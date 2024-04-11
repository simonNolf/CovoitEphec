const pgp = require('pg-promise');
const dotenv = require("dotenv");
dotenv.config();

// Configuration de la connexion à la base de données
const dbConfig = {
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
};

// Utiliser une configuration de test si l'environnement de test est défini
if (process.env.NODE_ENV === 'test') {
  Object.assign(dbConfig, {
    user: process.env.TEST_PGUSER,
    host: process.env.TEST_PGHOST,
    database: process.env.TEST_PGDATABASE,
    password: process.env.TEST_PGPASSWORD,
    port: process.env.TEST_PGPORT,
  });
}

// Créer une instance de base de données avec pg-promise
const db = pgp()(dbConfig);

// Tester la connexion à la base de données
db.connect()
  .then(obj => {
    // Si la connexion est réussie, log dans la console
    console.log('Connecté à la base de données');
    obj.done(); // Libérer la connexion dans le pool
  })
  .catch(error => {
    // Si la connexion échoue, log dans la console et arrête le processus Node.js
    console.error('Erreur de connexion à la base de données:', error);
    process.exit(1);
  });

module.exports = db;
