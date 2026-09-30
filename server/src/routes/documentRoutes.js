import express from 'express';
import {
  getDocuments,
  getDocument,
  createDocument,
  downloadDocument,
  serveDocumentFile,
  deleteDocument
} from '../controllers/documentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../lib/storage.js';

const router = express.Router();

router.use(protect);

router.get('/', getDocuments);
router.get('/file/:filename', serveDocumentFile);
router.get('/:id', getDocument);
router.get('/:id/download', downloadDocument);
router.post('/', upload.single('file'), createDocument);
router.delete('/:id', deleteDocument);

export default router;
