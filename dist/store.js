const store = {
    updates: new Map(),
    cycleStart: new Date(),
    prompted: new Set(),
};
export function resetCycle() {
    store.updates.clear();
    store.prompted.clear();
    store.cycleStart = new Date();
}
export function addUpdate(update) {
    const existing = store.updates.get(update.userId);
    if (existing) {
        existing.content += '\n' + update.content;
        existing.githubRefs.push(...update.githubRefs);
        existing.mentionedUsers.push(...update.mentionedUsers);
        existing.receivedAt = update.receivedAt;
    }
    else {
        store.updates.set(update.userId, update);
    }
}
export function getUpdates() {
    return Array.from(store.updates.values());
}
export function markPrompted(userId) {
    store.prompted.add(userId);
}
export function isPrompted(userId) {
    return store.prompted.has(userId);
}
export function hasResponded(userId) {
    return store.updates.has(userId);
}
// Sync mode: track which role members were called and who posted in the channel
const syncStore = {
    calledUsers: new Set(),
    postedUsers: new Set(),
};
export function resetSyncCycle() {
    syncStore.calledUsers.clear();
    syncStore.postedUsers.clear();
}
export function markCalled(userId) {
    syncStore.calledUsers.add(userId);
}
export function markPostedInChannel(userId) {
    syncStore.postedUsers.add(userId);
}
export function getCalledButNotPosted() {
    return Array.from(syncStore.calledUsers).filter((id) => !syncStore.postedUsers.has(id));
}
