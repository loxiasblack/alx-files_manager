import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient()
      .on('error', (error) => {
        console.log(`Redis client not connected to the server: ${error}`);
        this.connected = false;
        this.client.quit();
      });

    this.getAsync = promisify(this.client.get).bind(this.client);
    this.SetAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.get).bind(this.client);
    this.connected = true;
  }

  isAlive() {
    return this.connected;
  }

  async get(key) {
    // return the value of the key
    const value = await this.getAsync(key);
    return value;
  }

  async set(key, value, duration) {
    // set the value of the key with an expiration time
    await this.SetAsync(key, value, 'EX', duration);
  }

  async del(key) {
    // delete the key
    await this.delAsync(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
