// src/pages/admin/AdminRestaurantManagementPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RestaurantCard from '../../components/admin/RestaurantCard';
import { Restaurant } from '../../types/Restaurant';

// Define initial state for new restaurant creation
const initialNewRestaurantState = {
  name: '', username: '', email: '', password: '', address: '', phoneNumber: '',
  description: '', foodType: '', openingHours: '', closingHours: '',
  deliveryTime: '', deliveryFee: '', minOrderAmount: '', maxOrderAmount: '',
  imageUrl: '', authorities: ['ROLE_RESTAURANT'],
};

// Configuration for new restaurant creation form fields
const NEW_RESTAURANT_FORM_FIELDS = [
  { name: 'username', label: 'Username*', type: 'text', required: true },
  { name: 'password', label: 'Password*', type: 'password', required: true },
  { name: 'name', label: 'Restaurant Name*', type: 'text', required: true },
  { name: 'email', label: 'Email*', type: 'email', required: true },
  { name: 'address', label: 'Address', type: 'text' },
  { name: 'phoneNumber', label: 'Phone Number', type: 'tel' },
  { name: 'description', label: 'Description', type: 'textarea' },
  { name: 'foodType', label: 'Food Type (e.g., Italian, Mexican)', type: 'text' },
  { name: 'openingHours', label: 'Opening Hours (e.g., 09:00)', type: 'text' },
  { name: 'closingHours', label: 'Closing Hours (e.g., 22:00)', type: 'text' },
  { name: 'deliveryTime', label: 'Avg. Delivery Time (e.g., 30-45 min)', type: 'text' },
  { name: 'deliveryFee', label: 'Delivery Fee (TL)', type: 'number', step: '0.01' },
  { name: 'minOrderAmount', label: 'Min. Order (TL)', type: 'text' }, // Kept as text to handle various formats
  { name: 'maxOrderAmount', label: 'Max. Order (TL)', type: 'text' }, // Kept as text
  { name: 'imageUrl', label: 'Image URL', type: 'url' },
];

// Configuration for fields shown in the details/edit modal
const RESTAURANT_MODAL_FIELDS_CONFIG = [
  { key: 'name', label: 'Restaurant Name', type: 'text', group: 'Basic Info', required: true },
  { key: 'email', label: 'Email', type: 'email', group: 'Contact', required: true },
  { key: 'phoneNumber', label: 'Phone Number', type: 'tel', group: 'Contact' },
  { key: 'address', label: 'Address', type: 'text', group: 'Location' },
  { key: 'description', label: 'Description', type: 'textarea', group: 'Details', rows: 3 },
  { key: 'foodType', label: 'Food Type', type: 'text', group: 'Details' },
  { key: 'openingHours', label: 'Opening Hours (e.g., 09:00)', type: 'text', group: 'Operations' },
  { key: 'closingHours', label: 'Closing Hours (e.g., 22:00)', type: 'text', group: 'Operations' },
  { key: 'deliveryTime', label: 'Avg. Delivery Time (e.g., 30-45 min)', type: 'text', group: 'Delivery' },
  { key: 'deliveryFee', label: 'Delivery Fee (TL)', type: 'number', step: '0.01', group: 'Delivery' },
  { key: 'minOrderAmount', label: 'Min. Order Amount (TL)', type: 'text', group: 'Delivery' },
  { key: 'maxOrderAmount', label: 'Max. Order Amount (TL)', type: 'text', group: 'Delivery' },
  { key: 'imageUrl', label: 'Image URL', type: 'url', group: 'Display' },
];


export default function AdminRestaurantManagementPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newRestaurantData, setNewRestaurantData] = useState<any>(initialNewRestaurantState);
  
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState(''); // For create form specific errors

  // Modal States
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedRestaurantForModal, setSelectedRestaurantForModal] = useState<Restaurant | null>(null);
  const [isEditingInModal, setIsEditingInModal] = useState(false);
  const [modalEditableData, setModalEditableData] = useState<Partial<Restaurant>>({});
  const [modalFormError, setModalFormError] = useState('');

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setFormError('Authentication token not found. Please log in.');
        toast.error('Authentication token not found.');
        setLoading(false);
        return;
      }
      const response = await axios.get('http://localhost:8080/api/admin/restaurant/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRestaurants(response.data.data || []);
      setFilteredRestaurants(response.data.data || []);
      setFormError('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load restaurants.';
      setFormError(errorMessage); // Use formError for general page errors if needed or a specific pageError state
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRestaurants();
  }, [fetchRestaurants]);

  useEffect(() => {
    const lowercasedQuery = searchQuery.toLowerCase();
    setFilteredRestaurants(
      restaurants.filter(
        (r) =>
          r.name.toLowerCase().includes(lowercasedQuery) ||
          (r.email && r.email.toLowerCase().includes(lowercasedQuery)) ||
          (r.foodType && r.foodType.toLowerCase().includes(lowercasedQuery))
      )
    );
  }, [searchQuery, restaurants]);

  const handleNewRestaurantInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setNewRestaurantData((prev: any) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value,
    }));
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found.');
      return;
    }

    const payload: any = { ...newRestaurantData };
    if (payload.deliveryFee && payload.deliveryFee !== '') {
        payload.deliveryFee = parseFloat(payload.deliveryFee);
    } else {
        delete payload.deliveryFee; // Remove if empty to avoid sending empty string for number field
    }
    // Add similar parsing for other numeric fields if needed, based on API requirements

    try {
      const response = await axios.post('http://localhost:8080/api/admin/create', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`${payload.name} created successfully!`);
      const createdRestaurant = response.data.data as Restaurant;
      setRestaurants((prev) => [createdRestaurant, ...prev]); // Add to start of list
      setNewRestaurantData(initialNewRestaurantState);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; errors?: { defaultMessage: string }[] }>;
      let errorMessage = 'Failed to create restaurant.';
      if (axiosError.response?.data?.message) errorMessage = axiosError.response.data.message;
      else if (axiosError.response?.data?.errors) errorMessage = axiosError.response.data.errors.map(e => e.defaultMessage).join(', ');
      setFormError(errorMessage);
      toast.error(errorMessage);
    }
  };
  
  // --- Modal Logic ---
  const openManageModal = (restaurant: Restaurant) => {
    setSelectedRestaurantForModal(restaurant);
    const initialData: Partial<Restaurant> = {};
      RESTAURANT_MODAL_FIELDS_CONFIG.forEach(field => {
        initialData[field.key as keyof Restaurant] = restaurant[field.key as keyof Restaurant] as any;
      });
    setModalEditableData(initialData);
    setIsEditingInModal(false);
    setIsManageModalOpen(true);
    setModalFormError('');
  };

  const closeManageModal = () => {
    setIsManageModalOpen(false);
    setSelectedRestaurantForModal(null);
    setIsEditingInModal(false);
    setModalEditableData({});
    setModalFormError('');
  };

  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setModalEditableData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : parseFloat(value)) : value,
    }));
  };

  const handleModalSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRestaurantForModal) return;
    setModalFormError('');

    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found.');
      return;
    }

    const payload = { ...modalEditableData };
     // API might not like getting PK or version in update payload, adjust as needed
    // delete payload.pk; 
    // delete payload.version;
    // delete payload.menus;

    try {
      const response = await axios.put(
        `http://localhost:8080/api/admin/restaurant/edit/${selectedRestaurantForModal.pk}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Restaurant updated successfully!');
      const updatedRestaurant = response.data.data as Restaurant;
      
      setRestaurants((prev) =>
        prev.map((r) => (r.pk === selectedRestaurantForModal.pk ? { ...r, ...updatedRestaurant } : r))
      );
      setSelectedRestaurantForModal(prev => prev ? { ...prev, ...updatedRestaurant } : null); // Update selected restaurant data
      setIsEditingInModal(false); // Switch back to view mode after save
      // Optionally close modal: closeManageModal();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; errors?: { defaultMessage: string }[] }>;
      let errorMessage = 'Failed to update restaurant.';
      if (axiosError.response?.data?.message) errorMessage = axiosError.response.data.message;
      else if (axiosError.response?.data?.errors) errorMessage = axiosError.response.data.errors.map(e => e.defaultMessage).join(', ');
      setModalFormError(errorMessage);
      toast.error(errorMessage);
    }
  };
  // --- End Modal Logic ---


  const handleDeleteRestaurant = async (restaurantId: number) => {
    // Find restaurant name for confirmation message
    const restaurantToDelete = restaurants.find(r => r.pk === restaurantId);
    const restaurantName = restaurantToDelete ? restaurantToDelete.name : "this restaurant";

    if (!window.confirm(`Are you sure you want to delete ${restaurantName}? This action cannot be undone.`)) {
        return;
    }
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Authentication token not found.');
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/admin/delete/user/${restaurantId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`${restaurantName} deleted successfully.`);
      setRestaurants((prev) => prev.filter((r) => r.pk !== restaurantId));
      if (selectedRestaurantForModal && selectedRestaurantForModal.pk === restaurantId) {
        closeManageModal(); // Close modal if the deleted restaurant was open
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data?.message || `Failed to delete ${restaurantName}.`);
    }
  };

  const suspendRestaurant = async (restaurantId: number) => {
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Token not found.'); throw new Error('Token not found'); }
    await axios.put(`http://localhost:8080/api/admin/ban/${restaurantId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const unsuspendRestaurant = async (restaurantId: number) => {
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Token not found.'); throw new Error('Token not found'); }
    await axios.put(`http://localhost:8080/api/admin/unban/${restaurantId}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  // Group modal fields for display
  const groupedModalFields: Record<string, typeof RESTAURANT_MODAL_FIELDS_CONFIG> = {};
  RESTAURANT_MODAL_FIELDS_CONFIG.forEach(field => {
    if (!groupedModalFields[field.group]) groupedModalFields[field.group] = [];
    groupedModalFields[field.group].push(field);
  });


  return (
    <div className="min-h-screen bg-orange-50 p-4 md:p-8">
      <ToastContainer position="bottom-right" autoClose={4000} theme="colored" newestOnTop />
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-orange-700 mb-8">Restaurant Management</h1>

        {/* Create New Restaurant Form */}
        <div className="mb-10 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-orange-800 mb-6">Add New Restaurant</h2>
          {formError && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4 text-sm">{formError}</p>}
          <form onSubmit={handleCreateRestaurant} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
              {NEW_RESTAURANT_FORM_FIELDS.map(({ name, label, type, required, step }) => (
                <div key={name} className={type === 'textarea' ? 'md:col-span-2 lg:col-span-3' : ''}>
                  <label htmlFor={`new-${name}`} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  {type === 'textarea' ? (
                     <textarea
                        id={`new-${name}`} name={name} required={required}
                        className="mt-1 p-2 w-full border border-orange-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                        value={newRestaurantData[name]} onChange={handleNewRestaurantInputChange} rows={3}
                    />
                  ) : (
                    <input
                        id={`new-${name}`} type={type} name={name} required={required} step={step}
                        className="mt-1 p-2 w-full border border-orange-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                        value={newRestaurantData[name]} onChange={handleNewRestaurantInputChange}
                    />
                  )}
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Create Restaurant
            </button>
          </form>
        </div>

        {/* Search and Restaurant List */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search restaurants by name, email, or food type..."
            className="w-full px-4 py-3 border border-orange-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-10"><p className="text-orange-600 text-xl">Loading restaurants...</p></div>
        ) : formError && restaurants.length === 0 ? ( // Changed condition to check if formError is set and no restaurants loaded
          <div className="text-center py-10 bg-red-100 text-red-700 p-4 rounded-lg">
            <p>{formError}</p>
            <button onClick={fetchRestaurants} className="mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
                Try Again
            </button>
          </div>
        ) : filteredRestaurants.length === 0 && searchQuery ? (
            <div className="text-center py-10 text-gray-500"><p>No restaurants found matching your search criteria.</p></div>
        ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-10 text-gray-500"><p>No restaurants available. Start by adding a new one!</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRestaurants.map(r => (
              <RestaurantCard
                key={r.pk}
                restaurant={r}
                onManage={openManageModal}
                onDelete={handleDeleteRestaurant}
                onSuspend={suspendRestaurant}
                onUnsuspend={unsuspendRestaurant}
              />
            ))}
          </div>
        )}
      </div>

      {/* Manage Restaurant Modal */}
      {isManageModalOpen && selectedRestaurantForModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out" onClick={closeManageModal}>
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-orange-800">
                {isEditingInModal ? `Edit: ${selectedRestaurantForModal.name}` : `Details: ${selectedRestaurantForModal.name}`}
              </h2>
              <button onClick={closeManageModal} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            
            {modalFormError && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4 text-sm">{modalFormError}</p>}

            {!isEditingInModal ? (
              // READ-ONLY DETAILS VIEW
              <div>
                {Object.entries(groupedModalFields).map(([groupName, fields]) => (
                  <div key={groupName} className="mb-5">
                    <h5 className="text-lg font-semibold text-orange-600 mb-2 border-b pb-1">{groupName}</h5>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      {fields.map(field => {
                         const value = selectedRestaurantForModal[field.key as keyof Restaurant] as string | number | undefined;
                         return (
                          <React.Fragment key={field.key}>
                            <dt className="font-medium text-gray-600">{field.label}:</dt>
                            <dd className="text-gray-800 break-words">
                              {field.key === 'imageUrl' ? (
                                  <a href={String(value) || '#'} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                      {value ? (String(value).length > 40 ? String(value).substring(0, 37) + '...' : value) : 'N/A'}
                                  </a>
                              ) : (value !== undefined && value !== null && String(value).trim() !== '') ? String(value) : <span className="italic text-gray-400">N/A</span>}
                            </dd>
                          </React.Fragment>
                         );
                      })}
                    </dl>
                  </div>
                ))}
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setIsEditingInModal(true)}
                    className="px-5 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                  >
                    Edit Information
                  </button>
                </div>
              </div>
            ) : (
              // EDITABLE FORM VIEW
              <form onSubmit={handleModalSaveChanges}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 max-h-[65vh] overflow-y-auto pr-2">
                  {RESTAURANT_MODAL_FIELDS_CONFIG.map(field => (
                    <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                      <label htmlFor={`modal-${field.key}`} className="block text-sm font-medium text-orange-700 mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      {field.type === 'textarea' ? (
                          <textarea
                          id={`modal-${field.key}`} name={field.key} rows={field.rows || 3} required={field.required}
                          className="mt-1 block w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                          value={(modalEditableData[field.key as keyof Restaurant] as string | number | undefined) ?? ''}
                          onChange={handleModalInputChange}
                        />
                      ) : (
                          <input
                          type={field.type} id={`modal-${field.key}`} name={field.key} step={field.step} required={field.required}
                          className="mt-1 block w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                          value={(modalEditableData[field.key as keyof Restaurant] as string | number | undefined) ?? ''}
                          onChange={handleModalInputChange}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsEditingInModal(false)} // Or closeManageModal() if cancel should close everything
                    className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel Edit
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}