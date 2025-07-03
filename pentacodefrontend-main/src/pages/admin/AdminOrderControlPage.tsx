import { useState, useEffect } from 'react';
import axios from 'axios';
import { OrderDTO, OrderStatusEnum } from '../../types/Order';
import { CourierDTO } from '../../types/Courier';
import { OrderSearch } from '../../components/admin/OrderSearch';
import { OrderStatusFilter } from '../../components/admin/OrderStatusFilter';
import { OrderList } from '../../components/admin/OrderList';
import { AssignCourierModal } from '../../components/admin/AssignCourierModal';

export default function AdminOrderControlPage() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [couriers, setCouriers] = useState<CourierDTO[]>([]);
  const [statusLoading, setStatusLoading] = useState<number | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/api/admin/order/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const ordersWithSearch = response.data.data.map((order: OrderDTO) => {
          const name = order.name || '';
          const restaurantName = order.restaurant?.name || '';
          const orderItems = order.orderItems?.map((item) => item.menu?.name || '').join(' ') || '';
          return {
            ...order,
            searchString: `${name} ${restaurantName} ${orderItems}`.trim(),
          };
        });
        setOrders(ordersWithSearch);
        setFilteredOrders(ordersWithSearch);
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Failed to load orders.');
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  useEffect(() => {
    const filtered = orders.filter(
      (order) =>
        order.searchString!.toLowerCase().includes(searchQuery.toLowerCase()) &&
        (selectedStatuses.length === 0 || selectedStatuses.includes(order.status))
    );
    setFilteredOrders(filtered);
  }, [searchQuery, selectedStatuses, orders]);

  const openCourierModal = async (orderId: number) => {
    setSelectedOrderId(orderId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/couriers/available', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCouriers(response.data.data);
      setIsModalOpen(true);
    } catch (err) {
      setError('Failed to load couriers.');
    }
  };

  const assignCourier = async (orderId: number, courierId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8080/api/admin/orders/${orderId}/assign-courier/${courierId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedOrder = response.data.data;
      setOrders(orders.map((o) => (o.pk === orderId ? { ...o, ...updatedOrder } : o)));
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to assign courier.');
    }
  };

  const unassignCourier = async (orderId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:8080/api/admin/orders/${orderId}/unassign-courier`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedOrder = response.data.data;
      setOrders(orders.map((o) => (o.pk === orderId ? { ...o, ...updatedOrder } : o)));
      setIsModalOpen(false);
    } catch (err) {
      setError('Failed to unassign courier.');
    }
  };

  const changeOrderStatus = async (orderId: number, newStatus: OrderStatusEnum) => {
    setStatusLoading(orderId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:8080/api/admin/orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedOrder = response.data.data;
      setOrders(orders.map((o) => (o.pk === orderId ? { ...o, ...updatedOrder } : o)));
    } catch (err) {
      setError('Failed to change order status.');
    } finally {
      setStatusLoading(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrderId(null);
  };

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-amber-800 mb-6">Order Management</h1>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="lg:w-4/5">
            <OrderSearch searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
            {error && <p className="text-red-500 mb-4 font-medium">{error}</p>}
            <OrderList
              orders={filteredOrders}
              loading={loading}
              openCourierModal={openCourierModal}
              onChangeStatus={changeOrderStatus}
              statusLoading={statusLoading}
            />
          </div>
          <div className="lg:w-1/5">
            <OrderStatusFilter
              selectedStatuses={selectedStatuses}
              setSelectedStatuses={setSelectedStatuses}
            />
          </div>
        </div>
        {isModalOpen && selectedOrderId && (
          <AssignCourierModal
            orderId={selectedOrderId}
            orders={orders}
            couriers={couriers}
            onAssign={assignCourier}
            onUnassign={unassignCourier}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}