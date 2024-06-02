import { toast } from 'react-toastify';

export const checkTokenExpiration = (onTokenExpired) => {
  const tokenExpiration = sessionStorage.getItem('tokenExpiration');
  if (tokenExpiration) {
    const expirationTime = parseInt(tokenExpiration);
    const currentTime = new Date().getTime();
    if (currentTime > expirationTime) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('tokenExpiration');
      if (onTokenExpired) {
        onTokenExpired();
      } else {
        toast.error('Votre session a expiré');
      }
      return true; // Le token est expiré
    }
  }
  return false; // Le token est valide
};
