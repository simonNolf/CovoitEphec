const express = require('express');
const cors = require('cors');
const db = require('./database');
const bodyParser = require('body-parser');
const usersRoutes = require('./usersRoutes.js');
const app = express();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'Gmail',
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.MAIL, // Votre adresse e-mail Gmail
    pass: process.env.MDP, // Votre mot de passe Gmail
  },
});



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
app.delete('/deleteProposition', async (req,res) => {
  const {propositionId } = req.body;

  try{
    await db.none('DELETE FROM PROPOSITION WHERE id = $1', [propositionId]);
    res.json({success: true, message:'proposition supprimée avec succès.'});
  }catch (error) {
    console.error('Erreur lors de la suppression de la proposition :', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la suppression de la proposition.' });
  }
});

app.post('/addDemande', async (req, res) => {
  const { date, time, address } = req.body;
  const receivedToken = req.headers.token;

  if (!receivedToken) {
      return res.status(401).json({ success: false, message: 'Token manquant dans les en-têtes' });
  }

  try {
      const decodedToken = jwt.verify(receivedToken, process.env.TOKEN);
      const { matricule } = await db.one('SELECT matricule FROM public.token WHERE token = $1', [decodedToken.firstToken]);

      // Vérifiez si le passager a déjà une demande pour la même date
      const existingDemandQuery = 'SELECT * FROM demande WHERE date = $1 AND demandeur = $2';
      const existingDemandValues = [date, matricule];
      const existingDemandResult = await db.query(existingDemandQuery, existingDemandValues);

      if (existingDemandResult.length > 0) {
          return res.status(400).json({ success: false, message: 'Vous avez déjà une demande pour cette date' });
      }

      // Insérer la demande dans la base de données
      const insertQuery = 'INSERT INTO demande (demandeur, status, date, heure, adresse) VALUES ($1, $2, $3, $4, POINT($5, $6))';
      const insertValues = [matricule, 'pending', date, time, address.lon, address.lat];
      await db.query(insertQuery, insertValues);

      return res.status(200).json({ success: true, message: 'Demande de covoiturage ajoutée avec succès' });
  } catch (error) {
      console.error('Erreur lors de la gestion de la demande de covoiturage:', error);
      return res.status(500).json({ success: false, message: 'Erreur lors de la gestion de la demande de covoiturage' });
  }
});

app.post('/addProposition', async (req, res) => {
  const { date, time, address, selectedCar, places } = req.body;
  const receivedToken = req.headers.token;

  if (!receivedToken) {
      return res.status(401).json({ success: false, message: 'Token manquant dans les en-têtes' });
  }

  try {
      const decodedToken = jwt.verify(receivedToken, process.env.TOKEN);
      const { matricule } = await db.one('SELECT matricule FROM public.token WHERE token = $1', [decodedToken.firstToken]);

      // Vérifiez si le conducteur a déjà une proposition pour la même date
      const existingPropositionQuery = 'SELECT * FROM proposition WHERE date = $1 AND matricule_conducteur = $2';
      const existingPropositionValues = [date, matricule];
      const existingPropositionResult = await db.query(existingPropositionQuery, existingPropositionValues);

      if (existingPropositionResult.length > 0) {
          return res.status(400).json({ success: false, message: 'Vous avez déjà une proposition pour cette date' });
      }

      // Insérer la proposition dans la base de données
      const insertQuery = 'INSERT INTO proposition (matricule_conducteur, id_car, status, date, heure, adresse, places) VALUES ($1, $2, $3, $4, $5, POINT($6, $7), $8)';
      const insertValues = [matricule, selectedCar, 'pending', date, time, address.lon, address.lat, places];
      await db.query(insertQuery, insertValues);

      return res.status(200).json({ success: true, message: 'Proposition de covoiturage ajoutée avec succès' });
  } catch (error) {
      console.error('Erreur lors de la gestion de la proposition de covoiturage:', error);
      return res.status(500).json({ success: false, message: 'Erreur lors de la gestion de la proposition de covoiturage' });
  }
});


app.get('/propositions', async (req, res) => {
  const receivedToken = req.headers.token;

  if (!receivedToken) {
      return res.status(401).json({ success: false, message: 'Token manquant dans les en-têtes' });
  }

  try {
      const decodedToken = jwt.verify(receivedToken, process.env.TOKEN);
      const { matricule } = await db.one('SELECT matricule FROM public.token WHERE token = $1', [decodedToken.firstToken]);

      // Query pour récupérer les propositions de covoiturage de l'utilisateur actuel avec le nom de la voiture
      const propositions = await db.query('SELECT p.*, c.name AS car_name FROM proposition p JOIN user_car uc ON p.id_car = uc.id_car JOIN car c ON uc.id_car = c.id WHERE uc.matricule = $1ORDER BY p.date', [matricule]);

      // Renvoyer les propositions de covoiturage avec le nom de la voiture
      res.json({ success: true, propositions });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Erreur Serveur');
  }
});


app.get('/demandes', async (req, res) => {
  const receivedToken = req.headers.token;

  if (!receivedToken) {
      return res.status(401).json({ success: false, message: 'Token manquant dans les en-têtes' });
  }

  try {
      const decodedToken = jwt.verify(receivedToken, process.env.TOKEN);
      const { matricule } = await db.one('SELECT matricule FROM public.token WHERE token = $1', [decodedToken.firstToken]);

      // Query pour récupérer les demandes de covoiturage de l'utilisateur actuel
      const demandes = await db.query(`SELECT * FROM demande WHERE demandeur = $1 and status ='pending' order by date`, [matricule]);

      // Renvoyer les demandes de covoiturage avec success=true
      res.json({ success: true, demandes });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Erreur Serveur');
  }
});

app.get('/getDemandes', async (req, res) => {
  const receivedToken = req.headers.token;

  if (!receivedToken) {
      return res.status(401).json({ success: false, message: 'Token manquant dans les en-têtes' });
  }

  try {
      const decodedToken = jwt.verify(receivedToken, process.env.TOKEN);
      const { matricule } = await db.one('SELECT matricule FROM public.token WHERE token = $1', [decodedToken.firstToken]); 

      const demandes = await db.query(`SELECT * 
          FROM demande 
          WHERE date >= NOW() 
          and status = 'pending'
          ORDER BY date ASC`);
      res.json({success: true, demandes});
  }
  catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur Serveur');
}
});

app.get('/getPropositions', async (req, res) => {
  const receivedToken = req.headers.token;

  if (!receivedToken) {
      return res.status(401).json({ success: false, message: 'Token manquant dans les en-têtes' });
  }

  try {
      const decodedToken = jwt.verify(receivedToken, process.env.TOKEN);
      const { matricule } = await db.one('SELECT matricule FROM public.token WHERE token = $1', [decodedToken.firstToken]); 

      const propositions = await db.query(`
        SELECT p.*, c.name AS car_name 
        FROM proposition p 
        JOIN user_car uc ON p.id_car = uc.id_car 
        JOIN car c ON uc.id_car = c.id 
        WHERE uc.matricule = $1 AND p.date >= NOW()  and p.places > 0
        ORDER BY p.date ASC
    `, [matricule]);
    res.json({success: true, propositions});
  }
  catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur Serveur');
}
});

app.post('/acceptCovoiturage', async (req, res) => {
  const receivedToken = req.headers.token;

  // Vérification de la présence du token dans les en-têtes
  if (!receivedToken) {
      return res.status(401).json({ success: false, message: 'Token manquant dans les en-têtes' });
  }

  try {
      // Décodage et vérification du token
      const decodedToken = jwt.verify(receivedToken, process.env.TOKEN);
      const { matricule } = await db.one('SELECT matricule FROM public.token WHERE token = $1', [decodedToken.firstToken]);

      const { covoiturageId, type, selectedCar } = req.body;

      // Validation du type de covoiturage
      if (!['Proposition', 'Demande'].includes(type)) {
          return res.status(400).json({ success: false, message: 'Type invalide' });
      }

      const tableName = type === 'Proposition' ? 'proposition' : 'demande';

      let covoiturageData;

      if (type === 'Proposition') {
          // Traitement des propositions
          covoiturageData = await db.oneOrNone(`
              SELECT matricule_conducteur AS id_conducteur, date, heure, places, id_car, email_conducteur, email_passager
              FROM ${tableName}
              WHERE id = $1
          `, [covoiturageId]);

          if (!covoiturageData) {
              return res.status(404).json({ success: false, message: 'Proposition non trouvée' });
          }

          if (covoiturageData.places <= 0) {
              return res.status(400).json({ success: false, message: 'Aucune place disponible' });
          }

          // Insérer le nouveau covoiturage
          await db.none(`
              INSERT INTO covoiturage (id_conducteur, passager, status, date, heure, id_car)
              VALUES ($1, $2, $3, $4, $5, $6)
          `, [covoiturageData.id_conducteur, matricule, 'pending', covoiturageData.date, covoiturageData.heure, covoiturageData.id_car]);

          // Mettre à jour la proposition
          await db.none(`
              UPDATE ${tableName}
              SET places = places - 1, status = 'accepter'
              WHERE id = $1
          `, [covoiturageId]);

      } else if (type === 'Demande') {
          // Traitement des demandes
          covoiturageData = await db.oneOrNone(`
              SELECT demandeur AS email_passager, date, heure
              FROM ${tableName}
              WHERE id = $1
          `, [covoiturageId]);

          if (!covoiturageData) {
              return res.status(404).json({ success: false, message: 'Demande non trouvée' });
          }

          if (!selectedCar) {
              return res.status(400).json({ success: false, message: 'Voiture non sélectionnée' });
          }

          // Mettre à jour la demande pour accepter la demande
          await db.none(`
              UPDATE ${tableName}
              SET status = 'accepter'
              WHERE id = $1
          `, [covoiturageId]);

          // Insérer les détails dans la table covoiturage
          await db.none(`
              INSERT INTO covoiturage (id_conducteur, passager, status, date, heure, id_car)
              VALUES ($1, $2, $3, $4, $5, $6)
          `, [matricule, covoiturageData.email_passager, 'pending', covoiturageData.date, covoiturageData.heure, selectedCar]);
      }

      // Envoyer les e-mails
      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: `simon.nolf@gmail.com`,  // Remplacer par l'email approprié
          subject: 'Covoiturage Accepté',
          text: `Votre covoiturage a été accepté. Veuillez confirmer les détails sur la page "Mes Covoiturages".`
      };

      await transporter.sendMail(mailOptions);

      res.json({ success: true, message: `${type} acceptée et enregistrée avec succès` });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Erreur Serveur');
  }
});



app.get('/getCovoitUser', async (req, res) => {
  const receivedToken = req.headers.token; // Récupérer le token depuis les en-têtes de la requête

  if (!receivedToken) {
    return res.status(401).json({ success: false, message: 'Token manquant dans les en-têtes' });
  }

  try {
    // Vérifier et décoder le token
    const decodedToken = jwt.verify(receivedToken, process.env.TOKEN);
    const { matricule } = await db.one('SELECT matricule FROM public.token WHERE token = $1', [decodedToken.firstToken]);

    // Requête pour récupérer les covoiturages où l'utilisateur est conducteur ou passager
    const covoiturages = await db.query(`
      SELECT c.*, 
       car.name AS car_name,
       uc.adresse AS adresse_conducteur, 
       up.adresse AS adresse_passager, 
       uc.numero AS numéro_conducteur, 
       up.numero AS numéro_passager
FROM covoiturage c
JOIN car ON c.ID_CAR = car.id
JOIN user_data uc ON c.id_conducteur = uc.matricule
JOIN user_data up ON c.passager = up.matricule
WHERE (c.id_conducteur = $1 OR c.passager = $1)
  AND c.date > current_date
ORDER BY c.date ASC;


    `, [matricule]);

    res.json({ success: true, covoiturages });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur Serveur');
  }
});

app.post('/updateCovoitStatus', async (req, res) => {
  const receivedToken = req.headers.token;
  const { id, status } = req.body;

  if (!receivedToken) {
      return res.status(401).json({ success: false, message: 'Token manquant dans les en-têtes' });
  }

  if (!id || !status) {
      return res.status(400).json({ success: false, message: 'ID et statut requis' });
  }

  try {
      const decodedToken = jwt.verify(receivedToken, process.env.TOKEN);
      const { matricule } = await db.one('SELECT matricule FROM public.token WHERE token = $1', [decodedToken.firstToken]);

      const covoiturage = await db.oneOrNone('SELECT * FROM covoiturage WHERE id = $1 AND (id_conducteur = $2 OR passager = $2)', [id, matricule]);

      if (!covoiturage) {
          return res.status(404).json({ success: false, message: 'Covoiturage non trouvé ou vous n\'avez pas les droits nécessaires' });
      }

      await db.none('UPDATE covoiturage SET status = $1 WHERE id = $2', [status, id]);

      // Envoyer les e-mails
      const mailOptions = {
          from: process.env.EMAIL_USER,
          to: `simon.nolf@gmail.com`,
          subject: 'Statut du Covoiturage Mis à Jour',
          text: `Le statut de votre covoiturage a été mis à jour à ${status}. Veuillez vérifier les détails sur la page "Mes Covoiturages".`
      };

      await transporter.sendMail(mailOptions);

      res.json({ success: true, message: 'Statut mis à jour' });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Erreur Serveur');
  }
});

app.get('/getTodayCovoit', async (req, res) => {
  const receivedToken = req.headers.token; // Récupérer le token depuis les en-têtes de la requête

  if (!receivedToken) {
    return res.status(401).json({ success: false, message: 'Token manquant dans les en-têtes' });
  }

  try {
    // Vérifier et décoder le token
    const decodedToken = jwt.verify(receivedToken, process.env.TOKEN);
    const { matricule } = await db.one('SELECT matricule FROM public.token WHERE token = $1', [decodedToken.firstToken]);

    // Requête pour récupérer les covoiturages de l'utilisateur (conducteur ou passager) pour aujourd'hui
    const covoiturages = await db.query(`
      SELECT c.*, 
       up.adresse AS adresse_passager, 
       up.numero AS numéro_passager, 
       uc.adresse AS adresse_conducteur,
       uc.numero AS numéro_conducteur
FROM covoiturage c
JOIN user_data up ON c.passager = up.matricule
JOIN user_data uc ON c.id_conducteur = uc.matricule
WHERE c.date = current_date
  AND (c.id_conducteur = $1 OR c.passager = $1);


    `, [matricule]);

    res.json({ success: true, covoiturages });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur Serveur');
  }
});








module.exports = app;
