import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { toast } from 'react-toastify';

const CovoituragePage = () => {
    const [proposition, setProposition] = useState([]);
    const [alertOpen, setAlertOpen] = useState(null);
    const [user, setUser] = useState(true);
    const [approbation, setApprobation] = useState([]);
    const [address, setAddress] = useState('');
    const [coordinates, setCoordinates] = useState(null);
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL || '';
    const apiMaps = process.env.REACT_APP_MAPS_API_KEY;
    const token = sessionStorage.getItem('token');

    useEffect(() => {
        checkToken();
        fetchUsers();
    }, []);

    const checkToken = () => {
        if (!token) {
            toast.error('Merci de vous connecter');
            navigate('/login');
        }
    };

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

    const geocodeAddress = async (address) => {
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiMaps}`);
            const data = await response.json();
            if (data.status === 'OK') {
                const location = data.results[0].geometry.location;
                setCoordinates(location);
                console.log(location)
            } else {
                toast.error('Erreur lors de la géocodage de l\'adresse');
            }
        } catch (error) {
            console.error('Erreur lors de la géocodage de l\'adresse:', error);
            toast.error('Erreur lors de la géocodage de l\'adresse');
        }
    };

    const handleAddressChange = (e) => {
        const newAddress = e.target.value;
        setAddress(newAddress); // Met à jour l'état de l'adresse
        if (newAddress) {
            geocodeAddress(newAddress); 
        }
    };
    

    const handleAddressBlur = () => {
        if (address) {
            geocodeAddress(address);
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
                    <input 
                        type="text" 
                        id="address" 
                        name="address" 
                        value={address} 
                        onBlur={handleAddressBlur}
                    />
                </div>
                <button type="submit">Soumettre</button>
            </form>
            {coordinates ? (
                <div style={{ height: '400px', width: '100%' }}>
                    <LoadScript googleMapsApiKey={apiMaps}>
                        <GoogleMap
                            mapContainerStyle={{ height: '100%', width: '100%' }}
                            center={coordinates}
                            zoom={15}
                            onLoad={() => console.log('GoogleMap loaded')}
                        >
                            <Marker position={coordinates} />
                        </GoogleMap>
                    </LoadScript>
                </div>
            ) : null}
            
        </div>
    );
};

export default CovoituragePage;
