export interface Program {
  id: string;
  userId: string;
  deceasedName: string;
  birthYear: string;
  deathYear: string;
  eventDate: string;
  eventLocation: string;
  createdAt: string;
  views: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}
