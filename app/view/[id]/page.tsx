// Server component — runs at build time only.
// Generates /view/_/index.html as a placeholder.
// Apache rewrites /view/REAL_ID → that file; the client component then
// reads the real ID from window.location.pathname at runtime.
import ViewClient from './ViewClient';

export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function ViewPage() {
  return <ViewClient />;
}
