import multer from 'multer';
import { ValidationError } from '../utils/errors.js';

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new ValidationError('Only image files are allowed'));
      return;
    }
    cb(null, true);
  },
});

export const uploadSingleImage = upload.single('image');
