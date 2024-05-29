import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { toast } from 'react-toastify';


const CovoituragePage = () => {
    const [proposition, setProposition] = useState([]);
    const [alertOpen, setAlertOpen] = useState(null);
    const [user, setUser] = useState(true);
    const [approbation, setApprobation] = useState([]);
    const [chargement, setChargement] = useState(true);
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL || '';
    const apiMaps = process.env.MAPS_API_KEY
    const token = sessionStorage.getItem('token');


    useEffect(() => {
        fetchUsers();
        fetchProposition();
        fetchApprobation();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${apiUrl}/getUser`, {
                headers: {
                    'Content-type': 'application/json',
                    'token': token,
                },
            });
            const data = await res.json();
            setUser(data.user.conducteur);
        } catch (err) {
            console.error('Erreur lors de la récupération de l\'utilisateur:', err);
        }
    };

    const fetchProposition = async () => {
        try {
            const res = await fetch(`${apiUrl}/getProposition`, {
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token') || ''}`,
                },
            });
            const data = await res.json();
            if (res.status === 200) {
                setProposition(data.rows);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des propositions:', error);
        }
    };

    const fetchApprobation = async () => {
        try {
            const res = await fetch(`${apiUrl}/getPropositionCovoit`, {
                headers: {
                    'Content-type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token') || ''}`,
                },
            });
            const data = await res.json();
            if (res.status === 200) {
                setApprobation(data.rows);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des approbations:', error);
        }
    };

    const checkToken = () => {
        const token = sessionStorage.getItem('token');
        if (!token) {
            toast.error('Merci de vous connecter');
            return <navigate to="/login" />;
        }
    };

    

    return (
        <div>
            <h1>Page de covoiturage</h1>
            <form>
                <div>
                    <label htmlFor="date">Date:</label>
                    <input type="date" id="date" name="date" />
                </div>
                <div>
                    <label htmlFor="time">Heure:</label>
                    <input type="time" id="time" name="time" />
                </div>
                <div>
                    <label htmlFor="address">Adresse:</label>
                    <input type="text" id="address" name="address" />
                </div>
                <button type="submit">Soumettre</button>
            </form>
            {/* Affichage des propositions de covoiturage */}
            {proposition.map((item) => (
                <div key={item.id}>
                    <p>Date: {item.date?.substr(0, 10)}</p>
                    <p>Adresse: {item.arret}</p>
                    <p>Heure: {item.date?.substr(11, 5)}</p>
                    {/* Bouton pour afficher les détails */}
                    <button onClick={() => setAlertOpen(item.id)}>Info</button>
                    {/* Alert pour afficher les détails */}
                    {alertOpen === item.id && (
                        <div>
                            <p>Détails de la proposition:</p>
                            <p>ID: {item.id}</p>
                            <p>Conducteur: {item.conducteur}</p>
                            <p>Latitude: {item.latitude}</p>
                            <p>Longitude: {item.longitude}</p>
                            {/* Ajoutez plus de détails ici */}
                            <LoadScript googleMapsApiKey={apiMaps}>
                                <GoogleMap
                                    mapContainerStyle={{ height: "400px", width: "800px" }}
                                    center={{ lat: item.latitude, lng: item.longitude }}
                                    zoom={10}
                                >
                                    <Marker position={{ lat: item.latitude, lng: item.longitude }} />
                                </GoogleMap>
                            </LoadScript>
                            <button onClick={() => setAlertOpen(null)}>Fermer</button>
                        </div>
                    )}
                </div>
            ))}
            {/* Affichage des propositions d'approbation */}
            {user ? (
                <div>
                    <h2>Propositions d'approbation</h2>
                    {approbation.map((item) => (
                        <div key={item.id}>
                            <p>Date: {item.date?.substr(0, 10)}</p>
                            <p>Adresse: {item.arret}</p>
                            <p>Heure: {item.date?.substr(11, 5)}</p>
                            {/* Ajoutez plus de détails ici */}
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    <h2>Propositions de passager</h2>
                    {/* Affichage des propositions de passager */}
                </div>
            )}
        </div>
    );
};

export default CovoituragePage;