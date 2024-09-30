import crypto from 'crypto';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  static async postNew(req, res) {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).send({ error: 'Missing email' });
      }
      if (!password) {
        return res.status(400).send({ error: 'Missing password' });
      }
      const user = await dbClient.getUser(email);
      if (user) {
        return res.status(400).send({ error: 'Already exist' });
      }
      const hash = crypto.createHash('sha1');
      hash.update(password);
      const hashedPassword = hash.digest('hex');
      const newUser = await dbClient.addUser({ email, password: hashedPassword });
      return res.status(201).send({ id: newUser.insertedId, email });
    } catch (error) {
      return res.status(500).send({ error });
    }
  }

  static async getMe(req, res) {
    try {
      const token = req.header('x-token');
      if (!token) {
        return res.status(401).send({ error: 'Unauthorized' });
      }
      const userInfo = await redisClient.get(`auth_${token}`);
      if (!userInfo) {
        return res.status(401).send({ error: 'Unauthorized' });
      }
      const user = await dbClient.getUserById(userInfo);
      if (!user) {
        return res.status(401).send({ error: 'Unauthorized' });
      }
      return res.status(200).send({ email: user.email, id: user._id });
    } catch (error) {
      return res.status(500).send({ error });
    }
  }
}

export default UsersController;
