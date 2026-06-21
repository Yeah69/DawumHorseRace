// Lokale Daten (werden täglich per GitHub Action aktualisiert)
const DATA_URL = './data/polls.json';
const SURVEY_AGE_DAYS = 30;

export async function fetchData() {
    const response = await fetch(DATA_URL);
    if (!response.ok) {
        throw new Error('Umfragedaten konnten nicht geladen werden');
    }
    return await response.json();
}

export function findBundestagId(data) {
    for (const [id, parliament] of Object.entries(data.Parliaments)) {
        if (parliament.Shortcut === 'Bundestag' || parliament.Name.includes('Bundestag')) {
            return id;
        }
    }
    return null;
}

export function calculateAggregatedResults(data, bundestagId) {
    const surveys = data.Surveys;
    const parties = data.Parties;

    // Zeitfilter: Nur Umfragen der letzten X Tage
    const now = new Date();
    const cutoffDate = new Date(now);
    cutoffDate.setDate(cutoffDate.getDate() - SURVEY_AGE_DAYS);

    // Finde die neuesten Umfragen pro Institut für den Bundestag
    const latestByInstitute = {};

    for (const [id, survey] of Object.entries(surveys)) {
        if (survey.Parliament_ID == bundestagId) {
            const instituteId = survey.Institute_ID;
            const surveyDate = new Date(survey.Date);

            // Nur Umfragen innerhalb des Zeitfensters
            if (surveyDate < cutoffDate) {
                continue;
            }

            if (!latestByInstitute[instituteId] ||
                surveyDate > new Date(latestByInstitute[instituteId].Date)) {
                latestByInstitute[instituteId] = survey;
            }
        }
    }

    // Aggregiere die Ergebnisse mit Gewichtung nach Befragtenzahl
    const aggregated = {};
    const weights = {};
    let totalSurveys = 0;
    let totalRespondents = 0;

    for (const survey of Object.values(latestByInstitute)) {
        totalSurveys++;
        const respondents = parseInt(survey.Surveyed_Persons) || 1000; // Fallback
        totalRespondents += respondents;

        for (const [partyId, percentage] of Object.entries(survey.Results)) {
            if (!aggregated[partyId]) {
                aggregated[partyId] = 0;
                weights[partyId] = 0;
            }
            // Gewichteter Beitrag
            aggregated[partyId] += parseFloat(percentage) * respondents;
            weights[partyId] += respondents;
        }
    }

    // Berechne gewichtete Durchschnitte und erstelle Ergebnisliste
    const results = [];
    for (const [partyId, weightedTotal] of Object.entries(aggregated)) {
        const partyData = parties[partyId];
        if (partyData && weights[partyId] > 0) {
            const avg = weightedTotal / weights[partyId];
            // Nur Parteien mit mindestens 1% anzeigen
            if (avg >= 1) {
                results.push({
                    id: partyId,
                    name: partyData.Shortcut || partyData.Name,
                    fullName: partyData.Name,
                    percentage: avg
                });
            }
        }
    }

    // Sortiere alphabetisch nach Parteiname
    results.sort((a, b) => a.name.localeCompare(b.name, 'de'));

    return { results, totalSurveys, totalRespondents };
}
