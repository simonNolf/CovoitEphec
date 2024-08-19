import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const isSqlInjectionSafe = (input) => {
    // eslint-disable-next-line no-useless-escape
    const sqlInjectionPattern = /[\';\"]/;
    return !sqlInjectionPattern.test(input);
};

const isPasswordSecure = (password) => {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[#@$!%*?&])[A-Za-z\d#$@!%*?&]{8,}$/;
    return passwordRegex.test(password);
};

const InscriptionContainer = () => {
    const [matricule, setMatricule] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const apiUrl = process.env.REACT_APP_API_URL;

    useEffect(() => {
        // Récupérer le matricule depuis le sessionStorage
        const storedMatricule = sessionStorage.getItem('matricule');
        if (storedMatricule) {
            setMatricule(storedMatricule);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Vérifiez si les mots de passe correspondent
        if (password !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas.');
            return;
        }

        // Vérifiez la sécurité contre l'injection SQL
        if (!isSqlInjectionSafe(password) || !isSqlInjectionSafe(confirmPassword)) {
            toast.error('Potentielle injection SQL détectée.');
            return;
        }

        // Vérifiez la robustesse du mot de passe
        if (!isPasswordSecure(password)) {
            toast.error('Le mot de passe ne remplit pas les prérequis de sécurité (1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial, et au moins 8 caractères).');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${apiUrl}/users/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    matricule,
                    password,
                }),
            });

            if (response.ok) {
                toast.success('Veuillez vérifier vos emails pour la confirmation. Pensez a consulter vos spams');
            } else {
                toast.error('Échec de l\'inscription.');
            }
        } catch (error) {
            toast.error('Erreur lors de l\'inscription.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ToastContainer />
            {loading && <div style={{ textAlign: 'center', margin: '20px', fontSize: '18px', color: 'blue' }}>Enregistrement en cours...</div>}
            <form 
                style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100vh', 
                    backgroundColor: '#f7f7f7', 
                    padding: '20px', 
                    borderRadius: '8px', 
                    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)' 
                }} 
                onSubmit={handleSubmit}
            >
                {matricule && (
                    <div style={{ marginBottom: '10px', fontSize: '16px' }}>
                        <label>Matricule : {matricule}</label>
                    </div>
                )}
                <div style={{ marginBottom: '10px' }}>
                    <input
                        style={{ padding: '10px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', width: '300px' }}
                        placeholder='Votre mot de passe'
                        value={password}
                        minLength={8}
                        type='password'
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div style={{ marginBottom: '20px' }}>
                    <input
                        style={{ padding: '10px', fontSize: '14px', borderRadius: '4px', border: '1px solid #ccc', width: '300px' }}
                        placeholder='Confirmer le mot de passe'
                        value={confirmPassword}
                        minLength={8}
                        type='password'
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <button 
                    type='submit'
                    style={{ 
                        padding: '10px 20px', 
                        fontSize: '16px', 
                        backgroundColor: '#4CAF50', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px', 
                        cursor: 'pointer' 
                    }}
                >
                    S'inscrire
                </button>
            </form>
        </>
    );
};

export default InscriptionContainer;
