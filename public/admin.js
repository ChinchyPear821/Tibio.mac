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
//Eventos
async function createEvent() {
    document.getElementById('section-create-event').style.display = 'block';

    document.querySelectorAll("#sportDropdown .dropdown-item").forEach(item => {
        item.addEventListener("click", function () {
            const sport = this.textContent;
            document.getElementById("event-sport").value = sport;

            // Oculta todos los divs primero
            document.querySelectorAll(".sport-fields").forEach(div => div.style.display = "none");

            // Muestra el div correspondiente al deporte
            if (sport === "Soccer") {
                document.getElementById("soccer-fields").style.display = "block";
            } else if (sport === "Basketball") {
                document.getElementById("basketball-fields").style.display = "block";
            } else if (sport === "Football") {
                document.getElementById("football-fields").style.display = "block";
            }
        });
    });


    document.getElementById("volver-create-event").addEventListener("click", function () {
        document.getElementById('section-create-event').style.display = 'none';
    });

    const form = document.getElementById('create-event-form');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const formData = new FormData(form);
        eventData = {}
        // Datos del evento
        const sport = document.getElementById("event-sport").value
        if (sport === "Soccer") {
            eventData = {
                name: document.getElementById("event-name").value,
                begin_date: document.getElementById("event-date").value,
                sport: document.getElementById("event-sport").value,
                outcomes: [
                    { outcome_name: "Gana Local", official_odds: parseFloat(document.getElementById("odds-local-soccer").value) },
                    { outcome_name: "Empate", official_odds: parseFloat(document.getElementById("odds-empate-soccer").value) },
                    { outcome_name: "Gana Visitante", official_odds: parseFloat(document.getElementById("odds-visitante-soccer").value) },
                    { outcome_name: "Tarjetas Amarillas", official_odds: parseFloat(document.getElementById("odds-yellow").value) },
                    { outcome_name: "Tarjetas Rojas", official_odds: parseFloat(document.getElementById("odds-red").value) },
                    { outcome_name: "Corners", official_odds: parseFloat(document.getElementById("odds-corners").value) },
                    { outcome_name: "Penales", official_odds: parseFloat(document.getElementById("odds-penalties").value) }
                ]
            };
        }
        else if (sport === "Basketball") {
            eventData = {
                name: document.getElementById("event-name").value,
                begin_date: document.getElementById("event-date").value,
                sport: document.getElementById("event-sport").value,
                outcomes: [
                    { outcome_name: "Gana Local", official_odds: parseFloat(document.getElementById("odds-local-basketball").value) },
                    { outcome_name: "Gana Visitante", official_odds: parseFloat(document.getElementById("odds-visitante-basketball").value) },
                    { outcome_name: "Total Puntos", official_odds: parseFloat(document.getElementById("odds-puntos").value) },
                    { outcome_name: "Triples", official_odds: parseFloat(document.getElementById("odds-triples").value) },
                    { outcome_name: "Faltas", official_odds: parseFloat(document.getElementById("odds-faltas").value) },
                    { outcome_name: "Rebotes Totales", official_odds: parseFloat(document.getElementById("odds-rebotes").value) },
                ]
            };
        }
        else if (sport === "Football") {
            eventData = {
                name: document.getElementById("event-name").value,
                begin_date: document.getElementById("event-date").value,
                sport: document.getElementById("event-sport").value,
                outcomes: [
                    { outcome_name: "Gana Local", official_odds: parseFloat(document.getElementById("odds-local-football").value) },
                    { outcome_name: "Gana Visitante", official_odds: parseFloat(document.getElementById("odds-visitante-football").value) },
                    { outcome_name: "Touchdowns", official_odds: parseFloat(document.getElementById("odds-touchdowns").value) },
                    { outcome_name: "Field goals", official_odds: parseFloat(document.getElementById("odds-fieldgoals").value) },
                    { outcome_name: "Intercepciones Totales", official_odds: parseFloat(document.getElementById("odds-intercepciones").value) },
                    { outcome_name: "Sacks", official_odds: parseFloat(document.getElementById("odds-sacks").value) }
                ]
            };
        }
        try {
            const response = await fetch("/bet/events", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(eventData),
                credentials: "include"
            });

            const result = await response.json();

            if (response.ok) {
                alert("Evento creado exitosamente");
                document.getElementById('section-create-event').style.display = 'none';
                form.reset();
            } else {
                alert("Error al crear evento: " + result.error || result.message);
            }
        } catch (err) {
            console.error("Error en la solicitud:", err);
            alert("Ocurrió un error al enviar el formulario.");
        }
    });
}
async function administrateEvent() {
    document.getElementById('section-administrate-event').style.display = 'block';
    document.getElementById("volver-administrate-event").addEventListener("click", function () {
        document.getElementById('section-administrate-event').style.display = 'none';
    });

    //obtener todos los eventos
    try {
        const res = await fetch("/bet/events/current", {
            method: "GET",
            credentials: "include",
        });

        const events = await res.json();
        const container = document.getElementById("administrate-event-container");

        if (events.length === 0) {
            container.innerHTML = "<p>No hay eventos disponibles.</p>";
            return;
        }
        console.log(events)
        table = '<div class="table-responsive"><table class="table table-striped">';
        events.forEach(event => {
            table += `<tr>
                            <td>${event.id_event}</td>
                            <td>${event.name}</td>
                            <td>${event.sport}</td>
                            <td>${event.begin_date}</td>
                            <td>${event.status}</td>
                            <td><button class="btn btn-primary" id="btn-administrate-event-${event.id_event}">Administrar</button></td>
                        </tr>`;
        })
        table += '</table></div>'
        container.innerHTML = table;


        // Agregar evento click a cada botón de administrar
        events.forEach(event => {
            document.getElementById(`btn-administrate-event-${event.id_event}`).addEventListener("click", async () => {
                try {
                    const res = await fetch(`/bet/events/${event.id_event}`, {
                        method: "GET",
                        credentials: "include",
                    });

                    const text = await res.text();

                    if (!res.ok) {
                        console.warn("Error en la respuesta:", text);
                        return;
                    }

                    const data = JSON.parse(text);
                    console.log("Evento obtenido:", data);


                    document.getElementById('contenedor-modificar-evento').style.display = 'block';
                    document.getElementById('administrate-event-container').style.display = 'none';

                    //Obtener informacion de los outcomes

                    try {
                        const res = await fetch(`/bet/events/${event.id_event}/outcomes`, {
                            method: "GET",
                            credentials: "include",
                        });

                        const text = await res.text();

                        if (!res.ok) {
                            console.warn("Error en la respuesta:", text);
                            return;
                        }

                        const outcomes = JSON.parse(text);
                        console.log("Outcomes obtenidos:", outcomes);

                        // Mostrar los outcomes en el formulario

                        const containerModify = document.getElementById("modify-form-container");
                        containerModify.innerHTML = `
                        <h3>Modificar Evento</h3>
                        <form id="modify-event-form">
                            <div class="mb-3">
                                <label for="modify-event-name" class="form-label">Nombre del Evento</label>
                                <input type="text" class="form-control" id="modify-event-name" value="${data.name}" required>
                            </div>
                            <div class="mb-3">
                                <label for="modify-event-date" class="form-label">Fecha del Evento</label>
                                <input type="date" class="form-control" id="modify-event-date" value="${data.begin_date}" required>
                            </div>
                            <div class="mb-3">
                                <p>Deporte: ${data.sport}</p>
                            </div>
                            <button type="submit" class="btn btn-primary">Modificar Evento</button>
                        </form>`

                    }
                    catch (err) {
                        console.error("Error al obtener outcomes:", err);
                    }

                } catch (err) {
                    console.error("Error al hacer fetch:", err);
                }

            });
        });

    } catch (err) {
        console.error("Error al cargar eventos:", err);
    }
}

async function checkSession() {
    try {
        const response = await fetch("/protected-route", {
            method: "GET",
            credentials: "include",
        });
        const user = await response.json();

        // Verificar si el usuario está en admin.html y no es ADMIN

        if (user.user.rol !== "ADMIN") {
            alert("Acceso no autorizado. Redirigiendo a la página principal.");
            window.location.href = "main.html";
            return;
        }


    } catch (error) {
        console.error("Error al verificar la sesión:", error);
        window.location.href = "index.html";
    }

    //displayAllEvents(); // Muestra todos los eventos al cargar la página
    try {
        const res = await fetch("/bet/events/current", {
            method: "GET",
            credentials: "include",
        });

        const events = await res.json();
        const container = document.getElementById("event-container");

        if (events.length === 0) {
            container.innerHTML = "<p>No hay eventos disponibles.</p>";
        }

        events.forEach(event => {
            const col = document.createElement("div");
            col.classList.add("col-12", "col-md-6", "col-lg-4", "mb-4", "ms-3");

            col.innerHTML = `
                <div class="card mt-5" style="width: 22rem; justify-content: center;">
                    <div class="d-flex justify-content-around mt-2 pb-3 pt-3">
                        <img src="./${event.name}.png" style="width: 300px; height: 200px;" class="card-img-top" alt="${event.name}">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${event.name}</h5>
                        <p class="card-text">Deporte: ${event.sport}</p>
                        <p class="card-text">Fecha: ${event.begin_date}</p>
                        <p class="card-text">Estatus: ${event.status}</
                    </div>
                </div>
            `;

            container.appendChild(col);
        });
    } catch (err) {
        console.error("Error al cargar eventos:", err);
    }
    //Solo en la ventana eventos
    const currentFile = window.location.pathname.split("/").pop();
    if (currentFile === "eventos.html") {
        document.getElementById('section-create-event').style.display = 'none';
        document.getElementById('section-administrate-event').style.display = 'none';
        document.getElementById('btn-create-event').addEventListener('click', async () => {
            await createEvent(); // Llama a la función para crear un evento
        })
        document.getElementById('iniciar-administracion').addEventListener('click', async () => {
            await administrateEvent(); // Llama a la función para administrar un evento
        })
    }
}
document.addEventListener("DOMContentLoaded", () => {
    checkSession(); // Verifica la sesión al cargar la página
})