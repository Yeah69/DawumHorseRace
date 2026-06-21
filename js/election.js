// Letzte Bundestagswahl: 23. Februar 2025
const LAST_ELECTION = new Date('2025-02-23');
const ELECTION_CYCLE_YEARS = 4;

export function getNextElectionDate() {
    const now = new Date();
    let nextElection = new Date(LAST_ELECTION);

    while (nextElection <= now) {
        nextElection.setFullYear(nextElection.getFullYear() + ELECTION_CYCLE_YEARS);
    }

    return nextElection;
}

export function calculateRaceProgress() {
    const now = new Date();
    const nextElection = getNextElectionDate();
    const lastElection = new Date(nextElection);
    lastElection.setFullYear(lastElection.getFullYear() - ELECTION_CYCLE_YEARS);

    const totalTime = nextElection - lastElection;
    const elapsed = now - lastElection;

    // Progress von 0 (direkt nach Wahl) bis 1 (Wahltag)
    const progress = Math.max(0, Math.min(1, elapsed / totalTime));

    return {
        progress,
        lastElection,
        nextElection,
        today: now,
        daysUntil: Math.ceil((nextElection - now) / (1000 * 60 * 60 * 24))
    };
}
