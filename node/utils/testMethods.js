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
/*
//Las siguientes 3 funciones son las que se usan para evaluar cada tipo de apuesta segun la categoria y determinar la apuesta
function evaluateSoccerBet(bet, stats) {

    console.log(`[evaluateSoccerBet] bet.target=${bet.target}, home=${stats.home_team}, away=${stats.away_team}`);
    switch (bet.type.toLowerCase()) {
        case 'goles':
            return parseInt(bet.target) === stats.home_goals + stats.away_goals;
        case 'tarjetas amarillas':
            return parseInt(bet.target) === stats.yellow_cards;
        case 'tarjetas rojas':
            return parseInt(bet.target) === stats.red_cards;
        case 'tiros de esquina':
            return parseInt(bet.target) === stats.corners;
        case 'penales':
            return parseInt(bet.target) === stats.penalties;
        case 'ganador':
            if (stats.home_goals > stats.away_goals) {
                return bet.target.toLowerCase() === stats.home_team.toLowerCase();
            } else if (stats.away_goals > stats.home_goals) {
                return bet.target.toLowerCase() === stats.away_team.toLowerCase();
            } else {
                return bet.target.toLowerCase() === 'empate';
            }
        default:
            return false;
    }
}

function evaluateBasketballBet(bet, stats) {
    switch (bet.type.toLowerCase()) {
        case 'puntos':
            return parseInt(bet.target) === stats.home_points + stats.away_points;
        case 'triples':
            return parseInt(bet.target) === stats.three_pointers;
        case 'faltas':
            return parseInt(bet.target) === stats.fouls;
        case 'rebotes':
            return parseInt(bet.target) === stats.rebounds;
        case 'ganador':
            if (stats.home_points > stats.away_points) {
                return bet.target.toLowerCase() === stats.home_team.toLowerCase();
            } else if (stats.away_points > stats.home_points) {
                return bet.target.toLowerCase() === stats.away_team.toLowerCase();
            } else {
                return bet.target.toLowerCase() === 'empate';
            }
        default:
            return false;
    }
}

function evaluateFootballBet(bet, stats) {
    switch (bet.type.toLowerCase()) {
        case 'touchdowns':
            return parseInt(bet.target) === stats.home_touchdowns + stats.away_touchdowns;
        case 'goles de campo':
            return parseInt(bet.target) === stats.field_goals;
        case 'intercepciones':
            return parseInt(bet.target) === stats.interceptions;
        case 'sacks':
            return parseInt(bet.target) === stats.sacks;
        case 'ganador':
            if (stats.home_touchdowns > stats.away_touchdowns) {
                return bet.target.toLowerCase() === stats.home_team.toLowerCase();
            } else if (stats.away_touchdowns > stats.home_touchdowns) {
                return bet.target.toLowerCase() === stats.away_team.toLowerCase();
            } else {
                return bet.target.toLowerCase() === 'empate';
            }
        default:
            return false;
    }
}*/

//con esta funcion se calcula el target opuesto al que va apostar el "receptor" en una apuesta 1 vs 1
/*export function calculateTarget({bet}){
    const stats = db.prepare(`SELECT * FROM soccer_stats WHERE id_event = ?`).get(bet.id_event);
    if (bet.target.toLowerCase() === stats.home_team.toLowerCase()) {
        return stats.away_team;
    } else if (bet.target.toLowerCase() === stats.away_team.toLowerCase()) {
        return stats.home_team;
    } else {
        throw new Error("El target original no coincide con ningún equipo del evento");
    }
}*/