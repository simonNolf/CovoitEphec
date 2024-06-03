import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { checkTokenExpiration } from './utils/tokenUtils';

const EditProfil = () => {
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [adresse, setAdresse] = useState('');
    const [numero, setNumero] = useState('');
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;
    const location = useLocation();
    const [isDriver, setIsDriver] = useState(false);
    const matricule = sessionStorage.getItem('matricule');

    useEffect(() => {
        const storedNom = localStorage.getItem('nom');
        const storedPrenom = localStorage.getItem('prenom');
        const storedAdresse = localStorage.getItem('adresse');
        const storedNumero = localStorage.getItem('numero');

        const handleTokenExpiration = () => {
            toast.error('Votre session a expiré');
            navigate('/login');
        };

        if (checkTokenExpiration(handleTokenExpiration)) {
            return;
        }

        if (storedNom && storedPrenom && storedAdresse && storedNumero) {
            setNom(storedNom);
            setPrenom(storedPrenom);
            setAdresse(storedAdresse);
            setNumero(storedNumero);
            localStorage.removeItem('nom');
            localStorage.removeItem('prenom');
            localStorage.removeItem('adresse');
            localStorage.removeItem('numero');
        } else if (location.state) {
            const { nom, prenom, adresse, numero } = location.state;
            setNom(nom || '');
            setPrenom(prenom || '');
            setAdresse(adresse || '');
            setNumero(numero || '');
        }
    }, [location.state]);

    const validateFields = () => {
        const errors = {};
        if (!nom.trim()) errors.nom = 'Le champ Nom ne peut pas être vide.';
        if (!prenom.trim()) errors.prenom = 'Le champ Prénom ne peut pas être vide.';
        if (!adresse.trim()) errors.adresse = 'Le champ Adresse ne peut pas être vide.';
        if (!numero.trim()) errors.numero = 'Le champ Numéro de téléphone ne peut pas être vide.';
        return errors;
    };

    const handleCheckboxChange = (event) => {
        setIsDriver(event.target.checked); 
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const validationErrors = validateFields();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            // Utilisation de l'API Nominatim de OpenStreetMap pour géocoder l'adresse en coordonnées géographiques
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`);
            const data = await response.json();

            if (data.length > 0) {
                const { lat, lon } = data[0];
                // Utilisation des coordonnées géographiques dans la suite du traitement
                console.log('Coordonnées géographiques :', lat, lon);

                // Envoi du reste des données avec les coordonnées géographiques
                const responseUpdate = await fetch(`${apiUrl}/users/updateUser`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': sessionStorage.getItem('token'),
                    },
                    body: JSON.stringify({
                        matricule: matricule,
                        nom: nom.trim(),
                        prenom: prenom.trim(),
                        adresse: adresse.trim(),
                        numero: numero.trim(),
                        isDriver: isDriver,
                        latitude: lat,
                        longitude: lon
                    }),
                });

                const dataUpdate = await responseUpdate.json();
                if (dataUpdate.success) {
                    toast.success('Profil mis à jour avec succès.');
                    navigate('/profil');
                } else {
                    toast.error('Erreur lors de la mise à jour du profil.');
                }
            } else {
                toast.error('Adresse non trouvée. Veuillez entrer une adresse valide.');
                return;
            }
        } catch (error) {
            console.error('Erreur lors de la soumission du formulaire:', error);
            toast.error('Erreur lors de la soumission du formulaire.');
        }
    };

    return (
        <div>
            <h1>Modifier le profil de {matricule}</h1>
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
                        Numéro de téléphone :
                        <input
                            type="text"
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                        />
                    </label>
                    {errors.numero && <p style={{ color: 'red' }}>{errors.numero}</p>}
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
                <div>
                    <label>
                        Conducteur :
                        <input
                            type="checkbox"
                            checked={isDriver}
                            onChange={handleCheckboxChange}
                        />
                    </label>
                </div>
                <button type="submit">Enregistrer</button>
            </form>
        </div>
    );
};

export default EditProfil;
