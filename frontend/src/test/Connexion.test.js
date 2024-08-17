import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ConnexionContainer from '../Connexion';

// Mock fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ message: 'Success' }),
  })
);

describe('ConnexionContainer', () => {
  test('renders correctly', () => {
    render(<ConnexionContainer />, { wrapper: MemoryRouter });

    // Vérifier si les éléments de base sont rendus
    expect(screen.getByLabelText('Mot de passe :')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
  });

  test('handles form submission success', async () => {
    // Modifier la fonction fetch pour simuler une réponse de succès
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Success' }),
      })
    );

    render(<ConnexionContainer />, { wrapper: MemoryRouter });

    // Simuler la saisie de mot de passe
    fireEvent.change(screen.getByLabelText('Mot de passe :'), { target: { value: 'password123' } });

    // Simuler la soumission du formulaire
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    // Attendre et vérifier que le message de succès est affiché
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });

  test('handles form submission failure', async () => {
    // Modifier la fonction fetch pour simuler une réponse d'échec
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Error' }),
      })
    );

    render(<ConnexionContainer />, { wrapper: MemoryRouter });

    // Simuler la saisie de mot de passe
    fireEvent.change(screen.getByLabelText('Mot de passe :'), { target: { value: 'password123' } });

    // Simuler la soumission du formulaire
    fireEvent.click(screen.getByRole('button', { name: /se connecter/i }));

    // Attendre et vérifier que le message d'erreur est affiché
    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });
});
