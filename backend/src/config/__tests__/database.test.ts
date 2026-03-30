import database from '../database';

describe('Database Connection', () => {
  afterAll(async () => {
    await database.close();
  });

  it('should connect to the database successfully', async () => {
    const isConnected = await database.testConnection();
    expect(isConnected).toBe(true);
  });

  it('should execute a simple query', async () => {
    const result = await database.query('SELECT 1 as value');
    expect(result.rows).toHaveLength(1);
    expect(result.rows[0]?.value).toBe(1);
  });

  it('should handle transactions', async () => {
    const result = await database.transaction(async (client) => {
      const res = await client.query('SELECT 2 as value');
      return res.rows[0]?.value;
    });
    expect(result).toBe(2);
  });
});
