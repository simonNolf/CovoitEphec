import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { checkTokenExpiration } from './utils/tokenUtils';
import Modal from 'react-modal';

const Profil = () => {
    const [user, setUser] = useState(null);
    const [isDriver, setIsDriver] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);
    const [decodedAddress, setDecodedAddress] = useState('');
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [editModalIsOpen, setEditModalIsOpen] = useState(false);
    const [carName, setCarName] = useState('');
    const [carSeats, setCarSeats] = useState('');
    const [userCars, setUserCars] = useState([]);
    const [currentCar, setCurrentCar] = useState(null);
    const matricule = sessionStorage.getItem('matricule');
    const token = sessionStorage.getItem('token');
    const apiUrl = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const handleTokenExpiration = () => {
            toast.error('Votre session a expiré');
            navigate('/login');
        };

        if (checkTokenExpiration(handleTokenExpiration)) {
            return;
        }

        if (!token) {
            toast.error('Merci de vous connecter');
            navigate('/login');
        } else {
            fetchUserData();
            fetchUserCars();
        }
    }, [token, matricule, navigate]);

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
                setUser(data.user);
                if (data.isDriver) {
                    setIsDriver(data.isDriver);
                }
                if (data.isAdmin) {
                    setIsAdmin(data.isAdmin);
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
            } else {
                console.error('Erreur:', data.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

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

    const decodeAdresse = async (latitude, longitude) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await response.json();
            if (data.address) {
                const { road, house_number, postcode, town } = data.address;
                const formattedAddress = `${road}, ${house_number}, ${postcode} ${town}`;
                setDecodedAddress(formattedAddress);
            } else {
                setDecodedAddress('Adresse non disponible');
            }
        } catch (error) {
            console.error('Erreur lors du décodage de l\'adresse:', error);
            setDecodedAddress('Erreur lors du décodage de l\'adresse');
        }
    };

    const deconnexion = () => {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('matricule');
        navigate('/login');
    };

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const openEditModal = (car) => {
        setCurrentCar(car);
        setCarName(car.name);
        setCarSeats(car.places);
        setEditModalIsOpen(true);
    };

    const closeEditModal = () => {
        setEditModalIsOpen(false);
    };

    const handleCarSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${apiUrl}/addCar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                },
                body: JSON.stringify({
                    carName: carName.trim(),
                    carSeats: parseInt(carSeats, 10),
                }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Voiture ajoutée avec succès.');
                closeModal();
                setCarName('');
                setCarSeats('');
                fetchUserCars();
            } else {
                toast.error('Erreur lors de l\'ajout de la voiture.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la voiture:', error);
            toast.error('Erreur lors de l\'ajout de la voiture.');
        }
    };

    const handleCarEdit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch(`${apiUrl}/editCar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                },
                body: JSON.stringify({
                    carId: currentCar.id,
                    carName: carName.trim(),
                    carSeats: parseInt(carSeats, 10),
                }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Voiture modifiée avec succès.');
                closeEditModal();
                setCarName('');
                setCarSeats('');
                fetchUserCars();
            } else {
                toast.error('Erreur lors de la modification de la voiture.');
            }
        } catch (error) {
            console.error('Erreur lors de la modification de la voiture:', error);
            toast.error('Erreur lors de la modification de la voiture.');
        }
    };

    const handleCarDelete = async (carId) => {
        try {
            const response = await fetch(`${apiUrl}/deleteCar`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                },
                body: JSON.stringify({ carId }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Voiture supprimée avec succès.');
                fetchUserCars();
            } else {
                toast.error('Erreur lors de la suppression de la voiture.');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de la voiture:', error);
            toast.error('Erreur lors de la suppression de la voiture.');
        }
    };

    const allFieldsFilled = user?.nom && user?.prenom && decodedAddress;
    if (allFieldsFilled) {
        console.log (user.matricule)
        localStorage.setItem('adresse', decodedAddress);
        localStorage.setItem('nom', user.nom);
        localStorage.setItem('prenom', user.prenom);
        localStorage.setItem('numero', user.numero);
    }

    return (
        <div>
            <h1>Page de profil</h1>
            {user ? (
                <div>
                    {allFieldsFilled ? (
                        <>
                            <p>Nom: {user.nom}</p>
                            <p>Prénom: {user.prenom}</p>
                            <p>Adresse: {decodedAddress}</p>
                            <p>numéro de téléphone: {user.numero}</p>
                        </>
                    ) : (
                        <p>Merci de compléter toutes les informations de profil.</p>
                    )}
                    <h2>Mes Voitures</h2>
                    <ul>
                        {userCars.map(car => (
                            <li key={car.id}>
                                {car.name} - {car.places} places
                                <button onClick={() => openEditModal(car)}>✏️</button>
                                <button onClick={() => handleCarDelete(car.id)}>🗑️</button>
                            </li>
                        ))}
                    </ul>
                    <button onClick={openModal}>Ajouter une voiture</button>
                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={closeModal}
                        contentLabel="Ajouter une Voiture"
                    >
                        <h2>Ajouter une Voiture</h2>
                        <form onSubmit={handleCarSubmit}>
                            <label>
                                Nom de la voiture:
                                <input
                                    type="text"
                                    value={carName}
                                    onChange={(e) => setCarName(e.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                Nombre de places:
                                <input
                                    type="number"
                                    value={carSeats}
                                    onChange={(e) => setCarSeats(e.target.value)}
                                    required
                                />
                            </label>
                            <button type="submit">Ajouter</button>
                            <button type="button" onClick={closeModal}>Annuler</button>
                        </form>
                    </Modal>
                    <Modal
                        isOpen={editModalIsOpen}
                        onRequestClose={closeEditModal}
                        contentLabel="Modifier une Voiture"
                    >
                        <h2>Modifier une Voiture</h2>
                        <form onSubmit={handleCarEdit}>
                            <label>
                                Nom de la voiture:
                                <input
                                    type="text"
                                    value={carName}
                                    onChange={(e) => setCarName(e.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                Nombre de places:
                                <input
                                    type="number"
                                    value={carSeats}
                                    onChange={(e) => setCarSeats(e.target.value)}
                                    required
                                />
                            </label>
                            <button type="submit">Modifier</button>
                            <button type="button" onClick={closeEditModal}>Annuler</button>
                        </form>
                    </Modal>
                    <div style={{ marginTop: '20px' }}>
                        <button onClick={() => navigate('/editProfil')}>Modifier le profil</button>
                        <button onClick={deconnexion}>Déconnexion</button>
                    </div>
                </div>
            ) : (
                <p>Chargement...</p>
            )}
        </div>
    );
};

export default Profil;
