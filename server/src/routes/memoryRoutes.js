import express from 'express';
import {
  getMemories,
  getMemory,
  createMemory,
  updateMemory,
  deleteMemory
} from '../controllers/memoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getMemories);
router.get('/:id', getMemory);
router.post('/', createMemory);
router.put('/:id', updateMemory);
router.delete('/:id', deleteMemory);

export default router;
