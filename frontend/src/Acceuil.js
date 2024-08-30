import React from 'react';

const Acceuil = () => {
    const expirationToken = sessionStorage.getItem('tokenExpiration');

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
            padding: '20px',
            boxSizing: 'border-box'
        }}>
            <h1 style={{
                fontSize: '3em',
                marginBottom: '10px',
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
            }}>Bienvenue sur notre application CovoitEphec!</h1>
            <h2 style={{
                fontSize: '1.8em',
                marginBottom: '20px',
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
                textShadow: '1px 1px 3px rgba(0, 0, 0, 0.3)'
            }}>La solution de covoiturage pour l'Ephec</h2>
            <p style={{
                fontSize: '1.5em',
                maxWidth: '600px',
                lineHeight: '1.5',
                fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
            }}>
                Découvrez les fonctionnalités de notre plateforme en explorant les différentes sections. Nous sommes ravis de vous avoir parmi nous !
            </p>
        </div>
    );
};

export default Acceuil;
