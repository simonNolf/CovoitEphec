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
    const navigate = useNavigate();
    const token = sessionStorage.getItem('token');

    useEffect(() => {
        const handleTokenExpiration = () => {
            toast.error('Votre session a expiré');
            navigate('/login');
        };

        if (checkTokenExpiration(handleTokenExpiration)) {
            return;
        }
    }, [navigate]);

    const handleAddressChange = (e) => {
        const newAddress = e.target.value;
        setAddress(newAddress);
        geocodeAddress(newAddress);
    };

    const geocodeAddress = async (address) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
            const data = await response.json();
            if (data.length > 0) {
                const location = data[0];
                const locationCoords = {
                    lat: parseFloat(location.lat),
                    lon: parseFloat(location.lon),
                };
                setCoordinates(locationCoords);
                setMapCenter([locationCoords.lat, locationCoords.lon]);
                setMapVisible(true);
            } else {
                toast.error('Adresse non trouvée');
            }
        } catch (error) {
            console.error('Erreur lors du géocodage de l\'adresse:', error);
            toast.error('Erreur lors du géocodage de l\'adresse');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Date:', date);
        console.log('Heure:', time);
        console.log('Adresse:', address);
    };

    const customIcon = L.icon({
        iconUrl: markerIcon,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });

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
                        onChange={handleAddressChange} 
                        required 
                    />
                </div>
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
