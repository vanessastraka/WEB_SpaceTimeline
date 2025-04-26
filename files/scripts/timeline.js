// files/scripts/timeline.js

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~ PLACEHOLDER FOR API ~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

let events = [];

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~ FILTER FUNCTION FOR EVENTS ~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

function filterEvents({ textTerm, dateFrom, dateTo }) {
    return events.filter(item => {
        // 1) Text-Filter (case‐insensitive)
        if (textTerm) {
            const lower = textTerm.trim().toLowerCase();
            if (!item.text.toLowerCase().includes(lower)) return false;
        }
        // 2) Datumsbereich
        if (dateFrom && item.date < dateFrom) return false;
        if (dateTo && item.date > dateTo) return false;
        return true;
    });
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~ DRAW SUN TIMELINE ON FIXED X AXIS ~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

function drawTimeline(data) {
    const container = document.getElementById('timeline-container');

    // Container komplett leeren (kein innerHTML)
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    const NUM_DOTS = data.length;
    const SPACING  = 600;
    const DOT_R    = 150;
    const HEIGHT   = 450;
    const svgNS    = 'http://www.w3.org/2000/svg';
    const cw       = container.clientWidth;

    // SVG aufsetzen
    const totalWidth = cw + Math.max(0, NUM_DOTS - 1) * SPACING;
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('id', 'timeline-svg');
    svg.setAttribute('width',  totalWidth);
    svg.setAttribute('height', HEIGHT);
    svg.setAttributeNS(
        'http://www.w3.org/2000/xmlns/',
        'xmlns:xlink',
        'http://www.w3.org/1999/xlink'
    );
    container.appendChild(svg);

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ~~~~~~~~~ MAKE THE CURVE FOR SUN ELEMENTS ~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    const basely      = HEIGHT * 0.6;
    const rx          = totalWidth / 2;
    const ry          = 100;
    const startMiddle = DOT_R;
    const endX        = startMiddle + Math.max(0, NUM_DOTS - 1) * SPACING;

    const path = document.createElementNS(svgNS, 'path');
    path.setAttribute('d', `M ${startMiddle},${basely} A ${rx},${ry} 0 0,0 ${endX},${basely}`);
    path.setAttribute('class', 'timeline-path');
    svg.appendChild(path);

    // Sobald das Element im DOM ist, kann getTotalLength() arbeiten
    const pathLen = path.getTotalLength();

    // Schrittweite (verhindert Division durch Null bei nur einem Dot)
    const step = NUM_DOTS > 1 ? pathLen / (NUM_DOTS - 1) : 0;

    // Für jedes Event Icon + Info-Box zeichnen
    data.forEach((item, i) => {
        const pos = step * i;
        const pt  = path.getPointAtLength(pos);
        const { text, date } = item;

        // 1) Icon
        const img = document.createElementNS(svgNS, 'image');
        img.setAttribute('href', '/images/sun.png');
        img.setAttributeNS('http://www.w3.org/1999/xlink','xlink:href','/images/sun.png');
        img.setAttribute('width',  DOT_R * 2);
        img.setAttribute('height', DOT_R * 2);
        img.setAttribute('x',      pt.x - DOT_R);
        img.setAttribute('y',      pt.y - DOT_R);
        img.setAttribute('class',  'timeline-icon');
        svg.appendChild(img);

        // 2) Info-Box
        const INFO_W         = 140;
        const INFO_H         = 60;
        const INFO_Y_OFFSET  = DOT_R + INFO_H + 12;
        const DATE_FONT_SIZE = 14;

        const rectY = pt.y - INFO_Y_OFFSET;
        const rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('x',      pt.x - INFO_W/2);
        rect.setAttribute('y',      rectY);
        rect.setAttribute('width',  INFO_W);
        rect.setAttribute('height', INFO_H);
        rect.setAttribute('class',  'info-rect');
        svg.appendChild(rect);

        // 3) Haupttext in der Box
        const mainTextY = rectY + 20;
        const infoText = document.createElementNS(svgNS, 'text');
        infoText.setAttribute('x',                pt.x);
        infoText.setAttribute('y',                mainTextY);
        infoText.setAttribute('class',            'info-text');
        infoText.setAttribute('text-anchor',      'middle');
        infoText.setAttribute('dominant-baseline','middle');
        infoText.textContent = text;
        svg.appendChild(infoText);

        // 4) Datum direkt unterordnen
        const dateText = document.createElementNS(svgNS, 'text');
        dateText.setAttribute('x',                pt.x);
        dateText.setAttribute('y',                mainTextY + DATE_FONT_SIZE + 4);
        dateText.setAttribute('class',            'date-text');
        dateText.setAttribute('text-anchor',      'middle');
        dateText.setAttribute('dominant-baseline','middle');
        dateText.textContent = date;
        svg.appendChild(dateText);
    });

  /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  ~~~~~~~~~ START SCROLLING FROM RIGHT ELEMENT ~~~~~~~~~
  ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    const initialScroll = (DOT_R + Math.max(0, NUM_DOTS - 1) * SPACING) - (cw / 2) + DOT_R;
    container.scrollLeft = initialScroll;

 /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
 ~~~~~~~~ RESET TIMELINE BUTTON FUNCTION ~~~~~~~~~
 ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    const resetBtn = document.getElementById('reset-timeline');
    if (resetBtn) {
        resetBtn.onclick = e => {
            e.preventDefault();
            container.scrollLeft = initialScroll;
        };
    }

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~ MOUSE DRAG FUNCTION ~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
    let isDown    = false;
    let startX    = 0;
    let scrollPos = 0;

    container.addEventListener('pointerdown', e => {
        isDown    = true;
        startX    = e.clientX;
        scrollPos = container.scrollLeft;
        container.classList.add('active');
        container.setPointerCapture(e.pointerId);
    });
    container.addEventListener('pointermove', e => {
        if (!isDown) return;
        e.preventDefault();
        container.scrollLeft = scrollPos - (e.clientX - startX);
    });
    ['pointerup','pointercancel'].forEach(ev => {
        container.addEventListener(ev, e => {
            isDown = false;
            container.classList.remove('active');
            container.releasePointerCapture(e.pointerId);
        });
    });
}

/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
~~~~~~~~~~~~~~~~~ DOMCONTENTLOADED ~~~~~~~~~~~~~~~~~~
Sets Input for Filtering and then rebuilds
the filtered timeline
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/
document.addEventListener('DOMContentLoaded', () => {
    // 1) Initiale Daten (später per fetch ersetzen)
    events = [
        { text: "Alpha", date: "2025-01-01" },
        { text: "Beta",  date: "2025-01-15" },
        { text: "Gamma", date: "2025-02-01" },
        { text: "Delta", date: "2025-02-15" },
        { text: "Pheta", date: "2025-03-01" },
        { text: "Alpha", date: "2025-03-15" },
        { text: "Beta",  date: "2025-04-01" },
        { text: "Gamma", date: "2025-04-15" },
        { text: "Delta", date: "2025-05-01" },
        { text: "Pheta", date: "2025-05-15" },
        { text: "Alpha", date: "2025-06-01" },
        { text: "Beta",  date: "2025-06-15" },
        { text: "Gamma", date: "2025-07-01" },
        { text: "Delta", date: "2025-07-15" },
        { text: "Pheta", date: "2025-08-01" },
        { text: "Alpha", date: "2025-08-15" },
        { text: "Beta",  date: "2025-09-01" },
        { text: "Gamma", date: "2025-09-15" },
        { text: "Delta", date: "2025-10-01" },
        { text: "Pheta", date: "2025-10-15" }
    ];

    // 2) Dropdown für Text-Filter befüllen (einmalig eindeutige Werte)
    const select = document.getElementById('filter-text');
    if (select) {
        // a) alle Texte aus den Events sammeln
        const allTexts = events.map(item => item.text);
        // b) mit Set auf eindeutige Werte reduzieren
        const uniqueTexts = Array.from(new Set(allTexts));
        // c) vorhandene Optionen entfernen
        while (select.firstChild) {
            select.removeChild(select.firstChild);
        }
        // d) Default-Option „Alle“
        const emptyOpt = document.createElement('option');
        emptyOpt.value = '';
        emptyOpt.textContent = 'All';
        select.appendChild(emptyOpt);
        // e) für jeden eindeutigen Text eine Option anlegen
        uniqueTexts.forEach(text => {
            const opt = document.createElement('option');
            opt.value = text;
            opt.textContent = text;
            select.appendChild(opt);
        });
    }

    // 3) erste Darstellung
    drawTimeline(events);

    // 4) Filter-Button hooken
    const btn = document.getElementById('filter-go');
    if (btn) {
        btn.addEventListener('click', () => {
            const criteria = {
                textTerm : document.getElementById('filter-text')?.value   || '',
                dateFrom : document.getElementById('filter-from')?.value  || '',
                dateTo   : document.getElementById('filter-to')?.value    || ''
            };
            const filtered = filterEvents(criteria);
            drawTimeline(filtered);
        });
    }
});

const toggleButton = document.getElementById('toggle-button');
const infoPanel = document.getElementById('info-panel');

toggleButton.addEventListener('click', () => {
  infoPanel.classList.toggle('expanded');

  // Button-Text ändern je nach Status
  if (infoPanel.classList.contains('expanded')) {
    toggleButton.textContent = "▼ Close";
  } else {
    toggleButton.textContent = "▲ Open";
  }
});
