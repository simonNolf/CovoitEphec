import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const apiUrl = process.env.REACT_APP_API_URL;

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [sortBy, setSortBy] = useState('matricule'); // État pour le tri
    const [sortOrder, setSortOrder] = useState('asc'); // État pour l'ordre de tri
    const [statusFilter, setStatusFilter] = useState('all'); // État pour le filtre de statut
    const [searchTerm, setSearchTerm] = useState(''); // État pour la recherche par matricule
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
    

    // Fonction pour récupérer les utilisateurs depuis la route getAllUsers avec tri, filtre et recherche
    useEffect(() => {
        fetch(`${apiUrl}/getAllUsers?sort=${sortBy}&order=${sortOrder}`, {
            headers: {
                'Content-Type': 'application/json',
                'token': sessionStorage.getItem('token')
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Filtrage des utilisateurs selon le statut et la recherche
                    const filteredUsers = data.users
                        .filter(user => {
                            if (statusFilter === 'all') return true;
                            return user.status === statusFilter;
                        })
                        .filter(user => {
                            return user.matricule.toLowerCase().includes(searchTerm.toLowerCase());
                        });
                    setUsers(filteredUsers);
                } else {
                    console.error('Erreur:', data.message);
                }
            })
            .catch(error => console.error('Erreur:', error));
    }, [sortBy, sortOrder, statusFilter, searchTerm]); // Dépendance sur le critère de tri, l'ordre, le filtre de statut et la recherche

    // Fonction pour ouvrir la popup et sélectionner un utilisateur
    const handleRowClick = (user) => {
        setSelectedUser(user);
        setIsPopupOpen(true);
    };

    // Fonction pour fermer la popup
    const closePopup = () => {
        setIsPopupOpen(false);
        setSelectedUser(null);
    };

    // Fonction pour changer le rôle de l'utilisateur
    const handleRoleChange = (isAdmin) => {
        fetch(`${apiUrl}/updateUserRole`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': sessionStorage.getItem('token')
            },
            body: JSON.stringify({
                userMatricule: selectedUser.matricule,
                isAdmin
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setUsers(users.map(user => 
                    user.matricule === selectedUser.matricule ? { ...user, isAdmin } : user
                ));
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            toast.error('Une erreur est survenue');
        });
    };

    // Fonction pour changer le statut de l'utilisateur
    const handleStatusChange = (status) => {
        fetch(`${apiUrl}/updateUserStatus`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': sessionStorage.getItem('token')
            },
            body: JSON.stringify({
                matricule: selectedUser.matricule,
                status
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setUsers(users.map(user => 
                    user.matricule === selectedUser.matricule ? { ...user, status } : user
                ));
                toast.success(data.message);
                closePopup();
            } else {
                toast.error(data.message);
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            toast.error('Une erreur est survenue');
        });
    };

    // Fonction pour gérer le changement de tri
    const handleSortChange = (newSortBy) => {
        if (newSortBy === sortBy) {
            // Inverser l'ordre si le critère est déjà sélectionné
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            // Mettre à jour le critère de tri et réinitialiser l'ordre à croissant
            setSortBy(newSortBy);
            setSortOrder('asc');
        }
    };

    // Fonction pour gérer le changement de filtre de statut
    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
    };

    // Fonction pour gérer la recherche par matricule
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    // Fonction pour ajouter ou retirer des points à un utilisateur
    const handleAddPoints = (matricule, isAdding) => {
        // isAdding est un booléen : true pour ajouter, false pour retirer
        fetch(`${apiUrl}/addPoints`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': sessionStorage.getItem('token')
            },
            body: JSON.stringify({ matricule, isAdding })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                setUsers(users.map(user => 
                    user.matricule === matricule ? { ...user, points: user.points + (isAdding ? 1 : -1) } : user
                ));
                toast.success(data.message);
            } else {
                toast.error(data.message);
            }
        })
        .catch(error => {
            console.error('Erreur:', error);
            toast.error('Une erreur est survenue');
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '20px' }}>
            <h1>Page d'administration</h1>
            <p>Bienvenue sur notre application !</p>
            
            <label htmlFor="search">Rechercher par matricule :</label>
            <input 
                type="text" 
                id="search" 
                value={searchTerm} 
                onChange={handleSearchChange} 
                placeholder="Entrez le matricule" 
                style={{ marginBottom: '20px', width: '100%' }} 
            />
            
            <label htmlFor="sort">Trier par :</label>
            <select id="sort" value={sortBy} onChange={(e) => handleSortChange(e.target.value)} style={{ marginBottom: '20px' }}>
                <option value="matricule">Matricule</option>
                <option value="name">Nom</option>
                <option value="status">Statut</option>
                <option value="role">Rôle</option>
                <option value="points">Points</option>
            </select>

            <label htmlFor="statusFilter">Filtrer par statut :</label>
            <select id="statusFilter" value={statusFilter} onChange={handleStatusFilterChange} style={{ marginBottom: '20px' }}>
                <option value="all">Tous</option>
                <option value="active">Actif</option>
                <option value="banned">Banni</option>
                <option value="archived">Inactif</option>
            </select>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Nom</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Prénom</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Matricule</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Rôle</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Statut</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Points</th>
                        <th style={{ border: '1px solid #ddd', padding: '8px' }}>Modifier</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((user, index) => (
                        <tr 
                            key={index} 
                            style={{ 
                                backgroundColor: user.points > 0 ? 'green' : 'red',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleRowClick(user)}
                        >
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.nom}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.prenom}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.matricule}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.isAdmin ? 'Admin' : 'Utilisateur'}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>{user.status}</td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                {user.points}
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        handleAddPoints(user.matricule, true); // Ajouter un point
                                    }} 
                                    style={{ marginLeft: '5px' }}
                                >
                                    +
                                </button>
                                <button 
                                    onClick={(e) => { 
                                        e.stopPropagation(); 
                                        handleAddPoints(user.matricule, false); // Retirer un point
                                    }} 
                                    style={{ marginLeft: '5px' }}
                                >
                                    -
                                </button>
                            </td>
                            <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                                <span 
                                    style={{ cursor: 'pointer', color: 'blue' }} 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRowClick(user);
                                    }}
                                >
                                    ✏️
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Popup pour modifier le rôle et le statut de l'utilisateur */}
            {isPopupOpen && selectedUser && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    padding: '20px',
                    boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000
                }}>
                    <h2>Modifier le rôle et le statut de l'utilisateur</h2>
                    <p>Nom: {selectedUser.nom}</p>
                    <p>Prénom: {selectedUser.prenom}</p>
                    <p>Matricule: {selectedUser.matricule}</p>
                    <div>
                        <h3>Rôle</h3>
                        <label>
                            <input 
                                type="radio" 
                                name="role" 
                                checked={selectedUser.isAdmin} 
                                onChange={() => handleRoleChange(true)} 
                            />
                            Admin
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                name="role" 
                                checked={!selectedUser.isAdmin} 
                                onChange={() => handleRoleChange(false)} 
                            />
                            Utilisateur standard
                        </label>
                    </div>
                    <div>
                        <h3>Statut</h3>
                        <label>
                            <input 
                                type="radio" 
                                name="status" 
                                value="active"
                                checked={selectedUser.status === 'active'}
                                onChange={() => handleStatusChange('active')} 
                            />
                            Actif
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                name="status" 
                                value="banned"
                                checked={selectedUser.status === 'banned'}
                                onChange={() => handleStatusChange('banned')} 
                            />
                            Banni
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                name="status" 
                                value="archived"
                                checked={selectedUser.status === 'archived'}
                                onChange={() => handleStatusChange('archived')} 
                            />
                            Inactif
                        </label>
                    </div>
                    <button onClick={closePopup} style={{ marginTop: '10px' }}>Fermer</button>
                </div>
            )}

            {/* Overlay pour désactiver l'arrière-plan lorsqu'une popup est ouverte */}
            {isPopupOpen && <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 999
            }} />}
            
            <ToastContainer />
        </div>
    );
};

export default Admin;
