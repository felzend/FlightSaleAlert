require('dotenv').config();
process.env.NTBA_FIX_319 = 1;

const axios = require('axios').default;
const moment = require('moment');
const FlightMonitorAlertBot = require('./bot/flightMonitorAlertBot');

var flightMonitorAlertBot = new FlightMonitorAlertBot();

async function VerificarVoosLatam (listParams) {
    let baseUrl = 'https://bff.latam.com/ws/proxy/booking-webapp-bff/v1/public/revenue/recommendations/oneway';
    if (!listParams.length) {
        return;
    }
    
    var promises = [];
    var listaRotas = listParams.map(x => `- ${x.origin}/${x.destination} no dia ${moment(x.departure).format('DD/MM/YYYY')}`).join('\n');
    var listaVoosSemEscala = [];
    flightMonitorAlertBot.sendMessage(`- Iniciando verificacao de voos sem escalas a venda para as seguintes rotas:\n\n${listaRotas}`);

    listParams.forEach(params => {
        promises.push(new Promise((resolve, reject) => {
            axios.get(baseUrl, { params: params }).then(response => {
                let voos = response.data.data[0].flights;
                let voosSemEscalas = voos.filter(x => x.stops < 1);
                if (voosSemEscalas.length > 0) {
                    listaVoosSemEscala = listaVoosSemEscala.concat(voosSemEscalas);
                }

                resolve();
            });
        }));
    });

    Promise.all(promises).then(() => {
        if (listaVoosSemEscala.length > 0) {
            flightMonitorAlertBot.sendMessage(`${listaVoosSemEscala.length} voos sem escala encontrados:\n\n${listaVoosSemEscala.map(voo => `- ( Voo ${voo.flightCode} ) ( ${voo.stops} Escalas ) - Partida de ${voo.departure.airportCode} as ${voo.departure.time.stamp} / Chegada em ${voo.arrival.airportCode} as ${voo.arrival.time.stamp}`).join('\n')}`);
        }

        setTimeout(() => {
            flightMonitorAlertBot.sendMessage('Finalizando verificacao de voos sem escalas a venda');
        }, 1000);
    });
}

var listParams = [
    {
        "departure": "2020-07-02",
        "origin": "FOR",
        "destination": "MCZ",
        "cabin": "Y",
        "country": "BR",
        "language": "PT",
        "home": "pt_br",
        "adult": "1"
    },
    {
        "departure": "2020-07-02",
        "origin": "FOR",
        "destination": "AJU",
        "cabin": "Y",
        "country": "BR",
        "language": "PT",
        "home": "pt_br",
        "adult": "1"
    },
    {
        "departure": "2020-05-05",
        "origin": "FOR",
        "destination": "CNF",
        "cabin": "Y",
        "country": "BR",
        "language": "PT",
        "home": "pt_br",
        "adult": "1"
    },
    {
        "departure": "2020-04-04",
        "origin": "FOR",
        "destination": "VIX",
        "cabin": "Y",
        "country": "BR",
        "language": "PT",
        "home": "pt_br",
        "adult": "1"
    },
];

VerificarVoosLatam(listParams);