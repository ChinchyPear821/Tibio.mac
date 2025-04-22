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
        const res = await fetch("/bet/events/current", {
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
            const col = document.createElement("div");
            col.classList.add("col-12", "col-md-6", "col-lg-4", "mb-4");

            col.innerHTML = `
                <div class="card mt-5" style="width: 22rem; justify-content: center;">
                    <div class="d-flex justify-content-around mt-2 pb-3 pt-3">
                        <img src="./${event.name}.png" style="width: 300px; height: 200px;" class="card-img-top" alt="${event.name}">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${event.name}</h5>
                        <p class="card-text">Deporte: ${event.sport}</p>
                        <p class="card-text">Fecha: ${event.begin_date}</p>
                        <p class="card-text">Estatus: ${event.status}</p>
                        <div class="d-flex justify-content-center">
                            <a href="#" class="btn btn-secondary">Apostar</a>
                        </div>
                    </div>
                </div>
            `;

            container.appendChild(col);
        });
    } catch (err) {
        console.error("Error al cargar eventos:", err);
    }

}

// Llamar a la función cuando se cargue la página
document.addEventListener("DOMContentLoaded", checkSession);