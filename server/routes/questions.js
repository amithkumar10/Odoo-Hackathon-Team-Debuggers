import express from 'express';
import {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  voteQuestion
} from '../controllers/questionController.js';
import { authenticate, optionalAuth } from '../middlewares/auth.js';
import { validateQuestion, handleValidationErrors } from '../middlewares/validation.js';

const router = express.Router();

router.get('/', optionalAuth, getQuestions);
router.get('/:id', optionalAuth, getQuestion);
router.post('/', authenticate, validateQuestion, handleValidationErrors, createQuestion);
router.put('/:id', authenticate, updateQuestion);
router.delete('/:id', authenticate, deleteQuestion);
router.post('/:id/vote', authenticate, voteQuestion);

export default router;