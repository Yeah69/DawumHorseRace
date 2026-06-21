// Parteifarben
export const partyColors = {
    'CDU/CSU': '#000000',
    'CDU': '#000000',
    'CSU': '#008ac5',
    'SPD': '#E3000F',
    'Grüne': '#46962b',
    'GRÜNE': '#46962b',
    'FDP': '#FFED00',
    'AfD': '#009ee0',
    'Linke': '#BE3075',
    'DIE LINKE': '#BE3075',
    'BSW': '#FFA500',
    'Freie Wähler': '#FF8C00',
    'FREIE WÄHLER': '#FF8C00',
    'Sonstige': '#808080',
    'Piraten': '#FF8800',
    'SSW': '#003c8f'
};

export function getPartyColor(name, fullName) {
    return partyColors[name] || partyColors[fullName] || '#666';
}

export function renderRace(results, raceProgress) {
    const container = document.getElementById('race-container');
    container.innerHTML = '';

    // Grid-Layout erstellen
    const raceGrid = document.createElement('div');
    raceGrid.className = 'race-grid';

    // Spalten erstellen
    const labelsColumn = document.createElement('div');
    labelsColumn.className = 'labels-column';

    const tracksColumn = document.createElement('div');
    tracksColumn.className = 'tracks-column';

    const finishColumn = document.createElement('div');
    finishColumn.className = 'finish-column';

    const percentagesColumn = document.createElement('div');
    percentagesColumn.className = 'percentages-column';

    // Finde maximale Prozent für Positionsberechnung
    const maxPercentage = Math.max(...results.map(r => r.percentage));

    // Speichere horse containers für Animation
    const horseContainers = [];

    results.forEach((party, index) => {
        // Partei-Label (linke Spalte)
        const labelCell = document.createElement('div');
        labelCell.className = 'party-label-cell';
        const label = document.createElement('span');
        label.className = 'party-label';
        label.textContent = party.name;
        const color = getPartyColor(party.name, party.fullName);
        label.style.setProperty('--party-color', color);
        if (party.name === 'FDP') {
            label.style.color = '#333';
            label.style.textShadow = 'none';
        }
        labelCell.appendChild(label);
        labelsColumn.appendChild(labelCell);

        // Rennbahn (mittlere Spalte)
        const track = document.createElement('div');
        track.className = 'race-track';

        const horseContainer = document.createElement('div');
        horseContainer.className = 'horse-container';
        horseContainer.style.left = '10px';

        const horse = document.createElement('span');
        horse.className = 'horse';
        horse.textContent = '🏇';

        horseContainer.appendChild(horse);
        track.appendChild(horseContainer);
        tracksColumn.appendChild(track);

        // Speichere für Animation
        const relativePosition = party.percentage / maxPercentage;
        horseContainers.push({ container: horseContainer, relativePosition, index });

        // Ziellinie-Segment (Finish-Spalte)
        const finishSegment = document.createElement('div');
        finishSegment.className = 'finish-segment';
        finishColumn.appendChild(finishSegment);

        // Lücke zwischen Segmenten (außer beim letzten)
        if (index < results.length - 1) {
            const finishGap = document.createElement('div');
            finishGap.className = 'finish-gap';
            finishColumn.appendChild(finishGap);
        }

        // Prozent-Label (rechte Spalte)
        const percentageCell = document.createElement('div');
        percentageCell.className = 'percentage-cell';
        const percentage = document.createElement('span');
        percentage.className = 'percentage';
        percentage.textContent = party.percentage.toFixed(1) + '%';
        percentageCell.appendChild(percentage);
        percentagesColumn.appendChild(percentageCell);
    });

    // Finish-Flagge
    const finishFlag = document.createElement('div');
    finishFlag.className = 'finish-flag';
    finishFlag.textContent = '🏁';
    finishColumn.appendChild(finishFlag);

    // Grid zusammenbauen
    raceGrid.appendChild(labelsColumn);
    raceGrid.appendChild(tracksColumn);
    raceGrid.appendChild(finishColumn);
    raceGrid.appendChild(percentagesColumn);
    container.appendChild(raceGrid);

    // Animation: Bewege Pferde zur Position
    // Muss nach dem Rendern passieren, damit offsetWidth verfügbar ist
    setTimeout(() => {
        const trackWidth = tracksColumn.offsetWidth - 60; // Platz für Pferd
        const leaderPosition = raceProgress.progress * trackWidth;

        horseContainers.forEach(({ container: horseContainer, relativePosition, index }) => {
            const position = relativePosition * leaderPosition;
            setTimeout(() => {
                horseContainer.style.left = (10 + position) + 'px';
            }, index * 100);
        });
    }, 50);

    // Legende hinzufügen
    renderLegend(container, results);
}

function renderLegend(container, results) {
    const legend = document.createElement('div');
    legend.className = 'legend';
    legend.innerHTML = '<h3>Parteien</h3><div class="legend-items"></div>';
    const legendItems = legend.querySelector('.legend-items');

    results.forEach(party => {
        const item = document.createElement('div');
        item.className = 'legend-item';
        const color = getPartyColor(party.name, party.fullName);
        item.innerHTML = `
            <div class="legend-color" style="background: ${color}"></div>
            <span>${party.fullName}</span>
        `;
        legendItems.appendChild(item);
    });

    container.appendChild(legend);
}

export function updateInfoBox(data, raceProgress, totalSurveys) {
    document.getElementById('last-update').textContent =
        `Letzte Aktualisierung: ${new Date(data.Database.Last_Update).toLocaleDateString('de-DE')}`;

    document.getElementById('next-election').textContent =
        `Nächste Wahl: ${raceProgress.nextElection.toLocaleDateString('de-DE')} (noch ${raceProgress.daysUntil} Tage)`;

    document.getElementById('progress-info').textContent =
        `Wahlperiode: ${Math.round(raceProgress.progress * 100)}% | ${totalSurveys} Institute`;
}

export function showError(message) {
    const container = document.getElementById('race-container');
    container.innerHTML = `
        <div class="error">
            <h3>Fehler beim Laden der Daten</h3>
            <p>${message}</p>
            <p style="margin-top: 15px;">
                <button onclick="location.reload()" style="padding: 10px 20px; cursor: pointer;">
                    Erneut versuchen
                </button>
            </p>
        </div>
    `;
}
