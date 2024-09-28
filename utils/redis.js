import { createClient } from 'redis';

class RedisClient {
    constructor() {
        this.client = createClient()
         .on('error', (error) => {
            console.log(`Redis client not connected to the server: ${error}`);
         })
        
         .on('connect', () => {
            console.log('Redis client connected to the server');
         });
    }   

    async get(key) {
        // return the value of the key
        return this.client.get(key);
    }

    async set(key, value, duration) {
        // set the value of the key with an expiration time
        return this.client.set(key, value, 'EX', duration);
    }

    async del(key) {
        // delete the key
        return this.client.del(key);
    }
}

const redisClient = new RedisClient();

export default redisClient;
