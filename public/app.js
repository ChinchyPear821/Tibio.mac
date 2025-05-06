async function logout() {
    try {
        const response = await fetch("/user/logout", {
            method: "POST",
            credentials: "include",
        });

        const result = await response.json();
        alert(result.message || "Sesión cerrada");
        if (window.location.pathname === "/usuario/user.html") {
            window.location.href = "../index.html";
        } else {
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
        alert("Hubo un problema al cerrar sesión.");
    }
}

function showLoadingModal() {
    const loadingModal = new bootstrap.Modal(document.getElementById('loadingModal'));
    loadingModal.show();
    window.loadingModalInstance = loadingModal;
}

function hideLoadingModal() {
    if (window.loadingModalInstance) {
        window.loadingModalInstance.hide();
    }
}

function showSuccessModal(message = "Operación realizada correctamente") {
    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
    const successMessageContainer = document.querySelector('#successModal h5');
    successMessageContainer.textContent = message;
    successModal.show();
    window.successModalInstance = successModal;
}

function showErrorModal(message = "Ocurrio un error") {
    const errorModal = new bootstrap.Modal(document.getElementById('errorModal'));
    const errorMessageContainer = document.querySelector('#errorModal h5');
    errorMessageContainer.textContent = message;
    errorModal.show();
    window.errorModalInstance = errorModal;
}
function capitalizeWords(str) {
    return str
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
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
    console.log(`/images/${fileSport}/${local.toLowerCase()}.png`);
    console.log(`/images/${fileSport}/${visitor.toLowerCase()}.png`,)

    return {
        localImg: `/images/${fileSport}/${local.toLowerCase()}.png`,
        visitorImg: `/images/${fileSport}/${visitor.toLowerCase()}.png`
    };
}

async function checkSession() {
    try {
        const response = await fetch("/protected-route", {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            window.location.href = "index.html";
        }

        const user = await response.json();
        console.log("Usuario autenticado:", user);
        if (user.user.rol === "ADMIN") {
            window.location.href = "admin.html";
        }
    } catch (error) {
        console.error("Error al verificar la sesión:", error);
        window.location.href = "index.html";
    }
    try {
        const res = await fetch("/user/protected", {
            method: "GET",
            credentials: "include",
        });

        if (!res.ok) throw new Error("No pudo acceder a la informacion del usuario");

        const user = await res.json();
        console.log(user);
        // Aquí obtenemos los elementos del DOM
        // Verificamos si existe el balance y la navbar
         const balanceElement = document.getElementById("balance");
        const navbar = document.querySelector(".navbar-nav");

         if (balanceElement && user.balance !== undefined) {
            balanceElement.innerText = `$${user.balance.toFixed(2)}`;
        }

         if (navbar && user.username) {
            let userNameElement = document.getElementById("user-welcome");
            if (!userNameElement) {
                userNameElement = document.createElement("p");
                userNameElement.id = "user-welcome"; // Identificador único
                userNameElement.classList.add("p-2");
                navbar.prepend(userNameElement);
            }
            userNameElement.innerText = `Bienvenido ${user.username}`;
        }
        await loadUserBonuses();


        // Solo si estamos en main.html
        if (window.location.pathname.split("/").pop() === "main.html") {
            await displayAllEvents();
        }

    } catch (e) {
        console.error("Error al fetch de la informacion del usuario: ", e);
    }
}

async function displayAllEvents() {
    /////Display current events
    try {
        const res = await fetch(`/event/search?status=en%20proceso`, {
            method: "GET",
            credentials: "include",
        });

        const events = await res.json();
        const container = document.getElementById("event-container");
        container.innerHTML = "";

        const filteredEvents = events.filter(event => !event.sport.toLowerCase().startsWith("1 vs 1"))

        if (events.length === 0) {
            container.innerHTML = "<p>No hay eventos disponibles.</p>";
            return;
        }

        filteredEvents.forEach(event => {
            const col = document.createElement("div");
            col.classList.add('col-lg-4', 'col-md-6', 'col-sm-12', 'd-flex', 'justify-content-center');

            const {localImg, visitorImg} = getEventImages(event.name, event.sport);
            const cardSport = event.sport;
            const cardDate = event.begin_date;
            const cardStatus = event.status;

            col.innerHTML = `
                <div class="card mt-5 shadow-sm border-0 rounded-4 h-100" style="width: 22rem; justify-content: center;">
                    <div class="card-header bg-light text-center border-0">
                        <div class="d-flex justify-content-center align-items-center gap-3">
                            <img src="${localImg}" class="img-fluid" style="max-height: 60px;" alt="local">
                            <span class="fw-bold">vs</span>
                            <img src="${visitorImg}" class="img-fluid" style="max-height: 60px;" alt="visitor">
                        </div>
                    </div>
                    <div class="card-body text-center">
                        <h5 class="card-title fw-semibold text-danger text-primary">${event.name}</h5>
                        <p class="card-text mb-1"><i class="bi bi-controller me-1"></i>Deporte: <strong>${cardSport}</strong></p>
                        <p class="card-text mb-1"><i class="bi bi-calendar-event me-1"></i>Fecha: <strong>${cardDate}</strong></p>
                        <p class="card-text"><i class="bi bi-info-circle me-1"></i>Estatus: <strong>${cardStatus}</strong></p>
                        <div class="d-flex justify-content-center mt-3">
                            <a id="bet-btn-${event.id_event}" class="btn btn-outline-danger px-4 rounded-pill">Apostar</a>
                        </div>
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
        const eventRes = await fetch(`/event/search?id_event=${id_event}`, {
            method: "GET",
            credentials: "include",
        });
        const eventDataArray = await eventRes.json();
        const eventData = eventDataArray[0];
        const sport = eventData.sport;

        console.log("Datos del evento: ", eventData);
        console.log("nombre del evento:", eventData.name);

        const outcomesRes = await fetch(`/event/${id_event}/outcomes`, {
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
        const typeDescriptions = {
            "ganador local": "Apuesta por el equipo local que ganará el encuentro.",
            "ganador visitante": "Apuesta por el equipo local que ganará el encuentro.",
            "goles local": "Predice la cantidad de goles anotados por el equipo local en el partido.",
            "goles visitante": "Predice la cantidad de goles anotados por el equipo visitante en el partido.",
            "empate": "Predice que ambos equipos quedaran en empate.",
            "tarjetas amarillas": "Apuesta por cuántas tarjetas amarillas se mostrarán.",
            "tarjetas rojas": "Predice cuántas tarjetas rojas habrá.",
            "tiros esquina": "Apuesta por la cantidad de tiros de esquina.",
            "puntos totales": "Predice la suma total de puntos anotados.",
            "puntos local": "Predice la cantidad de puntos anotados por el equipo local en el partido.",
            "puntos visitante": "Predice la cantidad de puntos anotados por el equipo visitante en el partido.",
            "triples": "Apuesta por la cantidad de tiros de tres anotados.",
            "rebotes": "Predice el número total de rebotes.",
            "anotaciones local": "Predice la cantidad de anotaciones del equipo visitante en el partido.",
            "anotaciones visitante": "Predice la cantidad de anotaciones del equipo visitante en el partido.",
            "touchdowns": "Cantidad de touchdowns realizados.",
            "sacks": "Número de veces que se derriba al mariscal de campo.",
            "goles de campo": "Cantidad de goles de campo anotados.",
            "intercepciones": "Número de intercepciones realizadas."
        };


        const availableTypes = sportTypes[sport] || [];
        document.getElementById("betModalLabel").textContent = `Evento: ${eventData.name}`;
        const betModalLabel = document.getElementById("betModalLabel");
        betModalLabel.textContent = `Evento: ${eventData.name}`;

        const betModalBody = document.getElementById('betModalBody');
        betModalBody.innerHTML = `
            <h3> Local: ${eventData.name.split(" vs ")[0]} vs Visitante: ${eventData.name.split(" vs ")[1]}</h3>
            <form id="form-bet">
           
                <div class="form-group mb-3">
                    <label>Tipo de Apuesta</label>
                    <div id="type-buttons" class="d-flex flex-wrap gap-2 mt-2">
                        ${outcomes.map(outcome => `
                            <button type="button" class="btn btn-outline-danger outcome-btn" data-type="${outcome.outcome_name.toLowerCase()}">
                                 ${capitalizeWords(outcome.outcome_name)}  
                            </button>
                        `).join("")}
                    </div>
                    <div id="type-description" class="mt-2 badge bg-black text-wrap fw-semibold"></div>

                </div>

                <div class="form-group" id="target-group">
                    
                    <label for="target">Objetivo de apuesta</label>
                   
                    <select id="target" class="form-control" required>
                        <option value=""> Selecciona tu target</option>
                    </select>
                </div>
                <input type="hidden" id="auto-target">

                <div class="form-group">
                    <label for="amount">Cantidad a Apostar</label>
                    <input type="number" id="amount" class="form-control" required min="1" max="25000">
                </div>
                <div class="form-group">
                    <label for="extra">Momio de a Apuesta Seleccionada</label>
                    <input type="number" id="extra" class="form-control bg-danger text-white bold" readonly>
                </div>
                <input type="hidden" id="id_outcome">
            </form>
            <div id="respuesta-apuesta"></div>
        `;
        let selectedType = "";
        const amountInput = document.getElementById('amount');
        const maxAmount = parseInt(amountInput.max);

        amountInput.addEventListener('input', () => {
            if (parseInt(amountInput.value) > maxAmount) {
                amountInput.value = maxAmount;
            }
        });

        const typeButtonsContainer = document.getElementById("type-buttons");
        const extraInput = document.getElementById("extra");
        const idOutcomeInput = document.getElementById("id_outcome");
        const targetSelect = document.getElementById("target");

        typeButtonsContainer.querySelectorAll(".outcome-btn").forEach(button => {
            button.addEventListener("click", () => {
                typeButtonsContainer.querySelectorAll(".outcome-btn").forEach(btn => btn.classList.remove("active"));
                button.classList.add("active");
                selectedType = button.dataset.type;
                document.getElementById("type-description").innerText =
                    typeDescriptions[selectedType] || "";

                const selectedOutcome = outcomes.find(outcome => outcome.outcome_name.toLowerCase() === selectedType);
                if (selectedOutcome) {
                    extraInput.value = selectedOutcome.official_odds;
                    idOutcomeInput.value = selectedOutcome.id_outcome;
                } else {
                    extraInput.value = "";
                    idOutcomeInput.value = "";
                }

                const [localTeam, visitanteTeam] = eventData.name.split(" vs ").map(s => s.trim());

                if (selectedType === "ganador local") {
                    document.getElementById("target-group").style.display = "none";
                    targetSelect.required = false;
                    document.getElementById("auto-target").value = localTeam;
                } else if (selectedType === "ganador visitante") {
                    document.getElementById("target-group").style.display = "none";
                    targetSelect.required = false;
                    document.getElementById("auto-target").value = visitanteTeam;
                }else if (selectedType === "empate") {
                    document.getElementById("target-group").style.display = "none";
                    targetSelect.required = false;
                    document.getElementById("auto-target").value = "empate";
                }else {
                    document.getElementById("target-group").style.display = "block";
                    targetSelect.required = true;
                    document.getElementById("auto-target").value = "";

                    targetSelect.innerHTML = '<option value="">Selecciona el target</option>';
                    if (selectedType === "ganador") {
                        [localTeam, visitanteTeam].forEach(team => {
                            const option = document.createElement("option");
                            option.value = team;
                            option.textContent = team;
                            targetSelect.appendChild(option);
                        });
                    } else {
                        for (let i = 0; i <= 10; i++) {
                            const option = document.createElement("option");
                            option.value = i;
                            option.textContent = i;
                            targetSelect.appendChild(option);
                        }
                    }
                }
            });
        });


        document.getElementById("submit-bet").addEventListener("click", function (e) {
            e.preventDefault();

            const type = selectedType;
            const amount = parseFloat(document.getElementById("amount").value);
            const target = selectedType === "ganador local" || selectedType === "ganador visitante" || selectedType === "empate"
                ? document.getElementById("auto-target").value.trim()
                : targetSelect.value.trim();
            if(!type||!amount||!target){
                alert("Debes llenar todos los campos para hacer tu apuesta.");
                return;
            }

            const extra = parseFloat(extraInput.value);
            const selectedOutcome = outcomes.find(outcome => outcome.outcome_name.toLowerCase() === type);

            const confirmationBody = `
                <p><strong>Evento:</strong> ${eventData.name}</p>
                <p><strong>Tipo de Apuesta:</strong> ${selectedOutcome ? selectedOutcome.outcome_name : "No seleccionado"}</p>
                <p><strong>Target:</strong> ${target}</p>
                <p><strong>Cantidad a Apostar:</strong> $${amount}</p>
                <p><strong>Momio:</strong> ${extra}</p>
            `;

            document.getElementById("confirmationModalBody").innerHTML = confirmationBody;

            const confirmationModal = new bootstrap.Modal(document.getElementById('confirmationModal'));
            confirmationModal.show();

            console.log("outcome:", selectedOutcome);

            document.getElementById("confirm-bet").addEventListener("click", async function () {
                const token = localStorage.getItem("token");

                const body = {
                    id_event: id_event,
                    id_outcome: selectedOutcome ? selectedOutcome.id_outcome : "",
                    type: type,
                    target: target,
                    amount: amount,
                    extra: extra
                };
                console.log("Respuesta completa de apuesta:", body);


                try {
                    const res = await fetch(`/bet`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify(body)
                    });

                    const data = await res.json();
                    console.log("Apuesta recibida", data);
                    if (!res.ok) {
                        return alert("No tienes suficiente saldo. Deposita e intenta nuevamente.");
                        throw new Error(data.message || "Error en la petición");

                    }
                    hideLoadingModal();
                    document.getElementById("confirmationModal").style.display="none";
                    document.getElementById("betModal").style.display="none";
                    showSuccessModal("¡Apuesta realizada correctamente!");
                    betFormModal._element.addEventListener('hidden.bs.modal', () => {
                        document.body.classList.remove('modal-open');
                        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
                    });
                } catch (err) {
                    alert("Error al enviar tu apuesta. Intenta de nuevo")
                    document.getElementById("respuesta-apuesta").textContent = "Error: " + err.message;
                    hideLoadingModal();
                }
            });
        });

        betFormModal = new bootstrap.Modal(document.getElementById('betModal'));
        betFormModal.show();

    } catch (err) {
        alert("Error al enviar tu apuesta, intenta de nuevo.")
        console.error("Error al mostrar el formulario de apuestas:", err);
    }
}


async function loadUserBonuses() {

    try {
        const token = localStorage.getItem("token")
        const res = await fetch("/bonus/user", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            credentials: "include"
        });

        if (!res.ok) throw new Error("No se pudieron obtener los bonos");

        const bonuses = await res.json();
        const tbody = document.getElementById("bonos-table-body");
        tbody.innerHTML = ""; // Limpiar contenido anterior

        bonuses.forEach(bonus => {
            const tr = document.createElement("tr");

            const statusLabel = bonus.status === "canjeado" ? "Canjeado" : "Disponible";
            const actionBtn = bonus.status === "pendiente"
                ? `<button class="btn btn-success btn-sm" onclick="redeemBonus('${bonus.id_bonus}')">Canjear</button>`
                : `<span class="text-muted">—</span>`;

            tr.innerHTML = `
                <td>${bonus.type} - $${bonus.amount}</td>
                <td>${statusLabel}</td>
                <td>${actionBtn}</td>
            `;

            tbody.appendChild(tr);
        });

    } catch (e) {
        console.error("Error al cargar los bonos:", e);
    }
}

async function redeemBonus(id_bonus) {
    try {
        const token = localStorage.getItem("token")
        const res = await fetch(`/bonus/redeem/${id_bonus}`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            credentials: "include"
        });

        if (!res.ok) {
            const {error} = await res.json();
            return alert("Error: " + error);
        }

        alert("¡Bono canjeado con éxito!");
        await loadUserBonuses(); // Refrescar la tabla
        await checkSession();    // Refrescar el balance
    } catch (e) {
        console.error("Error al canjear bono:", e);
        alert("Error al canjear bono");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadUserBonuses()
})



// Llamar a la función cuando se cargue la página
document.addEventListener("DOMContentLoaded", checkSession);