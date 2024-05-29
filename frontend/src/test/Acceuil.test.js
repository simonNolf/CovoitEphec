import React from 'react';
import { render, screen } from '@testing-library/react';
import Acceuil from '../Acceuil';

describe('Acceuil', () => {
  test('renders heading and welcome message', () => {
    render(<Acceuil />); // Rendre le composant

    // Vérifier si le titre h1 est rendu
    const headingElement = screen.getByRole('heading', { name: /page d'accueil/i });
    expect(headingElement).toBeInTheDocument();

    // Vérifier si le message de bienvenue est rendu
    const welcomeMessage = screen.getByText(/bienvenue sur notre application/i);
    expect(welcomeMessage).toBeInTheDocument();
  });
});
