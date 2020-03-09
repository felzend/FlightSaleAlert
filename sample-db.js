const MongoClient = require('mongodb').MongoClient;
const assert = require('assert'); 
const BuscaVoo = require('./model/BuscaVoo');

// Connection URL
const url = 'mongodb://localhost:27017';
 
// Database Name
const dbName = 'teste';

// Use connect method to connect to the server
MongoClient.connect(url, function(err, client) {
  console.log("Connected successfully to server");
  const db = client.db(dbName);

  db.collection('busca_voo').insertOne(new BuscaVoo());
 
  client.close();
});