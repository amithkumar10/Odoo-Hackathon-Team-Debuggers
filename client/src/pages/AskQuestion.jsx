import { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Save } from 'lucide-react';
import RichTextEditor from '../components/RichTextEditor';
import TagInput from '../components/TagInput';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AskQuestion = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: []
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [availableTags, setAvailableTags] = useState([]);
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  useEffect(() => {
    fetchTags();
  }, []);

  console.log(availableTags)

  const fetchTags = async () => {
    try {
      const response = await api.get('/tags');
      const tagOptions = response.data.tags.map(tag => ({
        value: tag.name,
        label: tag.name,
        color: tag.color || '#3B82F6'
      }));
      setAvailableTags(tagOptions);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }

    if (!formData.description.trim() || formData.description.trim() === '<p><br></p>') {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.tags || formData.tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    } else if (formData.tags.length > 5) {
      newErrors.tags = 'Maximum 5 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description,
        tags: formData.tags.map(tag => tag.value)
      };

      const response = await api.post('/questions', payload);

      toast.success('Question posted successfully!');
      navigate(`/questions/${response.data.question._id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to post question';
      toast.error(message);

      // Handle validation errors from server
      if (error.response?.data?.errors) {
        const serverErrors = {};
        error.response.data.errors.forEach(err => {
          serverErrors[err.path] = err.msg;
        });
        setErrors(serverErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <HelpCircle className="h-8 w-8 text-primary-600" />
          <h1 className="text-3xl font-bold text-gray-900">Ask a Question</h1>
        </div>
        <p className="text-gray-600">
          Get help from the community by asking a detailed question. Be specific and provide context to get better answers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Question Title</h2>
          <p className="text-sm text-gray-600 mb-3">
            Be specific and imagine you're asking a question to another person.
          </p>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className={`input-field ${errors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
            placeholder="e.g., How to center a div in CSS?"
            maxLength={200}
          />
          <div className="flex justify-between items-center mt-2">
            {errors.title && (
              <p className="text-red-600 text-sm">{errors.title}</p>
            )}
            <span className="text-sm text-gray-500 ml-auto">
              {formData.title.length}/200
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Question Details</h2>
          <p className="text-sm text-gray-600 mb-3">
            Provide as much detail as possible. Include what you've tried, what you expected to happen, and what actually happened.
          </p>
          <RichTextEditor
            value={formData.description}
            onChange={(value) => handleChange('description', value)}
            placeholder="Describe your problem in detail. Include code examples, error messages, and what you've already tried..."
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-2">{errors.description}</p>
          )}
        </div>

        {/* Tags */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tags</h2>
          <p className="text-sm text-gray-600 mb-3">
            Add up to 5 tags to describe what your question is about.
          </p>
          <TagInput
            availableTags={availableTags}
            selectedTags={formData.tags}
            onChange={(tags) => handleChange('tags', tags)}
            maxTags={5}
          />
          {errors.tags && (
            <p className="text-red-600 text-sm mt-2">{errors.tags}</p>
          )}
        </div>

        {/* Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2">💡 Tips for a great question:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Make sure your question hasn't been asked before</li>
            <li>• Use proper spelling and grammar</li>
            <li>• Include relevant code, error messages, or screenshots</li>
            <li>• Explain what you've already tried</li>
            <li>• Be specific about your environment (OS, browser, versions)</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Post Question</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AskQuestion;