import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'leaflet/dist/leaflet.css';
import markerIcon from './marker.png';
import L from 'leaflet';
import { checkTokenExpiration } from './utils/tokenUtils';
import debounce from 'lodash.debounce';

const CovoituragePage = () => {
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [address, setAddress] = useState('');
    const [coordinates, setCoordinates] = useState(null);
    const [mapVisible, setMapVisible] = useState(false);
    const [mapCenter, setMapCenter] = useState([50.6658654, 4.6126958]); 
    const [isDriver, setIsDriver] = useState(false);
    const [userCars, setUserCars] = useState([]);
    const [selectedCar, setSelectedCar] = useState('');
    const [displayCarDropdown, setDisplayCarDropdown] = useState(false);
    const [propositions, setPropositions] = useState([]);
    const [demandes, setDemandes] = useState([]);
    const [selectedCovoiturage, setSelectedCovoiturage] = useState(null);
    const navigate = useNavigate();
    const token = sessionStorage.getItem('token');
    const apiUrl = process.env.REACT_APP_API_URL;
    console.log(propositions)

    useEffect(() => {
        const handleTokenExpiration = () => {
            toast.error('Votre session a expiré');
            navigate('/login');
        };

        if (checkTokenExpiration(handleTokenExpiration)) {
            return;
        }

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
                    if (data.isDriver) {
                        fetchUserCars();
                    }
                    if (data.user.adresse) {
                        const latitude = parseFloat(data.user.adresse.y);
                        const longitude = parseFloat(data.user.adresse.x);
                        if (!isNaN(latitude) && !isNaN(longitude)) {
                            decodeAdresse(latitude, longitude);
                        } else {
                            console.error('Coordonnées GPS invalides');
                        }
                    }
                    fetchCovoiturages();
                } else {
                    console.error('Erreur:', data.message);
                }
            } catch (error) {
                console.error('Erreur:', error);
            }
        };

        fetchUserData();
    }, [token, navigate, apiUrl]);

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

    const fetchCovoiturages = async () => {
        try {
            const [propositionsResponse, demandesResponse] = await Promise.all([
                fetch(`${apiUrl}/getPropositions`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': token,
                    },
                }),
                fetch(`${apiUrl}/getDemandes`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': token,
                    },
                }),
            ]);
    
            const propositionsData = await propositionsResponse.json();
            const demandesData = await demandesResponse.json();
    
            if (propositionsData.success) {
                setPropositions(propositionsData.propositions);
            } else {
                console.error('Erreur:', propositionsData.message);
            }
    
            if (demandesData.success) {
                setDemandes(demandesData.demandes);
            } else {
                console.error('Erreur:', demandesData.message);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des covoiturages:', error);
        }
    };
    

    const decodeAdresse = useCallback(debounce(async (latitude, longitude) => {
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
    }, 300), []);

    const resetForm = () => {
        setDate('');
        setTime('');
        setSelectedCar('');
        setDisplayCarDropdown(false);
    };

    const addProposition = async (covoiturageData) => {
        try {
            const response = await fetch(`${apiUrl}/addProposition`, {
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
                resetForm();
                fetchCovoiturages(); // Refresh covoiturages list
                navigate('/profil');
            } else {
                toast.error(`Erreur lors de l'enregistrement: ${data.message}`);
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du covoiturage:', error);
            toast.error('Erreur lors de l\'enregistrement du covoiturage');
        }
    };

    const addDemande = async (covoiturageData) => {
        try {
            const response = await fetch(`${apiUrl}/addDemande`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                },
                body: JSON.stringify(covoiturageData),
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Demande de covoiturage enregistrée avec succès');
                resetForm();
                fetchCovoiturages(); // Refresh covoiturages list
                navigate('/profil');
            } else {
                toast.error(`Erreur lors de l'enregistrement: ${data.message}`);
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du covoiturage:', error);
            toast.error('Erreur lors de l\'enregistrement du covoiturage');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!coordinates) {
            toast.error('Adresse non valide');
            return;
        }
        const selectedCarData = userCars.find(car => car.id === parseInt(selectedCar));
    
    // Obtenir le nombre de places de la voiture sélectionnée, ou null si la voiture n'est pas trouvée
    const carPlaces = selectedCarData ? selectedCarData.places : null;
        console.log(carPlaces)

        const covoiturageData = {
            date,
            time,
            address: coordinates,
            isDriver,
            selectedCar: isDriver ? selectedCar : null,
            places: isDriver ? carPlaces : null,

        };

        if (isDriver) {
            await addProposition(covoiturageData);
        } else {
            await addDemande(covoiturageData);
        }
    };

    const customIcon = L.icon({
        iconUrl: markerIcon,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    });

    const handleAddressChange = async (e) => {
        const newAddress = e.target.value;
        setAddress(newAddress);
    
        // Si l'adresse est vide, ne pas effectuer la requête
        if (!newAddress) {
            setCoordinates(null);
            setMapVisible(false);
            return;
        }
    
        try {
            // Requête à l'API Nominatim d'OpenStreetMap pour géocoder l'adresse
            const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(newAddress)}&format=json&addressdetails=1`);
    
            if (!response.ok) {
                throw new Error('Erreur réseau lors du géocodage');
            }
    
            const data = await response.json();
    
            // Vérifier si des résultats sont renvoyés
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                setCoordinates({ lat, lon });
                setMapCenter([lat, lon]);
                setMapVisible(true);
    
                // Décoder l'adresse pour obtenir une version formatée
                const reverseResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
                const reverseData = await reverseResponse.json();
                if (reverseData.address) {
                    const { road, house_number, postcode, town } = reverseData.address;
                    const formattedAddress = `${road || ''}, ${house_number || ''}, ${postcode || ''} ${town || ''}`;
                    setAddress(formattedAddress);
                } else {
                    toast.error('Adresse non disponible');
                }
            } else {
                toast.error('Adresse non trouvée');
                setCoordinates(null);
                setMapVisible(false);
            }
        } catch (error) {
            console.error('Erreur lors du géocodage:', error);
            toast.error('Erreur lors du géocodage');
        }
    };
    

    const handleDriverCheckboxChange = () => {
        setIsDriver(!isDriver);
        setDisplayCarDropdown(!displayCarDropdown);
    };

    const handleCarSelectionChange = (e) => {
        const selectedCarId = e.target.value;
        setSelectedCar(selectedCarId);
    };

    const handleCovoiturageClick = async (covoiturage, type) => {
        if (covoiturage.adresse) {
            const latitude = covoiturage.adresse.y;
            const longitude = covoiturage.adresse.x;
            const decodedAddress = await decodeAdresse(latitude, longitude);
    
            setSelectedCovoiturage({ 
                ...covoiturage, 
                decodedAddress, 
                coordinates: [latitude, longitude], 
                type, 
                placesRestantes: covoiturage.places  // Ajoutez cette ligne pour gérer les places restantes
            });
        } else {
            setSelectedCovoiturage({ 
                ...covoiturage, 
                decodedAddress: 'Coordonnées non disponibles', 
                coordinates: null, 
                type, 
                placesRestantes: covoiturage.places  
            })
        }
    };
    
    
    

    const renderCovoiturageDetails = () => {
        if (!selectedCovoiturage) return null;
    
        const handleAccept = () => {
            if (selectedCovoiturage.id) {
                alert(`Type: ${selectedCovoiturage.type}\nID du covoiturage : ${selectedCovoiturage.id}\nDate : ${selectedCovoiturage.date.split('T')[0]}\nHeure : ${selectedCovoiturage.heure}\nAdresse : ${selectedCovoiturage.decodedAddress || 'Adresse non disponible'}`);
            } else {
                alert('ID non disponible');
            }
        };
    
        return (
            <div>
    <h2>Détails du covoiturage</h2>
    <p>Date: {selectedCovoiturage.date.split('T')[0]}</p>
    <p>Heure: {selectedCovoiturage.heure}</p>
    <p>Adresse: {selectedCovoiturage.decodedAddress || 'Adresse non disponible'}</p>

    {/* Affiche le nombre de places restantes seulement s'il s'agit d'une proposition */}
    {selectedCovoiturage.type === 'Proposition' && (
        <p>Places restantes: {selectedCovoiturage.placesRestantes}</p>
    )}

    {selectedCovoiturage.coordinates && (
        <div style={{ height: '400px', width: '100%' }}>
            <MapContainer center={selectedCovoiturage.coordinates} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={selectedCovoiturage.coordinates} icon={customIcon}>
                    <Popup>
                        {selectedCovoiturage.decodedAddress || 'Adresse non disponible'}
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    )}

    <button onClick={handleAccept} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
        Accepter
    </button>
</div>

        );
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
                        onChange={handleAddressChange} 
                        required 
                    />
                </div>
                <div>
                    <label htmlFor="isDriver">Conducteur:</label>
                    <input 
                        type="checkbox" 
                        id="isDriver" 
                        name="isDriver"
                        checked={isDriver} 
                        onChange={handleDriverCheckboxChange} 
                    />
                    {displayCarDropdown && (
                        <div>
                            <label htmlFor="car">Sélectionnez votre voiture:</label>
                            <select 
                                id="car" 
                                name="car" 
                                value={selectedCar} 
                                onChange={handleCarSelectionChange}
                                required
                            >
                                <option value="">Sélectionnez une voiture</option>
                                {userCars.map(car => (
                                    <option key={car.id} value={car.id}>{car.name} - {car.places} places</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>
                <button type="submit">Envoyer</button>
            </form>

            <h2>Demandes de covoiturage</h2>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                    {demandes.map((demande) => (
                        <tr key={demande.id} style={{ borderBottom: '1px solid #ccc' }}>
                            <td>date : {demande.date.split('T')[0]}</td>
                            <td>heure : {demande.heure}</td>
                            <td>
    <button onClick={() => handleCovoiturageClick(demande, 'Demande')}>Voir les détails</button>
</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <h2>Propositions de covoiturage</h2>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                    {propositions.map((proposition) => (
                        <tr key={proposition.id} style={{ borderBottom: '1px solid #ccc' }}>
                            <td>date : {proposition.date.split('T')[0]}</td>
                            <td>heure : {proposition.heure}</td>
                            <td>
    <button onClick={() => handleCovoiturageClick(proposition, 'Proposition')}>Voir les détails</button>
</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {renderCovoiturageDetails()}
        </div>
    );
};

export default CovoituragePage;
