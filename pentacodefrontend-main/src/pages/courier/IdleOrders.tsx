import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { OrderDTO, OrderStatusEnum } from '../../types/Order';
import { OrderSearch } from '../../components/admin/OrderSearch';
import { OrderStatusFilter } from '../../components/admin/OrderStatusFilter';

export default function IdleOrders() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/order/courier/orders', {
        params: { accept: false, past: false, searchQuery, statuses: selectedStatuses.join(',') },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const ordersWithSearch = response.data.data.map((order: OrderDTO) => ({
        ...order,
        searchString: `${order.name} ${order.restaurant.name} ${order.orderItems.map((item) => item.menu.name).join(' ')}`,
      }));
      setOrders(ordersWithSearch);
      setFilteredOrders(ordersWithSearch);
    } catch (err) {
      setError('Failed to fetch orders');
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchQuery, selectedStatuses]);

  const handleRespondToAssignment = async (orderId: number, status: 'IN_TRANSIT' | 'READY_FOR_PICKUP') => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/couriers/orders/${orderId}/respond`,
        null,
        {
          params: { status },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      // Sayfayı güncellemek için fetchOrders'ı çağır
      await fetchOrders();
      toast.success(response.data.message || `Order ${status === 'IN_TRANSIT' ? 'accepted' : 'rejected'}`);
    } catch (err) {
      setError('Failed to respond to the order');
      toast.error('Failed to respond to the order');
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case OrderStatusEnum.PLACED:
        return 'bg-amber-200';
      case OrderStatusEnum.ASSIGNED:
        return 'bg-orange-200';
      default:
        return 'bg-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-red-700 mb-6">Idle Orders</h1>
        <div className="flex gap-6">
          <div className="w-4/5">
            <div className="relative w-full md:w-64 mb-4">
              <OrderSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-amber-800"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-amber-800"
                >
                  ✕
                </button>
              )}
            </div>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array(6).fill(0).map((_, index) => (
                  <div key={index} className="bg-white shadow-md rounded-lg p-5 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.length === 0 ? (
                  <div className="text-center text-amber-800 w-full">No idle orders found.</div>
                ) : (
                  filteredOrders.map((order) => (
                    <div key={order.pk} className="bg-white shadow-md rounded-lg p-5 hover:shadow-xl transition-all duration-300">
                      <div className="flex justify-between items-center">
                        <h2 className="text-xl font-medium text-amber-800">Order #{order.pk}</h2>
                        <span className={`px-2 py-1 rounded text-sm ${getStatusBackgroundColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="mt-3 text-amber-800">
                        <p className="font-semibold">Restaurant: {order.restaurant.name}</p>
                        <p className="text-sm">Total: ${order.totalPrice.toFixed(2)}</p>
                      </div>
                      <div className="mt-3">
                        <p className="font-semibold text-amber-800">Items:</p>
                        <ul className="text-sm text-amber-800">
                          {order.orderItems.slice(0, 2).map((item, index) => (
                            <li key={index}>{item.quantity}x {item.menu.name}</li>
                          ))}
                          {order.orderItems.length > 2 && <li>+{order.orderItems.length - 2} more...</li>}
                        </ul>
                      </div>
                      <div className="mt-5 flex justify-between">
                        <button
                          onClick={() => handleRespondToAssignment(order.pk, 'IN_TRANSIT')}
                          className="px-4 py-2 bg-orange-700 text-white rounded hover:bg-orange-800 transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRespondToAssignment(order.pk, 'READY_FOR_PICKUP')}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {/* <div className="w-1/5">
            <OrderStatusFilter selectedStatuses={selectedStatuses} setSelectedStatuses={setSelectedStatuses} />
          </div> */}
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
}