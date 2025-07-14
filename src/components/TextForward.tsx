import React from "react";

interface TextForwardProps {
  options: string[];
  selectedValues: string[];
  onChange: (updated: string[]) => void;
}

const TextForward: React.FC<TextForwardProps> = ({
  options,
  selectedValues,
  onChange,
}) => {
  const handleCheckboxChange = (option: string) => {
    const isChecked = selectedValues.includes(option);
    const updated = isChecked
      ? selectedValues.filter((value) => value !== option)
      : [...selectedValues, option];

    onChange(updated);
  };

  return (
    <div className="flex gap-10">
      {options.map((option) => (
        <div className="border border-black rounded px-8 py-2 text-base font-bold w-[14rem] flex items-center justify-center">
          <label
            key={option}
            className="flex items-center cursor-pointer"
            onClick={() => handleCheckboxChange(option)}
          >
            <div
              className={`w-5 h-5 border rounded flex items-center justify-center cursor-pointer ${
                selectedValues.includes(option)
                  ? "bg-[#00BA13] border-[#006F0B]"
                  : "border-black"
              }`}
            >
              {selectedValues.includes(option) && (
                <svg
                  className="w-5 h-5 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <span className="ml-3">{option}</span>
          </label>
        </div>
      ))}
    </div>
  );
};

export default TextForward;
