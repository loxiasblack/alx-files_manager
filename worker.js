const Bull = require('bull');
const imageThumbnail = require('image-thumbnail');
const fs = require('fs');
const path = require('path');
const dbClient = require('./utils/db');

// Create a Bull queue
const fileQueue = new Bull('fileQueue', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379
  }
});

fileQueue.process(async (job) => {
  const { fileId, userId } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  const file = await dbClient.filesCollection.findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });
  if (!file) throw new Error('File not found');

  if (file.type !== 'image') throw new Error('File is not an image');

  const sizes = [500, 250, 100];
  for (const size of sizes) {
    const thumbnailPath = path.join(path.dirname(file.localPath), `${path.basename(file.localPath, path.extname(file.localPath))}_${size}${path.extname(file.localPath)}`);
    const thumbnail = await imageThumbnail(file.localPath, { width: size });
    fs.writeFileSync(thumbnailPath, thumbnail);
  }
});
