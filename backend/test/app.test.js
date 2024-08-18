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

  it('should activate user account on GET /activate/:matricule', async () => {
    const matricule = '12345';
    const activationExpiration = moment().add(1, 'hour').toISOString();

    db.one.mockResolvedValueOnce({
      status: 'archived',
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
      status: 'archived',
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

  it('should add a car on POST /addCar with valid token', async () => {
    const carName = 'Toyota';
    const carSeats = 4;
    const token = 'valid-token';
    const matricule = '12345';

    jwt.verify = jest.fn().mockReturnValue({ firstToken: 'decodedToken' });
    db.one.mockResolvedValueOnce({ matricule });
    db.one.mockResolvedValueOnce({ id: 1 });

    const res = await request(app)
      .post('/addCar')
      .set('token', token)
      .send({ carName, carSeats });

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Voiture ajoutée avec succès.');
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.TOKEN);
    expect(db.one).toHaveBeenCalledWith('SELECT matricule FROM public.token WHERE token = $1', ['decodedToken']);
    expect(db.one).toHaveBeenCalledWith('INSERT INTO car (name, places) VALUES ($1, $2) RETURNING id', [carName, carSeats]);
  });

  it('should return error on POST /addCar without token', async () => {
    const carName = 'Toyota';
    const carSeats = 4;

    const res = await request(app)
      .post('/addCar')
      .send({ carName, carSeats });

    expect(res.statusCode).toEqual(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Token non valide');
  });

  it('should get cars on GET /getCars with valid token', async () => {
    const token = 'valid-token';
    const matricule = '12345';
    const cars = [
      { id: 1, name: 'Toyota', places: 4 },
      { id: 2, name: 'Honda', places: 5 }
    ];

    jwt.verify = jest.fn().mockReturnValue({ firstToken: 'decodedToken' });
    db.one.mockResolvedValueOnce({ matricule });
    db.any.mockResolvedValueOnce(cars);

    const res = await request(app).get('/getCars').set('token', token);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.cars).toEqual(cars);
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.TOKEN);
    expect(db.one).toHaveBeenCalledWith('SELECT matricule FROM public.token WHERE token = $1', ['decodedToken']);
    expect(db.any).toHaveBeenCalledWith('SELECT car.id, car.name, car.places FROM car JOIN user_car ON car.id = user_car.id_car WHERE user_car.matricule = $1', [matricule]);
  });

  it('should update car on PUT /editCar', async () => {
    const carId = 1;
    const carName = 'Updated Toyota';
    const carSeats = 5;

    const res = await request(app)
      .put('/editCar')
      .send({ carId, carName, carSeats });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Voiture mise à jour avec succès.');
    expect(db.none).toHaveBeenCalledWith('UPDATE car SET name = $1, places = $2 WHERE id = $3', [carName, carSeats, carId]);
  });

  it('should delete car on DELETE /deleteCar', async () => {
    const carId = 1;

    const res = await request(app)
      .delete('/deleteCar')
      .send({ carId });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Voiture supprimée avec succès.');
    expect(db.none).toHaveBeenCalledWith('DELETE FROM car WHERE id = $1', [carId]);
    expect(db.none).toHaveBeenCalledWith('DELETE FROM user_car WHERE id_car = $1', [carId]);
  });

  it('should delete proposition on DELETE /deleteProposition', async () => {
    const propositionId = 1;

    const res = await request(app)
      .delete('/deleteProposition')
      .send({ propositionId });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('proposition supprimée avec succès.');
    expect(db.none).toHaveBeenCalledWith('DELETE FROM PROPOSITION WHERE id = $1', [propositionId]);
  });

  it('should add a demande with valid token', async () => {
    const date = '2024-08-20';
    const time = '15:00';
    const address = { lat: 48.8566, lon: 2.3522 };
    const token = 'valid-token';
    const matricule = '12345';

    jwt.verify = jest.fn().mockReturnValue({ firstToken: 'decodedToken' });
    db.one.mockResolvedValueOnce({ matricule });
    db.query.mockResolvedValueOnce([]); // Pas de demande existante
    db.query.mockResolvedValueOnce(); // Insertion de la demande réussie

    const res = await request(app)
      .post('/addDemande')
      .set('token', token)
      .send({ date, time, address });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.TOKEN);
    expect(db.one).toHaveBeenCalledWith('SELECT matricule FROM public.token WHERE token = $1', ['decodedToken']);
    expect(db.query).toHaveBeenCalledWith('SELECT * FROM demande WHERE date = $1 AND demandeur = $2', [date, matricule]);
    expect(db.query).toHaveBeenCalledWith('INSERT INTO demande (demandeur, status, date, heure, adresse) VALUES ($1, $2, $3, $4, POINT($5, $6))', [matricule, 'pending', date, time, address.lon, address.lat]);
  });

  it('should return error if demande already exists', async () => {
    const date = '2024-08-20';
    const time = '15:00';
    const address = { lat: 48.8566, lon: 2.3522 };
    const token = 'valid-token';
    const matricule = '12345';

    jwt.verify = jest.fn().mockReturnValue({ firstToken: 'decodedToken' });
    db.one.mockResolvedValueOnce({ matricule });
    db.query.mockResolvedValueOnce([{ id: 1 }]); // Demande existante

    const res = await request(app)
      .post('/addDemande')
      .set('token', token)
      .send({ date, time, address });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Vous avez déjà une demande pour cette date');
  });

  // Test pour POST /addProposition
  it('should add a proposition with valid token', async () => {
    const date = '2024-08-21';
    const time = '16:00';
    const address = { lat: 48.8566, lon: 2.3522 };
    const selectedCar = 1;
    const places = 3;
    const token = 'valid-token';
    const matricule = '12345';

    jwt.verify = jest.fn().mockReturnValue({ firstToken: 'decodedToken' });
    db.one.mockResolvedValueOnce({ matricule });
    db.query.mockResolvedValueOnce([]); // Pas de proposition existante
    db.query.mockResolvedValueOnce(); // Insertion de la proposition réussie

    const res = await request(app)
      .post('/addProposition')
      .set('token', token)
      .send({ date, time, address, selectedCar, places });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Proposition de covoiturage ajoutée avec succès');
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.TOKEN);
    expect(db.one).toHaveBeenCalledWith('SELECT matricule FROM public.token WHERE token = $1', ['decodedToken']);
    expect(db.query).toHaveBeenCalledWith('SELECT * FROM proposition WHERE date = $1 AND matricule_conducteur = $2', [date, matricule]);
    expect(db.query).toHaveBeenCalledWith('INSERT INTO proposition (matricule_conducteur, id_car, status, date, heure, adresse, places) VALUES ($1, $2, $3, $4, $5, POINT($6, $7), $8)', [matricule, selectedCar, 'pending', date, time, address.lon, address.lat, places]);
  });

  it('should return error if proposition already exists', async () => {
    const date = '2024-08-21';
    const time = '16:00';
    const address = { lat: 48.8566, lon: 2.3522 };
    const selectedCar = 1;
    const places = 3;
    const token = 'valid-token';
    const matricule = '12345';

    jwt.verify = jest.fn().mockReturnValue({ firstToken: 'decodedToken' });
    db.one.mockResolvedValueOnce({ matricule });
    db.query.mockResolvedValueOnce([{ id: 1 }]); // Proposition existante

    const res = await request(app)
      .post('/addProposition')
      .set('token', token)
      .send({ date, time, address, selectedCar, places });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Vous avez déjà une proposition pour cette date');
  });

  // Test pour GET /propositions
  it('should get propositions with valid token', async () => {
    const token = 'valid-token';
    const matricule = '12345';
    const propositions = [
      { id: 1, date: '2024-08-21', time: '16:00', car_name: 'Toyota' },
      { id: 2, date: '2024-08-22', time: '17:00', car_name: 'Honda' }
    ];

    jwt.verify = jest.fn().mockReturnValue({ firstToken: 'decodedToken' });
    db.one.mockResolvedValueOnce({ matricule });
    db.query.mockResolvedValueOnce(propositions);

    const res = await request(app)
      .get('/propositions')
      .set('token', token);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.propositions).toEqual(propositions);
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.TOKEN);
    expect(db.one).toHaveBeenCalledWith('SELECT matricule FROM public.token WHERE token = $1', ['decodedToken']);
  });

  // Test pour GET /demandes
  it('should get demandes with valid token', async () => {
    const token = 'valid-token';
    const matricule = '12345';
    const demandes = [
      { id: 1, date: '2024-08-20', time: '15:00' },
      { id: 2, date: '2024-08-21', time: '16:00' }
    ];

    jwt.verify = jest.fn().mockReturnValue({ firstToken: 'decodedToken' });
    db.one.mockResolvedValueOnce({ matricule });
    db.query.mockResolvedValueOnce(demandes);

    const res = await request(app)
      .get('/demandes')
      .set('token', token);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.demandes).toEqual(demandes);
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.TOKEN);
    expect(db.one).toHaveBeenCalledWith('SELECT matricule FROM public.token WHERE token = $1', ['decodedToken']);
    expect(db.query).toHaveBeenCalledWith('SELECT * FROM demande WHERE demandeur = $1 and status =\'pending\' order by date', [matricule]);
  });

  // Test pour GET /getDemandes
  it('should get upcoming demandes', async () => {
    const token = 'valid-token';
    const matricule = '12345';
    const demandes = [
      { id: 1, date: '2024-08-20', time: '15:00' },
      { id: 2, date: '2024-08-21', time: '16:00' }
    ];

    jwt.verify = jest.fn().mockReturnValue({ firstToken: 'decodedToken' });
    db.one.mockResolvedValueOnce({ matricule });
    db.query.mockResolvedValueOnce(demandes);

    const res = await request(app)
      .get('/getDemandes')
      .set('token', token);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.demandes).toEqual(demandes);
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.TOKEN);
    expect(db.one).toHaveBeenCalledWith('SELECT matricule FROM public.token WHERE token = $1', ['decodedToken']);
  });

  // Test pour GET /getPropositions
  it('should get upcoming propositions with available places', async () => {
    const token = 'valid-token';
    const matricule = '12345';
    const propositions = [
      { id: 1, date: '2024-08-21', time: '16:00', car_name: 'Toyota', places: 3 },
      { id: 2, date: '2024-08-22', time: '17:00', car_name: 'Honda', places: 2 }
    ];

    jwt.verify = jest.fn().mockReturnValue({ firstToken: 'decodedToken' });
    db.one.mockResolvedValueOnce({ matricule });
    db.query.mockResolvedValueOnce(propositions);

    const res = await request(app)
      .get('/getPropositions')
      .set('token', token);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.propositions).toEqual(propositions);
    expect(jwt.verify).toHaveBeenCalledWith(token, process.env.TOKEN);
    expect(db.one).toHaveBeenCalledWith('SELECT matricule FROM public.token WHERE token = $1', ['decodedToken']);
  });

  // Test pour POST /acceptCovoiturage
  

  it('should return error if type is invalid', async () => {
    const token = 'valid-token';
    const matricule = '12345';
    const covoiturageId = 1;
    const type = 'InvalidType';
    const selectedCar = 1;

    jwt.verify = jest.fn().mockReturnValue({ firstToken: 'decodedToken' });
    db.one.mockResolvedValueOnce({ matricule });

    const res = await request(app)
      .post('/acceptCovoiturage')
      .set('token', token)
      .send({ covoiturageId, type, selectedCar });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Type invalide');
  });
});
