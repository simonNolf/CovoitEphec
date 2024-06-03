const express = require('express');
const cors = require('cors');
const db = require('./database');
const bodyParser = require('body-parser');
const usersRoutes = require('./usersRoutes.js');
const app = express();
const jwt = require('jsonwebtoken');


app.use(cors());
app.use(bodyParser.json()); 

app.use('/users', usersRoutes);

const PORT = 3030;
app.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});

// Route d'activation du compte
const moment = require('moment');

app.get('/activate/:matricule', async (req, res) => {
  const matricule = req.params.matricule;

  try {
    // Récupérer l'utilisateur et sa date d'expiration depuis la base de données
    const userData = await db.one('SELECT status, activation_expiration FROM "user" WHERE matricule = $1', [matricule]);

    // Vérifier si le compte est déjà actif
    if (userData.status === 'active') {
      return res.send('Votre compte est déjà actif. Vous pouvez vous connecter.');
    }

    // Vérifier si la date d'expiration n'a pas été dépassée
    const expirationDate = moment(userData.activation_expiration);
    if (moment().isAfter(expirationDate)) {
      return res.status(400).send('Le lien d\'activation a expiré. Veuillez vous réinscrire.');
    }

    // Mettre à jour le statut de l'utilisateur à 'active'
    await db.none('UPDATE "user" SET status = $1 WHERE matricule = $2', ['active', matricule]);

    res.send('Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.');
  } catch (error) {
    console.error('Erreur lors de l\'activation du compte :', error);
    res.status(500).send('Erreur lors de l\'activation du compte.');
  }
});


app.get('/getUser', async (req, res) => {
  const receivedToken = req.headers.token; // Récupérer le token de l'en-tête

  if (!receivedToken) {
    return res.status(401).json({ success: false, message: 'Token non valide' });
  }

  try {
    // Décryptage du token reçu pour obtenir le matricule
    const decodedToken = jwt.verify(receivedToken, process.env.TOKEN);
    const { matricule } = await db.one('SELECT matricule FROM public.token WHERE token = $1', [decodedToken.firstToken]);

    // Recherche des données de l'utilisateur dans la table "user" en fonction du matricule
    const user = await db.one('SELECT * FROM user_data WHERE matricule = $1', [matricule]);

    // Recherche du rôle de l'utilisateur dans la table "user_role"
    const userRole = await db.oneOrNone('SELECT id_role FROM user_role WHERE matricule = $1', [matricule]);

    let additionalInfo = {};
    if (userRole) {
      if (userRole.id_role === 2) {
        additionalInfo = { isDriver: true };
      } else if (userRole.id_role === 3) {
        additionalInfo = { isAdmin: true };
      }
    }

    // Envoi des données de l'utilisateur dans la réponse, incluant les informations supplémentaires sur le rôle
    res.json({ success: true, user, ...additionalInfo });
  } catch (error) {
    console.error('Error:', error);
    if (error.message === 'Invalid token') {
      res.status(401).json({ success: false, message: 'Token non valide' });
    } else {
      res.status(404).json({ success: false, message: 'User not found for the given token' });
    }
  }
});

app.post('/addCar', async (req, res) => {
  const { carName, carSeats } = req.body;
  const receivedToken = req.headers.token;

  if (!receivedToken) {
    return res.status(401).json({ success: false, message: 'Token non valide' });
  }

  try {
    // Vérifier le token
    const decodedToken = jwt.verify(receivedToken, process.env.TOKEN);
    const { matricule } = await db.one('SELECT matricule FROM public.token WHERE token = $1', [decodedToken.firstToken]);

    // Insérer les informations de la voiture dans la table 'cars'
    const carResult = await db.one('INSERT INTO car (name, places) VALUES ($1, $2) RETURNING id', [carName, carSeats]);
    const carId = carResult.id;

    // Insérer l'association dans la table 'user_car'
    await db.none('INSERT INTO user_car (matricule, id_car) VALUES ($1, $2)', [matricule, carId]);

    res.status(201).json({ success: true, message: 'Voiture ajoutée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la voiture :', error);
    res.status(500).json({ success: false, error: 'Erreur lors de l\'ajout de la voiture.' });
  }
});

app.get('/getCars', async (req, res) => {
  const receivedToken = req.headers.token;

  if (!receivedToken) {
    return res.status(401).json({ success: false, message: 'Token non valide' });
  }

  try {
    // Vérifier le token
    const decodedToken = jwt.verify(receivedToken, process.env.TOKEN);
    const { matricule } = await db.one('SELECT matricule FROM public.token WHERE token = $1', [decodedToken.firstToken]);

    // Récupérer les voitures de l'utilisateur
    const cars = await db.any('SELECT car.id, car.name, car.places FROM car JOIN user_car ON car.id = user_car.id_car WHERE user_car.matricule = $1', [matricule]);

    res.json({ success: true, cars });
  } catch (error) {
    console.error('Erreur lors de la récupération des voitures :', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération des voitures.' });
  }
});

app.put('/editCar', async (req, res) => {
  const { carId, carName, carSeats } = req.body;

  try {
    await db.none('UPDATE car SET name = $1, places = $2 WHERE id = $3', [carName, carSeats, carId]);
    res.json({ success: true, message: 'Voiture mise à jour avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la voiture :', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour de la voiture.' });
  }
});

// Route pour supprimer une voiture
app.delete('/deleteCar', async (req, res) => {
  const { carId } = req.body;

  try {
    await db.none('DELETE FROM car WHERE id = $1', [carId]);
    await db.none('DELETE FROM user_car WHERE id_car = $1', [carId]);
    res.json({ success: true, message: 'Voiture supprimée avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la voiture :', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression de la voiture.' });
  }
});

app.post('/addCovoit', async (req, res) => {
  const { date, time, address, isDriver, selectedCar } = req.body;
  const receivedToken = req.headers.token;

  if (!receivedToken) {
      return res.status(401).json({ success: false, message: 'Token manquant dans les en-têtes' });
  }

  try {
      const decodedToken = jwt.verify(receivedToken, process.env.TOKEN);
      const { matricule } = await db.one('SELECT matricule FROM public.token WHERE token = $1', [decodedToken.firstToken]);

      // Vérifiez si l'utilisateur est conducteur ou passager
      if (isDriver) {
          // Vérifiez si le conducteur a déjà une proposition ou une demande pour la même date
          const existingPropositionQuery = 'SELECT * FROM proposition WHERE date = $1 AND matricule_conducteur = $2';
          const existingPropositionValues = [date, matricule];
          const existingPropositionResult = await db.query(existingPropositionQuery, existingPropositionValues);
          console.log(existingPropositionResult.length)

          if (existingPropositionResult.length > 1) {
              return res.status(400).json({ success: false, message: 'Vous avez déjà une proposition pour cette date' });
          }

          const existingDemandQuery = 'SELECT * FROM demande WHERE date = $1 AND demandeur = $2';
          const existingDemandValues = [date, matricule];
          const existingDemandResult = await db.query(existingDemandQuery, existingDemandValues);

          if (existingDemandResult.length > 1 ) {
              return res.status(400).json({ success: false, message: 'Vous avez déjà une demande pour cette date' });
          }
      } else {
          // Vérifiez si le passager a déjà une demande pour la même date
          const existingDemandQuery = 'SELECT * FROM demande WHERE date = $1 AND demandeur = $2';
          const existingDemandValues = [date, matricule];
          const existingDemandResult = await db.query(existingDemandQuery, existingDemandValues);

          if (existingDemandResult.rows.length > 0) {
              return res.status(400).json({ success: false, message: 'Vous avez déjà une demande pour cette date' });
          }
      }

      // Créez un objet à insérer dans la base de données en fonction de isDriver
      let insertQuery, insertValues;
      if (isDriver) {
        adresse = `Point(${address.lon}, ${address.lat})`;
        insertQuery = `INSERT INTO proposition (matricule_conducteur, id_car, status, date, heure, adresse) VALUES ('${matricule}', '${selectedCar}', 'pending', '${date}', '${time}', POINT(${address.lon}, ${address.lat}))`;
        insertValues = [matricule, selectedCar, 'pending', date, time, adresse];

      } else {
          insertQuery = 'INSERT INTO demande (date, time, address, matricule_passager, status) VALUES ($1, $2, $3, $4, $5)';
          insertValues = [date, time, address, matricule, 'pending'];
      }

      // Essayez d'insérer l'objet dans la base de données
      await db.query(insertQuery, insertValues);
      return res.status(200).json({ success: true, message: 'Covoiturage ajouté avec succès' });
  } catch (error) {
      console.error('Erreur lors de la gestion du covoiturage:', error);
      return res.status(500).json({ success: false, message: 'Erreur lors de la gestion du covoiturage' });
  }
});


module.exports = app;
