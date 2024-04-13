import React from 'react';
import { render, screen } from '@testing-library/react';
import Profil from '../Profil';

describe('Profil component', () => {
  test('renders profile page', () => {
    render(<Profil />);
    const headingElement = screen.getByRole('heading', { name: /Page de profil/i });
    expect(headingElement).toBeInTheDocument();

    const paragraphElement = screen.getByText(/Ceci est votre profil utilisateur/i);
    expect(paragraphElement).toBeInTheDocument();
  });
});
