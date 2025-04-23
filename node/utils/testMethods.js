// Simular base de datos en memoria
import crypto from "crypto";
const db = {
    events: [],
    event_outcomes: [],
    users: [],
    bets: []
};

// Modelo simulado
const BetModel = {
    async createBet({ data, id_user_token }) {
        const event = db.events.find(e => e.id_event === data.id_event);
        if (!event) throw new Error("Evento no encontrado.");
        if (event.status === "FINALIZADO") throw new Error("No se puede apostar a un evento finalizado.");

        const outcome = db.event_outcomes.find(o => o.id_outcome === data.id_outcome);
        if (!outcome) throw new Error("Outcome no encontrado.");

        const user = db.users.find(u => u.id_user === id_user_token);
        if (!user) throw new Error("Usuario no encontrado.");
        if (user.balance < data.amount) throw new Error("Saldo insuficiente.");

        // Descontar saldo
        user.balance -= data.amount;

        const id_bet = crypto.randomUUID();
        const now = new Date();
        const bet = {
            id_bet,
            id_user: id_user_token,
            id_event: data.id_event,
            id_outcome: data.id_outcome,
            momio: outcome.official_odds,
            amount: data.amount,
            type: data.type,
            target: data.target,
            status: "EN_PROCESO",
            result: null,
            begin_date: now.toLocaleString(),
            end_date: null
        };

        db.bets.push(bet);
        return bet;
    }
};

// Prueba unitaria casera
async function testCreateBet() {
    try {
        // Crear evento de prueba
        const id_event = crypto.randomUUID();
        db.events.push({
            id_event,
            name: "Equipo A vs Equipo B",
            sport: "soccer",
            status: "EN_PROCESO"
        });

        // Crear outcome
        const id_outcome = crypto.randomUUID();
        db.event_outcomes.push({
            id_outcome,
            id_event,
            outcome_name: "Ganador",
            official_odds: 2.5
        });

        // Crear usuario
        const id_user = crypto.randomUUID();
        db.users.push({
            id_user,
            name: "Test User",
            balance: 1000
        });

        // Crear apuesta
        const data = {
            id_event,
            id_outcome,
            amount: 100,
            type: "Ganador",
            target: "Equipo A"
        };

        const betCreated = await BetModel.createBet({ data, id_user_token: id_user });

        // Validaciones
        if (betCreated.id_event !== id_event) throw new Error("Evento no coincide.");
        if (betCreated.id_user !== id_user) throw new Error("Usuario no coincide.");
        if (betCreated.amount !== data.amount) throw new Error("Monto no coincide.");
        if (betCreated.id_outcome !== id_outcome) throw new Error("Outcome no coincide.");
        if (betCreated.momio !== 2.5) throw new Error("Momio no coincide.");
        if (betCreated.type !== data.type) throw new Error("Tipo no coincide.");
        if (betCreated.target !== data.target) throw new Error("Target no coincide.");

        console.log("✅ Prueba de createBet PASADA");
    } catch (error) {
        console.error("❌ Prueba de createBet FALLIDA:", error.message);
    }
}

// Ejecutar prueba
testCreateBet();
