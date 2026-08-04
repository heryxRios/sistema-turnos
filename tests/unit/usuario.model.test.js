const Usuario = require('../../src/database/models/Usuario');
const { sequelize } = require('../../src/database/connection');

describe('Unit - Usuario model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  test('crea usuario y valida password', async () => {
    const user = await Usuario.create({ username: 'u1', password: 'secret' });
    expect(user.username).toBe('u1');
    const valid = await user.validPassword('secret');
    expect(valid).toBe(true);
  });
});
