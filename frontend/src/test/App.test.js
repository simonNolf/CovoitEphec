import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import App from '../App';

describe('App', () => {
  test('renders navigation links', () => {
    render(
        <App />
     
    );

    // Vérifier si les liens de navigation sont rendus
    const accueilLink = screen.getByRole('link', { name: /accueil/i });
    const profilLink = screen.getByRole('link', { name: /profil/i });
    const loginLink = screen.getByRole('link', { name: /login/i });

    // Assurer que les liens redirigent vers les bonnes routes
    expect(accueilLink).toHaveAttribute('href', '/');
    expect(profilLink).toHaveAttribute('href', '/profil');
    expect(loginLink).toHaveAttribute('href', '/login');
  });
});
