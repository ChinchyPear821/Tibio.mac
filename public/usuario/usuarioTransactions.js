let allTransactions = []
let filteredTransactions = []
let renderCountTransaction = 0
const renderLimitTransaction = 3

//Seleccionamos los botones 
const containerTransactions = document.getElementById("trasaction-scroll-container")
const loadMoreBtnTransactions = document.getElementById("transactions-load-more")
const typeFilterTransactions = document.getElementById("transactions-filter-type")
const dateFilterTransaction = document.getElementById("transactions-filter-date")
//Funcion para generar el pdf
function generatePDF(transactions) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Título del PDF
    doc.setFontSize(16);
    doc.text("Historial de Transacciones", 20, 20);

    let yPosition = 30;
    transactions.forEach((trs, index) => {
        doc.setFontSize(12);
        doc.text(`${index + 1}. ${trs.type} MXN ${trs.amount}`, 20, yPosition);
        yPosition += 10;
        doc.text(`Banco: ${trs.bank}`, 20, yPosition);
        yPosition += 10;
        //doc.text(`Tarjeta: ${trs.card}`, yPosition);
        yPosition += 10;
        doc.text(`Fecha: ${trs.date} ${trs.hour}`, 20, yPosition);
        yPosition += 20;
    });

    doc.save('transacciones.pdf');
}


function parseTransactionDate(dateString) {
    const [datePart] = dateString.split(" ") // "3/5/2025"
    const [day, month, year] = datePart.split("/").map(Number)
    return new Date(year, month - 1, day) // Se crea un objeto Date
}

//FETCH'S A LA API
async function fetchAllTransactionsByUser() {
    try {
        const res = await fetch("/transaction/user", {
            credentials: "include"
        })

        if (!res.ok) throw new Error("No pudo devolver todas las transacciones del usuario")

        const data = await res.json()
        allTransactions = data.reverse()
        applyFiltersTransactions()
    } catch (e) {
        console.log("Error al fetch de todas las transacciones", e)
    }
}

//Functions
function applyFiltersTransactions() {
    containerTransactions.innerHTML = ""
    const typeValue = typeFilterTransactions.value
    const daysValue = parseInt(dateFilterTransaction.value)

    const now = new Date()
    const dateLimit = new Date(now)
    dateLimit.setDate(now.getDate() - daysValue) // Filtra las transacciones por la fecha

    filteredTransactions = allTransactions.filter(trs => {
        const trsDate = parseTransactionDate(trs.date)
        const isInRange = trsDate >= dateLimit

        if (typeValue !== "ALL") {
            return trs.type === typeValue && isInRange
        }
        return isInRange
    })

    renderCountTransaction = 0
    renderNextTransactions()
}

function renderNextTransactions() {
    const next = filteredTransactions.slice(renderCountTransaction, renderCountTransaction + renderLimitTransaction)
    next.forEach(trs => {
        const card = document.createElement("div")
        card.classList.add("card")
        card.innerHTML = `
            <strong>${trs.type}</strong> MXN ${trs.amount}
            </br>
            Banco: ${trs.bank} 
            </br>
            Fecha: ${trs.date} ${trs.hour}
        `
        containerTransactions.appendChild(card)
    })

    renderCountTransaction += next.length

    if (renderCountTransaction >= filteredTransactions.length) {
        loadMoreBtnTransactions.style.display = "none"
    } else {
        loadMoreBtnTransactions.style.display = "block"
    }
}
// Evento para generar PDF
const downloadPDFBtn = document.getElementById("download-pdf")
downloadPDFBtn.addEventListener("click", () => {
    if (filteredTransactions.length === 0) {
        alert("No hay transacciones para exportar.");
        return;
    }
    generatePDF(filteredTransactions)
})

typeFilterTransactions.addEventListener("change", applyFiltersTransactions)
dateFilterTransaction.addEventListener("change", applyFiltersTransactions)
loadMoreBtnTransactions.addEventListener("click", renderNextTransactions)

//INICIAR
fetchAllTransactionsByUser()