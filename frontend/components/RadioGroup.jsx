import React from 'react';
import { Field, ErrorMessage } from 'formik';

const RadioGroup = ({ name, options }) => {
  return (
    <div className="flex space-x-4 mb-5"> {/* Flex container with horizontal spacing */}
      {options.map((option) => (
        <label 
          key={option.value} 
          className={`flex flex-col border-2 rounded-lg p-4 cursor-pointer transition-colors duration-300 ${
            option.checked ? 'border-[#f6405f]' : 'border-gray-300'
          } hover:border-[#f6405f] relative`}
        >
          <Field 
            type="radio" 
            name={name} 
            value={option.value} 
            className="absolute opacity-0 cursor-pointer" 
          />
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{option.label}</h3>
              <p className="text-gray-600">{option.description}</p>
            </div>
            {/* Checkmark icon for selected state */}
            <div className={`w-6 h-6 ${option.checked ? 'text-[#f6405f]' : 'invisible'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </label>
      ))}
      <ErrorMessage name={name} component="div" className="text-red-600 text-sm mt-1" />
    </div>
  );
};

export default RadioGroup;
