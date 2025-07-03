import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { Customer } from '../../types/Customer'; // Adjust path as needed
import CustomerForm from '../../components/customers/CustomerForm'; // Adjust path as needed
import LocationMap from '../../components/LocationMap'; // Adjust path as needed

export default function CustomerAccountManagement() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<Customer | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const response = await axios.get<{ data: Customer }>('/api/customer/profile', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        setCustomer(response.data.data);
        // Initialize formData with all fields, including lat/lng
        setFormData({
          ...response.data.data,
          latitude: response.data.data.latitude,
          longitude: response.data.data.longitude,
        });
        setLoading(false);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch customer details';
        setError(errorMessage);
        toast.error(errorMessage);
        setLoading(false);
      }
    };
    fetchCustomer();
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleLocationChange = (lat: number, lng: number) => {
    setFormData((prev) => (prev ? { ...prev, latitude: lat, longitude: lng } : null));
  };

  const handleSaveProfile = async () => {
    if (!formData) return;

    // Ensure latitude and longitude are numbers or undefined
    const payload = {
      ...formData,
      latitude: formData.latitude ? parseFloat(String(formData.latitude)) : undefined,
      longitude: formData.longitude ? parseFloat(String(formData.longitude)) : undefined,
    };

    try {
      const response = await axios.put<{ data: Customer }>(
        '/api/customer/profile',
        payload,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setCustomer(response.data.data);
      setFormData(response.data.data); // Refresh formData with server response
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="container mx-auto p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? (
            <div className="bg-white shadow-md rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          ) : error ? (
            <p className="text-red-500 text-center py-10">{error}</p>
          ) : customer && formData ? (
            <motion.div
              className="bg-white shadow-lg rounded-lg p-4 md:p-6"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 md:mb-6">
                Customer Profile Management
              </h2>
              
              <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                {/* Left Column: Form */}
                <div className="md:w-1/2 lg:w-3/5 space-y-4 md:space-y-6">
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
                    <div className="flex-grow">
                      {isEditing ? (
                        <h3 className="text-lg font-medium text-gray-700">Editing: {customer.name}</h3>
                      ) : (
                        <h3 className="text-lg font-medium text-gray-700">{customer.name}</h3>
                      )}
                      <p className="text-xs text-gray-500">Manage your personal details and location.</p>
                    </div>
                  </div>

                  <CustomerForm
                    customer={formData}
                    setCustomer={setFormData}
                    isEditing={isEditing}
                    handleInputChange={handleInputChange}
                  />

                  <div className="mt-6 flex flex-wrap gap-2 md:gap-4">
                    {isEditing ? (
                      <>
                        <motion.button
                          onClick={handleSaveProfile}
                          className="px-4 py-2 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Save Changes
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            setIsEditing(false);
                            setFormData(customer); // Reset form to original customer data
                          }}
                          className="px-4 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Cancel
                        </motion.button>
                      </>
                    ) : (
                      <motion.button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-amber-700 text-white text-sm rounded hover:bg-amber-800"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Edit Profile
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login'; // Adjust to your login route
                      }}
                      className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Logout"
                    >
                      Logout
                    </motion.button>
                  </div>
                </div>

                {/* Right Column: Map */}
                <div className="md:w-1/2 lg:w-2/5 mt-6 md:mt-0">
                  <h3 className="text-md font-semibold text-gray-700 mb-2">Customer Location</h3>
                  <div className="h-[350px] md:h-full rounded-md overflow-hidden shadow-md border border-gray-200">
                    <LocationMap
                      address={formData.address}
                      initialLatitude={formData.latitude}
                      initialLongitude={formData.longitude}
                      onLocationChange={handleLocationChange}
                      isEditing={isEditing}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <p className="text-center text-gray-600 py-10">No customer data found.</p>
          )}
        </motion.div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme="light"
          toastClassName="bg-orange-600 text-white"
        />
      </div>
    </div>
  );
}