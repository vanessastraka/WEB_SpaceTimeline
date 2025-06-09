// files/scripts/timeline.js
//TODO - Firefox funktioniert, Chrome funktioniert nicht.. herausfinde - KEIN PLAN!!!

// Global array for events
let events = [];

/**
 * 1) Fetch DONKI-Events der letzten 30 Tage vom eigenen Backend
 */
async function loadDonkiEvents() {
    const end = new Date();
    const start = new Date(end);
    start.setDate(end.getDate() - 14);
    const fmt = d => d.toISOString().slice(0,10);

    const res = await fetch(`/api/donki?startDate=${fmt(start)}&endDate=${fmt(end)}`);
    if (!res.ok) throw new Error(`API-Error ${res.status}`);
    const data = await res.json(); // { GST: [...], FLR: [...], IPS: [...] }

    // Flach mappen in [{ text, date, raw, eventType }]
    events = Object.entries(data)
        .flatMap(([type, arr]) =>
            arr.map(ev => {
                let rawDate;
                switch(type) {
                    case 'GST': rawDate = ev.startTime; break;
                    case 'IPS': rawDate = ev.eventTime; break;
                    case 'FLR':
                    default:    rawDate = ev.beginTime;
                }
                return {
                    text:      type,
                    date:      rawDate.slice(0,10),
                    raw:       ev,
                    eventType: type
                };
            })
        )
        .sort((a,b) => new Date(a.date) - new Date(b.date));
}

/**
 * 1.b) Fetch Wikimedia-Events based on the event
 */

const wikiEventMap = {
    FLR: 'Solar_Flare',
    GST: 'Geomagnetic_storm',
    IPS: 'Shock_waves_in_astrophysics'
};

// return the title for the event
function getWikiTitleFromEventType(eventType) {
    return wikiEventMap[eventType] || null;
}

async function loadWikimediaData(eventType, targetElement) {

    // get the title for the call
    const wikiTitle = getWikiTitleFromEventType(eventType);

    // handeling for when no title is available
    if (!wikiTitle) {
        targetElement.textContent = 'No Wikipedia-Data available.';
        console.warn(`No Wikipedia-Article for Event type ${eventType}`);
        return;
    }

    // call the API and insert the data into the targetelement
    try {
        const res = await fetch(`/api/wikimedia/${encodeURIComponent(wikiTitle)}`);

        if (!res.ok) {
            throw new Error("No Wikipedia-Data available.");
        }

        const data = await res.json();

        targetElement.innerHTML = `
            <strong>${data.title}</strong>: ${data.summary}
            <br><a href="${data.url}" target="_blank" rel="noopener noreferrer" class="wikiButton">Wikipedia Article</a>
        `;
    } catch (error) {
        targetElement.textContent = 'No Wikipedia-Data available.';
        console.error('Wikimedia API Error:', error);
    }
}

/**
 * 2) Filterfunktion bleibt unverändert
 */
function filterEvents({ textTerm, dateFrom, dateTo }) {
    return events.filter(item => {
        if (textTerm && !item.text.toLowerCase().includes(textTerm.toLowerCase())) return false;
        if (dateFrom && item.date < dateFrom) return false;
        if (dateTo   && item.date > dateTo)   return false;
        return true;
    });
}

/**
 * 3) Zeichne die Timeline und mache Kästchen klickbar
 */
function drawTimeline(data) {
    const container = document.getElementById('timeline-container');
    // Container leeren
    while (container.firstChild) container.removeChild(container.firstChild);

    const NUM_DOTS   = data.length;
    const SPACING    = 600;
    const DOT_R      = 150;
    const HEIGHT     = 450;
    const svgNS      = 'http://www.w3.org/2000/svg';
    const cw         = container.clientWidth;
    const totalWidth = cw + Math.max(0, NUM_DOTS - 1) * SPACING;

    // SVG erstellen
    const svg = document.createElementNS(svgNS, 'svg');
    svg.id = 'timeline-svg';
    svg.setAttribute('width', totalWidth);
    svg.setAttribute('height', HEIGHT);
    svg.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
    container.appendChild(svg);

    // Pfad unter den Icons
    const baseY  = HEIGHT * 0.6;
    const rx     = totalWidth / 2;
    const ry     = 100;
    const startPositioning = DOT_R;
    const endX   = startPositioning + Math.max(0, NUM_DOTS - 1) * SPACING;
    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', `M ${startPositioning},${baseY} A ${rx},${ry} 0 0,0 ${endX},${baseY}`);
    path.classList.add('timeline-path');
    svg.appendChild(path);

    const pathLen = path.getTotalLength();
    const step    = NUM_DOTS > 1 ? pathLen / (NUM_DOTS - 1) : 0;

    // Icons und Info-Boxen
    data.forEach((item, i) => {
        const pt = path.getPointAtLength(step * i);

        // Sonne
        const img = document.createElementNS(svgNS, 'image');
        img.setAttribute('href', '/images/sun.png');
        img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '/images/sun.png');
        img.setAttribute('width', DOT_R * 2);
        img.setAttribute('height', DOT_R * 2);
        img.setAttribute('x', pt.x - DOT_R);
        img.setAttribute('y', pt.y - DOT_R);
        img.classList.add('timeline-icon');
        svg.appendChild(img);

        // Info-Box
        const INFO_W  = 140;
        const INFO_H  = 60;
        const rectY   = pt.y - (DOT_R + INFO_H + 12);
        const rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('x', pt.x - INFO_W / 2);
        rect.setAttribute('y', rectY);
        rect.setAttribute('width', INFO_W);
        rect.setAttribute('height', INFO_H);
        rect.classList.add('info-rect');
        rect.style.cursor = 'pointer';
        svg.appendChild(rect);

        // Clickhandler
        rect.addEventListener('click', () => showInfoPanel(item));

        // Text
        const textY = rectY + 20;
        const infoText = document.createElementNS(svgNS, 'text');
        infoText.setAttribute('x', pt.x);
        infoText.setAttribute('y', textY);
        infoText.classList.add('info-text');
        infoText.setAttribute('text-anchor', 'middle');
        infoText.setAttribute('dominant-baseline', 'middle');
        infoText.textContent = item.text;
        svg.appendChild(infoText);

        // Datum
        const dateText = document.createElementNS(svgNS, 'text');
        dateText.setAttribute('x', pt.x);
        dateText.setAttribute('y', textY + 18);
        dateText.classList.add('date-text');
        dateText.setAttribute('text-anchor', 'middle');
        dateText.setAttribute('dominant-baseline', 'middle');
        dateText.textContent = item.date;
        svg.appendChild(dateText);
    });

    // Initial scroll
    const initialScroll = (DOT_R + (NUM_DOTS - 1) * SPACING) - (cw / 2) + DOT_R;
    container.scrollLeft = initialScroll;

    // Reset-Button
    document.getElementById('reset-timeline')?.addEventListener('click', async e => {
        e.preventDefault();
        // Filter zurücksetzen
        document.getElementById('filter-text').value = '';
        document.getElementById('filter-from').value = '';
        document.getElementById('filter-to').value = '';
        // Events wieder für Standard-Zeitraum laden
        await loadDonkiEvents();
        drawTimeline(events);
    });

    // Drag-to-Scroll
    let isDown = false;
    let startX = 0;
    let scrollX = 0;
    container.addEventListener('pointerdown', e => {
        isDown = true;
        startX = e.clientX;
        scrollX = container.scrollLeft;
        container.classList.add('active');
        container.setPointerCapture(e.pointerId);
    });
    container.addEventListener('pointermove', e => {
        if (!isDown) return;
        e.preventDefault();
        container.scrollLeft = scrollX - (e.clientX - startX);
    });
    ['pointerup','pointercancel'].forEach(evName =>
        container.addEventListener(evName, e => {
            isDown = false;
            container.classList.remove('active');
            container.releasePointerCapture(e.pointerId);
        })
    );
}

/**
 * 4) Panel befüllen
 */
function showInfoPanel(item) {
    const ev    = item.raw;
    const panel = document.getElementById('info-panel');
    const btn   = document.getElementById('toggle-button');
    if (!panel.classList.contains('expanded')) {
        panel.classList.add('expanded');
        btn.textContent = '▼ Close';
    }
    const eventBox = panel.querySelector('.event-box');
    eventBox.innerHTML = '';
    // Tabelle programmatisch anlegen
    const table = document.createElement('table');
    table.classList.add('event-table');
    const addRow = (label, value) => {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td'); td1.innerHTML = `<strong>${label}</strong>`;
        const td2 = document.createElement('td'); td2.textContent = value;
        tr.append(td1, td2);
        table.appendChild(tr);
    };
    addRow('Typ',        item.eventType);
    addRow('Start Time', ev.startTime || ev.beginTime);
    addRow('Peak Time',  ev.peakTime || '–');
    addRow('End Time',   ev.endTime || '–');
    addRow('ID',         ev.gstID || ev.flrID || ev.activityID);
    addRow('Location',   ev.location || ev.sourceLocation || '–');
    eventBox.appendChild(table);

    // Load Wikipedia Data
    const wikiBox = panel.querySelector('.wikiText');
    loadWikimediaData(item.eventType, wikiBox);

    // Event wird abgespeichert bei /fav
    const favBtn = document.getElementById('fav-button');
    const favsite = document.getElementById('fav-site');
    if (localStorage.getItem('jwt')) {
    favBtn.classList.remove('hidden');
    favsite.classList.remove('hidden');
    favBtn.onclick = async () => {
        try {
            const res = await fetch('/api/favorites', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('jwt')
                },
                body: JSON.stringify({
                    eventId: ev.gstID || ev.flrID || ev.activityID,
                    title: item.eventType,
                    time: ev.startTime || ev.eventTime || ev.beginTime,
                    location: ev.location || ev.sourceLocation || "-",
                    note: "",
                })
            });
            if (!res.ok) throw new Error('Favorit konnte nicht gespeichert werden');
            favBtn.textContent = '✓ Gespeichert!';
            setTimeout(() => favBtn.textContent = '☆ Zu Favoriten', 2000);
        } catch (err) {
            console.error('Fehler beim Speichern:', err);
            favBtn.textContent = '⚠ Fehler';
        }
        };
    } else {
        favBtn.classList.add('hidden');
    }
}

/**
 * 5) Start: DOMContentLoaded
 */
(async function initTimeline(){
    try {
        await loadDonkiEvents();
        // Dropdown füllen
        const sel = document.getElementById('filter-text');
        if(sel){
            sel.innerHTML = '<option value="">All</option>' +
                Array.from(new Set(events.map(e=>e.text)))
                    .map(t=>`<option>${t}</option>`).join('');
        }
        drawTimeline(events);
        document.getElementById('filter-go')?.addEventListener('click', async () => {
            const eventType = document.getElementById('filter-text')?.value || '';
            const start = document.getElementById('filter-from')?.value || '';
            const end   = document.getElementById('filter-to')?.value || '';

            // Wenn Zeitraum ausgewählt ist, hole neue Events vom Backend!
            if (start && end) {
                try {
                    await loadDonkiEventsRange(start, end);
                } catch (err) {
                    alert('Fehler beim Laden der Events: ' + err.message);
                    return;
                }
            }
            // Wenn keine neuen Daten geladen wurden, sind events[] noch die Standarddaten

            // Jetzt filtern (egal ob neue oder alte Events)
            let filtered = events;
            if (eventType) {
                filtered = filtered.filter(e => e.text === eventType);
            }
            drawTimeline(filtered);
        });

    } catch(err){
        console.error('Timeline-Init-Error',err);
    }
})();


/**
 * 6) Toggle-Button
 */
const toggleButton = document.getElementById('toggle-button');
const infoPanel    = document.getElementById('info-panel');
toggleButton.addEventListener('click', () => {
    infoPanel.classList.toggle('expanded');
    toggleButton.textContent = infoPanel.classList.contains('expanded')
        ? '▼ Close'
        : '▲ Open';
});



/**
 * 7) Filter-Timeline older events
 */
async function loadDonkiEventsRange(startDate, endDate) {
    const res = await fetch(`/api/donki?startDate=${startDate}&endDate=${endDate}`);
    if (!res.ok) throw new Error(`API-Error ${res.status}`);
    const data = await res.json();

    events = Object.entries(data)
        .flatMap(([type, arr]) =>
            arr.map(ev => {
                let rawDate;
                switch(type) {
                    case 'GST': rawDate = ev.startTime; break;
                    case 'IPS': rawDate = ev.eventTime; break;
                    case 'FLR':
                    default:    rawDate = ev.beginTime;
                }
                return {
                    text:      type,
                    date:      rawDate.slice(0,10),
                    raw:       ev,
                    eventType: type
                };
            })
        )
        .sort((a,b) => new Date(a.date) - new Date(b.date));
}

