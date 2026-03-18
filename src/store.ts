import type { StandupUpdate } from './types.js';

interface StandupStore {
  updates: Map<string, StandupUpdate>;
  cycleStart: Date;
  prompted: Set<string>;
}

const store: StandupStore = {
  updates: new Map(),
  cycleStart: new Date(),
  prompted: new Set(),
};

export function resetCycle(): void {
  store.updates.clear();
  store.prompted.clear();
  store.cycleStart = new Date();
}

export function addUpdate(update: StandupUpdate): void {
  const existing = store.updates.get(update.userId);
  if (existing) {
    existing.content += '\n' + update.content;
    existing.githubRefs.push(...update.githubRefs);
    existing.mentionedUsers.push(...update.mentionedUsers);
    existing.receivedAt = update.receivedAt;
  } else {
    store.updates.set(update.userId, update);
  }
}

export function getUpdates(): StandupUpdate[] {
  return Array.from(store.updates.values());
}

export function markPrompted(userId: string): void {
  store.prompted.add(userId);
}

export function isPrompted(userId: string): boolean {
  return store.prompted.has(userId);
}

export function hasResponded(userId: string): boolean {
  return store.updates.has(userId);
}

// Sync mode: track which role members were called and who posted in the channel
const syncStore = {
  calledUsers: new Set<string>(),
  postedUsers: new Set<string>(),
};

export function resetSyncCycle(): void {
  syncStore.calledUsers.clear();
  syncStore.postedUsers.clear();
}

export function markCalled(userId: string): void {
  syncStore.calledUsers.add(userId);
}

export function markPostedInChannel(userId: string): void {
  syncStore.postedUsers.add(userId);
}

export function getCalledButNotPosted(): string[] {
  return Array.from(syncStore.calledUsers).filter((id) => !syncStore.postedUsers.has(id));
}
