import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import Notification from '../models/Notification.js';

export const createAnswer = async (req, res) => {
  try {
    const { content } = req.body;
    const questionId = req.params.questionId;

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = await Answer.create({
      content,
      author: req.user.id,
      question: questionId
    });

    // Add answer to question
    question.answers.push(answer._id);
    await question.save();

    // Create notification for question author
    if (question.author.toString() !== req.user.id) {
      await Notification.create({
        recipient: question.author,
        sender: req.user.id,
        type: 'answer',
        message: `${req.user.username} answered your question: ${question.title}`,
        relatedQuestion: questionId,
        relatedAnswer: answer._id
      });
    }

    const populatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'username reputation avatar');

    res.status(201).json({
      message: 'Answer created successfully',
      answer: populatedAnswer
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create answer', error: error.message });
  }
};

export const updateAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if user is the author or admin
    if (answer.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this answer' });
    }

    const { content } = req.body;
    answer.content = content || answer.content;

    await answer.save();

    const updatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'username reputation avatar');

    res.json({
      message: 'Answer updated successfully',
      answer: updatedAnswer
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update answer', error: error.message });
  }
};

export const deleteAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if user is the author or admin
    if (answer.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this answer' });
    }

    answer.isActive = false;
    await answer.save();

    // Remove from question's answers array
    await Question.findByIdAndUpdate(answer.question, {
      $pull: { answers: answer._id }
    });

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete answer', error: error.message });
  }
};

export const voteAnswer = async (req, res) => {
  try {
    const { type } = req.body; // 'upvote' or 'downvote'
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const userId = req.user.id;

    // Remove existing votes
    answer.votes.upvotes = answer.votes.upvotes.filter(id => id.toString() !== userId);
    answer.votes.downvotes = answer.votes.downvotes.filter(id => id.toString() !== userId);

    // Add new vote
    if (type === 'upvote') {
      answer.votes.upvotes.push(userId);
    } else if (type === 'downvote') {
      answer.votes.downvotes.push(userId);
    }

    // Update vote score
    answer.voteScore = answer.votes.upvotes.length - answer.votes.downvotes.length;

    await answer.save();

    res.json({
      message: 'Vote recorded successfully',
      voteScore: answer.voteScore,
      userVote: type
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record vote', error: error.message });
  }
};

export const acceptAnswer = async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const question = await Question.findById(answer.question);

    // Check if user is the question author
    if (question.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only question author can accept answers' });
    }

    // Remove previous accepted answer
    if (question.acceptedAnswer) {
      await Answer.findByIdAndUpdate(question.acceptedAnswer, { isAccepted: false });
    }

    // Set new accepted answer
    answer.isAccepted = true;
    question.acceptedAnswer = answer._id;

    await Promise.all([answer.save(), question.save()]);

    res.json({
      message: 'Answer accepted successfully',
      answerId: answer._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to accept answer', error: error.message });
  }
};