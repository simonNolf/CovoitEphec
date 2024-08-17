const express = require('express');
const db = require('./database');
const app = express.Router();
const nodemailer = require('nodemailer');
const dotenv = require("dotenv");
const bcrypt = require('bcryptjs');
const moment = require('moment'); 
const crypto = require('crypto');
const jwt = require('jsonwebtoken')
dotenv.config();

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

app.get('/getMatricule', async (req, res) => {
  try {
    const matricule = await db.one('select matricule from public.user');
    
    // Envoi du matricule en tant que réponse
    res.send(`Matricule : ${matricule.matricule}`);
  } catch (error) {
    console.error('Erreur lors de l\'exécution de la requête SQL :', error);
    res.status(500).send('Erreur serveur');
  }
});

app.get('/:matricule', async (req, res) => {
  const matriculeToCheck = req.params.matricule;

  try {
    const result = await db.oneOrNone('SELECT COUNT(*) FROM "user" WHERE matricule = $1', [matriculeToCheck]);

    if (result && result.count > 0) {
      res.status(200).json({ exists: true, message: `Le matricule ${matriculeToCheck} existe dans la table "user".` });
    } else {
      res.status(404).json({ exists: false, message: `Le matricule ${matriculeToCheck} n'existe pas dans la table "user".` });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du matricule :', error);
    res.status(500).json({ error: 'Erreur lors de la vérification du matricule.' });
  }
});

app.post('/login', async (req, res) => {
  const { matricule, password } = req.body;

  try {
    // Recherche de l'utilisateur dans la base de données
    const user = await db.oneOrNone('SELECT * FROM "user" WHERE matricule = $1', [matricule]);

    if (user) {
      // Comparaison du mot de passe avec celui stocké dans la base de données
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (isPasswordMatch) {
        if (user.status === 'active') {
          // Générer un nouveau token à chaque connexion
          const firstToken = crypto.randomBytes(64).toString('hex');

          // Vérifier et mettre à jour ou insérer le token dans la table token
          await db.tx(async t => {
            const existingToken = await t.oneOrNone('SELECT token FROM public.token WHERE matricule = $1', [user.matricule]);

            if (existingToken) {
              await t.none('UPDATE public.token SET token = $2, created_at = NOW(), expires_to = NOW() + INTERVAL \'1 hour\' WHERE matricule = $1', [user.matricule, firstToken]);
            } else {
              await t.none('INSERT INTO public.token (matricule, token, created_at, expires_to) VALUES ($1, $2, NOW(), NOW() + INTERVAL \'1 hour\')', [user.matricule, firstToken]);
            }
          });

          // Vérifier si l'utilisateur a déjà une entrée dans la table user_data
          const existingUserData = await db.oneOrNone('SELECT * FROM user_data WHERE matricule = $1', [user.matricule]);

          // Insérer dans la table user_data seulement si le matricule n'y est pas encore
          if (!existingUserData) {
            await db.none('INSERT INTO user_data (matricule) VALUES ($1)', [user.matricule]);
          }

          // Générer un deuxième token qui contient le premier token dans son payload
          const secondToken = jwt.sign({ firstToken: firstToken }, process.env.TOKEN, { expiresIn: '1h' });

          // Retourner le deuxième token au frontend
          res.json({ success: true, message: 'Connexion réussie', token: secondToken });
        } else if (user.status === 'pending') {
          res.status(401).json({ success: false, message: 'Votre compte est en attente. Veuillez consulter vos e-mails pour activer votre compte.' });
        } else if (user.status === 'archived') {
          res.status(401).json({ success: false, message: 'Votre compte est archivé. Veuillez contacter le secrétariat pour plus d\'informations.' });
        } else if (user.status === 'banned') {
          res.status(401).json({ success: false, message: 'Votre compte est banni. Veuillez contacter le secrétariat pour plus d\'informations.' });
        }
      } else {
        res.status(401).json({ success: false, message: 'Mot de passe incorrect' });
      }
    } else {
      res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
    }
  } catch (error) {
    console.error('Erreur lors de la connexion :', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la connexion' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { matricule, password, email } = req.body;

    // Générer un sel pour bcrypt
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    // Hacher le mot de passe avec le sel
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer une date d'expiration d'une heure à partir de maintenant
    const expirationDate = moment().add(1, 'hour').toISOString();

    // Enregistrement dans la base de données avec le mot de passe haché, le sel et la date d'expiration
    await db.none('INSERT INTO "user" (matricule, password, salt, status, activation_expiration) VALUES($1, $2, $3, $4, $5)',
                  [matricule, hashedPassword, salt, 'pending', expirationDate]);

    // Envoi d'un e-mail avec le lien d'activation
    const activationLink = `${process.env.API_URL}/activate/${matricule}`;
    const mailOptions = {
      from: process.env.MAIL,
      to: 'simon.nolf@gmail.com',
      subject: 'Activation de compte',
      html: `
      <p>Cliquez sur le lien ci-dessous pour activer votre compte :</p>
      <a href="${activationLink}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none;">Activer le compte</a>
    `,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Inscription réussie. Vérifiez votre e-mail pour activer votre compte.' });
  } catch (error) {
    console.error('Erreur lors de l\'inscription :', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

app.post('/updateUser', async (req, res) => {
  const { matricule, nom, prenom, latitude, longitude, isDriver, numero } = req.body;

  try {
    await db.none('UPDATE user_data SET nom = $2, prenom = $3, adresse = POINT($4, $5), numero=$6 WHERE matricule = $1', [matricule, nom, prenom, longitude, latitude, numero]);
    
    const existingUserRole = await db.oneOrNone('SELECT * FROM user_role WHERE matricule = $1', [matricule]);

    if (existingUserRole) {
      if (existingUserRole.id_role !== 3) { 
        await db.none('UPDATE user_role SET id_role = $2 WHERE matricule = $1', [matricule, isDriver ? 2 : 1]);
      }
    } else {
      await db.none('INSERT INTO user_role (matricule, id_role) VALUES ($1, $2)', [matricule, isDriver ? 2 : 1]);
    }

    res.status(201).json({ success: true, message: 'Données utilisateur mises à jour avec succès.' });
  } catch (error) {
    console.error('Erreur lors de la mise à jour des données utilisateur :', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour des données utilisateur.' });
  }
});





module.exports = app; 