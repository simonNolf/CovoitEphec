import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Admin from '../Admin';

describe('Admin Component', () => {
  test('renders title', () => {
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    // Vérifie si le titre de la page est affiché
    expect(screen.getByText('Page d\'administration')).toBeInTheDocument();
  });

  test('renders subtitle', () => {
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    // Vérifie si le sous-titre est affiché
    expect(screen.getByText('Bienvenue sur notre application !')).toBeInTheDocument();
  });

  test('renders search input field', () => {
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    // Vérifie si le champ de recherche par matricule est présent
    expect(screen.getByLabelText(/Rechercher par matricule/i)).toBeInTheDocument();
  });

  test('renders sort dropdown', () => {
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    // Vérifie si la liste déroulante pour le tri est présente
    expect(screen.getByLabelText(/Trier par/i)).toBeInTheDocument();
  });

  test('renders status filter dropdown', () => {
    render(
      <MemoryRouter>
        <Admin />
      </MemoryRouter>
    );

    // Vérifie si la liste déroulante pour le filtre de statut est présente
    expect(screen.getByLabelText(/Filtrer par statut/i)).toBeInTheDocument();
  });
});
