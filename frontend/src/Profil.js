import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
    const [propositions, setPropositions] = useState([]);
    const [demandes, setDemandes] = useState([]);
    const [covoiturages, setCovoiturages] = useState([]);
    const matricule = sessionStorage.getItem('matricule');
    const token = sessionStorage.getItem('token');
    const apiUrl = process.env.REACT_APP_API_URL;
    const navigate = useNavigate();

    useEffect(() => {
        const handleTokenExpiration = () => {
            toast.error('Votre session a expiré');
            navigate('/login');
        };

        if (!token) {
            toast.error('Merci de vous connecter');
            navigate('/login');
        } else {
            fetchUserData();
            fetchUserCars();
            fetchPropositions();
            fetchDemandes();
            fetchCovoiturages();
        }
    }, [token, matricule, navigate]);

    const fetchCovoiturages = async () => {
        try {
            const response = await fetch(`${apiUrl}/getCovoiturages`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                },
            });
            const data = await response.json();
            if (data.success) {
                const today = new Date().toISOString().split('T')[0];
                const covoituragesFiltered = data.covoiturage.filter(covoiturage => covoiturage.date >= today);
                setCovoiturages(covoituragesFiltered);
            } else {
                console.error('Erreur:', data.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

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
                setIsDriver(data.isDriver);
                setIsAdmin(data.isAdmin);
                if(data.isAdmin){
                    setIsDriver(data.isAdmin)
                }
                if (data.user.adresse) {
                    const { x: longitude, y: latitude } = data.user.adresse;
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

    const fetchPropositions = async () => {
        try {
            const response = await fetch(`${apiUrl}/propositions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                },
            });
            const data = await response.json();
            if (data.success) {
                const today = new Date().toISOString().split('T')[0];
                const propositionsFiltered = data.propositions.filter(proposition => proposition.date >= today);

                for (const proposition of propositionsFiltered) {
                    const { x, y } = proposition.adresse;
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${y}&lon=${x}&format=json`);
                        const data = await response.json();
                        if (data.address) {
                            const { road, house_number, postcode, town } = data.address;
                            const formattedAddress = `${road} ${house_number}, ${postcode} ${town}`;
                            proposition.adresse = formattedAddress;
                        } else {
                            proposition.adresse = 'Adresse non disponible';
                        }
                    } catch (error) {
                        console.error('Erreur lors du décodage de l\'adresse:', error);
                        proposition.adresse = 'Erreur lors du décodage de l\'adresse';
                    }
                }

                setPropositions(propositionsFiltered);
            } else {
                console.error('Erreur:', data.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const fetchDemandes = async () => {
        try {
            const response = await fetch(`${apiUrl}/demandes`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                },
            });
            const data = await response.json();
            if (data.success) {
                const today = new Date().toISOString().split('T')[0];
                const demandesFiltered = data.demandes.filter(demande => demande.date >= today);

                for (const demande of demandesFiltered) {
                    const { x, y } = demande.adresse;
                    try {
                        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${y}&lon=${x}&format=json`);
                        const data = await response.json();
                        if (data.address) {
                            const { road, house_number, postcode, town } = data.address;
                            const formattedAddress = `${road} ${house_number}, ${postcode} ${town}`;
                            demande.adresse = formattedAddress;
                        } else {
                            demande.adresse = 'Adresse non disponible';
                        }
                    } catch (error) {
                        console.error('Erreur lors du décodage de l\'adresse:', error);
                        demande.adresse = 'Erreur lors du décodage de l\'adresse';
                    }
                }

                setDemandes(demandesFiltered);
            } else {
                console.error('Erreur:', data.message);
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    };

    const deleteDemande = async (demandeId) => {
        try {
            const response = await fetch(`${apiUrl}/deleteDemande`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                },
                body: JSON.stringify({ demandeId }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Demande supprimée avec succès.');
                fetchDemandes();
            } else {
                toast.error('Erreur lors de la suppression de la demande.');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression de la demande:', error);
            toast.error('Erreur lors de la suppression de la demande.');
        }
    };

    const deleteCovoiturage = async (covoiturageId) => {
        try {
            const response = await fetch(`${apiUrl}/deleteCovoiturage`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                },
                body: JSON.stringify({ covoiturageId }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Covoiturage supprimé avec succès.');
                fetchCovoiturages();
            } else {
                toast.error('Erreur lors de la suppression du Covoiturage.');
            }
        } catch (error) {
            console.error('Erreur lors de la suppression du covoiturage:', error);
            toast.error('Erreur lors de la suppression du Covoiturage.');
        }
    };

    const openModal = (car) => {
        setCurrentCar(car);
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
        setEditModalIsOpen(false);
    };

    const addCar = async () => {
        try {
            const response = await fetch(`${apiUrl}/addCar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                },
                body: JSON.stringify({ name: carName, seats: carSeats }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Voiture ajoutée avec succès.');
                setCarName('');
                setCarSeats('');
                fetchUserCars();
                closeModal();
            } else {
                toast.error('Erreur lors de l\'ajout de la voiture.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'ajout de la voiture:', error);
            toast.error('Erreur lors de l\'ajout de la voiture.');
        }
    };
    const handleEditProfile = () => {
        window.location.href = '/editProfil'; // Redirection vers la page d'édition de profil
    };
    const handleAdminPage = () => {
        window.location.href = '/admin'; // Redirection vers la page admin
    };
    const handleAnonymize = async () => {
        try {
            const response = await fetch(`${apiUrl}/anonymize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                },
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Profil anonymisé avec succès.');
                window.location.href = '/login'; // Redirection vers la page de connexion
            } else {
                toast.error('Erreur lors de l\'anonymisation du profil.');
            }
        } catch (error) {
            console.error('Erreur lors de l\'anonymisation du profil:', error);
            toast.error('Erreur lors de l\'anonymisation du profil.');
        }
    };
    
    const editCar = async () => {
        try {
            const response = await fetch(`${apiUrl}/editCar`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'token': token,
                },
                body: JSON.stringify({
                    id: currentCar._id,
                    name: carName || currentCar.name,
                    seats: carSeats || currentCar.seats,
                }),
            });
            const data = await response.json();
            if (data.success) {
                toast.success('Voiture modifiée avec succès.');
                fetchUserCars();
                closeModal();
            } else {
                toast.error('Erreur lors de la modification de la voiture.');
            }
        } catch (error) {
            console.error('Erreur lors de la modification de la voiture:', error);
            toast.error('Erreur lors de la modification de la voiture.');
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            {user && (
                <div>
                    <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Profil</h1>
                    <div style={{ marginBottom: '20px' }}>
                        <strong>Nom:</strong> {user.nom} <br />
                        <strong>Prénom:</strong> {user.prenom} <br />
                        <strong>Email:</strong> {user.email} <br />
                        <strong>Adresse:</strong> {decodedAddress}
                    </div>
                    <button
    onClick={handleEditProfile}
    style={{ padding: '10px 20px', marginBottom: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
>
    Modifier Profil
</button>

{isAdmin && (
    <>
        <button
            onClick={handleAdminPage}
            style={{ padding: '10px 20px', marginBottom: '10px', marginLeft: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
            Page Admin
        </button>
        </>
    )}
        <button
            onClick={handleAnonymize}
            style={{ padding: '10px 20px', marginBottom: '10px', marginLeft: '10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
        >
            Anonymiser
        </button>
    



                    {isDriver && (
                        <div>
                            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Vos voitures</h2>
                            <button
                                onClick={() => setModalIsOpen(true)}
                                style={{ padding: '10px 20px', marginBottom: '10px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                            >
                                Ajouter une voiture
                            </button>
                            <ul style={{ listStyleType: 'none', padding: '0' }}>
                                {userCars.map((car) => (
                                    <li key={car._id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                                        <strong>{car.name}</strong> ({car.places} places)
                                        <button
                                            onClick={() => openModal(car)}
                                            style={{ padding: '5px 10px', marginLeft: '10px', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                        >
                                            Modifier
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {isDriver && (
                        <div>
                            <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Propositions</h2>
                            <ul style={{ listStyleType: 'none', padding: '0' }}>
                                {propositions.map((proposition) => (
                                    <li key={proposition._id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                                        <strong>{proposition.title}</strong> <br />
                                        <strong>Date:</strong> {proposition.date} <br />
                                        <strong>Adresse:</strong> {proposition.adresse}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div>
                        <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Demandes</h2>
                        <ul style={{ listStyleType: 'none', padding: '0' }}>
                            {demandes.map((demande) => (
                                <li key={demande._id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                                    <strong>{demande.title}</strong> <br />
                                    <strong>Date:</strong> {demande.date} <br />
                                    <strong>Adresse:</strong> {demande.adresse} <br />
                                    <button
                                        onClick={() => deleteDemande(demande._id)}
                                        style={{ padding: '5px 10px', marginTop: '10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                    >
                                        Supprimer
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 style={{ fontSize: '20px', marginBottom: '10px' }}>Covoiturages</h2>
                        <ul style={{ listStyleType: 'none', padding: '0' }}>
                            {covoiturages.map((covoiturage) => (
                                <li key={covoiturage._id} style={{ marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '5px' }}>
                                    <strong>{covoiturage.title}</strong> <br />
                                    <strong>Date:</strong> {covoiturage.date} <br />
                                    <strong>Adresse:</strong> {covoiturage.adresse} <br />
                                    <button
                                        onClick={() => deleteCovoiturage(covoiturage._id)}
                                        style={{ padding: '5px 10px', marginTop: '10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                                    >
                                        Supprimer
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <Modal
                        isOpen={modalIsOpen}
                        onRequestClose={closeModal}
                        style={{
                            content: {
                                top: '50%',
                                left: '50%',
                                right: 'auto',
                                bottom: 'auto',
                                marginRight: '-50%',
                                transform: 'translate(-50%, -50%)',
                                padding: '20px',
                                borderRadius: '10px',
                                border: '1px solid #ccc',
                            },
                        }}
                    >
                        <h2>{currentCar ? 'Modifier la voiture' : 'Ajouter une voiture'}</h2>
                        <input
                            type="text"
                            placeholder="Nom de la voiture"
                            value={carName}
                            onChange={(e) => setCarName(e.target.value)}
                            style={{ display: 'block', marginBottom: '10px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                        />
                        <input
                            type="number"
                            placeholder="Nombre de places"
                            value={carSeats}
                            onChange={(e) => setCarSeats(e.target.value)}
                            style={{ display: 'block', marginBottom: '10px', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                        />
                        <button
                            onClick={currentCar ? editCar : addCar}
                            style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        >
                            {currentCar ? 'Modifier' : 'Ajouter'}
                        </button>
                        <button
                            onClick={closeModal}
                            style={{ padding: '10px 20px', marginLeft: '10px', backgroundColor: '#6c757d', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                        >
                            Annuler
                        </button>
                    </Modal>
                </div>
            )}
        </div>
    );
};

export default Profil;
