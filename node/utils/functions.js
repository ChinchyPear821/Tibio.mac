import {db} from "../Connection/db.js";
import {BET_STATUS, EVENT_STATUS, CATEGORY} from "./consts.js";
import {SECRET_JWT_KEY} from "../config.js";
import jwt from "jsonwebtoken";

//Funcion que cierra los eventos y apuestas
/*
* Primero busca apuestascon status en finalizado,(Para actualizar una apuesta a finalizado se usa otro endpoint para cerrar eventos)
* Cuando encuentra eventos en finalizado ahora busca las estadisticas de cada evento para determinar el ganador del evento
* Despues busca las apuestas que tengan el mismo id_event y por cada una determina si el "target" del que aposto coincide con alguna de las
* estadisticas del evento y si si devuelve true o false. Para eso se usa una funcion evaluator(para no hacer mas grande le codigo)
* Si won es true se le actualiza el balance al usuario y si no, se queda igual porque ya se le desconto
* */
const sec = 60000
export function monitorBets(){
    setInterval(()=>{
        console.log("[Buscando Eventos en Proceso]...");
        try {
            //Obtiene los eventos que tienen status en finalizado
            const events = db.prepare(`SELECT * FROM events WHERE status = ?`).all(EVENT_STATUS.FINALIZADO);

            //Por cada evento busca las apuestas que esten en proceso que tengan el id del evento
            events.forEach(event => {
                const bets = db.prepare(`
                  SELECT * FROM bets 
                  WHERE id_event = ? AND status = ?
                `).all(event.id_event, BET_STATUS.EN_PROCESO);

                if (bets.length === 0) return;

            /*
                Obtiene las estadisticas del partido del evento (con otro endpoint)
                usa otra funcion que recibe el evento
            */
                const stats = getStatsSport(event);

                if (!stats) {
                    console.log(`[monitorBets] No se encontraron estadisticas para el evento: ${event.id_event}`);
                    return;
                }

                //Ya con las estadisticas revisa el ganador del evento solo comparando los puntos
                const winner =getWinner(event, stats);

                //Asigna el resultado al evento
                db.prepare(`
                  UPDATE events
                  SET result = ?
                  WHERE id_event = ?
                `).run(winner, event.id_event);

                //Ahora busca por cada apuesta de las que hay  y compara el target de la apuesta con las estadisticas
                //Si coincide con alguno retorna true, si no false

                bets.forEach(bet => {
                    let won = false;
                    won = evaluateBetSport(bet, stats, event.sport);

                    //Se le suma el balance si gana y se asigna el resultado de la apuesta

                    const result = won ? "ganada" : "perdida";
                    if (won) {
                        const ganancia = bet.amount * bet.extra;
                        db.prepare(`UPDATE users SET balance = balance + ? WHERE id_user = ?`)
                            .run(ganancia, bet.id_user);
                    }

                    db.prepare(`
                        UPDATE bets
                        SET status = ?, result = ?, end_date = ?
                        WHERE id_bet = ?
                      `).run(BET_STATUS.FINALIZADO, result, new Date().toISOString(), bet.id_bet);
                });
                
            });

        } catch (error) {
            console.error("[Error al iniciar a verificar eventos]", error);
        }
    },60000);
}

export function getRowById (table, id_table, id) {
    return db.prepare(`
        SELECT * FROM ${table} WHERE ${id_table} = ?
    `).all(id)
}

function getStatsSport(event){
    /*
        La parte de
                        case EVENT_TYPES.FUTBOL:
                        case EVENT_TYPES.UNO_A_UNO_SOCCER:
        Es porque usan la misma logica pero los tenia que separar porque eran dos eventos distintos
    */
    switch (event.sport) {
        case CATEGORY.SOCCER:
        case CATEGORY.UNO_A_UNO_SOCCER:
            return db.prepare(`SELECT * FROM soccer_stats WHERE id_event = ?`).get(event.id_event);
        case CATEGORY.BASKETBALL:
        case CATEGORY.UNO_A_UNO_BASKETBALL:
            return db.prepare(`SELECT * FROM basketball_stats WHERE id_event = ?`).get(event.id_event);
        case CATEGORY.FOOTBALL:
        case CATEGORY.UNO_A_UNO_FOOTBALL:
            return db.prepare(`SELECT * FROM football_stats WHERE id_event = ?`).get(event.id_event);
        default:
            console.log(`[monitorBets] No se encontró el deporte: ${event.sport}`);
            return null;
    }
}

function getWinner(event, stats){
    switch (event.sport) {
        case CATEGORY.SOCCER:
        case CATEGORY.UNO_A_UNO_SOCCER:
            return stats.home_goals > stats.away_goals ? stats.home_team :
                stats.home_goals < stats.away_goals ? stats.away_team : "EMPATE";
        case CATEGORY.BASKETBALL:
        case CATEGORY.UNO_A_UNO_BASKETBALL:
            return stats.home_points > stats.away_points ? stats.home_team :
                stats.home_points < stats.away_points ? stats.away_team : "EMPATE";
        case CATEGORY.FOOTBALL:
        case CATEGORY.UNO_A_UNO_FOOTBALL:
            return stats.home_touchdowns > stats.away_touchdowns ? stats.home_team :
                stats.home_touchdowns < stats.away_touchdowns ? stats.away_team : "EMPATE";
    }
}

function evaluateBetSport(bet, stats, sport){
    switch (sport) {
        case CATEGORY.SOCCER:
        case CATEGORY.UNO_A_UNO_SOCCER:
            return evaluateSoccerBet(bet, stats);
        case CATEGORY.BASKETBALL:
        case CATEGORY.UNO_A_UNO_BASKETBALL:
            return evaluateBasketballBet(bet, stats);
        case CATEGORY.FOOTBALL:
        case CATEGORY.UNO_A_UNO_FOOTBALL:
            return evaluateFootballBet(bet, stats);
        default:
            return false;
    }
}

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
}

// Lo hizo gpt para enviar el token
export function authenticateToken(req, res, next){
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Token no proporcionado" });

    try {
        req.user = jwt.verify(token, SECRET_JWT_KEY);
        next();
    } catch (err) {
        return res.status(403).json({ error: "Token inválido o expirado" });
    }
}

//con esta funcion se calcula el target opuesto al que va apostar el "receptor" en una apuesta 1 vs 1
export function calculateTarget({bet}){
    const stats = db.prepare(`SELECT * FROM soccer_stats WHERE id_event = ?`).get(bet.id_event);
    if (bet.target.toLowerCase() === stats.home_team.toLowerCase()) {
        return stats.away_team;
    } else if (bet.target.toLowerCase() === stats.away_team.toLowerCase()) {
        return stats.home_team;
    } else {
        throw new Error("El target original no coincide con ningún equipo del evento");
    }
}