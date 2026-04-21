export interface Program {
  id: string;
  userId: string;
  deceasedName: string;
  birthYear: string;
  deathYear: string;
  eventDate: string;
  eventLocation: string;
  createdAt: string;
  expiresAt: string | null;
  views: number;
}
