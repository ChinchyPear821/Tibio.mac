document.addEventListener("DOMContentLoaded", obtenerHistorial);

async function getEventName(id_event){
    try{
        const res = await fetch(`http://localhost:1234/event/search?id_event=${id_event}`);
        const data = await res.json();
        console.log(data[0])
        return data[0].name;
    }catch (error){
        console.error("Error al obtener nombre de evento");
    }
}
async function obtenerHistorial() {
    const token = localStorage.getItem("token");

    try {
        const res = await fetch("http://localhost:1234/bet/search/auth", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error("Error al obtener apuestas");
        }

        const data = await res.json();
        showBets(data);
    } catch (error) {
        console.error(error);
        document.getElementById("bet-history").innerHTML = `
      <p class="text-danger">Error al cargar las apuestas</p>
    `;
    }
}

async function showBets(bets) {
    const container = document.getElementById("bet-history");
    container.innerHTML = "";

    if (bets.length === 0) {
        container.innerHTML = `<p class="text-muted">Aún no tienes apuestas registradas.</p>`;
        return;
    }

    for (const bet of bets) {
        const eventName = await getEventName(bet.id_event);
        const card = document.createElement("div");
        card.className = "col-12 col-md-6 col-lg-4 mb-4";
        card.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <h5 class="card-title">Evento: ${eventName}</h5>
          <p class="card-text">
            Deporte: ${bet.category}<br>
            Tipo: ${bet.type}<br>
            Cantidad: $${bet.amount}<br>
            Estado: ${bet.status}<br>
            Resultado: ${bet.result}<br>
            Fecha de inicio: ${bet.begin_date}<br>
            Fecha de finalizacion: ${bet.end_date}
          </p>
        </div>
      </div>
    `;

        container.appendChild(card);
    }
}
