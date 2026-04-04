import multer from 'multer';

export const createUpload = ({ maxFileSizeBytes, maxFiles }) => multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSizeBytes,
    files: maxFiles,
  },
});
