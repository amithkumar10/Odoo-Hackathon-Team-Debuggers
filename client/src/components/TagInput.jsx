import { useState } from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';

const TagInput = ({ availableTags, selectedTags, onChange, maxTags = 5 }) => {
  const [loading, setLoading] = useState(false);

  // Filter tags as user types
  const filterTags = (inputValue) => {
    if (!inputValue) return availableTags;
    return availableTags.filter(tag =>
      tag.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  // Async load options for react-select
  const loadOptions = (inputValue, callback) => {
    setLoading(true);
    setTimeout(() => {
      callback(filterTags(inputValue));
      setLoading(false);
    }, 200); // Simulate async
  };

  // Handle selection and creation
  const handleChange = (selectedOptions) => {
    if (selectedOptions && selectedOptions.length <= maxTags) {
      onChange(selectedOptions.map(option => ({
        value: option.value,
        label: option.label,
        color: option.color
      })));
    }
  };

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#3B82F6' : '#D1D5DB',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.2)' : 'none',
      '&:hover': { borderColor: '#3B82F6' }
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

  return (
    <div>
      <AsyncCreatableSelect
        isMulti
        value={selectedTags}
        onChange={handleChange}
        loadOptions={loadOptions}
        defaultOptions={availableTags}
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
        formatCreateLabel={(inputValue) => `Create "${inputValue}"`}
        isValidNewOption={(inputValue, selectValue) =>
          inputValue &&
          inputValue.trim().length > 0 &&
          inputValue.trim().length <= 20 &&
          selectValue.length < maxTags &&
          !selectValue.some(tag => tag.value.toLowerCase() === inputValue.toLowerCase())
        }
      />
      <p className="text-sm text-gray-500 mt-1">
        {selectedTags.length}/{maxTags} tags selected. Add up to {maxTags} tags to describe your question.
      </p>
    </div>
  );
};

export default TagInput;
