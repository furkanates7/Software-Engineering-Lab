import React, { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import Background from '../../Background';

interface AdminLoginResponse {
  user: {
    token: string;
    authorities: string[];
    name: string;
  };
}

const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const role = localStorage.getItem('adminRole');
    if (token && role === 'ROLE_ADMIN') {
      navigate('/admin/main');
    }
  }, [navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post<AdminLoginResponse>(
        'http://localhost:8080/api/auth/admin-login',
        {
          username: formData.username,
          password: formData.password,
          authorities: ['ROLE_ADMIN'], // keep consistent with backend if needed
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const { token, authorities, name } = response.data.user;

      localStorage.setItem('token', token);
      localStorage.setItem('role', authorities[0]);
      localStorage.setItem('userName', name);

      if (authorities[0] === 'ROLE_ADMIN') {
        navigate('/admin/main');
      } else {
        setError('Unauthorized role for admin login.');
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      setError('Admin login failed. Please check your credentials.');
      console.error(axiosError);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
      <Background />
      <div className="relative z-10 bg-orange-50 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center">Admin Login</h1>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="Admin Username"
            required
            className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Password"
            required
            className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
          />
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded transition duration-200"
          >
            Log In
          </button>
        </form>
        <p className="mt-4 text-sm text-center">
          Are you a regular user?{' '}
          <Link to="/login" className="text-red-500 hover:underline ml-1">
            Go to User Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
