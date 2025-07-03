import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import React from 'react';

export function NavbarForAdmin() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (e) {
      console.error(e);
    } finally {
      localStorage.clear();
      navigate('/admin-login');
    }
  };

  return (
    <div className="flex items-center p-4 bg-amber-50 shadow">
      {/* Left Links */}
      <div className="flex items-center gap-6 flex-1">
        <Link to="/admin/main" className="text-xl font-bold text-orange-700">
          Dashboard
        </Link>
        <Link to="/admin/courier-management" className="text-xl font-bold text-orange-700">
          Courier
        </Link>
        <Link to="/admin/customer-management" className="text-xl font-bold text-orange-700">
          Customer
        </Link>
      </div>

      {/* Centered Logo and Title */}
      <div className="flex items-center gap-2">
        <img src="/hurricane_image.png" alt="Logo" className="w-12 h-12" />
        <h1 className="text-3xl font-bold text-orange-600">HURRICANE ADMIN</h1>
      </div>

      {/* Right Links and Logout */}
      <div className="flex items-center gap-6 flex-1 justify-end">
        <Link to="/admin/delivery-management" className="text-xl font-bold text-orange-700">
          Delivery
        </Link>
        <Link to="/admin/restaurant-management" className="text-xl font-bold text-orange-700">
          Restaurant
        </Link>
        <Link to="/admin/review-management" className="text-xl font-bold text-orange-700">
          Review
        </Link>
        <button
          onClick={handleLogout}
          className="bg-orange-700 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
