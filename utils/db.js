import { MongoClient, ObjectId } from 'mongodb';
/**
 * Class DBClient
 * @class DBClient
 * @description Class DBClient
 * @example
 * const dbClient = new DBClient();
 */
class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
    this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';

    this.client = new MongoClient(`mongodb://${this.host}:${this.port}`);

    this.client.connect();
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    return this.client.db(this.database).collection('users').countDocuments();
  }

  async nbFiles() {
    return this.client.db(this.database).collection('files').countDocuments();
  }

  async addUser(user) {
    return this.client.db(this.database).collection('users').insertOne(user);
  }

  async getUser(email) {
    return this.client.db(this.database).collection('users').findOne({ email });
  }

  async getUserById(userId) {
    return this.client.db(this.database).collection('users').findOne({ _id: ObjectId(userId) });
  }

  async getfilebyid(parentId) {
    return this.client.db(this.database).collection('files').findOne({ _id: ObjectId(parentId) });
  }

  async addFile(file) {
    return this.client.db(this.database).collection('files').insertOne(file);
  }

  async getFilebyParentId(parentId) {
    return this.client.db(this.database).collection('files').find({ parentId });
  }

  async getFilebyUserId(userId) {
    return this.client.db(this.database).collection('files').find({ userId: ObjectId(userId) });
  }

  async getfileDocument(query, skip, limit) {
    return this.client.db(this.database).collection('files')
      .find(query)
      .skip(skip)
      .limit(limit)
      .toArray();
  }

  async getAllDocument() {
    return this.client.db(this.database).collection('files').find().toArray();
  }
  
  async updateisPublic(id, isPublic) {
    return this.client.db(this.database).collection('files').updateOne({ _id: ObjectId(id) }, { $set: { isPublic } });
  }

  async getfilebyidandUserId(id, userId) {
    return this.client.db(this.database).collection('files').findOne({ _id: ObjectId(id), userId: ObjectId(userId) });
  }
}

const dbClient = new DBClient();

export default dbClient;
