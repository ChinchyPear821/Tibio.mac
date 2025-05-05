let modeOperation = "";
let banks = ["HSBC", "BANAMEX", "INBURSA", "BBVA", "SANTANDER", "SCOTIABANK"]

//TRANSACTION MODAL BUTTONS
const btnDeposit = document.querySelector(".btnDeposit")
const btnWithdraw = document.querySelector(".btnWithdraw")
const transactionModal = document.getElementById("transactionModal")
const btnCloseModal = document.querySelector(".btnCloseModal")
const modalTitle = document.querySelector(".modalTitle")
const btnModalSubmit = document.querySelector(".btnModalSubmit")
const transactionForm = document.getElementById("transactionForm")
const amountType = document.querySelector(".amountType")

//ADD CARD MODAL BUTTONS
const allCardsSLCT = document.querySelector(".allCards-slct")
const addCardBtn = document.querySelector(".addCardBtn")
const addCardModal = document.getElementById("addCardModal")
const closeAddCardModalbtn = document.querySelector(".closeAddCardModalbtn")
const addCardSubmitBtn = document.querySelector(".addCardSubmitBtn")
const selectMonthCardExpiration = document.querySelector(".monthCardExpiration")
const selectYearCardExpiration = document.querySelector(".yearCardExpiration")
const selectBank = document.querySelector(".bank")
const addCardForm = document.getElementById("addCardForm")

// MODAL TRANSACTION
btnDeposit.addEventListener("click", () => openModalTransaction("DEPOSITO"))
btnWithdraw.addEventListener("click", () => openModalTransaction("RETIRO"))
btnCloseModal.addEventListener("click", closeModalTransaction)

async function openModalTransaction(type) {

    let allUserCards = []

    try {
        const res = await fetch("/user/cards", {
            credentials: "include",
        })

        if (!res.ok) throw new Error("Error al regresar todas las tarjetas del usurio")

        const result = await res.json()
        allUserCards = result
    } catch (e) {
        console.error("Error al regresar todas las tarjetas del Usuario", e)
    }

    let cards = allUserCards.map(card => 
        `<option value='
            ${JSON.stringify({
                number: card.number,
                password: card.cvv,
                bank: card.bank
            })}
        '>
            ${card.number.toString().slice(-4)} - ${card.expiration}
        </option>`
    ).join("")

    modeOperation = type;

    allCardsSLCT.innerHTML = cards
    if (modeOperation === "DEPOSITO") {
        modalTitle.innerText = "Depositar Dinero"
        btnModalSubmit.innerText = "Depositar"
        amountType.innerText = "Cantidad que deseas Depositar"
    } else if (modeOperation === "RETIRO") {
        modalTitle.innerText = "Retirar Dinero"
        btnModalSubmit.innerText = "Retirar"
        amountType.innerText = "Cantidad que deseas Retirar"
    }
    console.log("Se abrio en", type)
    transactionModal.classList.remove("hidden");
}

function closeModalTransaction() {
    transactionModal.classList.add("hidden")
}

//Modal ADD NEW CARD
addCardBtn.addEventListener("click", () => {
    closeModalTransaction()
    openAddCardModal()
})
closeAddCardModalbtn.addEventListener("click", closeAddCardModal)

function openAddCardModal() {
    const monthsOptions = Array.from({ length: 12 }, (_, i) =>
        `<option value="${i + 1}">${i + 1}</option>`
    ).join("");

    const nowYear = new Date().getFullYear();
    const yearsOptions = Array.from({ length: 16 }, (_, i) => {
        const year = nowYear + i;
        return `<option value="${year}">${year}</option>`;
    }).join("");

    const bankOptions = banks.map(bank =>
        `<option value="${bank}">${bank}</option>`
    ).join("");

    selectMonthCardExpiration.innerHTML = monthsOptions
    selectYearCardExpiration.innerHTML = yearsOptions
    selectBank.innerHTML = bankOptions

    addCardModal.classList.remove("hidden")
}

function closeAddCardModal() {
    addCardModal.classList.add("hidden")
}

//FETCH OF TRANSACTION
btnModalSubmit.addEventListener("click", fetchTransactionAction)

async function fetchTransactionAction(e) {
    //e.preventDefault()

    //FormData Es un metodo en el que detecta cada input, select, etc de un form 
    // y me da sus datos en un objeto clave(name) y valor
    const transactionFormData = new FormData(transactionForm)

    console.log(transactionFormData)

    const selectedCard = JSON.parse(transactionFormData.get("card"))

    const data = {
        "cardNumber": parseInt(selectedCard.number),
        "cardPassword": parseInt(selectedCard.password),
        "bank": selectedCard.bank,
        "amount": parseInt(transactionFormData.get("amount")),
        "type": modeOperation === "DEPOSITO" ? "DEPOSITO" : "RETIRO"
    }
    console.log(data);

    let endpoint = ""

    if (modeOperation === "DEPOSITO") {
        endpoint = "/transaction/deposit"
    } else if (modeOperation === "RETIRO") {
        endpoint = "/transaction/withdraw"
    }

    console.log(data, endpoint)

    try {
        const res = await fetch(endpoint, {
            credentials: "include",
            method: "POST",
            headers: { 'Content-Type': "application/json" },
            body: JSON.stringify(data)
        })

        if (!res.ok) throw new Error(`Error al ${modeOperation}`)

        const result = await res.json()
        console.log(result)
        alert("Transaccion Exitosa")
    } catch (e) {
        console.error("Error al realizar la transaccion", e)
        alert("Error al realizar la transaccion")
    }
}

addCardSubmitBtn.addEventListener("click", fetchAddUserCard)

async function fetchAddUserCard(e) {

    const cardFormData = new FormData(addCardForm)
    const data = {
        "cardName": cardFormData.get("cardName"),
        "cardNumber": parseInt(cardFormData.get("cardNumber")),
        "cardExpiration": `${cardFormData.get("monthCardExpiration")}
                /${cardFormData.get("yearCardExpiration")}`,
        "cardPassword": parseInt(cardFormData.get("cardPassword")),
        "bank": cardFormData.get("bank"),
    }
    console.log(data)

    try {
        const res = await fetch("/user/card", {
            credentials: "include",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })

        if (!res.ok) throw new Error("Error al hacer fetch POST addNewCard")

        const result = await res.json()
        console.log(result)
        alert("Tarjeta agregada con exito")
    } catch (e) {
        console.error("Error al anadir una nueva Tarjeta", e)
        alert("Error al anadir una nueva Tarjeta")
    }
}
