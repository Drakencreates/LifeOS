import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Uploads root directory
const UPLOADS_DIR = path.join(__dirname, '../../uploads/documents');

// Ensure directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Disk Storage configuration
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const userId = req.user ? req.user.id : 'anon';
    const timestamp = Date.now();
    const cleanName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    cb(null, `${userId}_${timestamp}_${cleanName}`);
  }
});

// File filter (accept all document/image/pdf formats)
const fileFilter = (req, file, cb) => {
  // Allow all typical document formats
  cb(null, true);
};

export const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB max file size
  },
  fileFilter
});

export { UPLOADS_DIR };
