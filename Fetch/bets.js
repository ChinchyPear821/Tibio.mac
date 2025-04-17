const baseURL = "http://localhost:1234";

// Son los datos que se reciben cuando se hace una transaccion con la apuesta
function showBet(bet) {
    return `
    <strong> Tipo:</strong> ${bet.type}<br>
    <strong> Target:</strong> ${bet.target}<br>
    <strong> Monto:</strong> $${bet.amount}<br>
    <strong> Momio:</strong> ${bet.extra}<br>
    <strong> Estado:</strong> ${bet.status}<br>
    <strong> Inicio:</strong> ${bet.begin_date}<br>
    <strong> Fin:</strong> ${bet.end_date}<br>
    <strong> Resultado:</strong> ${bet.result}<br>
    <strong> Apuesta:</strong> ${bet.id_bet}<br>
    <hr>
  `;
}

window.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");

    const loginContainer = document.getElementById("login-container");
    const apuestaContainer = document.getElementById("bet-form");
    const searchBetsContainer = document.getElementById("search-bets-container");
    const searchBetsAuthContainer = document.getElementById("search-bets-auth-container");
    const logoutBtn = document.getElementById("logoutBtn");

    if (loginContainer && apuestaContainer && searchBetsContainer && searchBetsAuthContainer) {
        if (token) {
            loginContainer.style.display = "none";
            apuestaContainer.style.display = "block";
            searchBetsContainer.style.display = "block";
            searchBetsAuthContainer.style.display = "block";
        } else {
            loginContainer.style.display = "block";
            apuestaContainer.style.display = "none";
            searchBetsContainer.style.display = "none";
            searchBetsAuthContainer.style.display = "none";
        }
    } else {
        console.error("");
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("token");
            location.reload();
        });
    }

    obtenerApuestas();
    obtenerApuestasUsuario();
});

// Login
document.getElementById("form-login").addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const res = await fetch(`${baseURL}/user/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (data.token) {
            localStorage.setItem("token", data.token);
            document.getElementById("login-container").style.display = "none";
            document.getElementById("bet-form").style.display = "block";
            document.getElementById("search-bets-container").style.display = "block";
            document.getElementById("search-bets-auth-container").style.display = "block";
        } else {
            alert("Credenciales incorrectas");
        }

    } catch (err) {
        alert("Error en el login: " + err.message);
    }
});

// Crear Apuesta
document.getElementById("form-bet").addEventListener("submit", async function (e) {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const body = {
        id_event: document.getElementById("id_event").value.trim(),
        type: document.getElementById("type").value,
        target: document.getElementById("target").value.trim(),
        amount: parseFloat(document.getElementById("amount").value),
        extra: parseFloat(document.getElementById("extra").value)
    };

    try {
        const res = await fetch(`${baseURL}/bet`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(body)
        });

        const data = await res.json();

        document.getElementById("respuesta-apuesta").textContent = showBet(data);
    } catch (err) {
        document.getElementById("respuesta-apuesta").textContent = "Error: " + err.message;
    }
});
// Search SIN token de usuario
function obtenerApuestas() {
    const form = document.getElementById("search-bets-container");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const type = form.elements["type"].value.trim();
        const status = form.elements["status"].value.trim();
        const id_event = form.elements["id_event"].value.trim();

        const params = new URLSearchParams();
        if (type) params.append("type", type);
        if (status) params.append("status", status);
        if (id_event) params.append("id_event", id_event);

        try {
            const res = await fetch(`${baseURL}/bet/search?${params.toString()}`);
            const data = await res.json();

            const container = document.getElementById("resultados-apuestas");
            container.innerHTML = "";

            data.forEach(bet => {
                const div = document.createElement("div");
                div.style.border = "1px solid #ccc";
                div.style.padding = "10px";
                div.style.margin = "10px 0";
                div.style.borderRadius = "6px";

                div.innerHTML = showBet(bet);
                container.appendChild(div);
            });
        } catch (err) {
            document.getElementById("bet-results").textContent = "Error: " + err.message;
        }
    });
}

// Search con token de usuario
function obtenerApuestasUsuario() {
    const form = document.getElementById("search-bets-auth-container");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const type = form.elements["type"].value.trim();
        const status = form.elements["status"].value.trim();
        const token = localStorage.getItem("token");

        const params = new URLSearchParams();
        if (type) params.append("type", type);
        if (status) params.append("status", status);

        try {
            const res = await fetch(`${baseURL}/bet/search/auth?${params.toString()}`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await res.json();
            const container = document.getElementById("resultados-apuestas-auth");
            container.innerHTML = "";

            data.forEach(bet => {
                const div = document.createElement("div");
                div.style.border = "1px solid #ccc";
                div.style.padding = "10px";
                div.style.margin = "10px 0";
                div.style.borderRadius = "6px";

                div.innerHTML = showBet(bet);
                container.appendChild(div);
            });
        } catch (err) {
            document.getElementById("bet-results-auth").textContent = "Error: " + err.message;
        }
    });
}
