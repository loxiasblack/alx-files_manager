import crypto from 'crypto';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    try {
      const { email, password } = req.body;
      if (!email) {
        res.status(400).send({ error: 'Missing email' });
      }
      if (!password) {
        res.status(400).send({ error: 'Missing password' });
      }
      const user = await dbClient.getUser(email);
      if (user) {
        res.status(400).send({ error: 'Already exist' });
      }
      const hash = crypto.createHash('sha1');
      hash.update(password);
      const hashedPassword = hash.digest('hex');
      const newUser = await dbClient.addUser({ email, password: hashedPassword });
      res.status(201).send({ id: newUser.insertedId, email });
    } catch (error) {
      console.log(`error: ${error}`);
    }
  }
}

export default UsersController;
