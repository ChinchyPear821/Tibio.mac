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
        const res = await fetch("http://localhost:1234/bet/user", {
            credentials: "include"
        })

        if (!res.ok) throw new Error("Error en el endpont de la API betsAllByUser")

        const data = await res.json()
        allBets = data.reverse()
        applyFiltersBets()
    } catch (e) {
        console.log("Error al hacer fetch de todas las apuestas: ", e)
    }
}

//FUNCTIONS
function applyFiltersBets() {
    containerBets.innerHTML = ""
    const typeValue = typeFilterBets.value
    typeBet = typeValue
    const daysValue = parseInt(dateFilterBets.value)

    const nowDay = new Date().getDate()
    //Enero = 0 
    const nowMonth = new Date().getMonth() + 1

    let limitDay = 0, limitMonth = 0

    if (typeValue == "ganada" || typeValue == "perdida") {
        filteredBets = allBets.filter(bet => {

            let betDay = bet.begin_date.slice(0, 2)
            let betMonth = bet.begin_date.slice(3, 4)

            if (daysValue == 15) {

                limitDay = nowDay - daysValue
                limitMonth = limitDay < 0 ? nowMonth - 1 : nowMonth
                limitDay = 30 - Math.abs(limitDay)

            } else if (daysValue == 30) {
                limitDay = nowDay
                limitMonth = nowMonth - 1
            }

            return bet.result == typeValue && betDay >= limitDay && betMonth >= limitMonth
        })

    } else if (typeValue == "en proceso") {
        filteredBets = allBets.filter(bet => {

            let betDay = bet.begin_date.slice(0, 2)
            let betMonth = bet.begin_date.slice(3, 4)

            if (daysValue == 15) {

                limitDay = nowDay - daysValue
                limitMonth = limitDay < 0 ? nowMonth - 1 : nowMonth
                limitDay = 30 - Math.abs(limitDay)

            } else if (daysValue == 30) {
                limitDay = nowDay
                limitMonth = nowMonth - 1
            }

            return bet.status == typeValue && betDay >= limitDay && betMonth >= limitMonth
        })
    } else if (typeValue == "ALL") {
        filteredBets = allBets
    }

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
loadMoreBtnBets.addEventListener("click", renderNextTransactions)
fetchAllBetsByUser()