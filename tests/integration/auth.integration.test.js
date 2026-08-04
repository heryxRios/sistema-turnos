const request = require('supertest');
const { app, sequelize } = require('../../src/app');
const Usuario = require('../../src/database/models/Usuario');

describe('Integración - Auth', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('Registrar y luego hacer login', async () => {
    const usuario = { username: 'testuser', password: 'pass123', rol: 'cajero' };

    const resReg = await request(app).post('/api/auth/registrar').send(usuario);
    expect(resReg.statusCode).toBe(200);
    expect(resReg.body).toHaveProperty('id');

    const resLogin = await request(app).post('/api/auth/login').send({ username: usuario.username, password: usuario.password });
    expect(resLogin.statusCode).toBe(200);
    expect(resLogin.body).toHaveProperty('token');
  });
});
