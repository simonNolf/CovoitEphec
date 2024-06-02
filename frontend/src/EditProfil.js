import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { checkTokenExpiration } from './utils/tokenUtils';


const EditProfil = () => {
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [adresse, setAdresse] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const location = useLocation();

    useEffect(() => {
        const storedNom = localStorage.getItem('nom');
        const storedPrenom = localStorage.getItem('prenom');
        const storedAdresse = localStorage.getItem('adresse');

        const handleTokenExpiration = () => {
          toast.error('Votre session a expiré');
          navigate('/login');
      };

      if (checkTokenExpiration(handleTokenExpiration)) {
          return;
      }

        if (storedNom && storedPrenom && storedAdresse) {
            setNom(storedNom);
            setPrenom(storedPrenom);
            setAdresse(storedAdresse);
            // Supprimer les valeurs du localStorage après utilisation
            localStorage.removeItem('nom');
            localStorage.removeItem('prenom');
            localStorage.removeItem('adresse');
        } else if (location.state) {
            const { nom, prenom, adresse } = location.state;
            setNom(nom || '');
            setPrenom(prenom || '');
            setAdresse(adresse || '');
        }
    }, [location.state]);

    // Fonction pour valider les champs de formulaire
    const validateFields = () => {
        const errors = {};
        if (!nom.trim()) errors.nom = 'Le champ Nom ne peut pas être vide.';
        if (!prenom.trim()) errors.prenom = 'Le champ Prénom ne peut pas être vide.';
        if (!adresse.trim()) errors.adresse = 'Le champ Adresse ne peut pas être vide.';
        return errors;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        // Validation des champs de formulaire
        const validationErrors = validateFields();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            // Soumission du formulaire vers l'API
            const response = await fetch(`${apiUrl}/users/updateUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': sessionStorage.getItem('token'),
                },
                body: JSON.stringify({
                    nom: nom.trim(),
                    prenom: prenom.trim(),
                    adresse: adresse.trim(),
                }),
            });

            const data = await response.json();
            if (data.success) {
                toast.success('Profil mis à jour avec succès.');
                navigate('/profil');
            } else {
                toast.error('Erreur lors de la mise à jour du profil.');
            }
        } catch (error) {
            console.error('Erreur lors de la soumission du formulaire:', error);
            toast.error('Erreur lors de la soumission du formulaire.');
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
};

export default EditProfil;
