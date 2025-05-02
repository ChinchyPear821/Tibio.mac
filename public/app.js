async function logout() {
    try {
        const response = await fetch("/user/logout", {
            method: "POST",
            credentials: "include",
        });

        const result = await response.json();
        alert(result.message || "Sesión cerrada");

        window.location.href = "index.html";
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert("Hubo un problema al cerrar sesión.");
    }
}

async function checkSession() {
    try {
        const response = await fetch("/protected-route", {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            // Usuario no autorizado, redirige a login
            window.location.href = "index.html";
        }

        const user = await response.json();
        console.log("Usuario autenticado:", user);
    } catch (error) {
        console.error("Error al verificar la sesión:", error);
        window.location.href = "index.html";
    }    
    if( window.location.pathname.split("/").pop() === "main.html"){
        displayAllEvents();
    }
}

async function displayAllEvents() {
    /////Display current events
    try {
        const res = await fetch("/event/search?status=en%20proceso", {
            method: "GET",
            credentials: "include",
        });

        const events = await res.json();
        const container = document.getElementById("event-container");

        if (events.length === 0) {
            container.innerHTML = "<p>No hay eventos disponibles.</p>";
            return;
        }

        events.forEach(event => {
            const [local, visitor] = event.name.split(" vs ");
            let cardSport = '';
            let sportFile = '';
            if (event.sport === "futbol") {
                cardSport = 'Fútbol';
                sportFile = 'SoccerImg';
            } else if (event.sport === "basquetbol") {
                cardSport = 'Basquetbol';
                sportFile = 'BasketballImg';
            } else if (event.sport === "futbol americano") {
                cardSport = 'Fútbol Américano';
                sportFile = 'FootballImg';
            }
            let cardStatus = '';
            if (event.status === "en proceso") {
                cardStatus = 'En Proceso';
            } else if (event.status === "finalizado") {
                cardStatus = 'Finalizado';
            }
            let cardDate = event.begin_date.toString();


            const col = document.createElement("div");
            col.classList.add("col-12", "col-md-6", "col-lg-4", "mb-4");

            col.innerHTML = `
                <div class="card mt-5" style="width: 22rem; justify-content: center;">
                    <div class="d-flex justify-content-around mt-2 pb-3 pt-3">
                        <img src="./${sportFile}/${local}.png" style="width: 150px; height: 200px;" class="card-img-top" alt="${local}">
                        <img src="./${sportFile}/${visitor}.png" style="width: 150px; height: 200px;" class="card-img-top" alt="${visitor}">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${event.name}</h5>
                        <p class="card-text">Deporte: ${cardSport}</p>
                        <p class="card-text">Fecha: ${cardDate}</p>
                        <p class="card-text">Estatus: ${cardStatus}</p>
                        <div class="d-flex justify-content-center">
                        <a id="bet-btn-${event.id_event}" class="btn btn-secondary">Apostar</a>
                        </div>
                        <div id="bet-form-container-${event.id_event}" class="mt-3"></div>
                    </div>
                </div>
            `;

            container.appendChild(col);
            document.getElementById(`bet-btn-${event.id_event}`).addEventListener('click', () => {
                showBetForm(event.id_event);
            });
        });
    } catch (err) {
        console.error("Error al cargar eventos:", err);
    }
}

async function showBetForm(id_event) {
    try {
        const eventRes = await fetch(`http://localhost:1234/event/search?id_event=${id_event}`, {
            method: "GET",
            credentials: "include",
        });
        const eventDataArray = await eventRes.json();
        const eventData = eventDataArray[0];
        const sport = eventData.sport;

        console.log("Datos del evento: ", eventData);
        console.log("nombre del evento:", eventData.name);

        const outcomesRes = await fetch(`http://localhost:1234/event/${id_event}/outcomes`, {
            method: "GET",
            credentials: "include",
        });
        const outcomesData = await outcomesRes.json();
        const outcomes = outcomesData.outcomes;

        const sportTypes = {
            futbol: ["ganador", "goles", "tarjetas amarillas", "tiros esquina", "tarjetas rojas"],
            basquetbol: ["ganador", "puntos totales", "triples", "rebotes"],
            futbol_americano: ["ganador", "touchdowns", "sacks", "goles de campo", "intercepciones"]
        };

        const availableTypes = sportTypes[sport] || [];

        const betFormContainer = document.getElementById(`bet-form-container-${id_event}`);
        betFormContainer.innerHTML = `
            <h3>Crear Apuesta para: ${eventData.name}</h3>
            <form id="form-bet">
                <div class="form-group">
                    <label for="id_event">ID del Evento</label>
                    <input type="text" id="id_event" class="form-control" value="${id_event}" readonly>
                </div>
                <div class="form-group">
                    <label for="type">Tipo de Apuesta</label>
                    <select id="type" class="form-control" required>
                        <option value="">Selecciona outcome</option>
                        ${outcomes.map(outcome => `<option value="${outcome.outcome_name.toLowerCase()}">${outcome.outcome_name}</option>`).join("")}
                    </select>
                </div>
                <div class="form-group">
                    <label for="target">Target</label>
                    <select id="target" class="form-control" required>
                        <option value="">Selecciona el target</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="amount">Cantidad a Apostar</label>
                    <input type="number" id="amount" class="form-control" required>
                </div>
                <div class="form-group">
                    <label for="extra">Momio</label>
                    <input type="number" id="extra" class="form-control" readonly>
                </div>
                <button type="submit" class="btn btn-primary">Realizar Apuesta</button>
                <input type="hidden" id="id_outcome">
            </form>
            <div id="respuesta-apuesta"></div>
        `;

        const typeSelect = document.getElementById("type");
        const targetSelect = document.getElementById("target");
        const extraInput = document.getElementById("extra");
        const idOutcomeInput = document.getElementById("id_outcome");

        typeSelect.addEventListener("change", () => {
            const selectedType = typeSelect.value;
            const selectedOutcome = outcomes.find(outcome => outcome.outcome_name.toLowerCase() === selectedType);

            if (selectedOutcome) {
                extraInput.value = selectedOutcome.official_odds;
                idOutcomeInput.value = selectedOutcome.id_outcome;
            } else {
                extraInput.value = "";
                idOutcomeInput.value = "";
            }

            targetSelect.innerHTML = '<option value="">Selecciona el target</option>';
            if (selectedType === "ganador") {
                const teamNames = eventData.name.split(" vs ");
                teamNames.forEach(team => {
                    const option = document.createElement("option");
                    option.value = team.trim();
                    option.textContent = team.trim();
                    targetSelect.appendChild(option);
                });
            } else if (selectedType) {
                for (let i = 0; i <= 10; i++) {
                    const option = document.createElement("option");
                    option.value = i;
                    option.textContent = i;
                    targetSelect.appendChild(option);
                }
            }
        });

        document.getElementById("form-bet").addEventListener("submit", async function (e) {
            e.preventDefault();
            const token = localStorage.getItem("token");

            console.log("id_outcome antes de enviar:", idOutcomeInput.value); // Debug

            const body = {
                id_event: document.getElementById("id_event").value.trim(),
                id_outcome: idOutcomeInput.value.trim(),
                type: typeSelect.value,
                target: targetSelect.value.trim(),
                amount: parseFloat(document.getElementById("amount").value),
                extra: parseFloat(extraInput.value)
            };

            try {
                const res = await fetch(`http://localhost:1234/bet`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify(body)
                });

                const data = await res.json();
                if (res.ok) {
                    alert("Apuesta creada correctamente");

                    document.getElementById("respuesta-apuesta").innerHTML = `
                        <pre>${JSON.stringify(data, null, 2)}</pre>
                        `;}
            } catch (err) {
                document.getElementById("respuesta-apuesta").textContent = "Error: " + err.message;
            }
        });

    } catch (err) {
        console.error("Error al mostrar el formulario de apuestas:", err);
    }
}

// Llamar a la función cuando se cargue la página
document.addEventListener("DOMContentLoaded", checkSession);