import React, { useEffect, useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CourierCard from '../../components/admin/CourierCard';
import { CourierDTO } from '../../types/Courier';
import { OrderDTO, OrderStatusEnum } from '../../types/Order'; // Adjust path if needed

const initialNewCourierState = {
  username: '',
  name: '',
  email: '',
  password: '',
  authorities: ['ROLE_COURIER'],
  phoneNumber: '', // Directly use 'phoneNumber' to match CourierDTO
  profilePictureUrl: '',
  isOnline: false, // Default for new courier
  isAvailable: false, // Default for new courier
};

// Fields for the "Add New Courier" form
const NEW_COURIER_FORM_FIELDS = [
  { name: 'username', label: 'Username*', type: 'text', required: true },
  { name: 'name', label: 'Full Name*', type: 'text', required: true },
  { name: 'email', label: 'Email*', type: 'email', required: true },
  { name: 'password', label: 'Password*', type: 'password', required: true },
  { name: 'phoneNumber', label: 'Phone Number', type: 'tel' },
  { name: 'profilePictureUrl', label: 'Profile Picture URL', type: 'url' },
  // isOnline and isAvailable can be set via checkboxes in create form if needed
  // For simplicity, they are defaulted and can be edited later.
];

// Fields for the modal (view/edit)
const COURIER_MODAL_FIELDS_CONFIG = [
  { key: 'name', label: 'Full Name', type: 'text', group: 'Personal Info', required: true },
  { key: 'email', label: 'Email', type: 'email', group: 'Personal Info', required: true },
  { key: 'username', label: 'Username', type: 'text', group: 'Account Info (Read-only)', readonly: true },
  { key: 'phoneNumber', label: 'Phone Number', type: 'tel', group: 'Contact Info' },
  { key: 'profilePictureUrl', label: 'Profile Picture URL', type: 'url', group: 'Display' },
  { key: 'isOnline', label: 'Online Status', type: 'checkbox', group: 'Status' },
  { key: 'isAvailable', label: 'Availability Status', type: 'checkbox', group: 'Status' },
];


export default function AdminCourierManagementPage() {
  const [couriers, setCouriers] = useState<CourierDTO[]>([]);
  const [filteredCouriers, setFilteredCouriers] = useState<CourierDTO[]>([]);
  const [newCourierData, setNewCourierData] = useState<any>(initialNewCourierState);
  
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState(''); // For general page errors

  // Modal States
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedCourierForModal, setSelectedCourierForModal] = useState<CourierDTO | null>(null);
  const [isEditingInModal, setIsEditingInModal] = useState(false);
  const [modalEditableData, setModalEditableData] = useState<Partial<CourierDTO>>({});
  const [modalFormError, setModalFormError] = useState('');

  // Order States for Modal
  const [courierOrders, setCourierOrders] = useState<OrderDTO[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  const fetchCouriers = useCallback(async () => {
    setLoading(true);
    setPageError('');
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setPageError('Authentication token not found.');
        toast.error('Authentication token not found.');
        setLoading(false);
        return;
      }
      const response = await axios.get('http://localhost:8080/api/admin/courier/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCouriers(response.data.data || []);
      setFilteredCouriers(response.data.data || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load couriers.';
      setPageError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCouriers();
  }, [fetchCouriers]);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase().trim();
    setFilteredCouriers(
      !lowerQuery
        ? couriers
        : couriers.filter(
            (courier) =>
              (courier.name && courier.name.toLowerCase().includes(lowerQuery)) ||
              (courier.email && courier.email.toLowerCase().includes(lowerQuery)) ||
              (courier.phoneNumber && courier.phoneNumber.includes(lowerQuery))
          )
    );
  }, [searchQuery, couriers]);



  const handleNewCourierInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setNewCourierData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleCreateCourier = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalFormError(''); // Use modalFormError for create form too, or a separate createFormError
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Authentication token not found.'); return; }

    // Ensure boolean values for isOnline, isAvailable are correctly set if not using checkboxes in create form
    const payload = {
      ...newCourierData,
      isOnline: newCourierData.isOnline || false, // Default if not set
      isAvailable: newCourierData.isAvailable || false, // Default if not set
    };

    try {
      const { data } = await axios.post('http://localhost:8080/api/admin/create', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Courier created successfully!');
      const createdCourier = data.data as CourierDTO;
      setCouriers((prev) => [createdCourier, ...prev]);
      setNewCourierData(initialNewCourierState);
      setModalFormError('');
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; errors?: { defaultMessage: string }[] }>;
      let errorMessage = 'Failed to create courier.';
      if (axiosError.response?.data?.message) errorMessage = axiosError.response.data.message;
      else if (axiosError.response?.data?.errors) errorMessage = axiosError.response.data.errors.map(e => e.defaultMessage).join(', ');
      setModalFormError(errorMessage); // Display error in form area
      toast.error(errorMessage);
    }
  };

  const fetchCourierOrders = async (courierPk: number) => {
    setOrdersLoading(true);
    setOrdersError('');
    setCourierOrders([]);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found for fetching orders.');
      // ADJUST API ENDPOINT IF NECESSARY
      const response = await axios.get(`http://localhost:8080/api/admin/courier/${courierPk}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourierOrders(response.data.data || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load courier orders.';
      setOrdersError(errorMessage);
      console.error("Error fetching courier orders:", errorMessage);
    } finally {
      setOrdersLoading(false);
    }
  };

  const openManageModal = (courier: CourierDTO) => {
    setSelectedCourierForModal(courier);
    const initialData: Partial<CourierDTO> = {};
    COURIER_MODAL_FIELDS_CONFIG.forEach(field => {
        initialData[field.key as keyof CourierDTO] = courier[field.key as keyof CourierDTO] as any;
    });
    setModalEditableData(initialData);
    setIsEditingInModal(false);
    setIsManageModalOpen(true);
    setModalFormError('');
    if (courier.pk) {
        fetchCourierOrders(courier.pk);
    }
  };

  const closeManageModal = () => {
    setIsManageModalOpen(false);
    setSelectedCourierForModal(null);
    setIsEditingInModal(false);
    setModalEditableData({});
    setCourierOrders([]);
    setOrdersError('');
    setModalFormError('');
  };

  const handleModalInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setModalEditableData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleModalSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourierForModal) return;
    setModalFormError('');
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Authentication token not found.'); return; }

    const payload = { ...modalEditableData };
    // Remove fields that shouldn't be sent or are readonly, if API is strict
    // delete payload.username; // If username is not editable

    try {
      // Your old code used: `/api/admin/courier/edit/${editCourier.pk}`
      const { data } = await axios.put(
        `http://localhost:8080/api/admin/courier/edit/${selectedCourierForModal.pk}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Courier updated successfully!');
      const updatedCourier = data.data as CourierDTO;
      setCouriers((prev) =>
        prev.map((c) => (c.pk === selectedCourierForModal.pk ? { ...c, ...updatedCourier } : c))
      );
      setSelectedCourierForModal(prev => prev ? { ...prev, ...updatedCourier } : null);
      setIsEditingInModal(false);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; errors?: { defaultMessage: string }[] }>;
      let errorMessage = 'Failed to update courier.';
      if (axiosError.response?.data?.message) errorMessage = axiosError.response.data.message;
      else if (axiosError.response?.data?.errors) errorMessage = axiosError.response.data.errors.map(e => e.defaultMessage).join(', ');
      setModalFormError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleBanCourier = async (pk: number) => {
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Token not found.'); throw new Error('Token not found'); }
    await axios.put(`http://localhost:8080/api/admin/ban/${pk}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handleUnbanCourier = async (pk: number) => {
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Token not found.'); throw new Error('Token not found'); }
    await axios.put(`http://localhost:8080/api/admin/unban/${pk}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };
  
  // Group modal fields for display
  const groupedModalFields: Record<string, typeof COURIER_MODAL_FIELDS_CONFIG> = {};
  COURIER_MODAL_FIELDS_CONFIG.forEach(field => {
    if (!groupedModalFields[field.group]) groupedModalFields[field.group] = [];
    groupedModalFields[field.group].push(field);
  });

  return (
    <div className="min-h-screen bg-yellow-50 p-4 md:p-8"> {/* Changed bg color for consistency */}
      <ToastContainer position="bottom-right" autoClose={4000} theme="colored" newestOnTop />
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-orange-700 mb-8">Courier Management</h1>

        <div className="mb-10 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-orange-800 mb-6">Add New Courier</h2>
          {modalFormError && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4 text-sm">{modalFormError}</p>}
          <form onSubmit={handleCreateCourier} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {NEW_COURIER_FORM_FIELDS.map(({ name, label, type, required }) => (
                <div key={name}>
                  <label htmlFor={`new-courier-${name}`} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    id={`new-courier-${name}`} type={type} name={name} required={required}
                    className="mt-1 p-2 w-full border border-orange-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    value={newCourierData[name]} onChange={handleNewCourierInputChange}
                  />
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors"
            >
              Add Courier
            </button>
          </form>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search couriers by name, email, username, or phone..."
            className="w-full px-4 py-3 border border-orange-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-10"><p className="text-orange-600 text-xl">Loading couriers...</p></div>
        ) : pageError && couriers.length === 0 ? (
          <div className="text-center py-10 bg-red-100 text-red-700 p-4 rounded-lg">
            <p>{pageError}</p>
            <button onClick={fetchCouriers} className="mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
                Try Again
            </button>
          </div>
        ) : filteredCouriers.length === 0 && searchQuery ? (
          <div className="text-center py-10 text-gray-500"><p>No couriers found matching your search criteria.</p></div>
        ) : filteredCouriers.length === 0 ? (
          <div className="text-center py-10 text-gray-500"><p>No couriers available. Start by adding a new one!</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredCouriers.map((courier) => (
              <CourierCard
                key={courier.pk}
                courier={courier}
                onManage={openManageModal}
                onBan={handleBanCourier}
                onUnban={handleUnbanCourier}
              />
            ))}
          </div>
        )}
      </div>

      {/* Manage Courier Modal */}
      {isManageModalOpen && selectedCourierForModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={closeManageModal}>
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-2xl font-semibold text-orange-800">
                {isEditingInModal ? `Edit: ${selectedCourierForModal.name}` : `Details: ${selectedCourierForModal.name}`}
              </h2>
              <button onClick={closeManageModal} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            
            {modalFormError && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4 text-sm">{modalFormError}</p>}

            <div className="overflow-y-auto flex-grow pr-2">
                {!isEditingInModal ? (
                <>
                    {Object.entries(groupedModalFields).map(([groupName, fields]) => (
                    <div key={groupName} className="mb-5">
                        <h5 className="text-lg font-semibold text-orange-600 mb-2 border-b pb-1">{groupName}</h5>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {fields.map(field => {
                            const value = selectedCourierForModal[field.key as keyof CourierDTO];
                            return (
                            <React.Fragment key={field.key}>
                                <dt className="font-medium text-gray-600">{field.label}:</dt>
                                <dd className="text-gray-800 break-words">
                                {field.type === 'checkbox' ? (
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${value ? (field.key === 'isOnline' ? 'bg-yellow-100 text-orange-700' : 'bg-blue-100 text-blue-700') : 'bg-gray-100 text-gray-600'}`}>
                                    {value ? (field.key === 'isOnline' ? 'Online' : 'Available') : (field.key === 'isOnline' ? 'Offline' : 'Unavailable')}
                                    </span>
                                ) : field.key === 'profilePictureUrl' && value ? (
                                    <a href={String(value)} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                        View Image
                                    </a>
                                ) : (value !== undefined && value !== null && String(value).trim() !== '') ? String(value) : <span className="italic text-gray-400">N/A</span>}
                                </dd>
                            </React.Fragment>
                            );
                        })}
                        </dl>
                    </div>
                    ))}

                    <div className="mt-6">
                        <h5 className="text-lg font-semibold text-orange-600 mb-2 border-b pb-1">Recent Orders</h5>
                        {ordersLoading && <p className="text-gray-500 italic">Loading orders...</p>}
                        {ordersError && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{ordersError}</p>}
                        {!ordersLoading && !ordersError && courierOrders.length === 0 && (
                            <p className="text-gray-500 italic">No orders found for this courier.</p>
                        )}
                        {!ordersLoading && !ordersError && courierOrders.length > 0 && (
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                            {courierOrders.map(order => (
                                <div key={order.pk} className="p-3 bg-gray-50 rounded-md shadow-sm border border-gray-200">
                                <div className="flex justify-between items-center text-sm mb-1">
                                    <span className="font-semibold text-gray-700">Order #{order.pk} <span className="text-xs text-gray-500">(for {order.name || 'Customer'})</span></span>
                                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                    order.status === OrderStatusEnum.DELIVERED ? 'bg-green-100 text-green-700' :
                                    order.status === OrderStatusEnum.CANCELLED || order.status === OrderStatusEnum.REJECTED ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                    }`}>{order.status.replace(/_/g, ' ')}</span>
                                </div>
                                <p className="text-xs text-gray-600">
                                    Restaurant: <span className="font-medium">{order.restaurant?.name || 'N/A'}</span>
                                </p>
                                <p className="text-xs text-gray-600">
                                    Total: <span className="font-medium">{order.totalPrice.toFixed(2)} TL</span>
                                </p>
                                <p className="text-xs text-gray-500">
                                    Date: {new Date(order.createdAt).toLocaleString()}
                                </p>
                                </div>
                            ))}
                            </div>
                        )}
                    </div>
                </>
                ) : (
                <form onSubmit={handleModalSaveChanges}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {COURIER_MODAL_FIELDS_CONFIG.filter(f => !f.readonly).map(field => (
                        <div key={field.key} className={field.type === 'checkbox' ? 'md:col-span-2 flex items-center' : ''}>
                        <label htmlFor={`modal-courier-${field.key}`} 
                               className={`block text-sm font-medium text-orange-700 ${field.type === 'checkbox' ? 'mr-3' : 'mb-1'}`}> {/* orange-700 for label */}
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type={field.type} id={`modal-courier-${field.key}`} name={field.key} required={field.required}
                            className={field.type === 'checkbox' 
                                ? 'h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500' 
                                : 'mt-1 block w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm'}
                            checked={field.type === 'checkbox' ? (modalEditableData[field.key as keyof CourierDTO] as boolean) : undefined}
                            value={field.type !== 'checkbox' ? (modalEditableData[field.key as keyof CourierDTO] as string | number | undefined) ?? '' : undefined}
                            onChange={handleModalInputChange}
                        />
                        </div>
                    ))}
                    </div>
                    <div className="mt-6 flex justify-end space-x-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={() => setIsEditingInModal(false)}
                        className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400 transition-colors"
                    >
                        Cancel Edit
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors"
                    >
                        Save Changes
                    </button>
                    </div>
                </form>
                )}
            </div>
            
            {!isEditingInModal && (
                <div className="mt-6 flex justify-end pt-4 border-t">
                  <button
                    onClick={() => setIsEditingInModal(true)}
                    className="px-5 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                  >
                    Edit Courier Information
                  </button>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}