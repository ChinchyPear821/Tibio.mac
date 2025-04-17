const baseURL = "http://localhost:1234";

// Datos que se reciben cuando se hace una transaccion con el evento
function showEvent(event) {
    return `
        <strong>Nombre:</strong> ${event.name}<br>
        <strong>ID:</strong> ${event.id_event}<br>
        <strong>Deporte:</strong> ${event.sport}<br>
        <strong>Estado:</strong> ${event.status}<br>
        <strong>Resultado:</strong> ${event.result}<br>
        <strong>Fecha de inicio:</strong> ${event.begin_date}<br>
        <strong>Fecha de finalizacion:</strong> ${event.end_date}
    `;
}

async function getEventos() {
    try {
        const res = await fetch(`${baseURL}/event`);
        const data = await res.json();

        const container = document.getElementById("all-events-container");
        container.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            container.textContent = "No hay eventos disponibles.";
            return;
        }

        data.forEach(event => {
            const div = document.createElement("div");
            div.style.border = "1px solid #ccc";
            div.style.padding = "10px";
            div.style.margin = "10px 0";
            div.style.borderRadius = "6px";

            div.innerHTML = showEvent(event);
            container.appendChild(div);
        });

    } catch (err) {
        document.getElementById("eventos").textContent = "Error: " + err.message;
    }
}
 // Search
async function searchEvents(form) {
    const formData = new FormData(form);
    const params = new URLSearchParams();

    for (let [key, value] of formData.entries()) {
        if (value.trim() !== "") {
            params.append(key, value);
        }
    }

    const url = `${baseURL}/event/search?${params.toString()}`;

    try {
        const res = await fetch(url);
        const data = await res.json();

        const container = document.getElementById("resultados-busqueda");
        container.innerHTML = "";

        data.forEach(evento => {
            const div = document.createElement("div");
            div.style.border = "1px solid #ccc";
            div.style.padding = "10px";
            div.style.margin = "10px 0";
            div.style.borderRadius = "6px";

            div.innerHTML = showEvent(evento);
            container.appendChild(div);
        });

    } catch (err) {
        document.getElementById("resultados-busqueda").textContent = "Error: " + err.message;
    }
}

async function createEvent() {
    const home_team = document.getElementById("equipoA").value.trim();
    const away_team = document.getElementById("equipoB").value.trim();
    const sport = document.getElementById("sport").value;
    const resContainer = document.getElementById("create-event-response");

    if (!home_team || !away_team || !sport) {
        resContainer.textContent = "Todos los campos son obligatorios.";
        return;
    }

    const name = `${home_team} vs ${away_team}`;
    const body = { name, sport };

    try {
        const res = await fetch(`${baseURL}/event`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (data && data.name) {
            resContainer.innerHTML = showEvent(data);
        } else {
            resContainer.textContent = "Error al crear evento.";
        }

    } catch (err) {
        resContainer.textContent = "Error: " + err.message;
    }
}

async function closeEvent() {
    const id_event = document.getElementById("id_event_close").value.trim();
    const resContainer = document.getElementById("close-event-response");

    const body = {
        id_event,
        result: "pendiente"
    };

    try {
        const res = await fetch(`${baseURL}/event/close`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        if (data && data.name) {
            resContainer.innerHTML = showEvent(data);
        } else {
            resContainer.textContent = "No se pudo cerrar el evento.";
        }

    } catch (err) {
        resContainer.textContent = "Error: " + err.message;
    }
}

function updateStats(type) {
    const container = document.getElementById("fields");
    container.innerHTML = "";

    const fields = statsSport[type];
    if (fields) {
        fields.forEach(field => {
            const label = document.createElement("label");
            label.textContent = field + ":";
            const select = document.createElement("select");
            select.name = field;
            select.required = true;

            for (let i = 0; i <= 20; i++) {
                const option = document.createElement("option");
                option.value = i;
                option.textContent = i;
                select.appendChild(option);
            }

            container.appendChild(label);
            container.appendChild(document.createElement("br"));
            container.appendChild(select);
            container.appendChild(document.createElement("br"));
            container.appendChild(document.createElement("br"));
        });
    }
}

async function registerStats() {
    const type = document.getElementById("sport-type").value;
    const id_event = document.getElementById("id_event_result").value.trim();
    const fields = document.querySelectorAll("#fields select");
    const responseContainer = document.getElementById("stats-result");

    if (!type || !id_event) {
        responseContainer.textContent = "Faltan campos obligatorios.";
        return;
    }

    const data = {};
    fields.forEach(select => {
        data[select.name] = parseInt(select.value);
    });

    const body = { type, id_event, data };

    try {
        const res = await fetch(`${baseURL}/sports`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        const result = await res.json();

        if (result && Object.keys(result).length > 0) {
            let html = `<strong>Estadísticas actualizadas para el evento:</strong><br><br>`;
            for (let clave in result) {
                html += `<strong>${clave.replace(/_/g, " ")}:</strong> ${result[clave]}<br>`;
            }
            responseContainer.innerHTML = html;
        } else {
            responseContainer.textContent = "No se pudieron registrar resultados.";
        }

    } catch (err) {
        responseContainer.textContent = "Error: " + err.message;
    }
}

function getEventStats() {
    const type = document.getElementById("event-type").value;
    const id_event = document.getElementById("id-event-sport").value.trim();
    const responseContainer = document.getElementById("stats-response");

    const url = `${baseURL}/sports?type=${type}&id_event=${id_event}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            if (!data || Object.keys(data).length === 0) {
                responseContainer.textContent = "No se encontraron estadísticas para este evento.";
                return;
            }

            let html = `<strong>Estadísticas del evento:</strong><br><br>`;
            for (let dataKey in data) {
                html += `<strong>${dataKey.replace(/_/g, " ")}:</strong> ${data[dataKey]}<br>`;
            }

            responseContainer.innerHTML = html;
        })
        .catch(err => {
            responseContainer.textContent = "Error al consultar estadisticas: " + err.message;
        });
}


const statsSport = {
    futbol: ["home_goals", "away_goals", "yellow_cards", "red_cards", "corners", "penalties"],
    basquetbol: ["home_points", "away_points", "three_pointers", "fouls", "rebounds"],
    futbol_americano: ["home_touchdowns","away_touchdowns", "field_goals", "interceptions", "sacks"]
};

// Event listeners
document.getElementById("search-form").addEventListener("submit", function (e) {
    e.preventDefault();
    searchEvents(this);
});

document.getElementById("create-event-form").addEventListener("submit", function (e) {
    e.preventDefault();
    createEvent();
});

document.getElementById("close-form").addEventListener("submit", function (e) {
    e.preventDefault();
    closeEvent();
});

document.getElementById("sport-type").addEventListener("change", function () {
    updateStats(this.value);
});

document.getElementById("stats-form").addEventListener("submit", function (e) {
    e.preventDefault();
    registerStats();
});

document.getElementById("show-stats-form")
    .addEventListener("submit", function (e) {
        e.preventDefault();
        getEventStats();
    });
