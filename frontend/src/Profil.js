import React, { useState, useEffect } from 'react';

const Profil = () => {
    const [status, setStatus] = useState(null);
    const matricule = sessionStorage.getItem('matricule');
    const apiUrl = process.env.REACT_APP_API_URL; // Assurez-vous que cette variable d'environnement est définie dans votre configuration React
    console.log(matricule)


    useEffect(() => {
        if (matricule) {
            fetch(`${apiUrl}/getUser`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'token' : sessionStorage.getItem('token')
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    setStatus(data.user.status);
                } else {
                    console.error('Error:', data.message);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        }
    }, [matricule]);
    

    return (
        <div>
            <h1>Page de profil</h1>
            {status ? (
                <div>
                    <p>Votre statut : {status}</p>
                </div>
            ) : (
                <p>Chargement...</p>
            )}
        </div>
    );
};

export default Profil;
