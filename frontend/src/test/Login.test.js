import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Login from '../Login'; // Importer Login au lieu de LoginComponent
import fs from 'fs';
import path from 'path';

describe('LoginComponent', () => {
  test('renders input and submit button', () => {
    const { getByPlaceholderText, getByText } = render(
      <Router>
        <Login /> {/* Utilisez Login au lieu de LoginComponent */}
      </Router>
    );

    // Vérifie si l'élément correspondant à l'input de matricule est rendu
    const input = getByPlaceholderText('votre matricule');
    expect(input).toBeInTheDocument();

    // Vérifie si l'élément correspondant au bouton "Suivant" est rendu
    const submitButton = getByText('Suivant');
    expect(submitButton).toBeInTheDocument();
  });

  // Ajoutez d'autres tests pour vérifier d'autres éléments de rendu au besoin
});



describe('data.csv', () => {
    test('has correct content', () => {
      const filePath = path.join(__dirname, '../../public/data.csv');
      const expectedLines = [
        'matricule;mail;nom;adresse;prenom',
        'HE201770;s.nolf@students.ephec.be;Nolf;rue d\'Hennuyeres, 38;Simon',
        'HE123456;p.vanderhulst@students.ephec.be;Vanderhulst;rue de la station, 31;Pauline',
        'HE654321;n.gregoire@students.ephec.be;Gregoire;boulevard de la resistance, 111;Nathan'
      ];
  
      const fileContent = fs.readFileSync(filePath, 'utf8');
  
      expectedLines.forEach(line => {
        expect(fileContent).toContain(line);
      });
    });
  });