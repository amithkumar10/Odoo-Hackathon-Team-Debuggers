import { useState, useEffect } from 'react';
import Select from 'react-select';
import api from '../utils/api';

const TagInput = ({ availableTags,selectedTags, onChange, maxTags = 5 }) => {
const [loading, setLoading] = useState(false);
  

  const searchTags = async (inputValue) => {
    if (!inputValue) return availableTags;

    // Filter availableTags for matches
    const filtered = availableTags.filter(tag =>
      tag.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    if (filtered.length > 0) {
      return filtered;
    } else {
      // No match, allow user to create new tag
      return [{
        value: inputValue.toLowerCase(),
        label: `Create "${inputValue}"`,
        color: '#3B82F6',
        __isNew__: true
      }];
    }
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
      '&:hover': {
        borderColor: '#3B82F6'
      }
    }),
    multiValue: (provided, { data }) => ({
      ...provided,
      backgroundColor: data.color ? `${data.color}20` : '#EBF4FF',
      borderRadius: '6px'
    }),
    multiValueLabel: (provided, { data }) => ({
      ...provided,
      color: data.color || '#1E40AF',
      fontWeight: '500'
    }),
    multiValueRemove: (provided, { data }) => ({
      ...provided,
      color: data.color || '#1E40AF',
      '&:hover': {
        backgroundColor: data.color ? `${data.color}40` : '#DBEAFE',
        color: data.color || '#1E40AF'
      }
    }),
    option: (provided, { data, isSelected, isFocused }) => ({
      ...provided,
      backgroundColor: 
        isSelected ? data.color || '#3B82F6' :
        isFocused ? (data.color ? `${data.color}20` : '#EBF4FF') :
        'white',
      color: isSelected ? 'white' : (data.color || '#1F2937'),
      fontWeight: data.__isNew__ ? '600' : '400'
    })
  };

  const handleChange = (selectedOptions) => {
    if (selectedOptions && selectedOptions.length <= maxTags) {
      const tags = selectedOptions.map(option => ({
        value: option.value,
        label: option.__isNew__ ? option.value : option.label,
        color: option.color
      }));
      onChange(tags);
    }
  };

  const loadOptions = (inputValue, callback) => {
    searchTags(inputValue).then(callback);
  };

  return (
    <div>
      <Select
        isMulti
        value={selectedTags}
        onChange={handleChange}
        loadOptions={loadOptions}
        defaultOptions={availableTags}
        isAsync
        isLoading={loading}
        placeholder="Select or create tags..."
        noOptionsMessage={({ inputValue }) => 
          inputValue ? `No tags found for "${inputValue}"` : 'Type to search tags'
        }
        styles={customStyles}
        classNamePrefix="react-select"
        isSearchable
        isClearable={false}
        closeMenuOnSelect={false}
        blurInputOnSelect={false}
        isValidNewOption={(inputValue) => {
          return inputValue && 
                 inputValue.trim().length > 0 && 
                 inputValue.trim().length <= 20 &&
                 selectedTags.length < maxTags &&
                 !selectedTags.some(tag => tag.value.toLowerCase() === inputValue.toLowerCase());
        }}
        formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
      />
      <p className="text-sm text-gray-500 mt-1">
        {selectedTags.length}/{maxTags} tags selected. Add up to {maxTags} tags to describe your question.
      </p>
    </div>
  );
};

export default TagInput;