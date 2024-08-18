import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('matricule');
    sessionStorage.removeItem('tokenExpiration')
    toast.success('Déconnexion réussie');

    // Rediriger vers la page de login
    navigate('/login');
  }, [navigate]);

  return null; // Pas besoin de rendre quoi que ce soit
};

export default Logout;
