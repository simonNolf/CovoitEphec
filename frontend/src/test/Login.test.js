import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from '../Login'; // Importer Login au lieu de LoginComponent

describe('Login component', () => {
  beforeEach(() => {
    render(
      <Router>
        <Login /> {/* Utilisez Login au lieu de LoginComponent */}
      </Router>
    );
  });

  test('renders input field with placeholder "votre matricule"', () => {
    const input = screen.getByPlaceholderText('votre matricule');
    expect(input).toBeInTheDocument();
  });

  test('renders submit button with text "Suivant"', () => {
    const submitButton = screen.getByText('Suivant');
    expect(submitButton).toBeInTheDocument();
  });

});
