import User from '../models/User.js';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Tag from '../models/Tag.js';

export const seedData = async () => {
  try {
    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Question.deleteMany({}),
      Answer.deleteMany({}),
      Tag.deleteMany({})
    ]);

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@stackit.com',
      password: 'admin123',
      role: 'admin',
      reputation: 1000
    });

    // Create sample users
    const user1 = await User.create({
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
      reputation: 250
    });

    const user2 = await User.create({
      username: 'janedoe',
      email: 'jane@example.com',
      password: 'password123',
      reputation: 180
    });

    // Create tags
    const tags = await Tag.create([
      { name: 'javascript', description: 'Questions about JavaScript programming', color: '#F7DF1E' },
      { name: 'react', description: 'Questions about React.js library', color: '#61DAFB' },
      { name: 'node.js', description: 'Questions about Node.js runtime', color: '#339933' },
      { name: 'mongodb', description: 'Questions about MongoDB database', color: '#47A248' },
      { name: 'css', description: 'Questions about CSS styling', color: '#1572B6' },
      { name: 'html', description: 'Questions about HTML markup', color: '#E34F26' }
    ]);

    // Create sample questions
    const question1 = await Question.create({
      title: 'How to center a div in CSS?',
      description: 'I\'ve been trying to center a div element both horizontally and vertically. I\'ve tried various methods but none seem to work consistently across different browsers. What\'s the best modern approach?',
      tags: ['css', 'html'],
      author: user1._id,
      voteScore: 5
    });

    const question2 = await Question.create({
      title: 'React useState vs useReducer - When to use which?',
      description: 'I\'m working on a React application and I\'m confused about when to use useState vs useReducer. Can someone explain the differences and provide examples of when each would be appropriate?',
      tags: ['react', 'javascript'],
      author: user2._id,
      voteScore: 8
    });

    // Create sample answers
    const answer1 = await Answer.create({
      content: 'The modern way to center a div is using Flexbox:\n\n```css\n.container {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  height: 100vh;\n}\n```\n\nThis works consistently across all modern browsers.',
      author: user2._id,
      question: question1._id,
      voteScore: 3
    });

    const answer2 = await Answer.create({
      content: 'You can also use CSS Grid for centering:\n\n```css\n.container {\n  display: grid;\n  place-items: center;\n  height: 100vh;\n}\n```\n\nThis is even more concise than Flexbox.',
      author: admin._id,
      question: question1._id,
      voteScore: 7
    });

    // Update questions with answers
    question1.answers = [answer1._id, answer2._id];
    question1.acceptedAnswer = answer2._id;
    await question1.save();

    answer2.isAccepted = true;
    await answer2.save();

    console.log('Sample data seeded successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};