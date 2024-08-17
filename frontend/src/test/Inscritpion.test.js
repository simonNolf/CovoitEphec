import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import InscriptionContainer from '../Inscription';

describe('InscriptionContainer', () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <InscriptionContainer />
      </MemoryRouter>
    );
  });

  test('renders matricule from query params', () => {
    sessionStorage.setItem('matricule', '123456');

    // Re-render to update the component with new sessionStorage value
    render(
      <MemoryRouter>
        <InscriptionContainer />
      </MemoryRouter>
    );

    expect(screen.getByText(/matricule : 123456/i)).toBeInTheDocument();
  });

  test('submits the form successfully when passwords match', async () => {
    fireEvent.change(screen.getByPlaceholderText(/votre mot de passe/i), {
      target: { value: 'Password123#' },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirmer le mot de passe/i), {
      target: { value: 'Password123#' },
    });

    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    // Attendre et vérifier l'absence du message d'erreur toast
    await waitFor(() => {
      expect(screen.queryByText('Erreur lors de l\'inscription.')).toBeNull();
    });
  });

  test('shows error toast message if passwords do not match', async () => {
    fireEvent.change(screen.getByPlaceholderText(/votre mot de passe/i), {
      target: { value: 'Password123#' },
    });
    fireEvent.change(screen.getByPlaceholderText(/confirmer le mot de passe/i), {
      target: { value: 'Password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    // Attendre et vérifier la présence du message d'erreur toast
    await waitFor(() => {
      expect(screen.getByText('Les mots de passe ne correspondent pas.')).toBeInTheDocument();
    });
  });

  test('shows error toast message for SQL injection attempts', async () => {
    fireEvent.change(screen.getByPlaceholderText(/votre mot de passe/i), {
      target: { value: 'Password123\'' },
    });

    fireEvent.change(screen.getByPlaceholderText(/confirmer le mot de passe/i), {
      target: { value: 'Password123\'' },
    });

    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    // Attendre et vérifier la présence du message d'erreur toast
    await waitFor(() => {
      expect(screen.getByText('Potentielle injection SQL détectée.')).toBeInTheDocument();
    });
  });

  test('shows error toast message for weak password', async () => {
    fireEvent.change(screen.getByPlaceholderText(/votre mot de passe/i), {
      target: { value: 'password' },
    });

    fireEvent.change(screen.getByPlaceholderText(/confirmer le mot de passe/i), {
      target: { value: 'password' },
    });

    fireEvent.click(screen.getByRole('button', { name: /s'inscrire/i }));

    // Attendre et vérifier la présence du message d'erreur toast
    await waitFor(() => {
      expect(screen.getByText(/prérequis de sécurité/i)).toBeInTheDocument();
    });
  });
});
