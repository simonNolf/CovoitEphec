import React from 'react';

const Acceuil = () => {
    const expirationToken = sessionStorage.getItem('tokenExpiration')

    function checkTokenExpiration(expirationTimestamp) {
        // Convertir le timestamp en date
        const expirationDate = new Date(expirationTimestamp);
        
        // Obtenir la date actuelle
        const currentDate = new Date();
        
        // Comparer les dates
        if (currentDate >= expirationDate) {
            console.log("Token expired!");
            // Déclencher la fonction à l'expiration
            onTokenExpired();
        } else {
            console.log("Token is still valid.");
            // Sinon, réessayer après un certain temps
            setTimeout(() => checkTokenExpiration(expirationTimestamp), 1000);
        }
    }
    
    function onTokenExpired() {
        // Fonction déclenchée à l'expiration du token
        console.log("Token expired, redirecting to /logout.");
        // Rediriger vers /logout
        window.location.href = "/logout";
    }
    
    // Convertir le timestamp en millisecondes (si nécessaire) et vérifier l'expiration
    checkTokenExpiration(expirationToken);
    
    return (
        <div>
            <h1>Page d'accueil</h1>
            <p>Bienvenue sur notre application !</p>
        </div>
    );
};

export default Acceuil;
