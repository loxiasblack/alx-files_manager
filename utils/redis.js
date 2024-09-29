import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = redis.createClient();
    this.isConnected = true;

    this.client.on('connect', () => {
      this.isConnected = true;
    });

    this.client.on('error', (error) => {
      console.log(`Redis client not connected to the server: ${error}`);
      this.isConnected = false;
    });

    // Promisify Redis commands
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  isAlive() {
    return this.isConnected;
  }

  async get(key) {
    return this.getAsync(key);
  }

  async set(key, value, duration) {
    return this.setAsync(key, value, 'EX', duration);
  }

  async del(key) {
    return this.delAsync(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
