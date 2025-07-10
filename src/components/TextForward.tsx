import React from 'react';

interface TextForwardProps {
  options: string[];
  selectedValues: string[];
  onChange: (updated: string[]) => void;
}

const TextForward: React.FC<TextForwardProps> = ({ options, selectedValues, onChange }) => {
  const handleCheckboxChange = (option: string) => {
    const isChecked = selectedValues.includes(option);
    const updated = isChecked
      ? selectedValues.filter(value => value !== option)
      : [...selectedValues, option];

    onChange(updated);
  };

  return (
    <div>
      {options.map(option => (
        <label key={option} className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedValues.includes(option)}
            onChange={() => handleCheckboxChange(option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
  );
};

export default TextForward;
