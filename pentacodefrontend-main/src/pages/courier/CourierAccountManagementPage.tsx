import React, { useState, useEffect, ChangeEvent } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import { CourierDTO } from '../../types/Courier';



export default function CourierAccountManagementPage() {
  const [courier, setCourier] = useState<CourierDTO | null>(null);
  const [formData, setFormData] = useState<CourierDTO | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; phoneNumber?: string }>({});
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const fetchCourier = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/couriers/status`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        console.log("RESPONSE",response.data.data);
        response.data.data.isAvailable = response.data.data.available;
        response.data.data.isOnline = response.data.data.online;
        setCourier(response.data.data);
        setFormData(response.data.data);
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Failed to fetch courier details';
        setError(errorMessage);
        console.log("ERRROR",errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    console.log('Fetching courier details...');
    fetchCourier();

    // Load dark mode preference
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    if (darkMode) document.documentElement.classList.add('dark');
  }, []);

  const validateForm = () => {
    const errors: { name?: string; phoneNumber?: string } = {};
    // if (!formData?.name || formData.name.length < 2) {
    //   errors.name = 'Name must be at least 2 characters long';
    // }
    // if (!formData?.phoneNumber || !/^\+?\d{10,15}$/.test(formData.phoneNumber)) {
    //   errors.phoneNumber = 'Enter a valid phone number (10-15 digits)';
    // }
    // setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => prev ? { ...prev, [name]: value } : null);
    // setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleStatusToggle = async (field: 'available' | 'online', value: boolean) => {
    console.log('Toggling status:', field, value);
    if (!formData) return;
    const updatedData = { ...formData, [field]: value };
    try {
      const response = await axios.patch(
        `http://localhost:8080/api/couriers/status`,
        updatedData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      console.log("TOGGLED RESPONSE",response.data.data);
      response.data.data.isAvailable = response.data.data.available;
      response.data.data.isOnline = response.data.data.online;

      setCourier(response.data.data);
      setFormData(response.data.data);
      toast.success(`${field === 'available' ? 'Availability' : 'Online status'} updated`);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update status';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleSaveProfile = async () => {
    if (!validateForm()) return;
    if (!formData) return;
    try {
      const response = await axios.patch(
        `http://localhost:8080/api/couriers/status`,
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      response.data.data.isAvailable = response.data.data.available;
      response.data.data.isOnline = response.data.data.online;

      setCourier(response.data.data);
      setFormData(response.data.data);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleProfilePictureChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProfilePicture(file);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post(
        `http://localhost:8080/api/couriers/profile-picture`,
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      response.data.data.isAvailable = response.data.data.available;
      response.data.data.isOnline = response.data.data.online;

      setCourier(response.data.data);
      setFormData(response.data.data);
      toast.success('Profile picture updated');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to upload profile picture';
      toast.error(errorMessage);
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('darkMode', (!isDarkMode).toString());
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark:bg-gray-900' : 'bg-orange-50'}`}>
      {/* <CourierNavbar /> */}
      <div className="container mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >

          {loading ? (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : courier && formData ? (
            <motion.div
              className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className={`text-2xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'} mb-4`}>Courier Profile</h2>
              <div className="flex flex-col md:flex-row gap-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center">
                  <motion.img
                    src={courier.profilePictureUrl || 'https://via.placeholder.com/150?text=Profile'}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover mb-4"
                    whileHover={{ scale: 1.05 }}
                  />
                  <label className="cursor-pointer bg-amber-800 text-white px-4 py-2 rounded hover:bg-amber-900">
                    Upload Picture
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleProfilePictureChange}
                    />
                  </label>
                </div>

                {/* Profile Details */}
                <div className="flex-1 space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className={`mt-1 w-full border ${formErrors.name ? 'border-red-500' : 'border-amber-600'} rounded px-3 py-2 focus:ring-2 focus:ring-orange-700 dark:bg-gray-700 dark:text-white`}
                        />
                        {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
                      </div>
                    ) : (
                      <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{courier.name}</p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone Number</label>
                    {isEditing ? (
                      <div>
                        <input
                          type="text"
                          name="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={handleInputChange}
                          className={`mt-1 w-full border ${formErrors.phoneNumber ? 'border-red-500' : 'border-amber-600'} rounded px-3 py-2 focus:ring-2 focus:ring-orange-700 dark:bg-gray-700 dark:text-white`}
                        />
                        {formErrors.phoneNumber && <p className="text-red-500 text-sm mt-1">{formErrors.phoneNumber}</p>}
                      </div>
                    ) : (
                      <p className={`mt-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{courier.phoneNumber}</p>
                    )}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Availability</label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isAvailable}
                        onChange={(e) => handleStatusToggle('available', e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        aria-label="Toggle availability"
                      />
                      <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formData.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Online Status</label>
                    <div className="mt-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isOnline}
                        onChange={(e) => handleStatusToggle('online', e.target.checked)}
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                        aria-label="Toggle online status"
                      />
                      <span className={`ml-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                        {formData.isOnline ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 flex space-x-4">
                    {isEditing ? (
                      <>
                        <motion.button
                          onClick={handleSaveProfile}
                          className="px-4 py-2 bg-orange-700 text-white rounded hover:bg-orange-800 disabled:bg-gray-400"
                          disabled={Object.keys(formErrors).length > 0}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Save
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            setIsEditing(false);
                            setFormData(courier);
                            setFormErrors({});
                          }}
                          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Cancel
                        </motion.button>
                      </>
                    ) : (
                      <motion.button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Edit Profile
                      </motion.button>
                    )}
                    <motion.button
                      onClick={() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Logout"
                    >
                      Logout
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : null}
        </motion.div>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          theme={isDarkMode ? 'dark' : 'light'}
          toastClassName="bg-orange-700 text-white"
        />
      </div>
    </div>
  );
}