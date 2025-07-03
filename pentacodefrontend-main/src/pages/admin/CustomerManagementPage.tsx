import React, { useEffect, useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Customer } from '../../types/Customer';
import { OrderDTO, OrderStatusEnum } from '../../types/Order'; // Adjust path if needed
import CustomerCard from '../../components/admin/CustomerCard';

const initialNewCustomerState = {
  username: '',
  name: '',
  email: '',
  password: '',
  authorities: ['ROLE_CUSTOMER'],
  customerPhoneNumber: '', // Corresponds to 'phoneNumber' in Customer type
  customerAddress: '',     // Corresponds to 'address' in Customer type
};

const NEW_CUSTOMER_FORM_FIELDS = [
  { name: 'username', label: 'Username*', type: 'text', required: true },
  { name: 'name', label: 'Full Name*', type: 'text', required: true },
  { name: 'email', label: 'Email*', type: 'email', required: true },
  { name: 'password', label: 'Password*', type: 'password', required: true },
  { name: 'customerPhoneNumber', label: 'Phone Number', type: 'tel' },
  { name: 'customerAddress', label: 'Address', type: 'text' },
];

const CUSTOMER_MODAL_FIELDS_CONFIG = [
  { key: 'name', label: 'Full Name', type: 'text', group: 'Personal Info', required: true },
  { key: 'email', label: 'Email', type: 'email', group: 'Personal Info', required: true },
  { key: 'username', label: 'Username', type: 'text', group: 'Account Info (Read-only)', readonly: true }, // Assuming username isn't editable post-creation
  { key: 'phoneNumber', label: 'Phone Number', type: 'tel', group: 'Contact Info' },
  { key: 'address', label: 'Address', type: 'text', group: 'Contact Info' },
  // Latitude and Longitude are usually set via map or backend, not direct user input often
  // { key: 'latitude', label: 'Latitude', type: 'number', group: 'Location' },
  // { key: 'longitude', label: 'Longitude', type: 'number', group: 'Location' },
];


const CustomerManagementPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newCustomerData, setNewCustomerData] = useState<any>(initialNewCustomerState);
  const [formError, setFormError] = useState(''); // For create form

  // Modal States
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedCustomerForModal, setSelectedCustomerForModal] = useState<Customer | null>(null);
  const [isEditingInModal, setIsEditingInModal] = useState(false);
  const [modalEditableData, setModalEditableData] = useState<Partial<Customer>>({});
  const [modalFormError, setModalFormError] = useState('');

  // Order States for Modal
  const [customerOrders, setCustomerOrders] = useState<OrderDTO[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setFormError('Authentication token not found.');
        toast.error('Authentication token not found.');
        setLoading(false);
        return;
      }
      const { data } = await axios.get('http://localhost:8080/api/admin/customer/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomers(data.data || []);
      setFilteredCustomers(data.data || []);
      setFormError('');
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const errorMessage = axiosError.response?.data?.message || 'Failed to load customers.';
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase().trim();
    setFilteredCustomers(
      !lowerQuery
        ? customers
        : customers.filter(
            (customer) =>
              (customer.name && customer.name.toLowerCase().includes(lowerQuery)) ||
              (customer.email && customer.email.toLowerCase().includes(lowerQuery)) ||
              (customer.phoneNumber && customer.phoneNumber.includes(lowerQuery))
          )
    );
  }, [searchQuery, customers]);

  const handleNewCustomerInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewCustomerData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Authentication token not found.'); return; }

    // Map form field names to Customer type field names if different
    const payload = {
      ...newCustomerData,
      phoneNumber: newCustomerData.customerPhoneNumber,
      address: newCustomerData.customerAddress,
    };
    // Remove the temporary fields if they are not part of the actual API payload structure for create
    delete payload.customerPhoneNumber;
    delete payload.customerAddress;


    try {
      const { data } = await axios.post('http://localhost:8080/api/admin/create', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Customer created successfully!');
      const createdCustomer = data.data as Customer;
      setCustomers((prev) => [createdCustomer, ...prev]);
      setNewCustomerData(initialNewCustomerState);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; errors?: { defaultMessage: string }[] }>;
      let errorMessage = 'Failed to create customer.';
      if (axiosError.response?.data?.message) errorMessage = axiosError.response.data.message;
      else if (axiosError.response?.data?.errors) errorMessage = axiosError.response.data.errors.map(e => e.defaultMessage).join(', ');
      setFormError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const fetchCustomerOrders = async (customerPk: number) => {
    setOrdersLoading(true);
    setOrdersError('');
    setCustomerOrders([]);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Authentication token not found for fetching orders.');
      const response = await axios.get(`http://localhost:8080/api/admin/customer/${customerPk}/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCustomerOrders(response.data.data || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to load customer orders.';
      setOrdersError(errorMessage);
      // toast.error(errorMessage); // Can be noisy if modal is opened/closed often
      console.error("Error fetching orders:", errorMessage);
    } finally {
      setOrdersLoading(false);
    }
  };

  const openManageModal = (customer: Customer) => {
    setSelectedCustomerForModal(customer);
    const initialData: Partial<Customer> = {};
    CUSTOMER_MODAL_FIELDS_CONFIG.forEach(field => {
      if (!field.readonly) { // Only include non-readonly fields for editing
        initialData[field.key as keyof Customer] = customer[field.key as keyof Customer] as any;
      }
    });
    setModalEditableData(initialData);
    setIsEditingInModal(false);
    setIsManageModalOpen(true);
    setModalFormError('');
    if (customer.pk) {
        fetchCustomerOrders(customer.pk);
    }
  };

  const closeManageModal = () => {
    setIsManageModalOpen(false);
    setSelectedCustomerForModal(null);
    setIsEditingInModal(false);
    setModalEditableData({});
    setCustomerOrders([]);
    setOrdersError('');
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
    if (!selectedCustomerForModal) return;
    setModalFormError('');
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Authentication token not found.'); return; }

    // API endpoint for customer edit might be different than restaurant, verify this
    // Your old code used: `/api/admin/customer/edit/${editCustomer.pk}`
    // This seems correct. The payload should match the fields your API expects for customer edit.
    const payload = { ...modalEditableData };
    // Ensure all required fields from CUSTOMER_MODAL_FIELDS_CONFIG are present or handled
    
    try {
      const { data } = await axios.put(
        `http://localhost:8080/api/admin/customer/edit/${selectedCustomerForModal.pk}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Customer updated successfully!');
      const updatedCustomer = data.data as Customer;
      setCustomers((prev) =>
        prev.map((c) => (c.pk === selectedCustomerForModal.pk ? { ...c, ...updatedCustomer } : c))
      );
      setSelectedCustomerForModal(prev => prev ? { ...prev, ...updatedCustomer } : null);
      setIsEditingInModal(false);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string; errors?: { defaultMessage: string }[] }>;
      let errorMessage = 'Failed to update customer.';
      if (axiosError.response?.data?.message) errorMessage = axiosError.response.data.message;
      else if (axiosError.response?.data?.errors) errorMessage = axiosError.response.data.errors.map(e => e.defaultMessage).join(', ');
      setModalFormError(errorMessage);
      toast.error(errorMessage);
    }
  };

  const handleBanCustomer = async (pk: number) => {
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Token not found.'); throw new Error('Token not found'); }
    await axios.put(`http://localhost:8080/api/admin/ban/${pk}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handleUnbanCustomer = async (pk: number) => {
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Token not found.'); throw new Error('Token not found'); }
    await axios.put(`http://localhost:8080/api/admin/unban/${pk}`, {}, {
      headers: { Authorization: `Bearer ${token}` },
    });
  };

  const handleDeleteCustomer = async (pk: number) => {
    const customerToDelete = customers.find(c => c.pk === pk);
    const customerName = customerToDelete ? customerToDelete.name : "this customer";
    if (!window.confirm(`Are you sure you want to delete ${customerName}? This action cannot be undone.`)) return;
    
    const token = localStorage.getItem('token');
    if (!token) { toast.error('Authentication token not found.'); return; }
    try {
      // Assuming the delete endpoint is /api/admin/delete/user/{id} or /api/admin/delete/{id} for customers
      // Your old code used /api/admin/delete/${pk} - let's stick with that.
      await axios.delete(`http://localhost:8080/api/admin/delete/${pk}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`${customerName} deleted successfully.`);
      setCustomers((prev) => prev.filter((c) => c.pk !== pk));
      if (selectedCustomerForModal && selectedCustomerForModal.pk === pk) {
        closeManageModal();
      }
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      toast.error(axiosError.response?.data?.message || `Failed to delete ${customerName}.`);
    }
  };
  
  // Group modal fields for display
  const groupedModalFields: Record<string, typeof CUSTOMER_MODAL_FIELDS_CONFIG> = {};
  CUSTOMER_MODAL_FIELDS_CONFIG.forEach(field => {
    if (!groupedModalFields[field.group]) groupedModalFields[field.group] = [];
    groupedModalFields[field.group].push(field);
  });

  return (
    <div className="min-h-screen bg-yellow-50 p-4 md:p-8">
      <ToastContainer position="bottom-right" autoClose={4000} theme="colored" newestOnTop />
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-red-700 mb-8">Customer Management</h1>

        <div className="mb-10 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-2xl font-semibold text-orange-800 mb-6">Add New Customer</h2>
          {formError && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4 text-sm">{formError}</p>}
          <form onSubmit={handleCreateCustomer} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {NEW_CUSTOMER_FORM_FIELDS.map(({ name, label, type, required }) => (
                <div key={name}>
                  <label htmlFor={`new-${name}`} className="block text-sm font-medium text-gray-700 mb-1">
                    {label}
                  </label>
                  <input
                    id={`new-${name}`} type={type} name={name} required={required}
                    className="mt-1 p-2 w-full border border-orange-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500"
                    value={newCustomerData[name]} onChange={handleNewCustomerInputChange}
                  />
                </div>
              ))}
            </div>
            <button
              type="submit"
              className="mt-4 px-6 py-2 bg-orange-500 text-white font-semibold rounded-md hover:bg-orange-600 transition-colors"
            >
              Add Customer
            </button>
          </form>
        </div>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name, email, username, or phone..."
            className="w-full px-4 py-3 border border-orange-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="text-center py-10"><p className="text-orange-600 text-xl">Loading customers...</p></div>
        ) : formError && customers.length === 0 ? (
          <div className="text-center py-10 bg-red-100 text-red-700 p-4 rounded-lg">
            <p>{formError}</p>
            <button onClick={fetchCustomers} className="mt-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600">
                Try Again
            </button>
          </div>
        ) : filteredCustomers.length === 0 && searchQuery ? (
          <div className="text-center py-10 text-gray-500"><p>No customers found matching your search criteria.</p></div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-10 text-gray-500"><p>No customers available. Start by adding a new one!</p></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredCustomers.map((customer) => (
              <CustomerCard
                key={customer.pk}
                customer={customer}
                onManage={openManageModal}
                onBan={handleBanCustomer}
                onUnban={handleUnbanCustomer}
                onDelete={handleDeleteCustomer}
              />
            ))}
          </div>
        )}
      </div>

      {/* Manage Customer Modal */}
      {isManageModalOpen && selectedCustomerForModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={closeManageModal}>
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <h2 className="text-2xl font-semibold text-orange-800">
                {isEditingInModal ? `Edit: ${selectedCustomerForModal.name}` : `Details: ${selectedCustomerForModal.name}`}
              </h2>
              <button onClick={closeManageModal} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
            </div>
            
            {modalFormError && <p className="text-red-500 bg-red-100 p-3 rounded-md mb-4 text-sm">{modalFormError}</p>}

            <div className="overflow-y-auto flex-grow pr-2"> {/* Scrollable content area */}
                {!isEditingInModal ? (
                // READ-ONLY DETAILS VIEW
                <>
                    {Object.entries(groupedModalFields).map(([groupName, fields]) => (
                    <div key={groupName} className="mb-5">
                        <h5 className="text-lg font-semibold text-orange-600 mb-2 border-b pb-1">{groupName}</h5>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        {fields.map(field => {
                            const value = selectedCustomerForModal[field.key as keyof Customer] as string | number | undefined;
                            return (
                            <React.Fragment key={field.key}>
                                <dt className="font-medium text-gray-600">{field.label}:</dt>
                                <dd className="text-gray-800 break-words">
                                {(value !== undefined && value !== null && String(value).trim() !== '') ? String(value) : <span className="italic text-gray-400">N/A</span>}
                                </dd>
                            </React.Fragment>
                            );
                        })}
                        </dl>
                    </div>
                    ))}

                    {/* Customer Orders Section */}
                    <div className="mt-6">
                    <h5 className="text-lg font-semibold text-orange-600 mb-2 border-b pb-1">Recent Orders</h5>
                    {ordersLoading && <p className="text-gray-500 italic">Loading orders...</p>}
                    {ordersError && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{ordersError}</p>}
                    {!ordersLoading && !ordersError && customerOrders.length === 0 && (
                        <p className="text-gray-500 italic">No orders found for this customer.</p>
                    )}
                    {!ordersLoading && !ordersError && customerOrders.length > 0 && (
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-1"> {/* Scroll for orders list */}
                        {customerOrders.map(order => (
                            <div key={order.pk} className="p-3 bg-gray-50 rounded-md shadow-sm border border-gray-200">
                            <div className="flex justify-between items-center text-sm mb-1">
                                <span className="font-semibold text-gray-700">Order #{order.pk}</span>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                                    order.status === OrderStatusEnum.DELIVERED ? 'bg-green-100 text-green-700' :
                                    order.status === OrderStatusEnum.CANCELLED || order.status === OrderStatusEnum.REJECTED ? 'bg-red-100 text-red-700' :
                                    'bg-yellow-100 text-yellow-700'
                                }`}>
                                {order.status.replace(/_/g, ' ')}
                                </span>
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
                // EDITABLE FORM VIEW
                <form onSubmit={handleModalSaveChanges}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {CUSTOMER_MODAL_FIELDS_CONFIG.filter(f => !f.readonly).map(field => (
                        <div key={field.key}>
                        <label htmlFor={`modal-${field.key}`} className="block text-sm font-medium text-orange-700 mb-1">
                            {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type={field.type} id={`modal-${field.key}`} name={field.key} required={field.required}
                            className="mt-1 block w-full px-3 py-2 border border-orange-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                            value={(modalEditableData[field.key as keyof Customer] as string | number | undefined) ?? ''}
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
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                        Save Changes
                    </button>
                    </div>
                </form>
                )}
            </div> {/* End scrollable content area */}
            
            {!isEditingInModal && (
                <div className="mt-6 flex justify-end pt-4 border-t">
                  <button
                    onClick={() => setIsEditingInModal(true)}
                    className="px-5 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors"
                  >
                    Edit Customer Information
                  </button>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagementPage;