import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Edit, Trash2, Check, Clock, Eye, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import VoteButtons from '../components/VoteButtons';
import RichTextEditor from '../components/RichTextEditor';
import api from '../utils/api';
import toast from 'react-hot-toast';

const QuestionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answerContent, setAnswerContent] = useState('');
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState(null);

  useEffect(() => {
    fetchQuestion();
  }, [id]);

  const fetchQuestion = async () => {
    try {
      const response = await api.get(`/questions/${id}`);
      setQuestion(response.data.question);
    } catch (error) {
      console.error('Failed to fetch question:', error);
      if (error.response?.status === 404) {
        toast.error('Question not found');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to post an answer');
      return;
    }

    if (!answerContent.trim() || answerContent.trim() === '<p><br></p>') {
      toast.error('Answer content is required');
      return;
    }

    setSubmittingAnswer(true);

    try {
      await api.post(`/answers/questions/${id}/answers`, {
        content: answerContent
      });

      toast.success('Answer posted successfully!');
      setAnswerContent('');
      fetchQuestion(); // Refresh to show new answer
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to post answer';
      toast.error(message);
    } finally {
      setSubmittingAnswer(false);
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    try {
      await api.post(`/answers/${answerId}/accept`);
      toast.success('Answer accepted!');
      fetchQuestion(); // Refresh to show accepted status
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to accept answer';
      toast.error(message);
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!window.confirm('Are you sure you want to delete this answer?')) {
      return;
    }

    try {
      await api.delete(`/answers/${answerId}`);
      toast.success('Answer deleted successfully');
      fetchQuestion(); // Refresh to remove deleted answer
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to delete answer';
      toast.error(message);
    }
  };

  const handleEditAnswer = async (answerId, newContent) => {
    try {
      await api.put(`/answers/${answerId}`, { content: newContent });
      toast.success('Answer updated successfully');
      setEditingAnswer(null);
      fetchQuestion(); // Refresh to show updated answer
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update answer';
      toast.error(message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Question not found</h2>
        <Link to="/" className="btn-primary">
          Back to Questions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Question */}
      <div className="card">
        <div className="flex gap-6">
          <VoteButtons
            type="question"
            id={question._id}
            initialScore={question.voteScore}
            onVoteChange={(newScore) => {
              setQuestion(prev => ({ ...prev, voteScore: newScore }));
            }}
          />

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {question.title}
            </h1>

            <div className="prose max-w-none mb-6" 
                 dangerouslySetInnerHTML={{ __html: question.description }} />

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {question.tags.map((tag) => (
                <Link
                  key={tag}
                  to={`/?tag=${encodeURIComponent(tag)}`}
                  className="tag"
                >
                  {tag}
                </Link>
              ))}
            </div>

            {/* Question Meta */}
            <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4" />
                  <span>{question.views} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>asked {formatDistanceToNow(new Date(question.createdAt), { addSuffix: true })}</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="font-medium text-gray-700">{question.author.username}</div>
                  <div className="text-xs">{question.author.reputation} reputation</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Answers */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}
        </h2>

        <div className="space-y-6">
          {question.answers
            .sort((a, b) => {
              // Sort accepted answer first, then by vote score
              if (a.isAccepted && !b.isAccepted) return -1;
              if (!a.isAccepted && b.isAccepted) return 1;
              return b.voteScore - a.voteScore;
            })
            .map((answer) => (
              <div key={answer._id} className={`card ${answer.isAccepted ? 'ring-2 ring-green-200 bg-green-50' : ''}`}>
                <div className="flex gap-6">
                  <div className="flex flex-col items-center space-y-2">
                    <VoteButtons
                      type="answer"
                      id={answer._id}
                      initialScore={answer.voteScore}
                    />
                    
                    {answer.isAccepted && (
                      <Check className="h-8 w-8 text-green-600" />
                    )}

                    {user && user.id === question.author._id && !answer.isAccepted && (
                      <button
                        onClick={() => handleAcceptAnswer(answer._id)}
                        className="p-2 rounded-lg border-2 border-gray-300 hover:border-green-500 hover:bg-green-50 transition-colors duration-200"
                        title="Accept this answer"
                      >
                        <Check className="h-6 w-6 text-gray-400 hover:text-green-600" />
                      </button>
                    )}
                  </div>

                  <div className="flex-1">
                    {editingAnswer === answer._id ? (
                      <AnswerEditForm
                        initialContent={answer.content}
                        onSave={(content) => handleEditAnswer(answer._id, content)}
                        onCancel={() => setEditingAnswer(null)}
                      />
                    ) : (
                      <>
                        <div className="prose max-w-none mb-6" 
                             dangerouslySetInnerHTML={{ __html: answer.content }} />

                        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>answered {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}</span>
                          </div>

                          <div className="flex items-center space-x-3">
                            {user && (user.id === answer.author._id || user.role === 'admin') && (
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => setEditingAnswer(answer._id)}
                                  className="text-gray-400 hover:text-primary-600 transition-colors duration-200"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteAnswer(answer._id)}
                                  className="text-gray-400 hover:text-red-600 transition-colors duration-200"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            )}

                            <div className="text-right">
                              <div className="font-medium text-gray-700">{answer.author.username}</div>
                              <div className="text-xs">{answer.author.reputation} reputation</div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Answer Form */}
      {user ? (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Answer</h3>
          <form onSubmit={handleAnswerSubmit} className="space-y-4">
            <RichTextEditor
              value={answerContent}
              onChange={setAnswerContent}
              placeholder="Write your answer here. Provide detailed explanations and code examples if applicable."
            />
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submittingAnswer}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {submittingAnswer ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    <span>Post Answer</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="card text-center">
          <p className="text-gray-600 mb-4">
            You need to be logged in to post an answer.
          </p>
          <Link to="/login" className="btn-primary">
            Sign in to answer
          </Link>
        </div>
      )}
    </div>
  );
};

// Answer Edit Form Component
const AnswerEditForm = ({ initialContent, onSave, onCancel }) => {
  const [content, setContent] = useState(initialContent);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!content.trim() || content.trim() === '<p><br></p>') {
      toast.error('Answer content is required');
      return;
    }

    setLoading(true);
    await onSave(content);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RichTextEditor
        value={content}
        onChange={setContent}
        placeholder="Edit your answer..."
      />
      
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
    </form>
  );
};

export default QuestionDetail;