import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { checkTokenExpiration } from './utils/tokenUtils';

const EditProfil = () => {
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [adresse, setAdresse] = useState('');
    const [numero, setNumero] = useState('');
    const [isDriver, setIsDriver] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const apiUrl = process.env.REACT_APP_API_URL;
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
    }, [location.state, navigate]);

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
            for (const error in validationErrors) {
                toast.error(validationErrors[error]);
            }
            return;
        }

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`);
            const data = await response.json();

            if (data.length > 0) {
                const { lat, lon } = data[0];
                
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
                    setTimeout(() => {
                        navigate('/profil'); 
                    }, 1000); 
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
        <div style={{
            maxWidth: '600px',
            margin: '0 auto',
            padding: '20px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}>
            <h1 style={{ textAlign: 'center' }}>Modifier le profil de {matricule}</h1>
            <form onSubmit={handleSubmit} style={{
                display: 'flex',
                flexDirection: 'column',
            }}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '5px',
                        fontWeight: 'bold',
                    }}>
                        Nom :
                        <input
                            type="text"
                            value={nom}
                            onChange={(e) => setNom(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                boxSizing: 'border-box',
                            }}
                        />
                    </label>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '5px',
                        fontWeight: 'bold',
                    }}>
                        Prénom :
                        <input
                            type="text"
                            value={prenom}
                            onChange={(e) => setPrenom(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                boxSizing: 'border-box',
                            }}
                        />
                    </label>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '5px',
                        fontWeight: 'bold',
                    }}>
                        Numéro de téléphone :
                        <input
                            type="text"
                            value={numero}
                            onChange={(e) => setNumero(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                boxSizing: 'border-box',
                            }}
                        />
                    </label>
                </div>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{
                        display: 'block',
                        marginBottom: '5px',
                        fontWeight: 'bold',
                    }}>
                        Adresse :
                        <input
                            type="text"
                            value={adresse}
                            onChange={(e) => setAdresse(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                border: '1px solid #ddd',
                                borderRadius: '4px',
                                boxSizing: 'border-box',
                            }}
                        />
                    </label>
                </div>
                <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}>
                    <label style={{
                        display: 'block',
                        marginRight: '10px',
                        fontWeight: 'bold',
                    }}>
                        Conducteur :
                    </label>
                    <input
                        type="checkbox"
                        checked={isDriver}
                        onChange={handleCheckboxChange}
                        style={{
                            marginLeft: '10px',
                        }}
                    />
                </div>
                <button type="submit" style={{
                    backgroundColor: '#007bff',
                    color: '#fff',
                    padding: '10px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                }}>
                    Enregistrer
                </button>
            </form>
        </div>
    );
};

export default EditProfil;
