function redirectToEvents(category) {
    localStorage.setItem('category', category);

    window.location.href = `eventos.html?category=${category}`;
}

const urlParams = new URLSearchParams(window.location.search);
const category = urlParams.get('category') || localStorage.getItem('category');

async function fetchEvents(category) {
    try {
        const response = await fetch(`http://localhost:1234/event/search?sport=${category}`);
        const events = await response.json();
        return events;
    } catch (error) {
        console.error("Error al cargar los eventos:", error);
        return [];
    }
}

function displayEvents(events) {
    const eventsContainer = document.getElementById('events-container');

    if (events.length === 0) {
        eventsContainer.innerHTML = '<p>No hay eventos disponibles para esta categoría.</p>';
        return;
    }

    events.forEach(event => {
        const eventCard = createEventCard(event);
        eventsContainer.appendChild(eventCard);
    });
}

function createEventCard(event) {
    const eventCard = document.createElement('div');
    eventCard.classList.add('col-md-4');
    eventCard.innerHTML = `
        <div class="card">
            <img src="${event.name}.png" class="card-img-top" alt="Event Image">
            <div class="card-body">
                <h5 class="card-title">${event.name}</h5>
                <p class="card-text">${event.begin_date}</p>
                <button class="btn btn-primary mt-3" onclick="showBetForm('${event.id_event}')">Apostar</button>
                <button class="btn btn-primary mt-3" onclick="openChallengeModal('${event.id_event}', '${event.sport}')">Reta a otro usuario</button>
            </div>
        </div>
    `;
    return eventCard;
}

function getCategoryFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category') || localStorage.getItem('category');
    return category;
}

async function loadEvents() {
    const category = getCategoryFromUrl();
    const events = await fetchEvents(category);
    displayEvents(events);
}

loadEvents();

let challengeModal;
let currentChallengeEventId = null;

async function openChallengeModal(id_event, sport) {
    try {
        const outcomesRes = await fetch(`http://localhost:1234/event/${id_event}/outcomes`, {
            method: "GET",
            credentials: "include",
        });
        const outcomesData = await outcomesRes.json();
        if (!outcomesRes.ok) throw new Error(outcomesData.error || "Error al obtener outcomes");
        const outcomes = outcomesData.outcomes;

        const eventRes = await fetch(`http://localhost:1234/event/search?id_event=${id_event}`);
        const eventData = await eventRes.json();
        if (!eventRes.ok) throw new Error(eventData.error || "Error al obtener evento");

        const event = eventData[0];
        const originalEventName = event.name;
        const token = localStorage.getItem('token');
        const createEventRes = await fetch('http://localhost:1234/event/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: originalEventName,
                sport: `1 vs 1 ${sport}`,
                outcomes: [
                    { outcome_name: "ganador", official_odds: 2 },
                    { outcome_name: "goles", official_odds: 2 },
                    { outcome_name: "tarjetas amarillas", official_odds: 2 },
                    { outcome_name: "tiros esquina", official_odds: 2 },
                    { outcome_name: "tarjetas rojas", official_odds: 2 }
                ]
            })
        });

        const newEventData = await createEventRes.json();
        if (!createEventRes.ok) throw new Error(newEventData.error || "Error al crear evento 1 vs 1");

        currentChallengeEventId = newEventData.id_event;

        if (!challengeModal) {
            challengeModal = new bootstrap.Modal(document.getElementById('challengeModal'));
        }

        const targetSelect = document.getElementById('challenge-target');
        targetSelect.innerHTML = `<option value="">Selecciona un equipo</option>`;

        const teams = originalEventName.split(" vs ");
        if (teams.length === 2) {
            targetSelect.innerHTML += `
                <option value="${teams[0]}">${teams[0]}</option>
                <option value="${teams[1]}">${teams[1]}</option>
            `;
        } else {
            targetSelect.innerHTML += `<option value="No disponible">No disponible</option>`;
        }

        document.getElementById('challenge-sport-name').textContent = `1 vs 1 ${sport}`;
        challengeModal.show();

        const sendChallengeBtn = document.getElementById('send-challenge');
        sendChallengeBtn.replaceWith(sendChallengeBtn.cloneNode(true));
        document.getElementById('send-challenge').addEventListener('click', async () => {
            const targetTeam = document.getElementById('challenge-target').value;
            const amount = document.getElementById('bet-amount').value.trim();

            if (!targetTeam || !amount) {
                return alert('Por favor, completa todos los campos.');
            }

            const selectedOutcome = outcomes.find(outcome => outcome.outcome_name === "ganador");
            if (!selectedOutcome) {
                return alert('No se encontró un outcome válido.');
            }

            try {

                const createBetRes = await fetch('http://localhost:1234/bet/1v1', {  // Modificada la ruta a /bets/1v1
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        id_event: currentChallengeEventId,
                        id_outcome: selectedOutcome.id_outcome,
                        amount: parseFloat(amount),
                        type: "ganador",
                        target: targetTeam,
                        extra: 2
                    })
                });

                const newBetData = await createBetRes.json();
                if (!createBetRes.ok) {
                    throw new Error(newBetData.error || "Error al crear apuesta");
                }

                alert('Apuesta 1 vs 1 enviada');
                challengeModal.hide();
            } catch (err) {
                console.error('Error creando la apuesta:', err);
                alert('Error al enviar al enviar la apuesta');
            }
        });


    } catch (error) {
        console.error('Error:', error);
        alert(error.message);
    }
}

document.getElementById('challengeModal').addEventListener('hidden.bs.modal', function () {
    document.getElementById('challenge-user').value = '';
    document.getElementById('bet-amount').value = '';
    document.getElementById('bet-type').value = '';
    currentChallengeEventId = null;
});


