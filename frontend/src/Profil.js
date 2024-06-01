import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Profil = () => {
    const [user, setUser] = useState(null);
    const [decodedAddress, setDecodedAddress] = useState('');
    const matricule = sessionStorage.getItem('matricule');
    const token = sessionStorage.getItem('token');
    const apiUrl = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            toast.error('Merci de vous connecter');
            navigate('/login');
        } else {
            fetchUserData();
        }
    }, [token, matricule]);

    const fetchUserData = async () => {
        try {
            const response = await fetch(`${apiUrl}/getUser`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                },
            });
            const data = await response.json();
            if (data.success) {
                setUser(data.user);
                if (data.user.adresse) {
                    const latitude = parseFloat(data.user.adresse.y);
                    const longitude = parseFloat(data.user.adresse.x);
                    if (!isNaN(latitude) && !isNaN(longitude)) {
                        decodeAdresse(latitude, longitude);
                    } else {
                        console.error('Coordonnées GPS invalides');
                    }
                }
            } else {
                console.error('Erreur:', data.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const decodeAdresse = async (latitude, longitude) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await response.json();
            if (data.address) {
                const { road, house_number, postcode, town } = data.address;
                const formattedAddress = `${road}, ${house_number}, ${postcode} ${town}`;
                setDecodedAddress(formattedAddress);
            } else {
                setDecodedAddress('Adresse non disponible');
            }
        } catch (error) {
            console.error('Erreur lors du décodage de l\'adresse:', error);
            setDecodedAddress('Erreur lors du décodage de l\'adresse');
        }
    };

    const deconnexion = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('matricule');
        navigate('/login');
    };

    return (
        <div>
            <h1>Page de profil</h1>
            {user ? (
                <div>
                    <p>Nom: {user.nom}</p>
                    <p>Prénom: {user.prenom}</p>
                    <p>Adresse: {decodedAddress}</p>
                    <p>Matricule: {user.matricule}</p>
                    <Link to="/editProfil">
                        <button>Modifier le profil</button>
                    </Link>
                    <button onClick={deconnexion}>Déconnexion</button>
                </div>
            ) : matricule && token ? (
                <div>
                    <p>Matricule: {matricule}</p>
                    <p>Vous n'avez pas encore complété votre profil.</p>
                    <Link to="/editProfil">
                        <button>Compléter le profil</button>
                    </Link>
                </div>
            ) : null}
        </div>
    );
};

export default Profil;
