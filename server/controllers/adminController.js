import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Notification from '../models/Notification.js';

export const getDashboardStats = async (req, res) => {
  try {
    const [userCount, questionCount, answerCount, pendingQuestions, pendingAnswers] = await Promise.all([
      User.countDocuments({ isActive: true }),
      Question.countDocuments({ isActive: true }),
      Answer.countDocuments({ isActive: true }),
      Question.countDocuments({ status: 'pending' }),
      Answer.countDocuments({ status: 'pending' })
    ]);

    res.json({
      stats: {
        users: userCount,
        questions: questionCount,
        answers: answerCount,
        pendingQuestions,
        pendingAnswers
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard stats', error: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments({});

    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

export const banUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Cannot ban admin users' });
    }

    user.isActive = false;
    await user.save();

    res.json({ message: 'User banned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to ban user', error: error.message });
  }
};

export const unbanUser = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = true;
    await user.save();

    res.json({ message: 'User unbanned successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to unban user', error: error.message });
  }
};

export const moderateContent = async (req, res) => {
  try {
    const { type, id, action } = req.body; // type: 'question' or 'answer', action: 'approve' or 'reject'

    let content;
    if (type === 'question') {
      content = await Question.findById(id);
    } else if (type === 'answer') {
      content = await Answer.findById(id);
    }

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    content.status = action === 'approve' ? 'approved' : 'rejected';
    await content.save();

    res.json({ message: `Content ${action}d successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to moderate content', error: error.message });
  }
};

export const getReports = async (req, res) => {
  try {
    const { type } = req.query; // 'users' or 'activity'

    if (type === 'users') {
      const users = await User.aggregate([
        {
          $lookup: {
            from: 'questions',
            localField: '_id',
            foreignField: 'author',
            as: 'questions'
          }
        },
        {
          $lookup: {
            from: 'answers',
            localField: '_id',
            foreignField: 'author',
            as: 'answers'
          }
        },
        {
          $project: {
            username: 1,
            email: 1,
            reputation: 1,
            isActive: 1,
            joinedAt: 1,
            questionCount: { $size: '$questions' },
            answerCount: { $size: '$answers' }
          }
        }
      ]);

      res.json({ users });
    } else if (type === 'activity') {
      const activity = await Promise.all([
        Question.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: -1 } },
          { $limit: 30 }
        ]),
        Answer.aggregate([
          {
            $group: {
              _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: -1 } },
          { $limit: 30 }
        ])
      ]);

      res.json({
        questions: activity[0],
        answers: activity[1]
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to generate report', error: error.message });
  }
};