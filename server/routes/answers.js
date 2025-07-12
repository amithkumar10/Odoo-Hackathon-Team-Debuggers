import express from 'express';
import {
  createAnswer,
  updateAnswer,
  deleteAnswer,
  voteAnswer,
  acceptAnswer
} from '../controllers/answerController.js';
import { authenticate } from '../middlewares/auth.js';
import { validateAnswer, handleValidationErrors } from '../middlewares/validation.js';

const router = express.Router();

router.post('/questions/:questionId/answers', authenticate, validateAnswer, handleValidationErrors, createAnswer);
router.put('/:id', authenticate, updateAnswer);
router.delete('/:id', authenticate, deleteAnswer);
router.post('/:id/vote', authenticate, voteAnswer);
router.post('/:id/accept', authenticate, acceptAnswer);

export default router;