// components/Button.js
import React from 'react';
import PropTypes from 'prop-types';

const Button = ({ children, onClick, className, type = 'button' }) => {
  return (
    <button
    //   className={`${styles.btn} ${className}`}
      className={`bg-[#12101c] text-white py-2 px-4 rounded-[10px] transition duration-300 ease-in-out hover:bg-pink-700 ${className}`}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
};

// PropTypes for validation
Button.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  className: PropTypes.string,
  type: PropTypes.string,
};

export default Button;
