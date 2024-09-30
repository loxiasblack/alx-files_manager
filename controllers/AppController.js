import redisClient from '../utils/redis';
import dbClient from '../utils/db';

/**
 * AppController class
 * @class AppController
 * @description AppController class
 */
class AppController {
  static async getStatus(req, res) {
    await redisClient.isAlive();
    await dbClient.isAlive();
    res.status(200).send({ redis: redisClient.isAlive(), db: dbClient.isAlive() });
  }

  static async getStats(req, res) {
    const users = await dbClient.nbUsers();
    const files = await dbClient.nbFiles();
    res.status(200).send({ users, files });
  }
}

export default AppController;
