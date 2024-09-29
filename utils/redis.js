const redis = require('redis');
const { promisify } = require('util');

// Declaration of the RedisClient class
class RedisClient {
  constructor() {
    this.client = redis.createClient();

    // Check if the client is connected to the server
    this.isconnected = true;

    this.client.on('error', (err) => {
      console.log(`Redis client not connected to the server: ${err}`);
      this.isconnected = false;
    });

    // Promisify the get, set and del methods of the client
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  // Method that checks if the client is connected to the server
  isAlive() {
    return this.isconnected;
  }

  // Method that get the value of a key
  async get(key) {
    const value = await this.getAsync(key);
    return value;
  }

  // Method that set a key value pair with a duration
  async set(key, value, duration) {
    await this.setAsync(key, value);
    await this.client.expire(key, duration);
  }

  // Method that delete a key
  async del(key) {
    await this.delAsync(key);
  }
}

// Create a new instance of the RedisClient class
const redisClient = new RedisClient();

// Export the RedisClient class
module.exports = redisClient;
