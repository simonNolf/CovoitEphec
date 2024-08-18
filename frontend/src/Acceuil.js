import React from 'react';

const Acceuil = () => {
    const expirationToken = sessionStorage.getItem('tokenExpiration')

    return (
        <div>
            <h1>Page d'accueil</h1>
            <p>Bienvenue sur notre application !</p>
        </div>
    );
};

export default Acceuil;
