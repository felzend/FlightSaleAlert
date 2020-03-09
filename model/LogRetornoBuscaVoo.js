var LogRetornoBuscaVoo = class LogRetornoBuscaVoo {    
    constructor(flightData, dateTime, voosSemEscala = {}) {
        this.flightData = flightData;
        this.voosSemEscala = voosSemEscala;
        this.dateTime = dateTime;
    }
}

LogRetornoBuscaVoo.collectionName = 'logRetornoBuscaVoo';

module.exports = LogRetornoBuscaVoo;