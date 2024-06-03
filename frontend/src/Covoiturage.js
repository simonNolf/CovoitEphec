import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import markerIcon from './marker.png';
import L from 'leaflet';
import { checkTokenExpiration } from './utils/tokenUtils';

const CovoituragePage = () => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [address, setAddress] = useState('');
    const [coordinates, setCoordinates] = useState(null);
    const [mapVisible, setMapVisible] = useState(false);
    const [mapCenter, setMapCenter] = useState([51.505, -0.09]);
    const [isDriver, setIsDriver] = useState(false);
    const [userCars, setUserCars] = useState([]);
    const [selectedCar, setSelectedCar] = useState('');
    const [displayCarDropdown, setDisplayCarDropdown] = useState(false);
    const navigate = useNavigate();
    const token = sessionStorage.getItem('token');
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        const handleTokenExpiration = () => {
            toast.error('Votre session a expiré');
            navigate('/login');
        };

        if (checkTokenExpiration(handleTokenExpiration)) {
            return;
        }

        // Appel à getUser pour récupérer les informations sur l'utilisateur
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
                    // Vérifie si l'utilisateur est conducteur
                    setIsDriver(data.isDriver);
                    // Si l'utilisateur est conducteur, charge les voitures qu'il possède
                    if (data.isDriver) {
                        fetchUserCars();
                    }
                    // Si l'utilisateur a une adresse, la décode pour remplir le champ d'adresse
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

        fetchUserData();
    }, [token, navigate, apiUrl]);

    // Fonction pour récupérer les voitures de l'utilisateur
    const fetchUserCars = async () => {
        try {
            const response = await fetch(`${apiUrl}/getCars`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                },
            });
            const data = await response.json();
            if (data.success) {
                setUserCars(data.cars);
            } else {
                console.error('Erreur:', data.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    // Fonction pour déterminer l'adresse à partir des coordonnées géographiques
    const decodeAdresse = async (latitude, longitude) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await response.json();
            if (data.address) {
                const { road, house_number, postcode, town } = data.address;
                const formattedAddress = `${road}, ${house_number}, ${postcode} ${town}`;
                setAddress(formattedAddress);
                setCoordinates({ lat: latitude, lon: longitude });
                setMapCenter([latitude, longitude]);
                setMapVisible(true);
            } else {
                toast.error('Adresse non disponible');
            }
        } catch (error) {
            console.error('Erreur lors du décodage de l\'adresse:', error);
            toast.error('Erreur lors du décodage de l\'adresse');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!coordinates) {
            toast.error('Adresse non valide');
            return;
        }

        const covoiturageData = {
            date,
            time,
            address: coordinates,
            isDriver,
            selectedCar: isDriver ? selectedCar : null,
        };

        try {
            const response = await fetch(`${apiUrl}/addCovoit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                },
                body: JSON.stringify(covoiturageData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Proposition de covoiturage enregistrée avec succès');
                navigate('/covoiturage');
            } else {
                toast.error(`Erreur lors de l'enregistrement: ${data.message}`);
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du covoiturage:', error);
            toast.error('Erreur lors de l\'enregistrement du covoiturage');
        }
    };

    const customIcon = L.icon({
        iconUrl: markerIcon,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });

    const handleDriverCheckboxChange = () => {
        setDisplayCarDropdown(!displayCarDropdown);
    };

    return (
        <div>
            <h1>Page de covoiturage</h1>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="date">Date:</label>
                    <input type="date" id="date" name="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="time">Heure:</label>
                    <input type="time" id="time" name="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                </div>
                <div>
                    <label htmlFor="address">Adresse:</label>
                    <input 
                        type="text" 
                        id="address" 
                        name="address" 
                        value={address} 
                        onChange={(e) => setAddress(e.target.value)} 
                        required 
                    />
                </div>
                {isDriver && (
                    <div>
                        <label htmlFor="isDriver">Conducteur:</label>
                        <input 
                            type="checkbox" 
                            id="isDriver" 
                            name="isDriver" 
                            checked={displayCarDropdown} 
                            onChange={handleDriverCheckboxChange} 
                        />
                        {displayCarDropdown && (
                            <div>
                                <label htmlFor="car">Sélectionnez votre voiture:</label>
                                <select 
                                    id="car" 
                                    name="car" 
                                    value={selectedCar} 
                                    onChange={(e) => setSelectedCar(e.target.value)} 
                                    required
                                >
                                    <option value="">Sélectionnez une voiture</option>
                                    {userCars.map(car => (
                                        <option key={car.id} value={car.name}>{car.name} - {car.places} places</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                )}
                <button type="submit">Soumettre</button>
            </form>
            {mapVisible && (
                <div style={{ height: '400px', width: '100%' }}>
                    <MapContainer center={mapCenter} zoom={18} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {coordinates && (
                            <Marker position={[coordinates.lat, coordinates.lon]} eventHandlers={{ click: () => navigate('/covoiturage') }} icon={customIcon}>
                                <Popup>
                                    Adresse: {address}
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>
            )}
        </div>
    );
};

export default CovoituragePage;

