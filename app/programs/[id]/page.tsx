import ProgramDetailClient from './ProgramDetailClient';

export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function ProgramDetailPage() {
  return <ProgramDetailClient />;
}
