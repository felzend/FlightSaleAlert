var LogBuscaVoo = class LogBuscaVoo {
    constructor(mensagem, dateTime) {
        this.mensagem = mensagem;
        this.dateTime = dateTime;
    }
}

LogBuscaVoo.collectionName = 'logBuscaVoo';

module.exports = LogBuscaVoo;