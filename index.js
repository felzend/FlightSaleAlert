require('dotenv').config();
process.env.NTBA_FIX_319 = 1;

const MongoClient = require('mongodb').MongoClient;
const CronJob = require('cron').CronJob;
const axios = require('axios').default;
const moment = require('moment');
const fs = require('fs');
const FlightMonitorAlertBot = require('./bot/flightMonitorAlertBot');

const BuscaVoo = require('./model/BuscaVoo');
const LogBuscaVoo = require('./model/LogBuscaVoo');
const LogRetornoBuscaVoo = require('./model/LogRetornoBuscaVoo');
var flightMonitorAlertBot = new FlightMonitorAlertBot();

const cronString = '0 * * * *';

var flightCatchJob = new CronJob(cronString, function() {
    var dbUrl = process.env.DATABASE_URL;
    var dbName = process.env.DATABASE_NAME;
    MongoClient.connect(dbUrl, { useUnifiedTopology: true }, (err, client) => {
        const db = client.db(dbName);
        if (err) {
            console.error(err);
            throw err;
        }
        db.collection(BuscaVoo.collectionName).find({}).toArray((err, data) => {
            if (err) {
                console.error(err);
                throw err;
            }
            new Promise((resolve, reject) => {
                if (data.length < 1) {
                    let json = JSON.parse(fs.readFileSync("./initial-data.json", {encoding: "utf-8"}));
                    let listaBuscaVoos = json.BuscaVoo.map(data => new BuscaVoo(data));
                    db.collection(BuscaVoo.collectionName).insertMany(listaBuscaVoos).then(result => {
                        resolve();
                    });
                }
                else {                
                    resolve();
                }
            }).then(() => {
                db.collection(BuscaVoo.collectionName).find({}).toArray((err, data) => {
                    let promises = [];
                    if (err) {
                        console.error(err);
                        throw err;
                    }

                    var listaBuscaVoos = data.map(x => {
                        x.date = moment(x.date).format('DD-MM-YYYY');
                        return new BuscaVoo(x);
                    });
                    listaBuscaVoos.forEach(buscaVoo => {
                        promises.push(new Promise((resolve, reject) => {
                            let currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
                            let logBuscaVoo = new LogBuscaVoo(`Iniciando verificacao de voos sem escalas a venda para a rota ${buscaVoo.origem}/${buscaVoo.destino} para a data ${buscaVoo.date}`, currentTime);
                            db.collection(LogBuscaVoo.collectionName).insertOne(logBuscaVoo).then(result => {
                                axios.get(buscaVoo.baseUrl, { params: buscaVoo.params }).then(response => {
                                    let voos = response.data.data[0].flights;
                                    let voosSemEscalas = voos.filter(x => x.stops < 1);
                                    let currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
                                    let logRetornoBuscaVoo = new LogRetornoBuscaVoo(voos, currentTime, voosSemEscalas);
                                    if (voosSemEscalas.length > 0) {
                                        flightMonitorAlertBot.sendMessage(`${voosSemEscalas.length} voos sem escalas para a rota ${buscaVoo.origem}/${buscaVoo.destino} no dia ${buscaVoo.date}.`);
                                    }
                                    db.collection(LogRetornoBuscaVoo.collectionName).insertOne(logRetornoBuscaVoo).then(result => {
                                        let currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
                                        let logBuscaVoo = new LogBuscaVoo(`Finalizando verificacao de voos sem escalas a venda para a rota ${buscaVoo.origem}/${buscaVoo.destino} para a data ${buscaVoo.date}`, currentTime);
                                        db.collection(LogBuscaVoo.collectionName).insertOne(logBuscaVoo).then(result => {
                                            resolve();
                                        });                                        
                                    });
                                });
                            });
                        }));
                    });

                    Promise.all(promises).then(() => {                        
                        let currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
                        let logBuscaVoo = new LogBuscaVoo(`Finalizado o Processamento de busca de todos os voos.`, currentTime);
                        db.collection(LogBuscaVoo.collectionName).insertOne(logBuscaVoo);
                    });
                });
            });
        });
      });
}, null, true, 'America/Fortaleza', null, true);

flightCatchJob.start();