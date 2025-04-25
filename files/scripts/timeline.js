// files/scripts/timeline.js

//TODO Dynamic scaling for timeline (sun elements)

// Warte, bis das DOM vollständig geladen ist, bevor wir auf Elemente zugreifen
document.addEventListener('DOMContentLoaded', () => {
    const NUM_DOTS = 10;     // Anzahl der Punkte auf der Timeline
    const SPACING  = 600;    // horizontaler Abstand zwischen den Punkten (in Pixeln)
    const DOT_R    = 150;     // Radius der Kreise, die die Events darstellen (in Pixeln)
    const HEIGHT   = 450;    // Höhe des SVG-Containers (in Pixeln)
    const svgNS    = 'http://www.w3.org/2000/svg';  // Namespace für SVG-Elemente

    const container = document.getElementById('timeline-container');  // Referenz auf den Wrapper div
    const cw = container.clientWidth;  // tatsächliche Breite des Containers (in Pixeln)

    //RESET-TIMER FUNCTION
    // wir merken uns die Position, auf die wir initial scrollen:
    // (horizontaler Abstand zum letzten Icon minus die halbe Viewport-Breite)
    const initialScroll = (DOT_R /* startX */ + (NUM_DOTS - 1) * SPACING) - (cw / 2) + DOT_R;


    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ~~~~~~~~~~~~~ SVG Elements and width ~~~~~~~~~~~~~~~~
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    //    Gesamtbreite = Breite des Containers + Abstände für alle Punkte
    const totalWidth = cw + (NUM_DOTS - 1) * SPACING;
    const svg = document.createElementNS(svgNS, 'svg');  // neues <svg> anlegen
    svg.setAttribute('id', 'timeline-svg');              // ID für CSS/JS-Referenz
    svg.setAttribute('width',  totalWidth);              // Breite des SVG
    svg.setAttribute('height', HEIGHT);                  // Höhe des SVG
    svg.setAttributeNS(                                             // Namespace für xlink:href hinzufügen (einmalig)
        'http://www.w3.org/2000/xmlns/',
        'xmlns:xlink',
        'http://www.w3.org/1999/xlink'
    );
    container.appendChild(svg);                           // SVG in den Container einhängen


    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ~~~~~~~~~~~~~~~ Bogen-Pfad (∩-Form) ~~~~~~~~~~~~~~~~~
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    const basely = HEIGHT * 0.6;      // y-Koordinate, auf der der Bogen verläuft
    const rx     = totalWidth / 2;    // Halbachse der Ellipse in X-Richtung
    const ry     = 100;               // Halbachse der Ellipse in Y-Richtung (Bogen-Tiefe)
    const startMiddle = DOT_R;        // Start-X: erster Punkt DOT_R px vom linken Rand
    const endX   = startMiddle + (NUM_DOTS - 1) * SPACING;  // End-X des Bogens

    const path = document.createElementNS(svgNS, 'path');    // <path>-Element anlegen
    const d = [
        `M ${startMiddle},${basely}`,                        // MoveTo: Anfangskoordinate
        `A ${rx},${ry} 0 0,0 ${endX},${basely}`              // Arc: elliptischer Bogen
    ].join(' ');
    path.setAttribute('d', d);            // Pfad-Daten setzen
    path.setAttribute('class', 'timeline-path');  // CSS-Klasse für Styling
    svg.appendChild(path);                // Pfad ins SVG einfügen


    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ~~~~~~~~~~ Points on x-axis positioning  ~~~~~~~~~~~~
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    const pathLen = path.getTotalLength();  // Länge des Pfads in Pixeln
    for (let i = 0; i < NUM_DOTS; i++) {     // Schleife über alle Punkte
        // Position auf dem Pfad berechnen (gleichmäßig verteilt)
       // const pt = path.getPointAtLength((pathLen / (NUM_DOTS - 1)) * i);
        const pos = (pathLen / (NUM_DOTS - 1)) * i;
        const pt  = path.getPointAtLength(pos);

        // ← PNG-Icon
        const img = document.createElementNS(svgNS, 'image');
        img.setAttribute('href', '/images/sun.png');
        img.setAttributeNS(                                             // klassisches xlink-Fallback
            'http://www.w3.org/1999/xlink',
            'xlink:href',
            '/images/sun.png'
        );
        img.setAttribute('width',  DOT_R * 2);
        img.setAttribute('height', DOT_R * 2);
        img.setAttribute('x',      pt.x - DOT_R);
        img.setAttribute('y',      pt.y - DOT_R);
        img.setAttribute('class',  'timeline-icon');
        svg.appendChild(img);

        /* Kreis-Element für den Punkt anlegen
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', pt.x);            // X-Koordinate des Kreismittelpunkts
        circle.setAttribute('cy', pt.y);            // Y-Koordinate des Kreismittelpunkts
        circle.setAttribute('r',  DOT_R);           // Radius des Kreises
        circle.setAttribute('class', 'timeline-dot');  // CSS-Klasse für Styling
        svg.appendChild(circle);                    // Kreis ins SVG einfügen
        */

        /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
        ~~~~~~~~~~~~ INFO - BOX over SUN ELEMENT ~~~~~~~~~~~~
        ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

        const INFO_W = 80, INFO_H = 24;
        const INFO_Y_OFFSET = DOT_R + INFO_H + 12;

        const rect = document.createElementNS(svgNS, 'rect');
        rect.setAttribute('x', pt.x - INFO_W/2);
        rect.setAttribute('y', pt.y - INFO_Y_OFFSET);
        rect.setAttribute('width',  INFO_W);
        rect.setAttribute('height', INFO_H);
        rect.setAttribute('class', 'info-rect');
        svg.appendChild(rect);

        const info = document.createElementNS(svgNS, 'text');
        info.setAttribute('x', pt.x);
        info.setAttribute('y', pt.y - INFO_Y_OFFSET + INFO_H/2);
        info.setAttribute('class', 'info-text');
        info.textContent = 'INFO';
        svg.appendChild(info);

        // Berechne, wo der letzte Punkt auf X liegt
        const lastPos = (pathLen / (NUM_DOTS - 1)) * (NUM_DOTS - 1);  // Länge bis zum letzten Punkt
        // Ziehe das halbierte Viewport-Breite ab, damit er in die Mitte rückt
        container.scrollLeft = lastPos - (cw / 2) + DOT_R;

        //RESET-TIMER FUNCTION
        container.scrollLeft = initialScroll;

        document
            .getElementById('reset-timeline')
            .addEventListener('click', e => {
                e.preventDefault();
                container.scrollLeft = initialScroll;
            });

    }

    /*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    ~~~~~~~~~~ Drag-to-scroll (Pointer Events) ~~~~~~~~~~
    ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

    let isDown = false,     // Flag, ob gerade gezogen wird
        startX = 0,         // X-Position beim PointerDown
        scrollLeft = 0;     // scrollLeft-Wert zu Beginn des Drags

    // wenn die Maustaste (oder Touch) gedrückt wird
    container.addEventListener('pointerdown', e => {
        isDown = true;                              // Drag-Start markieren
        container.classList.add('active');          // CSS-Klasse für Cursor-Change
        startX = e.clientX;                         // Start-X speichern
        scrollLeft = container.scrollLeft;          // Anfangs-ScrollLeft speichern
        container.setPointerCapture(e.pointerId);   // Zeigersperre setzen
    });

    // während der Zeiger bewegt wird
    container.addEventListener('pointermove', e => {
        if (!isDown) return;                        // nur bei aktivem Drag
        e.preventDefault();                         // Standard-Scroll verhindern
        const dx = e.clientX - startX;              // Differenz seit Start
        container.scrollLeft = scrollLeft - dx;     // scrollLeft aktualisieren
    });

    // wenn die Maustaste losgelassen oder abgebrochen wird
    ['pointerup','pointercancel'].forEach(ev => {
        container.addEventListener(ev, e => {
            isDown = false;                         // Drag beenden
            container.classList.remove('active');   // CSS-Klasse zurücksetzen
            container.releasePointerCapture(e.pointerId);  // Zeigersperre lösen
        });
    });
});
