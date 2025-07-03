import React, { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import Background from '../../Background';

interface SignupResponse {
  message?: string;
}

type Role = 'customer' | 'restaurant' | 'courier' | 'admin';

type RoleFields = Record<Role, { name: string; placeholder: string; type: string }[]>;

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role: Role = location.pathname.includes('restaurant')
    ? 'restaurant'
    : location.pathname.includes('courier')
    ? 'courier'
    : location.pathname.includes('admin')
    ? 'admin'
    : 'customer';

  const roleToAuthority: Record<Role, string> = {
    customer: 'ROLE_CUSTOMER',
    restaurant: 'ROLE_RESTAURANT',
    courier: 'ROLE_COURIER',
    admin: 'ROLE_ADMIN',
  };

  const roleFields: RoleFields = {
    customer: [
      { name: 'username', placeholder: 'Username', type: 'text' },
      { name: 'name', placeholder: 'Your Full Name', type: 'text' },
      { name: 'email', placeholder: 'Email', type: 'email' },
      { name: 'password', placeholder: 'Password', type: 'password' },
      { name: 'againPassword', placeholder: 'Enter Password Again', type: 'password' },
      { name: 'customerPhoneNumber', placeholder: 'Phone Number', type: 'text' },
      { name: 'customerAddress', placeholder: 'Address', type: 'text' }
    ],
    restaurant: [
      { name: 'username', placeholder: 'Restaurant Username', type: 'text' },
      { name: 'name', placeholder: 'Restaurant Name', type: 'text' },
      { name: 'email', placeholder: 'Email', type: 'email' },
      { name: 'password', placeholder: 'Password', type: 'password' },
      { name: 'againPassword', placeholder: 'Enter Password Again', type: 'password' },
      { name: 'restaurantAddress', placeholder: 'Restaurant Address', type: 'text' },
      { name: 'restaurantPhoneNumber', placeholder: 'Restaurant Phone Number', type: 'text' },
      { name: 'restaurantDescription', placeholder: 'Restaurant Description', type: 'text' },
      { name: 'foodType', placeholder: 'Food Type', type: 'text' },
      { name: 'openingHours', placeholder: 'Opening Hours', type: 'text' },
      { name: 'closingHours', placeholder: 'Closing Hours', type: 'text' },
      { name: 'deliveryTime', placeholder: 'Delivery Time', type: 'text' },
      { name: 'deliveryFee', placeholder: 'Delivery Fee', type: 'text' },
      { name: 'minOrderAmount', placeholder: 'Min Order Amount', type: 'text' },
      { name: 'maxOrderAmount', placeholder: 'Max Order Amount', type: 'text' }
    ],
    
    courier: [
      { name: 'username', placeholder: 'Courier Username', type: 'text' },
      { name: 'name', placeholder: 'Name Surname', type: 'text' },
      { name: 'email', placeholder: 'Email', type: 'email' },
      { name: 'password', placeholder: 'Password', type: 'password' },
      { name: 'againPassword', placeholder: 'Enter Password Again', type: 'password' },
      { name: 'isAvailable', placeholder: 'Is Available', type: 'checkbox' },
      { name: 'courierPhoneNumber', placeholder: 'Courier Phone Number', type: 'text' },
      { name: 'isOnline', placeholder: 'Is Online', type: 'checkbox' },
    ],
    admin: [
      { name: 'username', placeholder: 'Admin Username', type: 'text' },
      { name: 'name', placeholder: 'Name Surname', type: 'text' },
      { name: 'email', placeholder: 'Email', type: 'email' },
      { name: 'password', placeholder: 'Password', type: 'password' },
      { name: 'againPassword', placeholder: 'Enter Password Again', type: 'password' },
    ],
  };

  const initialFormData = roleFields[role].reduce((acc, field) => {
    acc[field.name] = field.type === 'checkbox' ? false : '';
    return acc;
  }, {} as Record<string, string | boolean>);

  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState<string>('');
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsValidToken(false);
        return;
      }

      try {
        const res = await axios.get('/api/auth/validate-token', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        setIsValidToken(res.status === 200);
      } catch (error) {
        console.error('Token validation error:', error);
        setIsValidToken(false);
      }
    };

    validateToken();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, type, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.againPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (isValidToken === true) {
      navigate('/main');
      return;
    }

    try {
      const payload: Record<string, string | boolean | string[]> = {
        authorities: [roleToAuthority[role]],
      };

      roleFields[role].forEach(({ name }) => {
        if (name !== 'againPassword') {
          payload[name] = formData[name];
        }
      });

      console.log('Payload:', payload);

      const response = await axios.post<SignupResponse>(
        'http://localhost:8080/api/auth/register',
        payload
      );

      if (response.data.message === 'Success') {
        navigate('/login');
      } else {
        setError(response.data.message || 'Signup failed.');
      }
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error(axiosError);
      setError('Signup failed. Please check your information.');
    }
  };

  if (isValidToken === null) {
    return <div>Loading...</div>;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100">
      <Background />
      <div className="relative z-10 bg-orange-50 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold mb-4 text-center">
          {role.charAt(0).toUpperCase() + role.slice(1)} Sign Up
        </h1>
        <p className="text-center mb-6">
          {role === 'customer' ? 'Join us and enjoy the discounts!' : 'Create your account now!'}
        </p>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {roleFields[role].map((field) =>
            field.type === 'checkbox' ? (
              <label key={field.name} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={field.name}
                  checked={Boolean(formData[field.name])}
                  onChange={handleChange}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-700">{field.placeholder}</span>
              </label>
            ) : (
              <input
                key={field.name}
                type={field.type}
                name={field.name}
                value={formData[field.name] as string}
                onChange={handleChange}
                placeholder={field.placeholder}
                required
                className="p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-400"
              />
            )
          )}
          <button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded transition duration-200"
          >
            Sign Up
          </button>
        </form>

        <div className="mt-6 flex flex-col items-center gap-2">
          {role === 'customer' && (
  <>
    <p className="text-gray-500 text-sm">Are you a Restaurant, Courier or Admin?</p>
    <div className="flex gap-4">
      <Link to="/restaurant/signup" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm">Restaurant Sign Up</Link>
      <Link to="/courier/signup" className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full text-sm">Courier Sign Up</Link>
      <Link to="/admin/signup" className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-full text-sm">Admin Sign Up</Link>
    </div>
  </>
)}
{role === 'restaurant' && (
  <>
    <p className="text-gray-500 text-sm">Are you a Customer, Courier or Admin?</p>
    <div className="flex gap-4">
      <Link to="/signup" className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm">Customer Sign Up</Link>
      <Link to="/courier/signup" className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full text-sm">Courier Sign Up</Link>
      <Link to="/admin/signup" className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-full text-sm">Admin Sign Up</Link>
    </div>
  </>
)}
{role === 'courier' && (
  <>
    <p className="text-gray-500 text-sm">Are you a Customer, Restaurant or Admin?</p>
    <div className="flex gap-4">
      <Link to="/signup" className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm">Customer Sign Up</Link>
      <Link to="/restaurant/signup" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm">Restaurant Sign Up</Link>
      <Link to="/admin/signup" className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-full text-sm">Admin Sign Up</Link>
    </div>
  </>
)}
    {role === 'admin' && (
      <>
        <p className="text-gray-500 text-sm">Are you a Customer, Restaurant or Courier?</p>
        <div className="flex gap-4">
          <Link to="/signup" className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-full text-sm">Customer Sign Up</Link>
          <Link to="/restaurant/signup" className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full text-sm">Restaurant Sign Up</Link>
          <Link to="/courier/signup" className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-full text-sm">Courier Sign Up</Link>
        </div>
      </>
    )}

        </div>

        <p className="mt-4 text-sm text-center">
          Already have an account?
          <Link to="/login" className="text-red-500 hover:underline ml-1">Log In</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
