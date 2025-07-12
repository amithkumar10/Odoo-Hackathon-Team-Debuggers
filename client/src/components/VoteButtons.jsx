import { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const VoteButtons = ({ type, id, initialScore = 0, initialUserVote = null, onVoteChange }) => {
  const { user } = useAuth();
  const [voteScore, setVoteScore] = useState(initialScore);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [loading, setLoading] = useState(false);

  const handleVote = async (voteType) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }

    if (loading) return;

    setLoading(true);

    try {
      let endpoint;
      if (type === 'question') {
        endpoint = `/questions/${id}/vote`;
      } else if (type === 'answer') {
        endpoint = `/answers/${id}/vote`;
      }

      // If clicking the same vote type, remove the vote
      const newVoteType = userVote === voteType ? null : voteType;

      const response = await api.post(endpoint, { 
        type: newVoteType 
      });

      setVoteScore(response.data.voteScore);
      setUserVote(newVoteType);

      if (onVoteChange) {
        onVoteChange(response.data.voteScore, newVoteType);
      }

      if (newVoteType) {
        toast.success(`${voteType === 'upvote' ? 'Upvoted' : 'Downvoted'} successfully`);
      } else {
        toast.success('Vote removed');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to vote';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <button
        onClick={() => handleVote('upvote')}
        disabled={loading}
        className={`vote-btn ${
          userVote === 'upvote' ? 'vote-btn-active' : 'vote-btn-inactive'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <ChevronUp className="h-6 w-6" />
      </button>

      <span className={`text-lg font-bold ${
        voteScore > 0 ? 'text-green-600' : 
        voteScore < 0 ? 'text-red-600' : 
        'text-gray-600'
      }`}>
        {voteScore}
      </span>

      <button
        onClick={() => handleVote('downvote')}
        disabled={loading}
        className={`vote-btn ${
          userVote === 'downvote' ? 'vote-btn-active' : 'vote-btn-inactive'
        } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <ChevronDown className="h-6 w-6" />
      </button>
    </div>
  );
};

export default VoteButtons;