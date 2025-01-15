// components/InputField.js
import React from 'react';
import PropTypes from 'prop-types';

const InputField = ({ type = 'text', placeholder, value, onChange, className }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    //   className={`${styles.inputField} ${className}`}
      className={`h-[50px] py-2 px-2 border-[1px] border-gray-300 rounded-[10px] w-full text-base outline-none transition duration-300 ease-in-out focus:border-pink-600 ${className}`}  
      
      />
      // border-2 border-gray-300 rounded-[8px] py-2 px-4 focus:outline-none focus:border-pink-500 transition duration-300 ease-in-out ${className}
  );
};

// PropTypes for validation
InputField.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  className: PropTypes.string,
};

export default InputField;
