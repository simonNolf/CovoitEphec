import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom'; // Importez le bon Router

import Profil from '../Profil';

describe('Profil component', () => {
  test('renders profile page with user data', () => {
    const user = {
      nom: 'Doe',
      prenom: 'John',
      adresse: '123 Rue de la Test',
      matricule: '12345'
    };
    sessionStorage.setItem('matricule', '12345');
    sessionStorage.setItem('token', 'test-token');
    
    render(
      <Router>
        <Profil />
      </Router>
    );

    const headingElement = screen.getByRole('heading', { name: /Page de profil/i });
    expect(headingElement).toBeInTheDocument();

    const nomElement = screen.getByText(/Matricule: 12345/i);
    expect(nomElement).toBeInTheDocument();
    
  });
});
