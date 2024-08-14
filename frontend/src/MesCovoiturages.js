import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
const apiUrl = process.env.REACT_APP_API_URL;

const MesCovoiturages = () => {
    const [covoiturages, setCovoiturages] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [details, setDetails] = useState(null);
    const navigate = useNavigate();
    const token = sessionStorage.getItem('token');

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
                    setCovoiturages(data.covoiturages); // Assurez-vous que la réponse contient un champ `covoiturages`
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

    const handleDateChange = date => {
        setSelectedDate(date);
        const selectedDateString = date.toISOString().split('T')[0]; // format YYYY-MM-DD

        // Trouver un covoiturage pour la date sélectionnée
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

    return (
        <div>
            <h1>Mes Covoiturages</h1>
            <Calendar
                onChange={handleDateChange}
                value={selectedDate}
                tileContent={({ date, view }) => {
                    if (view === 'month') {
                        const dateString = date.toISOString().split('T')[0]; // format YYYY-MM-DD
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
            {details && (
                <div>
                    <h2>Détails du Covoiturage</h2>
                    <p><strong>Conducteur:</strong> {details.id_conducteur}</p>
                    <p><strong>Date:</strong> {new Date(details.date).toLocaleDateString()}</p>
                    <p><strong>Heure:</strong> {details.heure}</p>
                    <p><strong>Voiture:</strong> {details.name}</p>
                    <p><strong>Passager:</strong> {details.passager}</p>
                    {details.status === 'pending' && (
                        <button onClick={confirmCovoiturage}>Confirmer</button>
                    )}
                </div>
            )}
        </div>
    );
};

export default MesCovoiturages;
