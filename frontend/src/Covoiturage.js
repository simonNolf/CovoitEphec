import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const CovoituragePage = () => {
    const [proposition, setProposition] = useState([]);
    const [alertOpen, setAlertOpen] = useState<string | null>(null);
    const [user, setUser] = useState<boolean>(true);
    const [approbation, setApprobation] = useState([]);
    const [chargement, setChargement] = useState<boolean>(true);
    const navigate = useNavigate();
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        fetchUsers();
        fetchProposition();
        fetchApprobation();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await axios.get(`${apiUrl}/getUser`, {
                headers: {
                    'Content-type': 'application/json',
                    token: sessionStorage.getItem('token') || '',
                },
            });
            setUser(res.data.user.conducteur);
        } catch (err) {
            console.error('Error fetching user:', err);
        }
    };

    const refus = async (id, heure) => {
        // Logique de refus
    };

    const fetchProposition = async () => {
        try {
            const response = await axios.get(`${apiUrl}/getProposition`, {
                headers: {
                    'Content-type': 'application/json',
                    token: sessionStorage.getItem('token') || '',
                },
            });

            if (response.status === 200) {
                setProposition(response.data.rows);
            }
        } catch (error) {
            console.error('Error during fetchProposition:', error);
        }
    };

    const fetchApprobation = async () => {
        try {
            const response = await axios.get(`${apiUrl}/getPropositionCovoit`, {
                headers: {
                    'Content-type': 'application/json',
                    token: sessionStorage.getItem('token') || '',
                },
            });

            if (response.status === 200) {
                setApprobation(response.data.rows);
            }
        } catch (error) {
            console.error('Error during fetchApprobation:', error);
        }
    };

    const setData = (data) => {
        // Logique pour définir les données
    };

    return (
        <div>
            <h1>Page de covoiturage</h1>
            <button onClick={() => setData([])}>Charger les données</button>
            {/* Affichage des propositions de covoiturage */}
            {proposition.map((item) => (
                <div key={item.id}>
                    <p>Date: {item.date?.substr(0, 10)}</p>
                    <p>Adresse: {item.arret}</p>
                    <p>Heure: {item.date?.substr(11, 5)}</p>
                    {/* Bouton pour afficher les détails */}
                    <button onClick={() => setAlertOpen(item.id)}>Info</button>
                    {/* Alert pour afficher les détails */}
                    {/* ... */}
                </div>
            ))}
            {/* Affichage des propositions d'approbation */}
            {user ? (
                <div>
                    {/* Affichage des propositions d'approbation */}
                </div>
            ) : (
                <div>
                    {/* Affichage des propositions de passager */}
                </div>
            )}
        </div>
    );
};

export default CovoituragePage;
