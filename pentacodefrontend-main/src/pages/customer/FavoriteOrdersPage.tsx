import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

interface MenuItem { pk: number; name: string; price: number }
interface OrderItem { menu: MenuItem; quantity: number }
interface RestaurantDTO { pk: number; name: string }
interface CourierDTO { pk: number; name: string }

interface OrderDTO {
  pk: number;
  name?: string;
  restaurant: RestaurantDTO;
  menus: MenuItem[];
  courier?: CourierDTO;
  status: string;
  courierAssignmentAccepted: boolean;
  version: number;
  totalPrice: number;
  orderItems: OrderItem[];
  rated: boolean;
  rating?: number;
  createdAt: string;
}

interface ApiResponse { data: OrderDTO[] }

const FavoriteOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);

  const itemsPerPage = 6;
  const navigate = useNavigate();

  const fetchFavoriteOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get<ApiResponse>(
        'http://localhost:8080/api/customer/get-favorite-orders',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const list = res.data.data || [];
      setOrders(list);
      applyFilterSort(list, searchQuery, sortOption);
    } catch {
      setError('Failed to load favorite orders');
      toast.error('Failed to load favorite orders');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = (order: OrderDTO) =>
    order.orderItems.reduce((sum, item) => sum + item.menu.price * item.quantity, 0);

  const applyFilterSort = (list: OrderDTO[], query: string, sort: string) => {
    let result = [...list];
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(
        o =>
          o.pk.toString().includes(q) ||
          o.orderItems.some(i => i.menu.name.toLowerCase().includes(q))
      );
    }
    if (sort === 'date-desc') {
      result.sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
    } else if (sort === 'date-asc') {
      result.sort((a, b) => Date.parse(a.createdAt) - Date.parse(b.createdAt));
    } else if (sort === 'total-asc') {
      result.sort((a, b) => calculateTotal(a) - calculateTotal(b));
    } else {
      result.sort((a, b) => calculateTotal(b) - calculateTotal(a));
    }
    setFilteredOrders(result);
    setCurrentPage(1);
  };

  const handleRemoveFromFavorites = async (orderPk: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8080/api/customer/remove-from-favorite-orders/${orderPk}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order removed from favorites');
      setOrders(prev => prev.filter(o => o.pk !== orderPk));
      setFilteredOrders(prev => prev.filter(o => o.pk !== orderPk));
    } catch {
      setError('Failed to remove order from favorites');
      toast.error('Failed to remove order from favorites');
    }
  };

  const handleReorder = async (orderPk: number) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8080/api/order/re-order/${orderPk}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order successfully created');
      navigate('/customer/review-cart');
    } catch {
      setError('Failed to reorder');
      toast.error('Failed to reorder');
    }
  };

  useEffect(() => { fetchFavoriteOrders(); }, []);
  useEffect(() => { applyFilterSort(orders, searchQuery, sortOption); }, [orders, searchQuery, sortOption]);

  const paginated = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <div className="min-h-screen bg-orange-50">
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold text-red-700 mb-6">
            Favorite Orders
          </h1>

          {/* Search & Sort */}
          <div className="sticky top-0 bg-orange-50 z-10 pb-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full md:w-64 border border-amber-600 rounded px-3 py-2 text-amber-800 placeholder-amber-400"
              />
              <select
                value={sortOption}
                onChange={e => setSortOption(e.target.value)}
                className="border border-amber-600 rounded px-3 py-2 text-amber-800"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="total-asc">Total Low→High</option>
                <option value="total-desc">Total High→Low</option>
              </select>
            </div>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white shadow rounded-lg p-5 animate-pulse h-48" />
              ))}
            </div>
          ) : paginated.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-amber-800 text-lg">
                No favorite orders found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map(order => (
                <div
                  key={order.pk}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white shadow-md rounded-lg p-5 hover:shadow-xl cursor-pointer"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h2 className="text-xl font-medium text-amber-800">Order #{order.pk}</h2>
                    <p className="text-sm text-amber-600">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p>Status: <strong>{order.status}</strong></p>
                  <p>Total: <strong>${order.totalPrice.toFixed(2)}</strong></p>

                  <div className="mt-4 flex flex-col space-y-4">
                    <button
                      onClick={e => { e.stopPropagation(); handleRemoveFromFavorites(order.pk); }}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Remove from Favorites
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleReorder(order.pk); }}
                      className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900"
                    >
                      Reorder
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {filteredOrders.length > itemsPerPage && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-amber-800 text-white rounded disabled:bg-gray-300"
              >Prev</button>
              <span>Page {currentPage} of {Math.ceil(filteredOrders.length / itemsPerPage)}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(filteredOrders.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)}
                className="px-3 py-1 bg-amber-800 text-white rounded disabled:bg-gray-300"
              >Next</button>
            </div>
          )}

          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[10000]"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-white rounded-lg max-w-xl w-full p-6 z-[10001]"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="float-right text-gray-500 hover:text-gray-800"
              onClick={() => setSelectedOrder(null)}
            >×</button>
            <h2 className="text-2xl font-bold mb-4">Order #{selectedOrder.pk} Details</h2>
            {selectedOrder.name && <p><strong>Name:</strong> {selectedOrder.name}</p>}
            <p><strong>Restaurant:</strong> {selectedOrder.restaurant.name}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
            <p><strong>Courier Accepted:</strong> {selectedOrder.courierAssignmentAccepted ? 'Yes' : 'No'}</p>
            {selectedOrder.courier && (
              <p><strong>Courier:</strong> {selectedOrder.courier.name}</p>
            )}
            <p><strong>Version:</strong> {selectedOrder.version}</p>
            <p><strong>Total Price:</strong> ${selectedOrder.totalPrice.toFixed(2)}</p>
            <h3 className="mt-4 font-semibold">Items:</h3>
            <ul className="list-disc list-inside mb-4">
              {selectedOrder.orderItems.map((i: OrderItem) => (
                <li key={i.menu.pk}>
                  {i.menu.name} × {i.quantity} @ ${i.menu.price.toFixed(2)}
                </li>
              ))}
            </ul>
            <p>
              <strong>Rated:</strong> {selectedOrder.rated ? 'Yes' : 'No'}
              {selectedOrder.rated && selectedOrder.rating != null && (
                <> (Your rating: {selectedOrder.rating} ⭐)</>
              )}
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default FavoriteOrdersPage;