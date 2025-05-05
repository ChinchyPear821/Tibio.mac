function redirectToEvents(category) {
    localStorage.setItem('category', category);
    window.location.href = `categories-events.html?category=${category}`;
}

const outcomesBySport = {
    futbol: [
        { outcome_name: "ganador local", official_odds: 2 },
        { outcome_name: "ganador visitante", official_odds: 2 },
        { outcome_name: "goles", official_odds: 2 },
        { outcome_name: "goles local", official_odds: 2 },
        { outcome_name: "goles visitante", official_odds: 2 },
        { outcome_name: "tarjetas amarillas", official_odds: 2 },
        { outcome_name: "tiros esquina", official_odds: 2 },
        { outcome_name: "tarjetas rojas", official_odds: 2 },
        { outcome_name: "empate", official_odds: 2 }
    ],
    basquetbol: [
        { outcome_name: "ganador local", official_odds: 2 },
        { outcome_name: "ganador visitante", official_odds: 2 },
        { outcome_name: "puntos totales", official_odds: 2 },
        { outcome_name: "puntos local", official_odds: 2 },
        { outcome_name: "puntos visitante", official_odds: 2 },
        { outcome_name: "rebotes", official_odds: 2 },
        { outcome_name: "triples", official_odds: 2 }
    ],
    "futbol americano": [
        { outcome_name: "ganador local", official_odds: 2 },
        { outcome_name: "ganador visitante", official_odds: 2 },
        { outcome_name: "touchdowns", official_odds: 2 },
        { outcome_name: "anotaciones local", official_odds: 2 },
        { outcome_name: "anotaciones visitante", official_odds: 2 },
        { outcome_name: "intercepciones", official_odds: 2 },
        { outcome_name: "sacks", official_odds: 2 },
        { outcome_name: "goles de campo", official_odds: 2 }
    ]
};

function getBaseSport(sport) {
    // Si empieza con "1 vs 1", extrae la parte después
    if (sport.startsWith("1 vs 1")) {
        return sport.replace("1 vs 1", "").trim().toLowerCase();
    }
    return sport.trim().toLowerCase();
}

function getEventImages(eventName, sport) {
    const [local, visitor] = eventName.split(" vs ");
    let fileSport = '';

    switch (sport.toLowerCase()) {
        case "futbol":
            fileSport = 'SoccerImg';
            break;
        case "basquetbol":
            fileSport = 'BasketballImg';
            break;
        case "futbol americano":
            fileSport = 'FootballImg';
            break;
        default:
            fileSport = 'UnknownSportImg';
    }

    return {
        localImg: `/${fileSport}/${local}.png`,
        visitorImg: `/${fileSport}/${visitor}.png`
    };
}

const urlParams = new URLSearchParams(window.location.search);
const category = urlParams.get('category') || localStorage.getItem('category');
//Busca evenot
async function fetchEvents(category) {
    try {
        // Hace 3 fetch para despues poder filtrar apuestas con las apuestas
        const [categoryEventsRes, oneVsOneEventsRes, betsRes] = await Promise.all([
            fetch(`/event/search?sport=${category}&status=en proceso`),
            fetch(`/event/search?sport=1 vs 1 ${category}&status=en proceso`),
            fetch("/bet/")
        ]);


        const [categoryEvents, oneVsOneEvents, bets] = await Promise.all([
            categoryEventsRes.json(),
            oneVsOneEventsRes.json(),
            betsRes.json()
        ]);
        //Filtra las apuestas asociandolas con su evento para saber cuales son las 1 vs 1 que no han sido aceptadas y si estan aceptadas
        // o tienen mas de 2 apuestas no las muestra
        const betsByEvent = {};
        bets.forEach(bet => {
            if (!betsByEvent[bet.id_event]) {
                betsByEvent[bet.id_event] = [];
            }
            betsByEvent[bet.id_event].push(bet);
        });

        const discard1v1Events = oneVsOneEvents
            .map(event => {
                const eventBets = betsByEvent[event.id_event] || [];
                const mainBet = eventBets[0];
                return {
                    ...event,
                    id_bet: mainBet?.id_bet,
                    amount: mainBet?.amount,
                    target: mainBet?.target,
                    num_bets: eventBets.length
                };
            })
            .filter(event => event.num_bets < 2);

        return [...categoryEvents, ...discard1v1Events];

    } catch (error) {
        console.error("Error al cargar los eventos:", error);
        return [];
    }
}


function displayEvents(events) {
    const eventsContainer = document.getElementById('events-container');

    if (events.length === 0) {
        eventsContainer.innerHTML = '<p>No hay eventos por ahora categoria.</p>';
        return;
    }
    events.forEach(event => {
        const eventCard = createEventCard(event);
        eventsContainer.appendChild(eventCard);
    });
}

function createEventCard(event) {
    const eventCard = document.createElement('div');
    eventCard.classList.add('col-lg-4', 'col-md-6', 'col-sm-12', 'd-flex', 'justify-content-center');

    let actionButtonHTML = '';

    if (event.sport.startsWith("1 vs 1")) {
        if (event.id_bet && event.amount) {
            const safeEvent = {
                ...event,
                target: event.target
            };
            actionButtonHTML = `<button class="btn btn-danger mt-3" onclick='openAcceptOneVsOneModal(${JSON.stringify(safeEvent)})'>Aceptar Apuesta</button>`;
        }
    } else {
        actionButtonHTML = `<button class="btn btn-danger mt-3" onclick="showBetForm('${event.id_event}')">Apostar</button>`;
    }

    const challengeButtonHTML = event.sport.startsWith("1 vs 1")
        ? ""
        : `<button class="btn btn-danger mt-3" onclick="openChallengeModal('${event.id_event}', '${event.sport}')">Reta a otro usuario</button>`;
    const sportBase = getBaseSport(event.sport);
    const { localImg, visitorImg } = getEventImages(event.name, sportBase);

    eventCard.innerHTML = `
    <div class="card shadow-sm border-0 rounded-4 h-100 mx-auto" style="width: 22rem; padding-top: 10px;">

        <div class="card-header bg-light text-center border-0">
            <div class="d-flex justify-content-center align-items-center gap-3">
                <img src="${localImg}" class="img-fluid" style="max-height: 60px;" alt="local">
                <span class="fw-bold">vs</span>
                <img src="${visitorImg}" class="img-fluid" style="max-height: 60px;" alt="visitor">
            </div>
        </div>
        <div class="card-body text-center">
            <h5 class="card-title fw-semibold text-danger text-primary">${event.name}</h5>
            <p class="card-text mb-1"><i class="bi bi-controller me-1"></i>Deporte: <strong>${event.sport}</strong></p>
            <p class="card-text mb-1"><i class="bi bi-calendar-event me-1"></i>Fecha: <strong>${event.begin_date}</strong></p>
            <p class="card-text"><i class="bi bi-info-circle me-1"></i>Estatus: <strong>${event.status}</strong></p>
            ${actionButtonHTML}
            ${challengeButtonHTML}
        </div>
    </div>
`;


    return eventCard;
}

let currentBetToAccept = null;

function openAcceptOneVsOneModal(bet) {
    currentBetToAccept = bet;

    document.getElementById("oneVsOneAmount").textContent = `$${bet.amount}`;
    document.getElementById("oneVsOneTarget").textContent = `${bet.target}`;

    const modal = new bootstrap.Modal(document.getElementById("acceptOneVsOneModal"));
    modal.show();
}

document.getElementById("btn-confirm-accept-one-vs-one").addEventListener("click", async () => {
    if (!currentBetToAccept || !currentBetToAccept.id_bet) {
        alert("Error apuesta no encontrada.");
        return;
    }

    const token = localStorage.getItem("token");

    try {
        
        const response = await fetch("/bet/place", {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ id_bet: currentBetToAccept.id_bet })
        });

        if (response.ok) {
            showSuccessModal("¡Reto aceptado exitosamente!");
            const modal = bootstrap.Modal.getInstance(document.getElementById("acceptOneVsOneModal"));
            modal.hide();
            window.location.reload();
        } else {
            const errorData = await response.json();
            alert("Error al aceptar la apuesta No puedes aceptar la apuesta que mandaste: " + errorData.message);
            window.location.reload();
        }
        hideLoadingModal();
        challengeModal.hide();


    } catch (error) {
        console.error("Error al aceptar apuesta: No puedes aceptar la apuesta que mandaste");
    }
});



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

        const outcomesRes = await fetch(`/event/${id_event}/outcomes`, {
            method: "GET",
            credentials: "include",
        });
        const outcomesData = await outcomesRes.json();
        if (!outcomesRes.ok) throw new Error(outcomesData.error || "Error al obtener outcomes");
        const outcomes = outcomesData.outcomes;

        const eventRes = await fetch(`/event/search?id_event=${id_event}`);
        const eventData = await eventRes.json();
        if (!eventRes.ok) throw new Error(eventData.error);

        const event = eventData[0];
        const originalEventName = event.name;
        const token = localStorage.getItem('token');


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
            const [localTeam, visitorTeam] = originalEventName.split(" vs ").map(t => t.trim());

            let tipoApuesta = "";
            let valorTarget = "";

            if (targetTeam === localTeam) {
                tipoApuesta = "ganador local";
                valorTarget = `ganador local`;
            } else if (targetTeam === visitorTeam) {
                tipoApuesta = "ganador visitante";
                valorTarget = `ganador visitante`;
            } else {
                return alert("El equipo seleccionado no coincide con los del evento.");
            }

            const selectedOutcome = outcomes.find(outcome => outcome.outcome_name === tipoApuesta);
            if (!selectedOutcome) {
                return alert(`No se encontró el outcome para ${tipoApuesta}`);
            }
            const normalizedSport = sport.toLowerCase();
            const sportOutcomes = outcomesBySport[normalizedSport];
            if (!sportOutcomes) {
                return alert(`No hay outcomes definidos para el deporte: ${sport}`);
            }

            try {
                
                const createEventRes = await fetch('/event/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: originalEventName,
                        sport: `1 vs 1 ${sport}`,
                        outcomes:sportOutcomes
                    })
                });

                const newEventData = await createEventRes.json();
                if (!createEventRes.ok) throw new Error(newEventData.error || "Error al crear evento 1vs1");

                const id_event_created = newEventData.id_event;


                const updatedOutcomes = await fetch(`/event/${id_event_created}/outcomes`, {
                    method: "GET",
                    credentials: "include",
                }).then(res => res.json());

                const selectedOutcome = updatedOutcomes.outcomes.find(outcome => outcome.outcome_name === tipoApuesta);
                if (!selectedOutcome) {
                    return alert(`No se encontró el outcome para ${tipoApuesta}`);
                }

                const createBetRes = await fetch('/bet/1v1', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        id_event: id_event_created,
                        id_outcome: selectedOutcome.id_outcome,
                        amount: parseFloat(amount),
                        type: valorTarget,
                        target: targetTeam,
                        extra: 2
                    })
                });

                const newBetData = await createBetRes.json();
                if (!createBetRes.ok) {
                    throw new Error(newBetData.error || "Error al crear apuesta");
                }

                //alert('¡Reto enviado exitosamente!');
                hideLoadingModal();
                challengeModal.hide();
                showSuccessModal("¡Reto enviado exitosamente!");
            } catch (err) {
                hideLoadingModal();
                console.error('Error creando la apuesta', err);
                alert('Hubo un error al enviar el reto');
            }
        });


    } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Hubo un error inesperado');
    }
}

document.getElementById('challengeModal').addEventListener('hidden.bs.modal', function () {
    document.getElementById('challenge-user').value = '';
    document.getElementById('bet-amount').value = '';
    document.getElementById('bet-type').value = '';
    currentChallengeEventId = null;
});


