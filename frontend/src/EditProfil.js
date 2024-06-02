import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { checkTokenExpiration } from './utils/tokenUtils';

function EditProfil() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [adresse, setAdresse] = useState('');
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const apiUrl = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const handleTokenExpiration = () => {
      toast.error('Votre session a expiré');
      navigate('/login');
    };

    if (checkTokenExpiration(handleTokenExpiration)) {
      return;
    }
  }, [navigate]);

  const sanitizeInput = (input) => {
    return input.replace(/['";]/g, '');
  };

  const validateFields = () => {
    const errors = {};
    if (!nom.trim()) errors.nom = 'Le champ Nom ne peut pas être vide.';
    if (!prenom.trim()) errors.prenom = 'Le champ Prénom ne peut pas être vide.';
    if (!adresse.trim()) errors.adresse = 'Le champ Adresse ne peut pas être vide.';
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validateFields();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`);
      const data = await response.json();

      if (data.length > 0) {
        setLatitude(data[0].lat);
        setLongitude(data[0].lon);

        const postData = {
          matricule: sessionStorage.getItem('matricule'),
          nom: sanitizeInput(nom),
          prenom: sanitizeInput(prenom),
          latitude: data[0].lat,
          longitude: data[0].lon
        };

        const backendResponse = await fetch(`${apiUrl}/users/insert-user-data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(postData),
        });

        if (backendResponse.ok) {
          console.log('Données insérées avec succès.');
          toast.success('Ajout de données réussie');
          navigate('/profil');
        } else {
          console.error('Erreur lors de l\'insertion des données.');
          toast.error('Erreur lors de l\'insertion des données');
        }
      } else {
        setErrors({ adresse: 'Adresse invalide. Veuillez saisir une adresse valide.' });
        toast.error('Adresse invalide. Veuillez saisir une adresse valide.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'appel de l\'API Nominatim :', error);
      toast.error('Erreur lors de l\'appel de l\'API Nominatim');
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
          {errors.nom && <p style={{ color: 'red' }}>{errors.nom}</p>}
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
          {errors.prenom && <p style={{ color: 'red' }}>{errors.prenom}</p>}
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
          {errors.adresse && <p style={{ color: 'red' }}>{errors.adresse}</p>}
        </div>
        <button type="submit">Enregistrer</button>
      </form>
    </div>
  );
}

export default EditProfil;
