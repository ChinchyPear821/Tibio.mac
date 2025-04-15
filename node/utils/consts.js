export const BET_STATUS = {
    EN_PROCESO: "en proceso",
    ENVIADA: "enviado",
    FINALIZADO: "finalizado"
};

export const EVENT_STATUS= {
    EN_PROCESO: "en proceso",
    FINALIZADO: "finalizado",
};
// En evento sport es el tipo de evento que se crea y en bet sport es lo mismo, comparten el mismo enum
export const CATEGORY= {
    SOCCER: "futbol",
    BASKETBALL: "basquetbol",
    FOOTBALL: "futbol americano",
    UNO_A_UNO_SOCCER: "1 vs 1 futbol",
    UNO_A_UNO_BASKETBALL: "1 vs 1 basquetbol",
    UNO_A_UNO_FOOTBALL: "1 vs 1 futbol americano"
}

export const EVENT_RESULTS={
    NULL: null,
    GANADOR: "ganador",
    PERDEDOR: "perdedor",
    EMPATE: "empate",
    PENDIENTE: "pendiente"
}


const BET_TYPES=[
    "ganador", "goles", "tarjetas amarillas", "tiros esquina", "tarjetas rojas", // para apuestas de futbol
    "puntos totales", "triples", "rebotes", // para basquetbol
    "touchdowns", "sacks","goles de campo", "intercepciones"];// para futbol americano
