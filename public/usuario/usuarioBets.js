let allBets = []
let filteredBets = []
let renderCountBets = 0
let typeBet = ""
const renderLimitBets = 3

//SELECCIONAMOS BOTONES
const containerBets = document.getElementById("bet-scroll-container")
const loadMoreBtnBets = document.getElementById("bets-load-more")
const typeFilterBets = document.getElementById("bets-filter-type")
const dateFilterBets = document.getElementById("bets-filter-date")

//FETCH'S A LA API
async function fetchAllBetsByUser() {
    try {
        const res = await fetch("/bet/user", {
            method: "GET",
            credentials: "include"
        })

        if (!res.ok) throw new Error("Error en el endpont de la API betsAllByUser")
        const data = await res.json()

        allBets = data.reverse()
        console.log("apuestas obtenidas", allBets);
        applyFiltersBets()
    } catch (e) {
        console.log("Error al hacer fetch de todas las apuestas: ", e)
    }
}

//FUNCTIONS
function parseBetDate(dateString) {
    if (!dateString || typeof dateString !== "string") return null;

    const [datePart] = dateString.split(" ");
    const [day, month, year] = datePart.split("/").map(Number);

    return new Date(year, month - 1, day);
}


function applyFiltersBets() {
    containerBets.innerHTML = ""
    const typeValue = typeFilterBets.value
    typeBet = typeValue
    const daysValue = parseInt(dateFilterBets.value)

    const now = new Date()
    const dateLimit = new Date(now)
    dateLimit.setDate(now.getDate() - daysValue)

    filteredBets = allBets.filter(bet => {
        const betDate = parseBetDate(bet.begin_date);
        if (!betDate) return false;
        const isInRange = betDate >= dateLimit

        if (typeValue === "ganada" || typeValue === "perdida") {
            return bet.result === typeValue && isInRange
        } else if (typeValue === "en proceso") {
            return bet.status === typeValue && isInRange
        } else if (typeValue === "ALL") {
            return true
        }
        return false
    })

    renderCountBets = 0
    renderNextBets()
}

function renderNextBets() {
    let statusText = "";

    const next = filteredBets.slice(renderCountBets, renderCountBets + renderLimitBets)
    next.forEach(bet => {
        const card = document.createElement("div")
        card.classList.add("card")

        let momioGanado = null
        let fechaFin = bet.end_date ? `Fecha Fin: ${bet.end_date}</br>` : ""

        if(typeBet == "ALL"){
            statusText = !bet.result ? "PENDIENTE" : bet.result
        }else if (typeBet === "en proceso") {
            statusText = "PENDIENTE";
        } else if (typeBet === "ganada") {
            statusText = "GANADA";
            momioGanado = bet.amount * bet.extra
        } else if (typeBet === "perdida") {
            statusText = "PERDIDA";
        }        

        card.innerHTML = `
            <strong>${statusText}</strong>
            Categoria: ${bet.category}
            </br>
            Tipo: ${bet.target} ${bet.type}
            </br>
            Monto: ${bet.amount}
            </br>
            Momio: ${bet.extra}
            </br>
            ${momioGanado ? `Ganancia:  ${momioGanado}</br>` : ""}
            Fecha Inicio: ${bet.begin_date}
            ${fechaFin}
            `
            containerBets.appendChild(card)
    })

    renderCountBets += next.length

    if(renderCountBets >= filteredBets.length){
        loadMoreBtnBets.style.display = "none"
    } else{
        loadMoreBtnBets.style.display = "block"
    }

}
//INICIAR
typeFilterBets.addEventListener("change", applyFiltersBets)
dateFilterBets.addEventListener("change", applyFiltersBets)
loadMoreBtnBets.addEventListener("click", renderNextBets)
fetchAllBetsByUser()