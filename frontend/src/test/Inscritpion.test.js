import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { MemoryRouter } from 'react-router-dom';
import InscriptionContainer from '../Inscription';

describe('InscriptionContainer', () => {
  test('renders matricule from query params', () => {
    sessionStorage.setItem('matricule', '123456');

    render(
      <MemoryRouter>
        <InscriptionContainer />
      </MemoryRouter>
    );

    expect(screen.getByText(/matricule : 123456/i)).toBeInTheDocument();
  });

  test('submits the form successfully', async () => {
    render(
      <MemoryRouter>
        <InscriptionContainer />
      </MemoryRouter>
    );
  
    // Simuler le remplissage du formulaire
    fireEvent.change(screen.getByPlaceholderText(/votre mot de passe/i), {
      target: { value: 'Password123#' },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirmer le mot de passe/i), {
      target: { value: 'Password123#' },
    });
  
    // Simuler la soumission du formulaire
    fireEvent.click(screen.getByText(/s'inscrire/i));
  
    // Vérifier si le message d'erreur est affiché
    expect(screen.queryByText('Erreur lors de l\'inscription.')).toBeNull();
  });

  test('shows error message if passwords do not match', () => {
    render(
      <MemoryRouter>
        <InscriptionContainer />
      </MemoryRouter>
    );
  
    // Simuler le remplissage du formulaire
    fireEvent.change(screen.getByPlaceholderText(/votre mot de passe/i), {
      target: { value: 'Password123#' },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirmer le mot de passe/i), {
      target: { value: 'Password123' }, // Ce mot de passe ne correspond pas
    });
  
    // Simuler la soumission du formulaire
    fireEvent.click(screen.getByText(/s'inscrire/i));
  
    // Vérifier si le message d'erreur est affiché
    expect(screen.queryByText('Les mots de passe ne correspondent pas.')).toBeInTheDocument();
  });
  
  test('shows error message for SQL injection', () => {
    render(
      <MemoryRouter>
        <InscriptionContainer />
      </MemoryRouter>
    );
  
    fireEvent.change(screen.getByPlaceholderText(/votre mot de passe/i), {
      target: { value: 'Password123\'' },
    });
  
    fireEvent.change(screen.getByPlaceholderText(/confirmer le mot de passe/i), {
      target: { value: 'Password123\'' },
    });
  
    fireEvent.submit(screen.getByRole('button', { name: /s'inscrire/i }));
  
    // Vérifier si le message d'erreur est affiché
    expect(screen.getByText('Potentielle injection SQL')).toBeInTheDocument();
  });
  
  test('shows error message for weak password', () => {
    render(
      <MemoryRouter>
        <InscriptionContainer />
      </MemoryRouter>
    );
  
    fireEvent.change(screen.getByPlaceholderText(/votre mot de passe/i), {
      target: { value: 'password' }, // Mot de passe faible
    });
  
    fireEvent.change(screen.getByPlaceholderText(/confirmer le mot de passe/i), {
      target: { value: 'password' }, // Mot de passe faible
    });
  
    fireEvent.submit(screen.getByRole('button', { name: /s'inscrire/i }));
  
    // Vérifier si le message d'erreur est affiché
    expect(screen.getByText(/prérequis de sécurité/i)).toBeInTheDocument();
  });
  
});
