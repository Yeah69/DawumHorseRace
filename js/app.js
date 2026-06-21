import { fetchData, findBundestagId, calculateAggregatedResults } from './api.js';
import { calculateRaceProgress } from './election.js';
import { renderRace, updateInfoBox, showError } from './ui.js';

async function init() {
    try {
        const data = await fetchData();

        const bundestagId = findBundestagId(data);
        if (!bundestagId) {
            throw new Error('Bundestag nicht in der API gefunden');
        }

        const { results, totalSurveys } = calculateAggregatedResults(data, bundestagId);
        const raceProgress = calculateRaceProgress();

        updateInfoBox(data, raceProgress, totalSurveys);
        renderRace(results, raceProgress);

    } catch (error) {
        console.error('Initialisierungsfehler:', error);
        showError(error.message || 'Unbekannter Fehler');
    }
}

// Starte die Anwendung
init();

// Aktualisiere bei Fenstergrößenänderung
window.addEventListener('resize', () => {
    init();
});
