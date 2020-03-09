var BuscaVoo = class BuscaVoo {  
    constructor(data) {
        this.baseUrl = 'https://bff.latam.com/ws/proxy/booking-webapp-bff/v1/public/revenue/recommendations/oneway';
        this.origem = data.origem;
        this.destino = data.destino;
        this.date = data.date;
        this.params = data.params;
    }  
}

BuscaVoo.collectionName = 'BuscaVoo';

module.exports = BuscaVoo;