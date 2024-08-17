// database.js

const pgp = require('pg-promise')();
const dotenv = require("dotenv");
dotenv.config();

// Configuration de la connexion à la base de données à partir des variables d'environnement
const dbConfig = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
};

// Créer une instance de base de données avec pg-promise
const db = pgp(dbConfig);


// Tester la connexion à la base de données
db.connect()
  .then(obj => {
    // Si la connexion est réussie, log dans la console
    obj.done(); // Libérer la connexion dans le pool
  })
  .catch(error => {
    // Si la connexion échoue, log dans la console et arrête le processus Node.js
    console.error('Erreur de connexion à la base de données:', error);
    process.exit(1);
  });



module.exports = db;
