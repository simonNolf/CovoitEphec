import React, { useEffect, useState, navigate } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const apiUrl = process.env.REACT_APP_API_URL;

const Admin = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [sortBy, setSortBy] = useState('matricule');
    const [sortOrder, setSortOrder] = useState('asc');
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const expirationToken = sessionStorage.getItem('tokenExpiration');

    function checkTokenExpiration(expirationTimestamp) {
        const expirationDate = new Date(expirationTimestamp);
        const currentDate = new Date();

        if (currentDate >= expirationDate) {
            onTokenExpired();
        } else {
            setTimeout(() => checkTokenExpiration(expirationTimestamp), 1000);
        }
    }

    function onTokenExpired() {
        navigate = "/logout";
    }

    checkTokenExpiration(expirationToken);

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
                    const filteredUsers = data.users
                        .filter(user => {
                            if (statusFilter === 'all') return true;
                            return user.status === statusFilter;
                        })
                        .filter(user => user.matricule.toLowerCase().includes(searchTerm.toLowerCase()));
                    setUsers(filteredUsers);
                } else {
                    console.error('Erreur:', data.message);
                }
            })
            .catch(error => console.error('Erreur:', error));
    }, [sortBy, sortOrder, statusFilter, searchTerm]);

    const handleRowClick = (user) => {
        setSelectedUser(user);
        setIsPopupOpen(true);
    };

    const closePopup = () => {
        setIsPopupOpen(false);
        setSelectedUser(null);
    };

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

    const handleSortChange = (newSortBy) => {
        if (newSortBy === sortBy) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(newSortBy);
            setSortOrder('asc');
        }
    };

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleAddPoints = (matricule, isAdding) => {
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Page d'administration</h1>
            <p style={{ marginBottom: '20px' }}>Bienvenue sur notre application !</p>
            
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '1200px' }}>
                <label htmlFor="search" style={{ marginBottom: '10px', fontWeight: 'bold' }}>Rechercher par matricule :</label>
                <input 
                    type="text" 
                    id="search" 
                    value={searchTerm} 
                    onChange={handleSearchChange} 
                    placeholder="Entrez le matricule" 
                    style={{ marginBottom: '20px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }} 
                />
                
                <label htmlFor="sort" style={{ marginBottom: '10px', fontWeight: 'bold' }}>Trier par :</label>
                <select 
                    id="sort" 
                    value={sortBy} 
                    onChange={(e) => handleSortChange(e.target.value)} 
                    style={{ marginBottom: '20px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                >
                    <option value="matricule">Matricule</option>
                    <option value="name">Nom</option>
                    <option value="status">Statut</option>
                    <option value="role">Rôle</option>
                    <option value="points">Points</option>
                </select>

                <label htmlFor="statusFilter" style={{ marginBottom: '10px', fontWeight: 'bold' }}>Filtrer par statut :</label>
                <select 
                    id="statusFilter" 
                    value={statusFilter} 
                    onChange={handleStatusFilterChange} 
                    style={{ marginBottom: '20px', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                >
                    <option value="all">Tous</option>
                    <option value="active">Actif</option>
                    <option value="banned">Banni</option>
                    <option value="archived">archivé</option>
                </select>
            </div>

            <div style={{ width: '100%', maxWidth: '1200px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                    <thead>
                        <tr>
                            <th style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f4f4f4' }}>Nom</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f4f4f4' }}>Prénom</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f4f4f4' }}>Matricule</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f4f4f4' }}>Rôle</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f4f4f4' }}>Statut</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f4f4f4' }}>Points</th>
                            <th style={{ border: '1px solid #ddd', padding: '12px', backgroundColor: '#f4f4f4' }}>Modifier</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user, index) => (
                            <tr 
                                key={index} 
                                style={{ 
                                    backgroundColor: user.points > 0 ? '#4CAF50' : '#F44336',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                                onClick={() => handleRowClick(user)}
                            >
                                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{user.nom}</td>
                                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{user.prenom}</td>
                                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{user.matricule}</td>
                                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{user.isAdmin ? 'Admin' : 'Utilisateur'}</td>
                                <td style={{ border: '1px solid #ddd', padding: '12px' }}>{user.status}</td>
                                <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                                    {user.points}
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            handleAddPoints(user.matricule, true); 
                                        }} 
                                        style={{ marginLeft: '5px', padding: '5px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        +
                                    </button>
                                    <button 
                                        onClick={(e) => { 
                                            e.stopPropagation(); 
                                            handleAddPoints(user.matricule, false); 
                                        }} 
                                        style={{ marginLeft: '5px', padding: '5px', backgroundColor: '#F44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        -
                                    </button>
                                </td>
                                <td style={{ border: '1px solid #ddd', padding: '12px' }}>
                                    <span 
                                        style={{ cursor: 'pointer', color: '#2196F3', fontSize: '18px' }} 
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
            </div>

            {isPopupOpen && selectedUser && (
                <div style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '8px',
                    boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.2)',
                    zIndex: 1000
                }}>
                    <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>Modifier le rôle et le statut de l'utilisateur</h2>
                    <p><strong>Nom:</strong> {selectedUser.nom}</p>
                    <p><strong>Prénom:</strong> {selectedUser.prenom}</p>
                    <p><strong>Matricule:</strong> {selectedUser.matricule}</p>
                    <div style={{ marginBottom: '15px' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Rôle</h3>
                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            <input 
                                type="radio" 
                                name="role" 
                                checked={selectedUser.isAdmin} 
                                onChange={() => handleRoleChange(true)} 
                            />
                            <span style={{ marginLeft: '5px' }}>Admin</span>
                        </label>
                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            <input 
                                type="radio" 
                                name="role" 
                                checked={!selectedUser.isAdmin} 
                                onChange={() => handleRoleChange(false)} 
                            />
                            <span style={{ marginLeft: '5px' }}>Utilisateur standard</span>
                        </label>
                    </div>
                    <div>
                        <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>Statut</h3>
                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            <input 
                                type="radio" 
                                name="status" 
                                value="active"
                                checked={selectedUser.status === 'active'}
                                onChange={() => handleStatusChange('active')} 
                            />
                            <span style={{ marginLeft: '5px' }}>Actif</span>
                        </label>
                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            <input 
                                type="radio" 
                                name="status" 
                                value="banned"
                                checked={selectedUser.status === 'banned'}
                                onChange={() => handleStatusChange('banned')} 
                            />
                            <span style={{ marginLeft: '5px' }}>Banni</span>
                        </label>
                        <label style={{ display: 'block', marginBottom: '5px' }}>
                            <input 
                                type="radio" 
                                name="status" 
                                value="archived"
                                checked={selectedUser.status === 'archived'}
                                onChange={() => handleStatusChange('archived')} 
                            />
                            <span style={{ marginLeft: '5px' }}>Archivé</span>
                        </label>
                    </div>
                    <button 
                        onClick={closePopup} 
                        style={{ marginTop: '20px', padding: '10px', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        Fermer
                    </button>
                </div>
            )}

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
