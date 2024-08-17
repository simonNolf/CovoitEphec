import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom'; // Importez le bon Router

import Profil from '../Profil';

describe('Profil component', () => {
  beforeEach(() => {
    // Configuration préalable avant chaque test
    sessionStorage.setItem('matricule', '12345');
    sessionStorage.setItem('token', 'test-token');
  });

  test('renders profile page with heading "Page de profil"', () => {
    render(
      <Router>
        <Profil />
      </Router>
    );

    const headingElement = screen.getByRole('heading', { name: /Page de profil/i });
    expect(headingElement).toBeInTheDocument();
  });

  test('renders "Chargement des informations" text', () => {
    render(
      <Router>
        <Profil />
      </Router>
    );

    const loadingText = screen.getByText(/Chargement des informations/i);
    expect(loadingText).toBeInTheDocument();
  });
});
