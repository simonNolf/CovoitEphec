const request = require('supertest');
const app = require('../app'); // Assuming your main app file is named app.js
const db = require('../database'); // Your database module
const jwt = require('jsonwebtoken');
const moment = require('moment');


// Mock the database module
jest.mock('../database');

describe('Backend API tests', () => {

  afterEach(() => {
    jest.clearAllMocks();
    // Close database connection after each test
    db.$pool.end();
  });

  it('should return "coucou" on GET /test', async () => {
    const res = await request(app).get('/test');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('coucou');
  });

  it('should activate user account on GET /activate/:matricule', async () => {
    const matricule = '12345';
    const activationExpiration = moment().add(1, 'hour').toISOString();

    db.one.mockResolvedValueOnce({
      status: 'inactive',
      activation_expiration: activationExpiration
    });

    db.none.mockResolvedValueOnce();

    const res = await request(app).get(`/activate/${matricule}`);

    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.');
    expect(db.one).toHaveBeenCalledWith('SELECT status, activation_expiration FROM "user" WHERE matricule = $1', [matricule]);
    expect(db.none).toHaveBeenCalledWith('UPDATE "user" SET status = $1 WHERE matricule = $2', ['active', matricule]);
  });

  it('should return error if activation link expired', async () => {
    const matricule = '12345';
    const activationExpiration = moment().subtract(1, 'hour').toISOString();

    db.one.mockResolvedValueOnce({
      status: 'inactive',
      activation_expiration: activationExpiration
    });

    const res = await request(app).get(`/activate/${matricule}`);

    expect(res.statusCode).toEqual(400);
    expect(res.text).toBe('Le lien d\'activation a expiré. Veuillez vous réinscrire.');
  });

  it('should return user data on GET /getUser with valid token', async () => {
    const token = 'valid-token';
    const matricule = '12345';
    const user = { matricule, name: 'John Doe', email: 'john.doe@example.com' };

    jwt.verify = jest.fn().mockReturnValue({ firstToken: 'decodedToken' });
    db.one.mockResolvedValueOnce({ matricule });
    db.one.mockResolvedValueOnce(user);

    const res = await request(app).get('/getUser').set('token', token);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toEqual(user);
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.TOKEN);
    expect(db.one).toHaveBeenCalledWith('SELECT matricule FROM public.token WHERE token = $1', ['decodedToken']);
    expect(db.one).toHaveBeenCalledWith('SELECT * FROM user_data WHERE matricule = $1', [matricule]);
  });

  it('should return error on GET /getUser with invalid token', async () => {
    const token = 'invalid-token';

    jwt.verify = jest.fn(() => { throw new Error('Invalid token'); });

    const res = await request(app).get('/getUser').set('token', token);

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Token non valide');
  });

  it('should return error on GET /getUser with valid token but no user found', async () => {
    const token = 'valid-token';
    const matricule = '12345';

    jwt.verify = jest.fn().mockReturnValue({ firstToken: 'decodedToken' });
    db.one.mockResolvedValueOnce({ matricule });
    db.one.mockRejectedValueOnce(new Error('No data returned from the query.'));

    const res = await request(app).get('/getUser').set('token', token);

    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('User not found for the given token');
  });
});
