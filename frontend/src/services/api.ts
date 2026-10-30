import axios from 'axios';
import { API_BASE } from '@/config';

const client = axios.create({ baseURL: API_BASE, timeout: 15000 });

export interface Person {
  id: number;
  student_id?: string | null;
  name: string;
  gender: 'male' | 'female' | 'other';
  age?: number | null;
  region?: string | null;
  dance_styles: string[];
  hobbies: string[];
  zodiac?: string | null;
  mbti?: string | null;
}

export interface CreatePersonResult {
  person: Person;
  overwritten: boolean;
}

export interface MatchPair {
  person_a: Person;
  person_b: Person;
  score: number;
  reasons: string[];
}

export interface MatchResult {
  pairs: MatchPair[];
  unmatched: Person[];
}

export interface MatchFilters {
  dance_style?: string | null;
  region?: string | null;
  gender?: string | null;
}

export interface MatchParams {
  gender_mode: string;
  algorithm: string;
  min_score: number;
  filters?: MatchFilters;
}

export interface Stats {
  total: number;
  gender: Record<string, number>;
  dance_styles: Record<string, number>;
  regions: Record<string, number>;
  zodiac: Record<string, number>;
  mbti: Record<string, number>;
}

export const api = {
  listPersons: () => client.get<Person[]>('/persons').then((r) => r.data),
  createPerson: (data: Partial<Person>) =>
    client.post<CreatePersonResult>('/persons', data).then((r) => r.data),
  deletePerson: (id: number) =>
    client.delete(`/persons/${id}`).then((r) => r.data),
  updatePerson: (id: number, data: Partial<Person>) =>
    client.put<Person>(`/persons/${id}`, data).then((r) => r.data),
  clearPersons: () =>
    client.delete<{ ok: boolean; deleted: number }>('/persons').then((r) => r.data),
  getStats: () => client.get<Stats>('/stats').then((r) => r.data),
  match: (params: MatchParams) =>
    client.post<MatchResult>('/match', params).then((r) => r.data),
  seed: () => client.post<{ seeded: boolean; count: number; message: string }>('/seed').then((r) => r.data),
};
