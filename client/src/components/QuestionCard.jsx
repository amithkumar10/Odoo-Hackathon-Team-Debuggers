import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ChevronUp, ChevronDown, MessageSquare, Eye, Check } from 'lucide-react';

const QuestionCard = ({ question }) => {
  const {
    _id,
    title,
    description,
    tags = [],
    author,
    voteScore = 0,
    answers = [],
    acceptedAnswer,
    views = 0,
    createdAt
  } = question;

  // Strip HTML tags from description for preview
  const getTextPreview = (html, maxLength = 150) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex gap-4">
        {/* Vote Score */}
        <div className="flex flex-col items-center space-y-1 min-w-[60px]">
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-gray-700">{voteScore}</span>
            <span className="text-xs text-gray-500">votes</span>
          </div>
          
          <div className="flex flex-col items-center">
            <span className={`text-lg font-semibold ${acceptedAnswer ? 'text-green-600' : 'text-gray-700'}`}>
              {answers.length}
            </span>
            <span className="text-xs text-gray-500">answers</span>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-gray-700">{views}</span>
            <span className="text-xs text-gray-500">views</span>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <Link 
              to={`/questions/${_id}`}
              className="text-lg font-semibold text-primary-600 hover:text-primary-700 transition-colors duration-200 line-clamp-2"
            >
              {title}
            </Link>
            {acceptedAnswer && (
              <Check className="h-5 w-5 text-green-500 ml-2 flex-shrink-0" />
            )}
          </div>

          <p className="text-gray-600 mb-3 line-clamp-2">
            {getTextPreview(description)}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map((tag) => (
              <Link
                key={tag}
                to={`/?tag=${encodeURIComponent(tag)}`}
                className="tag"
              >
                {tag}
              </Link>
            ))}
          </div>

          {/* Author and Time */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <span>asked by</span>
              <span className="font-medium text-gray-700">{author?.username || 'Unknown'}</span>
              <span className="text-gray-400">•</span>
              <span>{author?.reputation || 0} reputation</span>
            </div>
            <span>
              {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionCard;