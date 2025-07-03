import React from 'react';
import { useNavigate } from 'react-router-dom';
import Background from './Background';

const LoginSelector: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-6">
      <Background />
      <div className="relative z-10 bg-white p-8 rounded-lg shadow-md w-full max-w-md flex flex-col items-center gap-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Select Your Login Type</h1>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded w-full"
        >
          Customer Login
        </button>
        <button
          onClick={() => navigate('/restaurant/login')}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded w-full"
        >
          Restaurant Login
        </button>
        <button
          onClick={() => navigate('/courier/login')}
          className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded w-full"
        >
          Courier Login
        </button>
      </div>
    </div>
  );
};

export default LoginSelector;
