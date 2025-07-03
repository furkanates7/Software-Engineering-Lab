import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Restaurant } from '../../types/Restaurant';

interface MenuItem {
  pk: number;
  name: string;
  price: number;
}

interface OrderItem {
  menu: MenuItem;
  quantity: number;
}

interface RestaurantDTO {
  pk: number;
  name: string;
}

interface OrderDTO {
  pk: number;
  restaurant: RestaurantDTO;
  orderItems: OrderItem[];
  status: string;
  totalPrice: number;
  createdAt: string;
}

interface OrderData {
  data: {
    orderItems: OrderItem[];
    restaurant: Restaurant;
  };
}

interface ApiResponse<T> {
  message: string;
  status: number;
  data: T;
}

const ReviewCartPage: React.FC = () => {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<OrderItem[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant>();
  const [favoriteRestaurants, setFavoriteRestaurants] = useState<RestaurantDTO[]>([]);
  const [favoriteOrders, setFavoriteOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get<OrderData>(
        'http://localhost:8080/api/customer/get-order',
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRestaurant(res.data.data.restaurant);
      const items = res.data.data.orderItems || [];
      setOrderItems(items);
      filterItems(items, searchQuery);
    } catch (err) {
      setError('Failed to load cart');
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch favorite restaurants
      const restaurantRes = await axios.get<ApiResponse<RestaurantDTO[]>>(
        'http://localhost:8080/api/customer/get-favorite-restaurants',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFavoriteRestaurants(restaurantRes.data.data || []);

      // Fetch favorite orders
      const orderRes = await axios.get<ApiResponse<OrderDTO[]>>(
        'http://localhost:8080/api/customer/get-favorite-orders',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setFavoriteOrders(orderRes.data.data || []);
    } catch (err) {
      setError('Failed to load favorites');
      toast.error('Failed to load favorites');
    }
  };

  const handleUpdateOrder = async (pk: number, action: 'add' | 'remove') => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:8080/api/customer/update-order/${pk}?action=${action}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchOrder();
      toast.success(`Item ${action === 'add' ? 'added' : 'removed'} successfully`);
    } catch (err) {
      setError('Failed to update cart');
      toast.error('Failed to update cart');
    }
  };

  const handleQuantityChange = async (pk: number, quantity: number) => {
    if (quantity < 1) return;
    try {
      const token = localStorage.getItem('token');
      const currentItem = orderItems.find((item) => item.menu.pk === pk);
      if (!currentItem) return;
      const delta = quantity - currentItem.quantity;
      if (delta === 0) return;
      const action = delta > 0 ? 'add' : 'remove';
      const absDelta = Math.abs(delta);
      for (let i = 0; i < absDelta; i++) {
        await axios.post(
          `http://localhost:8080/api/customer/update-order/${pk}?action=${action}`,
          null,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      await fetchOrder();
      toast.success(`Quantity updated to ${quantity}`);
    } catch (err) {
      setError('Failed to update quantity');
      toast.error('Failed to update quantity');
    }
  };

  const placeOrder = async () => {
    setPlacingOrder(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8080/api/customer/place-order',
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order placed successfully!');
      navigate('/success', {
        state: {
          message: 'Order placed successfully!',
          redirectTo: '/customer/restaurants',
        },
      });
    } catch (err) {
      let errorMessage = 'Failed to place order';
      if (axios.isAxiosError(err) && err.response?.data) {
        errorMessage = typeof err.response.data === 'string' ? err.response.data : err.response.data.message || errorMessage;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setPlacingOrder(false);
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
      await fetchOrder(); // Refresh cart to show reordered items
      toast.success('Order successfully created');
      navigate('/customer/review-cart');
    } catch (err) {
      setError('Failed to reorder');
      toast.error('Failed to reorder');
    }
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
      setFavoriteOrders((prev) => prev.filter((order) => order.pk !== orderPk));
    } catch (err) {
      setError('Failed to remove order from favorites');
      toast.error('Failed to remove order from favorites');
    }
  };

  const calculateSubtotal = () => {
    return orderItems.reduce((sum, item) => sum + item.menu.price * item.quantity, 0);
  };

  const deliveryFee = Number(restaurant?.deliveryFee ?? 0);
  const calculateTotal = () => calculateSubtotal() + deliveryFee;

  const filterItems = (items: OrderItem[], query: string) => {
    if (!query) {
      setFilteredItems(items);
      return;
    }
    const lowerQuery = query.toLowerCase();
    setFilteredItems(
      items.filter((item) => item.menu.name.toLowerCase().includes(lowerQuery))
    );
  };

  useEffect(() => {
    fetchOrder();
  }, []);

  useEffect(() => {
    if (filteredItems.length === 0 && !loading) {
      fetchFavorites();
    }
  }, [filteredItems, loading]);

  useEffect(() => {
    filterItems(orderItems, searchQuery);
  }, [searchQuery, orderItems]);

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-red-700 mb-6">Review Your Cart</h1>

        {/* Sticky Header */}
        <div className="sticky top-0 bg-orange-50 z-10 pb-4">
          <div className="flex items-center w-full mb-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search cart items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-amber-600 rounded px-3 py-2 pl-10 focus:ring-2 focus:ring-orange-700 text-amber-800 placeholder-amber-400"
              />
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
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-1 gap-6">
            {Array(4)
              .fill(0)
              .map((_, index) => (
                <div key={index} className="bg-white shadow-md rounded-lg p-5 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <img
              src="https://via.placeholder.com/200?text=No+Items"
              alt="No items"
              className="mx-auto mb-4"
            />
            <p className="text-amber-800 text-lg">Your cart is empty.</p>
            <button
              onClick={() => navigate('/customer/restaurants')}
              className="mt-4 px-4 py-2 bg-orange-700 text-white rounded hover:bg-orange-800 transition"
            >
              Browse Restaurants
            </button>

            {/* Favorite Restaurants */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-amber-800 mb-4">Favorite Restaurants</h2>
              {favoriteRestaurants.length === 0 ? (
                <p className="text-amber-800">No favorite restaurants found.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {favoriteRestaurants.map((resto) => (
                    <div
                      key={resto.pk}
                      className="bg-white shadow-md rounded-lg p-5 flex justify-between items-center"
                    >
                      <p className="text-amber-800 text-lg">{resto.name}</p>
                      <button
                        onClick={() => navigate(`/customer/restaurants/${resto.pk}`)}
                        className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900 transition"
                      >
                        Browse
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Favorite Orders */}
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-amber-800 mb-4">Favorite Orders</h2>
              {favoriteOrders.length === 0 ? (
                <p className="text-amber-800">No favorite orders found.</p>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  {favoriteOrders.map((order) => (
                    <div
                      key={order.pk}
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
                          onClick={() => handleReorder(order.pk)}
                          className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900 transition"
                        >
                          Reorder
                        </button>
                        <button
                          onClick={() => handleRemoveFromFavorites(order.pk)}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                          Remove from Favorites
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6">
              {filteredItems.map((item) => (
                <div
                  key={item.menu.pk}
                  className="bg-white shadow-md rounded-lg p-5 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-amber-800 text-lg">{item.menu.name}</p>
                      <p className="text-sm text-amber-600">
                        Price: ${item.menu.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleUpdateOrder(item.menu.pk, 'remove')}
                        className="bg-amber-800 text-white rounded w-8 h-8 flex items-center justify-center hover:bg-amber-900 transition"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.menu.pk, parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-12 text-center border border-amber-600 rounded px-2 py-1 text-amber-800 focus:ring-2 focus:ring-orange-700"
                      />
                      <button
                        onClick={() => handleUpdateOrder(item.menu.pk, 'add')}
                        className="bg-amber-800 text-white rounded w-8 h-8 flex items-center justify-center hover:bg-amber-900 transition"
                      >
                        +
                      </button>
                      <span className="text-amber-800 text-lg">
                        ${(item.menu.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Breakdown Footer */}
            <div className="max-w-2xl mx-auto sticky bottom-0 bg-orange-50 pt-4 pb-6 z-10">
              <div className="mb-2">
                <div className="flex justify-between text-amber-800">
                  <span>Subtotal:</span>
                  <span>${calculateSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-amber-800">
                  <span>Delivery Fee:</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
              </div>
              <div className="flex justify-between items-center mb-4 border-t border-amber-200 pt-4">
                <span className="text-amber-800 font-semibold text-lg">Total:</span>
                <span className="text-amber-800 font-bold text-lg">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>
              <button
                onClick={placeOrder}
                disabled={placingOrder}
                className="w-full bg-orange-700 text-white font-bold py-3 rounded-lg hover:bg-orange-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {placingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </>
        )}

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
};

export default ReviewCartPage;