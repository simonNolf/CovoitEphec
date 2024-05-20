import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function EditProfil() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [adresse, setAdresse] = useState('');
  const apiUrl = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    // Création de l'objet de données à envoyer au backend
    const data = {
      matricule: sessionStorage.getItem('matricule'),
      nom: nom,
      prenom: prenom,
      adresse: adresse
    };

    try {
      // Appel du backend pour insérer les données
      const response = await fetch(`${apiUrl}/users/insert-user-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        // Redirection vers la page de profil en cas de succès
        console.log('Données insérées avec succès.');
        navigate('/profil');
      } else {
        // Traitement en cas d'erreur
        console.error('Erreur lors de l\'insertion des données.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'appel de l\'API :', error);
    }
  };

  return (
    <div>
      <h1>Modifier le profil</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Nom :
            <input
              type="text"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Prénom :
            <input
              type="text"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
            />
          </label>
        </div>
        <div>
          <label>
            Adresse :
            <input
              type="text"
              value={adresse}
              onChange={(e) => setAdresse(e.target.value)}
            />
          </label>
        </div>
        <button type="submit">Enregistrer</button>
      </form>
    </div>
  );
}

export default EditProfil;
