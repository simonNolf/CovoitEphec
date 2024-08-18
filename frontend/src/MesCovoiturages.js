import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet's default icon issue with Webpack
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

const apiUrl = process.env.REACT_APP_API_URL;

const MesCovoiturages = () => {
    const [covoiturages, setCovoiturages] = useState([]);
    const [todayCovoiturages, setTodayCovoiturages] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [details, setDetails] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [addresses, setAddresses] = useState({});
    const navigate = useNavigate();
    const token = sessionStorage.getItem('token');
    const ephecCoordinates = [50.6649515, 4.612295650251259];

    useEffect(() => {
        const fetchCovoiturages = async () => {
            if (!token) {
                toast.error('Merci de vous connecter');
                navigate('/login');
                return;
            }

            try {
                const response = await fetch(`${apiUrl}/getCovoitUser`, {
                    method: 'GET',
                    headers: {
                        'token': token
                    }
                });

                const data = await response.json();

                if (data.success) {
                    setCovoiturages(data.covoiturages);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des covoiturages:', error);
                toast.error('Erreur lors de la récupération des covoiturages.');
            }
        };

        fetchCovoiturages();
    }, [navigate, token]);

    useEffect(() => {
        const fetchTodayCovoiturages = async () => {
            if (!token) {
                return;
            }

            try {
                const response = await fetch(`${apiUrl}/getTodayCovoit`, {
                    method: 'GET',
                    headers: {
                        'token': token
                    }
                });

                const data = await response.json();

                if (data.success) {
                    setTodayCovoiturages(data.covoiturages);
                } else {
                    toast.error(data.message);
                }
            } catch (error) {
                console.error('Erreur lors de la récupération des covoiturages d\'aujourd\'hui:', error);
                toast.error('Erreur lors de la récupération des covoiturages d\'aujourd\'hui.');
            }
        };

        fetchTodayCovoiturages();
    }, [token]);

    useEffect(() => {
        const fetchAddress = async (lat, lon, id) => {
            try {
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`);
                const data = await response.json();
                const address = data.address;
                const formattedAddress = `${address.road || ''} ${address.house_number || ''}, ${address.postcode || ''}`;
                
                setAddresses(prevAddresses => ({
                    ...prevAddresses,
                    [id]: formattedAddress
                }));
            } catch (error) {
                console.error('Erreur lors de la récupération de l\'adresse:', error);
            }
        };

        if (details && details.adresse_conducteur) {
            fetchAddress(details.adresse_conducteur.y, details.adresse_conducteur.x, 'conducteur');
        }
        if (details && details.adresse_passager) {
            fetchAddress(details.adresse_passager.y, details.adresse_passager.x, 'passager');
        }

        todayCovoiturages.forEach(covoit => {
            if (covoit.adresse) {
                fetchAddress(covoit.adresse.y, covoit.adresse.x, `covoiturage-${covoit.id}`);
            }
            if (covoit.adresse_passager) {
                fetchAddress(covoit.adresse_passager.y, covoit.adresse_passager.x, `passager-${covoit.id}`);
            }
        });
    }, [details, todayCovoiturages]);

    const handleDateChange = date => {
        setSelectedDate(date);
        const selectedDateString = date.toISOString().split('T')[0]; // format YYYY-MM-DD

        const covoiturage = covoiturages.find(covoit => {
            const covoitDateString = new Date(covoit.date).toISOString().split('T')[0];
            return covoitDateString === selectedDateString;
        });
        setDetails(covoiturage || null);
    };

    const confirmCovoiturage = async () => {
        if (!details) return;

        try {
            const response = await fetch(`${apiUrl}/updateCovoitStatus`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token
                },
                body: JSON.stringify({ id: details.id, status: 'accepter' })
            });

            const data = await response.json();

            if (data.success) {
                toast.success('Covoiturage confirmé!');
                const updatedCovoiturages = covoiturages.map(covoit => covoit.id === details.id ? { ...covoit, status: 'accepted' } : covoit);
                setCovoiturages(updatedCovoiturages);
                setDetails({ ...details, status: 'accepted' });
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.error('Erreur lors de la confirmation du covoiturage:', error);
            toast.error('Erreur lors de la confirmation du covoiturage.');
        }
    };

    const verification = async (covoiturageId, passagerCoords) => {
        if (!navigator.geolocation) {
            toast.error('La géolocalisation n\'est pas disponible.');
            return;
        }
    
        // Vérifier que les coordonnées du passager existent
        if (!passagerCoords || !passagerCoords.y || !passagerCoords.x) {
            toast.error('Les coordonnées du passager ne sont pas disponibles.');
            return;
        }
    
        navigator.geolocation.getCurrentPosition(async position => {
            const { latitude, longitude } = position.coords;
            setUserLocation({ lat: latitude, lng: longitude });
    
            try {
                const response = await fetch(`${apiUrl}/verifCovoit`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'token': token
                    },
                    body: JSON.stringify({
                        covoiturageId,  // ID du covoiturage
                        passagerLatitude: passagerCoords.y,  // Latitude du passager
                        passagerLongitude: passagerCoords.x, // Longitude du passager
                        latitude,  // Latitude actuelle de l'utilisateur
                        longitude  // Longitude actuelle de l'utilisateur
                    })
                });
    
                const data = await response.json();
    
                if (response.ok) {
                    if (data.success) {
                        toast.success(data.message || 'Votre position a été enregistrée.');
                    } else {
                        toast.error(data.message || 'Erreur lors de la vérification.');
                    }
                } else {
                    // Gérer les erreurs liées aux réponses non réussies (status code >= 400)
                    toast.error(data.message || 'Erreur de serveur. Veuillez réessayer.');
                }
            } catch (error) {
                console.error('Erreur lors de l\'envoi des coordonnées:', error);
                toast.error('Erreur lors de l\'envoi des coordonnées.');
            }
        }, error => {
            toast.error('Erreur de géolocalisation.');
            console.error('Erreur de géolocalisation:', error);
        });
    };
    
    
    
    return (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ flex: 1, marginRight: '20px' }}>
                <h1>Mes Covoiturages</h1>
                <Calendar
                    onChange={handleDateChange}
                    value={selectedDate}
                    tileContent={({ date, view }) => {
                        if (view === 'month') {
                            const dateString = date.toISOString().split('T')[0];
                            const covoiturage = covoiturages.find(covoit => {
                                const covoitDateString = new Date(covoit.date).toISOString().split('T')[0];
                                return covoitDateString === dateString;
                            });

                            if (covoiturage) {
                                return (
                                    <div
                                        style={{
                                            position: 'relative',
                                            height: '100%',
                                        }}
                                    >
                                        {covoiturage.status === 'pending' && (
                                            <div
                                                style={{
                                                    backgroundColor: 'lightcoral',
                                                    borderRadius: '50%',
                                                    height: '10px',
                                                    width: '10px',
                                                    position: 'absolute',
                                                    bottom: '5px',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            />
                                        )}
                                        {covoiturage.status === 'accepter' && (
                                            <div
                                                style={{
                                                    backgroundColor: 'lightgreen',
                                                    borderRadius: '50%',
                                                    height: '10px',
                                                    width: '10px',
                                                    position: 'absolute',
                                                    bottom: '5px',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                }}
                                            />
                                        )}
                                    </div>
                                );
                            }
                        }
                        return null;
                    }}
                />
                {details ? (
                    <div>
                        <h2>Détails du Covoiturage</h2>
                        <p><strong>Conducteur:</strong> {details.id_conducteur}</p>
                        <p><strong>Date:</strong> {new Date(details.date).toLocaleDateString()}</p>
                        <p><strong>Heure:</strong> {details.heure}</p>
                        <p><strong>Voiture:</strong> {details.car_name}</p>
                        <p><strong>Passager:</strong> {details.passager}</p>
                        {details.status === 'pending' && (
                            <button onClick={confirmCovoiturage}>Confirmer</button>
                        )}
                        {(details.adresse_conducteur || details.adresse_passager) ? (
                            <MapContainer
                                center={details.adresse_conducteur ? [details.adresse_conducteur.y, details.adresse_conducteur.x] : ephecCoordinates}
                                zoom={13}
                                style={{ height: '300px', width: '100%', marginTop: '20px' }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution="&copy; OpenStreetMap contributors"
                                />
                                {details.adresse_conducteur && (
                                    <Marker position={[details.adresse_conducteur.y, details.adresse_conducteur.x]}>
                                        <Popup>
                                            Adresse du conducteur: {addresses['conducteur'] || 'Chargement...'}
                                        </Popup>
                                    </Marker>
                                )}
                                {details.adresse_passager && (
                                    <Marker position={[details.adresse_passager.y, details.adresse_passager.x]}>
                                        <Popup>
                                            Adresse du passager: {addresses['passager'] || 'Chargement...'}
                                        </Popup>
                                    </Marker>
                                )}
                                <Marker position={ephecCoordinates}>
                                    <Popup>
                                        Adresse de l'EPHEC
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        ) : (
                            <p>Adresse du conducteur ou du passager non disponible</p>
                        )}
                    </div>
                ) : (
                    <p>Aucun covoiturage sélectionné pour cette date.</p>
                )}
            </div>
            <div style={{ flex: 1 }}>
                <h2>Covoiturages du Jour</h2>
                {todayCovoiturages.length > 0 ? (
                    todayCovoiturages.map(covoit => (
                        <div key={covoit.id} style={{ marginBottom: '20px' }}>
                            <p><strong>Conducteur:</strong> {covoit.id_conducteur} <strong> numéro : </strong>0{covoit.numéro_conducteur}</p>
                            <p><strong>Date:</strong> {new Date(covoit.date).toLocaleDateString()}</p>
                            <p><strong>Heure:</strong> {covoit.heure}</p>
                            <p><strong>Passager:</strong> {covoit.passager} <strong>numéro : </strong>0{covoit.numéro_passager}</p>
                            {(covoit.adresse || covoit.adresse_passager) ? (
                                <MapContainer
                                    center={covoit.adresse ? [covoit.adresse.y, covoit.adresse.x] : ephecCoordinates}
                                    zoom={13}
                                    style={{ height: '200px', width: '100%', marginTop: '10px' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution="&copy; OpenStreetMap contributors"
                                    />
                                    {covoit.adresse && (
                                        <Marker position={[covoit.adresse.y, covoit.adresse.x]}>
                                            <Popup>
                                                Adresse du covoiturage: {addresses[`covoiturage-${covoit.id}`] || 'Chargement...'}
                                            </Popup>
                                        </Marker>
                                    )}
                                    {covoit.adresse_passager && (
                                        <Marker position={[covoit.adresse_passager.y, covoit.adresse_passager.x]}>
                                            <Popup>
                                                Adresse du passager: {addresses[`passager-${covoit.id}`] || 'Chargement...'}
                                            </Popup>
                                        </Marker>
                                    )}
                                    <Marker position={ephecCoordinates}>
                                        <Popup>
                                            Adresse de l'EPHEC
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            ) : (
                                <p>Adresse du conducteur ou du passager non disponible</p>
                            )}
                            <button 
                                onClick={() => verification(covoit.id, covoit.adresse_passager)} 
                                style={{ marginTop: '10px' }}
                            >
                                Je suis au point de rendez-vous
                            </button>


                        </div>
                    ))
                ) : (
                    <p>Aucun covoiturage pour aujourd'hui.</p>
                )}
            </div>
        </div>
    );
};

export default MesCovoiturages;
