import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req, res) {
    try {
      const auth = req.headers.authorization;
      if (!auth) {
        return res.status(401).send({ error: 'Unauthorized' });
      }
      const buff = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
      const email = buff[0];
      const password = buff[1];
      const hash = crypto.createHash('sha1');
      hash.update(password);
      const hashedPassword = hash.digest('hex');
      const user = await dbClient.getUser(email);
      if (!user || user.password !== hashedPassword) {
        return res.status(401).send({ error: 'Unauthorized' });
      }
      const token = uuidv4();
      const key = `auth_${token}`;
      await redisClient.set(key, user._id.toString(), 86400);
      return res.status(200).send({ token });
    } catch (error) {
      return res.status(500).send({ error });
    }
  }

  static async getDisconnect(req, res) {
    try {
      const token = req.header('x-token');
      if (!token) {
        return res.status(401).send({ error: 'Unauthorized' });
      }
      const userInfo = await redisClient.get(`auth_${token}`);
      if (!userInfo) {
        return res.status(401).send({ error: 'Unauthorized' });
      }
      await redisClient.del(`auth_${token}`);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).send({ error });
    }
  }
}

export default AuthController;
