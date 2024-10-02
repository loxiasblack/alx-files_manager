import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class FilesController {
  static async postUpload(req, res) {
    try {
      const token = req.header('x-token');
      const userInfo = await redisClient.get(`auth_${token}`);
      if (!userInfo) {
        return res.status(401).send({ error: 'Unauthorized' });
      }
      const user = await dbClient.getUserById(userInfo);
      if (!user) {
        return res.status(401).send({ error: 'Unauthorized' });
      }

      const {
        name,
        type,
        parentId,
        isPublic,
        data,
      } = req.body;

      if (!name) {
        return res.status(400).send({ error: 'Missing name' });
      }
      if (!type) {
        return res.status(400).send({ error: 'Missing type' });
      }
      if (!data && type !== 'folder') {
        return res.status(400).send({ error: 'Missing data' });
      }
      if (parentId) {
        const parentFile = await dbClient.getfilebyid(parentId);
        if (!parentFile) {
          return res.status(400).send({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return res.status(400).send({ error: 'Parent is not a folder' });
        }
      }
      const file = {
        name,
        type,
        parentId: parentId || 0,
        isPublic: isPublic || false,
        userId: user._id,
      };
      if (type === 'folder') {
        await dbClient.addFile(file);
        return res.status(201).send({
          id: file._id,
          userId: file.userId,
          name,
          type,
          parentId: file.parentId,
          isPublic: file.isPublic,
        });
      }
      const convertedData = Buffer.from(data, 'base64').toString('utf-8');
      const localPath = process.env.FOLDER_PATH || '/tmp/files_manager';
      const filename = uuidv4();
      const localFolder = `${localPath}/${filename}`;
      if (!fs.existsSync(localPath)) {
        fs.mkdirSync(localPath);
      }
      fs.writeFileSync(localFolder, convertedData);
      file.localPath = localFolder;
      await dbClient.addFile(file);
      return res.status(201).send({
        id: file._id,
        userId: file.userId,
        name,
        type,
        parentId: file.parentId,
        isPublic: file.isPublic,
      });
    } catch (error) {
      console.error(`the error is ${error}`);
      return res.status(500).send({ error });
    }
  }

  static async getShow(req, res) {
    const token = req.header('x-token');
    const userInfo = await redisClient.get(`auth_${token}`);
    if (!userInfo) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    const user = await dbClient.getUserById(userInfo);
    if (!user) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    const { id } = req.params.id;
    const file = await dbClient.getfilebyid(id);
    if (!file) {
      return res.status(404).send({ error: 'Not found' });
    }
    if (file.userId.toString() !== user._id.toString()) {
      return res.status(404).send({ error: 'Not found' });
    }
    return res.status(200).send({
      id: file._id,
      userId: file.userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId,
    });
  }

  static async getIndex(req, res) {
    try {
      const token = req.header('x-token');
      const userInfo = await redisClient.get(`auth_${token}`);
      if (!userInfo) {
        return res.status(401).send({ error: 'Unauthorized' });
      }
      const user = await dbClient.getUserById(userInfo);
      if (!user) {
        return res.status(401).send({ error: 'Unauthorized' });
      }
      const { parentId } = req.query.parentId;
      const { page } = req.query.page;
      if (parentId || page) {
        const pageSize = 20;
        const skip = parseInt(page, 10) * pageSize;
        const query = {
          userId: user._id,
          parentId: parentId || 0,
        };
        const files = await dbClient.getfileDocument(query, skip, pageSize);
        return res.status(200).send(files);
      }
      const files = await dbClient.getAllDocument();
      return res.status(200).send(files);
    } catch (error) {
      console.error(`the error is ${error}`);
      return res.status(500).send({ error });
    }
  }
}

export default FilesController;
