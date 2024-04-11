const request = require('supertest');
const app = require('../app'); // Assurez-vous d'utiliser le chemin correct

describe('Tests pour l\'activation du compte', () => {
  it('devrait activer le compte avec succès', async () => {
    const matricule = 'test123';

    const response = await request(app).get(`/activate/${matricule}`);

    expect(response.status).toBe(200);
    expect(response.text).toBe('Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.');
  });

  it('devrait renvoyer un message si le compte est déjà actif', async () => {
    const matricule = 'compteActif123';

    const response = await request(app).get(`/activate/${matricule}`);

    expect(response.status).toBe(200); // Ou 400 selon votre implémentation
    expect(response.text).toBe('Votre compte est déjà actif. Vous pouvez vous connecter.');
  });

  it('devrait renvoyer un message d\'erreur si le lien d\'activation a expiré', async () => {
    const matricule = 'lienExpire123';

    const response = await request(app).get(`/activate/${matricule}`);

    expect(response.status).toBe(400);
    expect(response.text).toBe('Le lien d\'activation a expiré. Veuillez vous réinscrire.');
  });
});
