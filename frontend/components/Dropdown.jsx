// components/Dropdown.js
import React from 'react';
import PropTypes from 'prop-types';

const Dropdown = ({ options, value, onChange, className }) => {
  return (
    <div className={`flex items-center pl-3 border-l-2 border-gray-300 ml-3 ${className}`}>
      <select value={value} onChange={onChange} className="bg-transparent border-none text-gray-800 text-base outline-none cursor-pointer py-2">
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// PropTypes for validation
Dropdown.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default Dropdown;
