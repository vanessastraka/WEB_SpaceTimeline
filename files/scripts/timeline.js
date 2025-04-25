// files/scripts/timeline.js

// Warte, bis das DOM vollständig geladen ist, bevor wir auf Elemente zugreifen
document.addEventListener('DOMContentLoaded', () => {
    const NUM_DOTS = 10;     // Anzahl der Punkte auf der Timeline
    const SPACING  = 300;    // horizontaler Abstand zwischen den Punkten (in Pixeln)
    const DOT_R    = 90;     // Radius der Kreise, die die Events darstellen (in Pixeln)
    const HEIGHT   = 350;    // Höhe des SVG-Containers (in Pixeln)
    const svgNS    = 'http://www.w3.org/2000/svg';  // Namespace für SVG-Elemente

    const container = document.getElementById('timeline-container');  // Referenz auf den Wrapper div
    const cw = container.clientWidth;  // tatsächliche Breite des Containers (in Pixeln)

    // 1) SVG erzeugen und Breite setzen
    //    Gesamtbreite = Breite des Containers + Abstände für alle Punkte
    const totalWidth = cw + (NUM_DOTS - 1) * SPACING;
    const svg = document.createElementNS(svgNS, 'svg');  // neues <svg> anlegen
    svg.setAttribute('id', 'timeline-svg');              // ID für CSS/JS-Referenz
    svg.setAttribute('width',  totalWidth);              // Breite des SVG
    svg.setAttribute('height', HEIGHT);                  // Höhe des SVG
    container.appendChild(svg);                           // SVG in den Container einhängen

    // 2) Bogen-Pfad (∩-Form) zeichnen
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

    // 3) Punkte & Nummern entlang des Pfads verteilen
    const pathLen = path.getTotalLength();  // Länge des Pfads in Pixeln
    for (let i = 0; i < NUM_DOTS; i++) {     // Schleife über alle Punkte
        // Position auf dem Pfad berechnen (gleichmäßig verteilt)
        const pt = path.getPointAtLength((pathLen / (NUM_DOTS - 1)) * i);

        // Kreis-Element für den Punkt anlegen
        const circle = document.createElementNS(svgNS, 'circle');
        circle.setAttribute('cx', pt.x);            // X-Koordinate des Kreismittelpunkts
        circle.setAttribute('cy', pt.y);            // Y-Koordinate des Kreismittelpunkts
        circle.setAttribute('r',  DOT_R);           // Radius des Kreises
        circle.setAttribute('class', 'timeline-dot');  // CSS-Klasse für Styling
        svg.appendChild(circle);                    // Kreis ins SVG einfügen

        // Text-Element für die Nummerierung anlegen
        const text = document.createElementNS(svgNS, 'text');
        text.setAttribute('x', pt.x);               // X-Koordinate der Textposition
        text.setAttribute('y', pt.y - DOT_R - 8);   // Y-Koordinate oberhalb des Kreises
        text.setAttribute('class', 'timeline-text');   // CSS-Klasse für Styling
        text.textContent = (NUM_DOTS - i);          // Nummer von 10 abwärts
        svg.appendChild(text);                      // Text ins SVG einfügen
    }

    // 4) Drag-to-scroll (Pointer Events) einrichten
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
