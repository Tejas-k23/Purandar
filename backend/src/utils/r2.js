import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';
import { r2Client } from '../config/r2.js';

export const uploadToR2 = async ({ key, body, contentType }) => {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await r2Client.send(command);
};

export const deleteFromR2 = async (key) => {
  const command = new DeleteObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
  });

  await r2Client.send(command);
};

export const deleteManyFromR2 = async (keys = []) => {
  const filtered = keys.filter(Boolean);
  if (!filtered.length) return;
  await Promise.all(filtered.map((key) => deleteFromR2(key)));
};
