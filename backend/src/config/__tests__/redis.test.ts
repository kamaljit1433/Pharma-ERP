import redisClient from '../redis';

describe('Redis Connection', () => {
  afterAll(async () => {
    await redisClient.close();
  });

  it('should connect to Redis successfully', async () => {
    const isConnected = await redisClient.testConnection();
    expect(isConnected).toBe(true);
  });

  it('should set and get a value', async () => {
    const key = 'test:key';
    const value = 'test-value';

    await redisClient.set(key, value);
    const retrieved = await redisClient.get(key);

    expect(retrieved).toBe(value);

    // Cleanup
    await redisClient.del(key);
  });

  it('should set a value with expiry', async () => {
    const key = 'test:expiry';
    const value = 'expiring-value';

    await redisClient.set(key, value, 2);
    const exists = await redisClient.exists(key);

    expect(exists).toBe(true);

    // Wait for expiry (add buffer for Redis processing)
    await new Promise((resolve) => setTimeout(resolve, 2500));
    const existsAfter = await redisClient.exists(key);

    expect(existsAfter).toBe(false);
  }, 10000);

  it('should delete a key', async () => {
    const key = 'test:delete';
    const value = 'delete-me';

    await redisClient.set(key, value);
    await redisClient.del(key);
    const exists = await redisClient.exists(key);

    expect(exists).toBe(false);
  });
});
