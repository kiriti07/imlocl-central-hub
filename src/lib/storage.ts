// src/lib/storage.ts
import { Member, SEED_MEMBERS } from './types';

const KEY = 'central-hub-members-v1';

export function loadMembers(): Member[] {
  if (typeof window === 'undefined') return SEED_MEMBERS;
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : SEED_MEMBERS;
  } catch {
    return SEED_MEMBERS;
  }
}

export function saveMembers(members: Member[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(KEY, JSON.stringify(members));
  } catch {}
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function initials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}
