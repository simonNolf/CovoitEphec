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
                toast.success('Veuillez vérifier vos emails pour la confirmation.');
            } else {
                toast.error('Échec de l\'inscription.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'inscription :', error);
            toast.error('Erreur lors de l\'inscription.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <ToastContainer />
            {loading && <div className="loading">Enregistrement en cours...</div>}
            <form className="centered-container" onSubmit={handleSubmit}>
                {matricule && (
                    <div>
                        <label>Matricule : {matricule}</label>
                    </div>
                )}
                <div>
                    <input
                        placeholder='Votre mot de passe'
                        value={password}
                        minLength={8}
                        type='password'
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>
                <div>
                    <input
                        placeholder='Confirmer le mot de passe'
                        value={confirmPassword}
                        minLength={8}
                        type='password'
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </div>
                <button type='submit'>
                    S'inscrire
                </button>
            </form>
        </>
    );
};

export default InscriptionContainer;
