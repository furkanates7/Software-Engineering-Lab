import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

interface MenuItem { pk: number; name: string; price: number }
interface OrderItem { menu: MenuItem; quantity: number }
interface RestaurantDTO { pk: number; name: string }
interface CourierDTO { pk: number; name: string }
interface ReviewDTO { rating: number; reviewText: string }

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
  reviewText?: string;
  courierRated?: boolean;
  courierRating?: number;
  courierReviewText?: string;
  createdAt: string;
}

interface ApiResponse { message: string; status: number; data: OrderDTO[] }
interface ReviewApiResponse { message: string; status: number; data: ReviewDTO }

const ActiveOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('date-desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);
  const [favoriteOrders, setFavoriteOrders] = useState<Set<number>>(new Set());
  const [editingReview, setEditingReview] = useState<{ type: 'restaurant' | 'courier'; order: OrderDTO } | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const itemsPerPage = 6;
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const checkCourierReview = async (orderPk: number, courierPk: number): Promise<ReviewDTO | null> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication error');
      }
      const res = await axios.get<ReviewApiResponse>(
        `http://localhost:8080/api/couriers/check-review`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { orderPk, courierPk },
        }
      );
      if (res.data.status === 200 && res.data.data) {
        return res.data.data;
      }
      return null;
    } catch (err) {
      return null; // Treat errors (e.g., "Review not found") as no review
    }
  };

  const fetchActiveOrders = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication error');
      }

      const failed = searchParams.get('failed') === 'true';
      const old = searchParams.get('old') === 'true';
      let query = '';
      if (failed) {
        query = '?failed=true';
      } else if (old) {
        query = '?old=true';
      }

      const res = await axios.get<ApiResponse>(
        `http://localhost:8080/api/customer/get-active-orders${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.status !== 200) {
        throw new Error(res.data.message || 'Failed to load orders');
      }

      const list = res.data.data || [];
      // Fetch courier review for each order with a courier
      const ordersWithReviews = await Promise.all(
        list.map(async (order: OrderDTO) => {
          if (order.courier) {
            const review = await checkCourierReview(order.pk, order.courier.pk);
            return {
              ...order,
              courierRated: !!review,
              courierRating: review?.rating,
              courierReviewText: review?.reviewText,
              searchString: `${order.name || ''} ${order.restaurant.name} ${order.orderItems
                .map((item) => item.menu.name)
                .join(' ')}`,
            };
          }
          return {
            ...order,
            searchString: `${order.name || ''} ${order.restaurant.name} ${order.orderItems
              .map((item) => item.menu.name)
              .join(' ')}`,
          };
        })
      );

      setOrders(ordersWithReviews);
      applyFilterSort(ordersWithReviews, searchQuery, sortOption);

      const favoriteStatuses = await Promise.all(
        list.map(order =>
          axios.get<{ data: boolean }>(
            `http://localhost:8080/api/customer/is-favorite-order/${order.pk}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ).then(res => ({ pk: order.pk, isFavorite: res.data.data }))
        )
      );

      const favorites = new Set(
        favoriteStatuses
          .filter(status => status.isFavorite)
          .map(status => status.pk)
      );
      setFavoriteOrders(favorites);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load orders';
      setError(errorMessage);
      toast.error(errorMessage);
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
          o.orderItems.some(i => i.menu.name.toLowerCase().includes(q)) ||
          (o.reviewText && o.reviewText.toLowerCase().includes(q)) ||
          (o.courierReviewText && o.courierReviewText.toLowerCase().includes(q))
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

  const handleRateOrder = async (orderPk: number, rating: number, reviewText: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication error');
      }
      const res = await axios.post(
        `http://localhost:8080/api/order/rate-order/${orderPk}?rating=${rating}`,
        { reviewText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order rated successfully');
      setOrders(prev =>
        prev.map(o =>
          o.pk === orderPk ? { ...o, rated: true, rating, reviewText } : o
        )
      );
      setFilteredOrders(prev =>
        prev.map(o =>
          o.pk === orderPk ? { ...o, rated: true, rating, reviewText } : o
        )
      );
      setIsReviewModalOpen(false);
      setEditingReview(null);
    } catch {
      setError('Failed to rate order');
      toast.error('Failed to rate order');
    }
  };

  const handleRateCourier = async (
    orderPk: number,
    courierPk: number,
    rating: number,
    reviewText: string
  ) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication error');
      }
      await axios.post(
        `http://localhost:8080/api/couriers/rate`,
        { reviewText },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { orderPk, rating},
        }
      );
      toast.success('Courier rated successfully');
      setOrders(prev =>
        prev.map(o =>
          o.pk === orderPk
            ? { ...o, courierRated: true, courierRating: rating, courierReviewText: reviewText }
            : o
        )
      );
      setFilteredOrders(prev =>
        prev.map(o =>
          o.pk === orderPk
            ? { ...o, courierRated: true, courierRating: rating, courierReviewText: reviewText }
            : o
        )
      );
      setIsReviewModalOpen(false);
      setEditingReview(null);
    } catch {
      setError('Failed to rate courier');
      toast.error('Failed to rate courier');
    }
  };

  const handleReorder = async (orderPk: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication error');
      }
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

  const handleAddToFavorites = async (orderPk: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication error');
      }
      await axios.post(
        `http://localhost:8080/api/customer/add-to-favorite-orders/${orderPk}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order added to favorites');
      setFavoriteOrders(prev => new Set(Array.from(prev).concat(orderPk)));
    } catch {
      setError('Failed to add order to favorites');
      toast.error('Failed to add order to favorites');
    }
  };

  const handleRemoveFromFavorites = async (orderPk: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication error');
      }
      await axios.post(
        `http://localhost:8080/api/customer/remove-from-favorite-orders/${orderPk}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Order removed from favorites');
      setFavoriteOrders(prev => {
        const next = new Set(Array.from(prev));
        next.delete(orderPk);
        return next;
      });
    } catch {
      setError('Failed to remove order from favorites');
      toast.error('Failed to remove order from favorites');
    }
  };

  const openReviewModal = async (order: OrderDTO, type: 'restaurant' | 'courier') => {
    if (type === 'courier' && order.courier) {
      const review = await checkCourierReview(order.pk, order.courier.pk);
      setEditingReview({
        type,
        order: {
          ...order,
          courierRated: !!review,
          courierRating: review?.rating ?? order.courierRating,
          courierReviewText: review?.reviewText ?? order.courierReviewText,
        },
      });
    } else {
      setEditingReview({ type, order: { ...order } });
    }
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setEditingReview(null);
    setIsReviewModalOpen(false);
  };

  const handleReviewChange = (field: 'reviewText' | 'rating', value: string | number) => {
    if (editingReview) {
      if (editingReview.type === 'restaurant') {
        if (field === 'rating') {
          setEditingReview({
            ...editingReview,
            order: {
              ...editingReview.order,
              rating: value as number,
            },
          });
        } else if (field === 'reviewText') {
          setEditingReview({
            ...editingReview,
            order: {
              ...editingReview.order,
              reviewText: value as string,
            },
          });
        }
      } else if (editingReview.type === 'courier') {
        if (field === 'rating') {
          setEditingReview({
            ...editingReview,
            order: {
              ...editingReview.order,
              courierRating: value as number,
            },
          });
        } else if (field === 'reviewText') {
          setEditingReview({
            ...editingReview,
            order: {
              ...editingReview.order,
              courierReviewText: value as string,
            },
          });
        }
      }
    }
  };

  useEffect(() => { fetchActiveOrders(); }, [searchParams]);
  useEffect(() => { applyFilterSort(orders, searchQuery, sortOption); }, [orders, searchQuery, sortOption]);

  const paginated = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const pageTitle = searchParams.get('failed') === 'true'
    ? 'Failed Orders'
    : searchParams.get('old') === 'true'
      ? 'Past Orders'
      : 'Your Active Orders';
  const emptyMessage = searchParams.get('failed') === 'true'
    ? 'No failed orders found.'
    : searchParams.get('old') === 'true'
      ? 'No past orders found.'
      : 'You have no active orders.';

  return (
    <>
      <div className="min-h-screen bg-orange-50">
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold text-red-700 mb-6">{pageTitle}</h1>

          <div className="sticky top-0 bg-orange-50 z-10 pb-4">
            <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
              <input
                type="text"
                placeholder="Search orders or reviews..."
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
              <p className="text-amber-800 text-lg">{emptyMessage}</p>
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
                  {searchParams.get('old') === 'true' && (
                    <div className="mt-4 flex flex-col space-y-4">
                      {!order.rated ? (
                        <div className="flex items-center">
                          <span className="mr-2">Rate Restaurant:</span>
                          {[1, 2, 3, 4, 5].map(n => (
                            <button
                              key={n}
                              onClick={e => {
                                e.stopPropagation();
                                openReviewModal({ ...order, rating: n, reviewText: '' }, 'restaurant');
                              }}
                              className="text-2xl transform hover:scale-125"
                            >
                              ☆
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="mr-2">Restaurant rating:</span>
                          {[1, 2, 3, 4, 5].map(n => (
                            <span
                              key={n}
                              className={`text-2xl ${n <= (order.rating ?? 0) ? 'text-yellow-500' : 'text-gray-300'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      )}
                      {order.courier && !order.courierRated ? (
                        <div className="flex items-center">
                          <span className="mr-2">Rate Courier:</span>
                          {[1, 2, 3, 4, 5].map(n => (
                            <button
                              key={n}
                              onClick={e => {
                                e.stopPropagation();
                                openReviewModal({ ...order, courierRating: n, courierReviewText: '' }, 'courier');
                              }}
                              className="text-2xl transform hover:scale-125"
                            >
                              ☆
                            </button>
                          ))}
                        </div>
                      ) : order.courier && order.courierRated ? (
                        <div className="flex items-center">
                          <span className="mr-2">Courier rating:</span>
                          {[1, 2, 3, 4, 5].map(n => (
                            <span
                              key={n}
                              className={`text-2xl ${n <= (order.courierRating ?? 0) ? 'text-yellow-500' : 'text-gray-300'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      ) : null}
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          handleReorder(order.pk);
                        }}
                        className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900"
                      >
                        Reorder
                      </button>
                      {favoriteOrders.has(order.pk) ? (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleRemoveFromFavorites(order.pk);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                        >
                          Remove from Favorites
                        </button>
                      ) : (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            handleAddToFavorites(order.pk);
                          }}
                          className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900"
                        >
                          Add to Favorites
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {filteredOrders.length > itemsPerPage && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-amber-800 text-white rounded disabled:bg-gray-300"
              >
                Prev
              </button>
              <span>Page {currentPage} of {Math.ceil(filteredOrders.length / itemsPerPage)}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(filteredOrders.length / itemsPerPage)))}
                disabled={currentPage === Math.ceil(filteredOrders.length / itemsPerPage)}
                className="px-3 py-1 bg-amber-800 text-white rounded disabled:bg-gray-300"
              >
                Next
              </button>
            </div>
          )}

          <ToastContainer position="top-right" autoClose={3000} />
        </div>
      </div>

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
            >
              ×
            </button>
            <h2 className="text-2xl font-bold text-red-700 mb-4">Order #{selectedOrder.pk} Details</h2>
            {selectedOrder.name && <p><strong>Name:</strong> {selectedOrder.name}</p>}
            <p><strong>Restaurant:</strong> {selectedOrder.restaurant.name}</p>
            <p><strong>Status:</strong> {selectedOrder.status}</p>
            <p><strong>Courier Accepted:</strong> {selectedOrder.courierAssignmentAccepted ? 'Yes' : 'No'}</p>
            {selectedOrder.courier && <p><strong>Courier:</strong> {selectedOrder.courier.name}</p>}
            <p><strong>Version:</strong> {selectedOrder.version}</p>
            <p><strong>Total Price:</strong> ${selectedOrder.totalPrice.toFixed(2)}</p>
            <h3 className="mt-4 font-semibold text-amber-800">Items:</h3>
            <ul className="list-disc list-inside mb-4">
              {selectedOrder.orderItems.map((i: OrderItem) => (
                <li key={i.menu.pk}>
                  {i.menu.name} × {i.quantity} @ ${i.menu.price.toFixed(2)}
                </li>
              ))}
            </ul>
            <p>
              <strong>Restaurant Rated:</strong> {selectedOrder.rated ? 'Yes' : 'No'}
              {selectedOrder.rated && selectedOrder.rating != null && (
                <> (Your rating: {selectedOrder.rating} ⭐)</>
              )}
            </p>
            {selectedOrder.rated && selectedOrder.reviewText && (
              <p>
                <strong>Restaurant Review:</strong> {selectedOrder.reviewText}
              </p>
            )}
            {selectedOrder.courier && (
              <p>
                <strong>Courier Rated:</strong> {selectedOrder.courierRated ? 'Yes' : 'No'}
                {selectedOrder.courierRated && selectedOrder.courierRating != null && (
                  <> (Your rating: {selectedOrder.courierRating} ⭐)</>
                )}
              </p>
            )}
            {selectedOrder.courier && selectedOrder.courierRated && selectedOrder.courierReviewText && (
              <p>
                <strong>Courier Review:</strong> {selectedOrder.courierReviewText}
              </p>
            )}
          </div>
        </div>
      )}

      {isReviewModalOpen && editingReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h2 className="text-2xl font-bold text-red-700 mb-4">
              Rate {editingReview.type === 'restaurant' ? 'Restaurant' : 'Courier'}
            </h2>
            <div className="mb-4">
              <label className="block text-amber-800 mb-2">Review Text</label>
              <textarea
                value={
                  editingReview.type === 'restaurant'
                    ? editingReview.order.reviewText || ''
                    : editingReview.order.courierReviewText || ''
                }
                onChange={e => handleReviewChange('reviewText', e.target.value)}
                className="w-full border border-amber-600 rounded px-3 py-2 focus:ring-2 focus:ring-orange-700"
                rows={4}
                placeholder="Write your review here..."
              />
            </div>
            <div className="mb-4">
              <label className="block text-amber-800 mb-2">Rating (1-5)</label>
              <select
                value={
                  editingReview.type === 'restaurant'
                    ? editingReview.order.rating || 1
                    : editingReview.order.courierRating || 1
                }
                onChange={e => handleReviewChange('rating', parseInt(e.target.value))}
                className="w-full border border-amber-600 rounded px-3 py-2 focus:ring-2 focus:ring-orange-700"
              >
                {[1, 2, 3, 4, 5].map(num => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  if (editingReview.type === 'restaurant') {
                    handleRateOrder(
                      editingReview.order.pk,
                      editingReview.order.rating ?? 1,
                      editingReview.order.reviewText ?? ''
                    );
                  } else if (editingReview.order.courier) {
                    handleRateCourier(
                      editingReview.order.pk,
                      editingReview.order.courier.pk,
                      editingReview.order.courierRating ?? 1,
                      editingReview.order.courierReviewText ?? ''
                    );
                  } else {
                    toast.error('Cannot rate courier: no courier assigned');
                  }
                }}
                className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900"
                disabled={
                  editingReview.type === 'restaurant'
                    ? !editingReview.order.reviewText
                    : !editingReview.order.courierReviewText
                }
              >
                Submit
              </button>
              <button
                onClick={closeReviewModal}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActiveOrdersPage;