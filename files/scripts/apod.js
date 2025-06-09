document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('filter-date');
    const startBtn = document.getElementById('filter-go');
    const resetBtn = document.getElementById('reset-timeline');

    const titleEl = document.getElementById('title');
    const dateEl = document.getElementById('date');
    const copyrightEl = document.getElementById('copyright');
    const explanationEl = document.getElementById('explanation');
    const imgEl = document.querySelector('#picture-section img');

    const fetchApod = async (date = null) => {
        let url = '/api/apod';
        if (date) url += `?date=${date}`;

        try {
            const res = await fetch(url);
            if (!res.ok) throw new Error('API request failed');
            const data = await res.json();

            titleEl.textContent = data.title;
            dateEl.textContent = data.date;
            copyrightEl.textContent = data.copyright || '-';
            explanationEl.textContent = data.explanation;

            if (data.media_type === 'image') {
                imgEl.src = data.url;
                imgEl.alt = data.title;
                imgEl.style.display = 'block';
            } else {
                imgEl.style.display = 'none';
            }

        } catch (err) {
            console.error('Error loading APOD:', err.message);
            titleEl.textContent = 'Error loading data';
            imgEl.style.display = 'none';
        }
    };

    // Initial load (today)
    fetchApod();

    // Date filter
    startBtn.addEventListener('click', () => {
        const selectedDate = dateInput.value;
        if (selectedDate) {
            fetchApod(selectedDate);
        }
    });

    // Reset
    resetBtn.addEventListener('click', () => {
        dateInput.value = '';
        fetchApod(); // today
    });
});