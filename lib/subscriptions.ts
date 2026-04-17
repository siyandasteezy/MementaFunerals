import { supabase } from './supabase';

export interface Subscription {
  id: string;
  userId: string;
  status: 'trial' | 'active' | 'expired' | 'cancelled';
  trialEndsAt: string;
  currentPeriodEnd: string | null;
  createdAt: string;
}

export async function createSubscription(userId: string): Promise<void> {
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 30);
  await supabase.from('subscriptions').insert({
    user_id: userId,
    status: 'trial',
    trial_ends_at: trialEndsAt.toISOString(),
  });
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
  const { data } = await supabase.from('subscriptions').select('*').eq('user_id', userId).single();
  if (!data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    status: data.status,
    trialEndsAt: data.trial_ends_at,
    currentPeriodEnd: data.current_period_end ?? null,
    createdAt: data.created_at,
  };
}

export async function isSubscriptionActive(userId: string): Promise<boolean> {
  const sub = await getSubscription(userId);
  if (!sub) return false;
  if (sub.status === 'active' && sub.currentPeriodEnd && new Date(sub.currentPeriodEnd) > new Date()) return true;
  if (sub.status === 'trial' && new Date(sub.trialEndsAt) > new Date()) return true;
  if (sub.status === 'active' || sub.status === 'trial') {
    await supabase.from('subscriptions').update({ status: 'expired' }).eq('user_id', userId);
  }
  return false;
}

export async function activateSubscription(userId: string): Promise<void> {
  const periodEnd = new Date();
  periodEnd.setMonth(periodEnd.getMonth() + 1);
  const { data: existing } = await supabase.from('subscriptions').select('id').eq('user_id', userId).single();
  if (existing) {
    await supabase.from('subscriptions').update({
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString(),
    }).eq('user_id', userId);
  } else {
    const trialEndsAt = new Date();
    await supabase.from('subscriptions').insert({
      user_id: userId,
      status: 'active',
      trial_ends_at: trialEndsAt.toISOString(),
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString(),
    });
  }
}

export function getTrialDaysLeft(sub: Subscription | null): number {
  if (!sub || sub.status !== 'trial') return 0;
  const diff = new Date(sub.trialEndsAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
