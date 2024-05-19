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

app.get("/test", async (req,res) => {
  res.send("coucou")
})

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

    // Envoi des données de l'utilisateur dans la réponse
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error:', error);
    if (error.message === 'Invalid token') {
      res.status(401).json({ success: false, message: 'Token non valide' });
    } else {
      res.status(404).json({ success: false, message: 'User not found for the given token' });
    }
  }
});


module.exports = app;
