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
