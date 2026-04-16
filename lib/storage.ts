import { supabase } from './supabase';
import { Program } from './types';

const BUCKET = 'programs';

function toProgram(row: Record<string, unknown>): Program {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    deceasedName: row.deceased_name as string,
    birthYear: row.birth_year as string,
    deathYear: row.death_year as string,
    eventDate: (row.event_date as string) ?? '',
    eventLocation: (row.event_location as string) ?? '',
    createdAt: row.created_at as string,
    views: (row.views as number) ?? 0,
  };
}

export async function saveProgram(
  program: Omit<Program, 'id' | 'createdAt' | 'views'>
): Promise<Program> {
  const { data, error } = await supabase
    .from('programs')
    .insert({
      user_id: program.userId,
      deceased_name: program.deceasedName,
      birth_year: program.birthYear,
      death_year: program.deathYear,
      event_date: program.eventDate || null,
      event_location: program.eventLocation,
    })
    .select()
    .single();

  if (error) throw error;
  return toProgram(data);
}

export async function getProgram(id: string): Promise<Program | null> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return toProgram(data);
}

export async function getAllPrograms(userId: string): Promise<Program[]> {
  const { data, error } = await supabase
    .from('programs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map(toProgram);
}

export async function savePDF(programId: string, file: File | Blob): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(`${programId}.pdf`, file, { contentType: 'application/pdf', upsert: true });

  if (error) throw error;
}

export function getPDFUrl(programId: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(`${programId}.pdf`);
  return data.publicUrl;
}

export async function deleteProgram(id: string): Promise<void> {
  await supabase.storage.from(BUCKET).remove([`${id}.pdf`]);
  await supabase.from('programs').delete().eq('id', id);
}

export async function updateProgramViews(id: string): Promise<void> {
  const { data } = await supabase.from('programs').select('views').eq('id', id).single();
  if (data) {
    await supabase.from('programs').update({ views: (data.views || 0) + 1 }).eq('id', id);
  }
}
