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
function eliminarAcentos(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

//Eventos
async function createEvent() {
    document.getElementById('section-create-event').style.display = 'block';

    document.querySelectorAll("#sportDropdown .dropdown-item").forEach(item => {
        item.addEventListener("click", function () {
            let sport = this.textContent;
            document.getElementById("event-sport").value = sport;

            sport = eliminarAcentos(sport.toLowerCase());
            console.log(sport)
            // Oculta todos los divs primero
            document.querySelectorAll(".sport-fields").forEach(div => div.style.display = "none");
            // Muestra el div correspondiente al deporte
            if (sport === "futbol") {
                document.getElementById("soccer-fields").style.display = "block";

                const teams = ['Cruz Azul', 'America', 'Pumas', 'Chivas', 'Tigres', 'Monterrey', 'Toluca', 'Pachuca', 'Atlas', 'Santos', 'Leon', 'Queretaro', 'Juarez', 'Necaxa', 'Mazatlan', 'Tijuana'];
                const localNameDiv = document.getElementById('local-name');

                localNameDiv.innerHTML = `
                <div class="dropdown w-100 mb-3">
                    Equipo local
                    <input type="text" class="form-control dropdown-toggle" data-bs-toggle="dropdown"
                    placeholder="Selecciona un equipo" id="local-team" name="local-team" readonly required>
                    <ul class="dropdown-menu w-100" id="localTeamDropdown">
                    ${teams.map(team => `<li><a class="dropdown-item" href="#">${team}</a></li>`).join('')}
                    </ul>
                </div>
                `;
                //Reescribir dependiendo local
                document.querySelectorAll("#localTeamDropdown .dropdown-item").forEach(item => {
                    item.addEventListener("click", function (e) {
                        e.preventDefault();
                        const selectedTeam = this.textContent;
                        // Establecer el equipo seleccionado en el input
                        document.getElementById("local-team").value = selectedTeam;

                        //Asignar equipos visitantes
                        // Filtrar los equipos para que no incluya el equipo local seleccionado
                        const visitorTeams = [];
                        visitorTeams.push(...teams.filter(team => team !== selectedTeam));

                        const visitorNameDiv = document.getElementById('visitor-name');

                        visitorNameDiv.innerHTML = `
                        <div class="dropdown w-100 mb-3">
                            Equipo visitante
                            <input type="text" class="form-control dropdown-toggle" data-bs-toggle="dropdown"
                            placeholder="Selecciona un equipo" id="visitor-team" name="visitor-team" readonly required>
                            <ul class="dropdown-menu w-100" id="visitorTeamDropdown">
                            ${visitorTeams.map(team => `<li><a class="dropdown-item" href="#">${team}</a></li>`).join('')}
                            </ul>
                        </div>
                        `;
                        //Reescribir dependiendo visitante
                        document.querySelectorAll("#visitorTeamDropdown .dropdown-item").forEach(item => {
                            item.addEventListener("click", function (e) {
                                e.preventDefault();
                                const selectedTeamVisitor = this.textContent;
                                // Establecer el equipo seleccionado en el input
                                document.getElementById("visitor-team").value = selectedTeamVisitor;
                            });
                        });
                    });
                });

            } else if (sport === "basquetbol") {
                document.getElementById("basketball-fields").style.display = "block";

                const teams = ['Lakers', 'Celtics', 'Bulls', 'Warriors', 'Heat', 'Nets', 'Suns', 'Clippers', 'Mavericks', 'Rockets'];
                const localNameDiv = document.getElementById('local-name');

                localNameDiv.innerHTML = `
                <div class="dropdown w-100 mb-3">
                    Equipo local
                    <input type="text" class="form-control dropdown-toggle" data-bs-toggle="dropdown"
                    placeholder="Selecciona un equipo" id="local-team" name="local-team" readonly required>
                    <ul class="dropdown-menu w-100" id="localTeamDropdown">
                    ${teams.map(team => `<li><a class="dropdown-item" href="#">${team}</a></li>`).join('')}
                    </ul>
                </div>
                `;
                //Reescribir dependiendo local
                document.querySelectorAll("#localTeamDropdown .dropdown-item").forEach(item => {
                    item.addEventListener("click", function (e) {
                        e.preventDefault();
                        const selectedTeam = this.textContent;
                        // Establecer el equipo seleccionado en el input
                        document.getElementById("local-team").value = selectedTeam;

                        //Asignar equipos visitantes
                        // Filtrar los equipos para que no incluya el equipo local seleccionado
                        const visitorTeams = [];
                        visitorTeams.push(...teams.filter(team => team !== selectedTeam));

                        const visitorNameDiv = document.getElementById('visitor-name');

                        visitorNameDiv.innerHTML = `
                        <div class="dropdown w-100 mb-3">
                            Equipo visitante
                            <input type="text" class="form-control dropdown-toggle" data-bs-toggle="dropdown"
                            placeholder="Selecciona un equipo" id="visitor-team" name="visitor-team" readonly required>
                            <ul class="dropdown-menu w-100" id="visitorTeamDropdown">
                            ${visitorTeams.map(team => `<li><a class="dropdown-item" href="#">${team}</a></li>`).join('')}
                            </ul>
                        </div>
                        `;
                        //Reescribir dependiendo visitante
                        document.querySelectorAll("#visitorTeamDropdown .dropdown-item").forEach(item => {
                            item.addEventListener("click", function (e) {
                                e.preventDefault();
                                const selectedTeamVisitor = this.textContent;
                                // Establecer el equipo seleccionado en el input
                                document.getElementById("visitor-team").value = selectedTeamVisitor;
                            });
                        });
                    });
                });
            } else if (sport === "futbol americano") {
                document.getElementById("football-fields").style.display = "block";
                const teams = ["Cardinals", "Falcons", "Panthers", "Bears", "Cowboys", "Lions", "Packers", "Rams", "Vikings", "Saints", "Giants", "Eagles", "49ers", "Seahawks", "Buccaneers", "Commanders", "Ravens", "Bills", "Bengals", "Browns", "Broncos", "Texans", "Colts", "Jaguars", "Chiefs", "Raiders", "Chargers", "Dolphins", "Patriots", "Jets", "Steelers", "Titans"];
                const localNameDiv = document.getElementById('local-name');

                localNameDiv.innerHTML = `
                <div class="dropdown w-100 mb-3">
                    Equipo local
                    <input type="text" class="form-control dropdown-toggle" data-bs-toggle="dropdown"
                    placeholder="Selecciona un equipo" id="local-team" name="local-team" readonly required>
                    <ul class="dropdown-menu w-100" id="localTeamDropdown">
                    ${teams.map(team => `<li><a class="dropdown-item" href="#">${team}</a></li>`).join('')}
                    </ul>
                </div>
                `;
                //Reescribir dependiendo local
                document.querySelectorAll("#localTeamDropdown .dropdown-item").forEach(item => {
                    item.addEventListener("click", function (e) {
                        e.preventDefault();
                        const selectedTeam = this.textContent;
                        // Establecer el equipo seleccionado en el input
                        document.getElementById("local-team").value = selectedTeam;

                        //Asignar equipos visitantes
                        // Filtrar los equipos para que no incluya el equipo local seleccionado
                        const visitorTeams = [];
                        visitorTeams.push(...teams.filter(team => team !== selectedTeam));

                        const visitorNameDiv = document.getElementById('visitor-name');

                        visitorNameDiv.innerHTML = `
                        <div class="dropdown w-100 mb-3">
                            Equipo visitante
                            <input type="text" class="form-control dropdown-toggle" data-bs-toggle="dropdown"
                            placeholder="Selecciona un equipo" id="visitor-team" name="visitor-team" readonly required>
                            <ul class="dropdown-menu w-100" id="visitorTeamDropdown">
                            ${visitorTeams.map(team => `<li><a class="dropdown-item" href="#">${team}</a></li>`).join('')}
                            </ul>
                        </div>
                        `;
                        //Reescribir dependiendo visitante
                        document.querySelectorAll("#visitorTeamDropdown .dropdown-item").forEach(item => {
                            item.addEventListener("click", function (e) {
                                e.preventDefault();
                                const selectedTeamVisitor = this.textContent;
                                // Establecer el equipo seleccionado en el input
                                document.getElementById("visitor-team").value = selectedTeamVisitor;
                            });
                        });
                    });
                });
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
        const localTeam = document.getElementById("local-team").value;
        const visitorTeam = document.getElementById("visitor-team").value;
        let sport = eliminarAcentos(document.getElementById("event-sport").value.toLowerCase())
        console.log(sport)
        if (sport === "futbol") {
            eventData = {
                name: `${localTeam} vs ${visitorTeam}`,
                //begin_date: document.getElementById("event-date").value,
                sport: sport,
                outcomes: [
                    { outcome_name: "ganador local", official_odds: parseFloat(document.getElementById("odds-local-soccer").value) },
                    { outcome_name: "ganador visitante", official_odds: parseFloat(document.getElementById("odds-visitor-soccer").value) },
                    { outcome_name: "empate", official_odds: parseFloat(document.getElementById("odds-draw-soccer").value) },
                    { outcome_name: "goles local", official_odds: parseFloat(document.getElementById("odds-goals-local").value) },
                    { outcome_name: "goles visitante", official_odds: parseFloat(document.getElementById("odds-goals-visitor").value) },
                    { outcome_name: "tarjetas amarillas", official_odds: parseFloat(document.getElementById("odds-yellow").value) },
                    { outcome_name: "tiros esquina", official_odds: parseFloat(document.getElementById("odds-corners").value) },
                    { outcome_name: "tarjetas rojas", official_odds: parseFloat(document.getElementById("odds-red").value) }
                ]
            };
        }
        else if (sport === "basquetbol") {
            eventData = {
                name: `${localTeam} vs ${visitorTeam}`,
                //begin_date: document.getElementById("event-date").value,
                sport: sport,
                outcomes: [
                    { outcome_name: "ganador local", official_odds: parseFloat(document.getElementById("odds-local-basketball").value) },
                    { outcome_name: "ganador visitante", official_odds: parseFloat(document.getElementById("odds-visitor-basketball").value) },
                    { outcome_name: "puntos local", official_odds: parseFloat(document.getElementById("odds-puntos-local").value) },
                    { outcome_name: "puntos visitante", official_odds: parseFloat(document.getElementById("odds-puntos-visitante").value) },
                    { outcome_name: "triples", official_odds: parseFloat(document.getElementById("odds-triples").value) },
                    { outcome_name: "rebotes", official_odds: parseFloat(document.getElementById("odds-rebotes").value) },
                ]
            };
        }
        else if (sport === "futbol americano") {
            eventData = {
                name: `${localTeam} vs ${visitorTeam}`,
                //begin_date: document.getElementById("event-date").value,
                sport: sport,
                outcomes: [
                    { outcome_name: "ganador local", official_odds: parseFloat(document.getElementById("odds-local-football").value) },
                    { outcome_name: "ganador visitante", official_odds: parseFloat(document.getElementById("odds-visitor-football").value) },
                    { outcome_name: "anotaciones local", official_odds: parseFloat(document.getElementById("odds-anotaciones-local").value) },
                    { outcome_name: "anotaciones visitante", official_odds: parseFloat(document.getElementById("odds-anotaciones-visitor").value) },
                    { outcome_name: "touchdowns", official_odds: parseFloat(document.getElementById("odds-touchdowns").value) },
                    { outcome_name: "sacks", official_odds: parseFloat(document.getElementById("odds-sacks").value) },
                    { outcome_name: "goles de campo", official_odds: parseFloat(document.getElementById("odds-fieldgoals").value) },
                    { outcome_name: "intercepciones", official_odds: parseFloat(document.getElementById("odds-intercepciones").value) }
                ]
            };
        }
        try {
            // VALIDACIÓN ANTES DEL FETCH

            console.log("Datos del evento:", eventData);
            const isValidOdds = eventData.outcomes.every(outcome => {
                return outcome.official_odds >= 1 && outcome.official_odds <= 10;
            });

            if (!isValidOdds) {
                alert("Todos los momios deben estar entre 1 y 10.");
                return; // No envía el formulario
            }
            const response = await fetch("/event/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(eventData),
                credentials: "include"
            });

            const result = await response.json();
            console.log(result)
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
        const res = await fetch("/event/search?status=en%20proceso", {
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
        table = '<div class="table-responsive"><table class="table table-striped"><th>ID EVENTO</th><th>NOMBRE</th><th>DEPORTE</th><th>FECHA</th><th>ESTATUS</th><th>ACCIONES</th>';
        events.forEach(event => {
            let tableSport = '';
            if (event.sport === "futbol") {
                tableSport = 'Fútbol';
            } else if (event.sport === "basquetbol") {
                tableSport = 'Basquetbol';
            } else if (event.sport === "futbol americano") {
                tableSport = 'Fútbol Americano';
            }
            let tableStatus = '';
            if (event.status === "en proceso") {
                tableStatus = 'En Proceso';
            } else if (event.status === "finalizado") {
                tableStatus = 'Finalizado';
            }
            table += `<tr>
                            <td>${event.id_event}</td>
                            <td>${event.name}</td>
                            <td>${tableSport}</td>
                            <td>${event.begin_date}</td>
                            <td>${tableStatus}</td>
                            <td><button class="btn btn-primary" id="btn-administrate-event-${event.id_event}">Administrar</button></td>
                        </tr>`;
        })
        table += '</table></div>'
        container.innerHTML = table;


        // Agregar evento click a cada botón de administrar
        events.forEach(event => {
            document.getElementById(`btn-administrate-event-${event.id_event}`).addEventListener("click", async () => {
                try {
                    const res = await fetch(`/event/search?id_event=${event.id_event}`, {
                        method: "GET",
                        credentials: "include",
                    });

                    const text = await res.text();

                    if (!res.ok) {
                        console.warn("Error en la respuesta:", text);
                        return;
                    }
                    const data = JSON.parse(text);
                    const evento = data[0];
                    console.log("Evento seleccionado:", evento);

                    document.getElementById('contenedor-modificar-evento').style.display = 'block';
                    document.getElementById('administrate-event-container').style.display = 'none';

                    //Obtener informacion de los outcomes

                    try {
                        const res = await fetch(`/event/${event.id_event}/outcomes`, {
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

                        let containerModify = document.getElementById("modify-form-container");
                        let modifyEvent = `
                            <div class="w-100">
                                <div class="text-center mb-3"><h3>MODIFICAR EVENTO</h3></div>
                                <h5>Datos generales</h5>
                                <table class="table table-responsive table-bordered table-striped">  
                                    <tr>
                                        <td class="w-50">NOMBRE:</td> <td class="w-50 text-center">${(evento.name).toUpperCase()}</td>
                                    </tr>
                                    <tr>
                                        <td class="w-50">FECHA DE INICIO:</td> <td class="w-50 text-center">${evento.begin_date}</td>
                                    </tr>
                                    <tr>
                                        <td class="w-50">DEPORTE:</td> <td class="w-50 text-center">${(evento.sport).toUpperCase()}</td>
                                    </tr>
                                </table>
                                <h5>Outcomes</h5>
                                <table class="table table-responsive table-bordered table-striped"><th class="w-50">NOMBRE DEL MOMIO</th><th class="text-center w-50">MOMIO ACTUAL</th></tr>
                                `
                            outcomes.outcomes.forEach(outcome => {
                                modifyEvent += `
                                <tr>
                                    <td>${(outcome.outcome_name).toUpperCase()}</td>
                                    <td class="text-center justify-content-center">
                                        <label for="${outcome.outcome_name}-${evento.sport}" class="form-label"></label>
                                        <input type="number"  class="form-control form-control-sm w-50 mx-auto rounded shadow-sm d-block" step="0.01" name="${outcome.outcome_name}" id="${outcome.outcome_name}-${evento.sport}" value="${outcome.official_odds}">
                                    </td>
                                </tr>
                                `
                            })
                        modifyEvent += `</table>
                            <div align="center">
                                <button class="btn btn-primary" id="update-outcomes">Actualizar momios</button>
                            </div>    
                        </div>`
                        containerModify.innerHTML = modifyEvent;
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

async function updateOutcomes(id_event){

    try{

        const outcomes=S;
        const responesOutcomes = await fetch(`/${id_event}/outcomes`,{
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(eventData),
            credentials: "include"
        });
    }catch(error){
        
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
        
        //Show the username in the navbar
        let adminName = document.getElementById('admin-name');
        adminName.innerHTML = `${user.user.username}`

    } catch (error) {
        console.error("Error al verificar la sesión:", error);
        window.location.href = "index.html";
    }
    //displayAllEvents(); // Muestra todos los eventos al cargar la página
    try {
        const res = await fetch("/event/", {
            method: "GET",
            credentials: "include",
        });

        const events = await res.json();
        const container = document.getElementById("event-container");

        // Asegúrate de que el contenedor principal tenga la clase 'row'
        container.classList.add("row", "justify-content-center");

        if (events.length === 0) {
            container.innerHTML = "<p>No hay eventos disponibles.</p>";
        }

        events.forEach(event => {
            const [local, visitor] = event.name.split(" vs ");
            let cardSport = '';
            let fileSport = '';
            if (event.sport === "futbol") {
                cardSport = 'Fútbol';
                fileSport = 'SoccerImg';
            } else if (event.sport === "basquetbol") {
                cardSport = 'Basquetbol';
                fileSport = 'BasketballImg';
            } else if (event.sport === "futbol americano") {
                cardSport = 'Fútbol Américano';
                fileSport = 'FootballImg';
            }
            let cardStatus = '';
            if (event.status === "en proceso") {
                cardStatus = 'En Proceso';
            } else if (event.status === "finalizado") {
                cardStatus = 'Finalizado';
            }
            let cardDate = event.begin_date.toString();

            // Crear la columna
            const col = document.createElement("div");
            col.classList.add("col-12", "col-sm-6", "col-md-4", "col-lg-3", "mb-4", "ms-2");

            // Insertar contenido de la carta
            col.innerHTML = `
                <div class="card mt-5 h-100" >
                    <div class="d-flex justify-content-around">
                        <img src="./${fileSport}/${local}.png" class="w-50" alt="${local}">
                        <img src="./${fileSport}/${visitor}.png" class="w-50" alt="${visitor}">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${event.name}</h5>
                        <p class="card-text">Deporte: ${cardSport}</p>
                        <p class="card-text">Fecha: ${cardDate}</p>
                        <p class="card-text">Estatus: ${cardStatus}</p>
                    </div>
                </div>
            `;

            // Añadir la columna al contenedor principal
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