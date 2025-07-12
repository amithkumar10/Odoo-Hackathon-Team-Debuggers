import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Tag from '../models/Tag.js';
import Notification from '../models/Notification.js';

export const getQuestions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortBy || 'newest';
    const tag = req.query.tag;
    const search = req.query.search;

    let query = { isActive: true, status: 'approved' };

    // Add tag filter
    if (tag) {
      query.tags = { $in: [tag] };
    }

    // Add search filter
    if (search) {
      query.$text = { $search: search };
    }

    // Define sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'votes':
        sortOptions = { voteScore: -1 };
        break;
      case 'answers':
        sortOptions = { 'answers.length': -1 };
        break;
      default:
        sortOptions = { createdAt: -1 };
    }

    const questions = await Question.find(query)
      .populate('author', 'username reputation')
      .populate('acceptedAnswer')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Question.countDocuments(query);

    res.json({
      questions,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch questions', error: error.message });
  }
};

export const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username reputation avatar joinedAt')
      .populate({
        path: 'answers',
        populate: {
          path: 'author',
          select: 'username reputation avatar'
        }
      });

    if (!question || !question.isActive) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Increment view count (only if user is not the author)
    if (!req.user || req.user.id !== question.author._id.toString()) {
      question.views += 1;
      await question.save();
    }

    res.json({ question });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch question', error: error.message });
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    // Update or create tags
    for (const tagName of tags) {
      await Tag.findOneAndUpdate(
        { name: tagName.toLowerCase() },
        { 
          $inc: { questionCount: 1 },
          $setOnInsert: { name: tagName.toLowerCase() }
        },
        { upsert: true }
      );
    }

    const question = await Question.create({
      title,
      description,
      tags: tags.map(tag => tag.toLowerCase()),
      author: req.user.id
    });

    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'username reputation');

    res.status(201).json({
      message: 'Question created successfully',
      question: populatedQuestion
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create question', error: error.message });
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is the author or admin
    if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this question' });
    }

    const { title, description, tags } = req.body;

    question.title = title || question.title;
    question.description = description || question.description;
    
    if (tags) {
      question.tags = tags.map(tag => tag.toLowerCase());
    }

    await question.save();

    const updatedQuestion = await Question.findById(question._id)
      .populate('author', 'username reputation');

    res.json({
      message: 'Question updated successfully',
      question: updatedQuestion
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update question', error: error.message });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is the author or admin
    if (question.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this question' });
    }

    question.isActive = false;
    await question.save();

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete question', error: error.message });
  }
};

export const voteQuestion = async (req, res) => {
  try {
    const { type } = req.body; // 'upvote' or 'downvote'
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const userId = req.user.id;

    // Remove existing votes
    question.votes.upvotes = question.votes.upvotes.filter(id => id.toString() !== userId);
    question.votes.downvotes = question.votes.downvotes.filter(id => id.toString() !== userId);

    // Add new vote
    if (type === 'upvote') {
      question.votes.upvotes.push(userId);
    } else if (type === 'downvote') {
      question.votes.downvotes.push(userId);
    }

    // Update vote score
    question.voteScore = question.votes.upvotes.length - question.votes.downvotes.length;

    await question.save();

    res.json({
      message: 'Vote recorded successfully',
      voteScore: question.voteScore,
      userVote: type
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to record vote', error: error.message });
  }
};