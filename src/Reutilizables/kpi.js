import React from 'react';

const Kpi = ({ title, value, description, color, isDarkMode }) => {
  return (
    <div
      className={`p-6 rounded-lg text-center shadow-lg hover:shadow-2xl transition-colors duration-500  transform hover:-translate-y-1 ${
        isDarkMode ? 'bg-bgper text-white' : 'bg-white text-black border-sky-500'
      } border-l-4 ${color}`}
    >
      <h3
        className={`text-2xl font-bold transition-colors duration-500 ${
          isDarkMode ? 'text-white' : 'text-blue-600'
        }`}
      >
        {title}
      </h3>
      <p
        className={`text-3xl mt-2 font-semibold transition-colors duration-500 ${
          isDarkMode ? 'text-[#ff4d4d]' : 'text-green-600'
        }`}
      >
        {value}
      </p>
      <p
        className={`text-sm mt-4 transition-colors duration-500 ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}
      >
        {description}
      </p>
    </div>
  );
};

export default Kpi;
