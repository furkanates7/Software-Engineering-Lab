import { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { SkeletonLoader } from '../components/restaurants/SkeletonLoader';

interface RestaurantDTO {
  id: number;
  name: string;
  imageUrl?: string;
}

interface CourierDTO {
  id: number;
  name: string;
}

interface OrderDTO {
  id: number;
}

interface CustomerDTO {
  pk: number;
  name: string;
  address: string;
  longitude: number;
  latitude: number;
  phoneNumber: string;
  email: string;
  order?: OrderDTO;
  orderHistory?: OrderDTO[];
  favoriteOrders?: OrderDTO[];
}

interface Review {
  pk: number;
  reviewText: string;
  rating: number;
  restaurant?: RestaurantDTO;
  courier?: CourierDTO;
  customer?: CustomerDTO;
}

export default function GeneralReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const token = localStorage.getItem('token');

  // Fetch all reviews
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/order/get-reviews', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const fetchedReviews = Array.isArray(response.data.data) ? response.data.data : [];
        console.log('Fetched reviews:', fetchedReviews);
        setReviews(fetchedReviews);
        setFilteredReviews(fetchedReviews);
        setCurrentPage(1);
      } catch (err) {
        console.error('Error loading reviews:', err);
        setError('Failed to load reviews.');
        toast.error('Failed to load reviews.');
        setReviews([]);
        setFilteredReviews([]);
      } finally {
        setLoading(false);
      }
    };
    loadReviews();
  }, [token]);

  // Filter reviews based on searchQuery
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = reviews.filter((review) =>
      review.reviewText?.toLowerCase().includes(lowerQuery) ||
      review.customer?.name?.toLowerCase().includes(lowerQuery) ||
      review.restaurant?.name?.toLowerCase().includes(lowerQuery) ||
      review.courier?.name?.toLowerCase().includes(lowerQuery)
    );
    setFilteredReviews(filtered);
    setCurrentPage(1);
  }, [searchQuery, reviews]);

  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-red-700 mb-6">Customer Reviews</h1>

        {/* Search Bar */}
        <div className="sticky top-0 bg-orange-50 z-10 pb-4">
          <div className="flex items-center w-full md:w-64 mb-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search reviews, customers, restaurants, or couriers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-amber-600 rounded px-3 py-2 pl-10 focus:ring-2 focus:ring-orange-700"
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <SkeletonLoader key={index} />
            ))}
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12">
            <img
              src="https://via.placeholder.com/200?text=No+Reviews"
              alt="No reviews"
              className="mx-auto mb-4"
            />
            <p className="text-amber-800 text-lg">No reviews found.</p>
          </div>
        ) : (
          <>
            {/* Review Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedReviews.map((review) => (
                <div
                  key={review.pk}
                  className="bg-white border border-amber-600 rounded-lg shadow-lg p-6 hover:bg-orange-100 transition"
                >
                  <h2 className="text-lg font-semibold text-amber-800 mb-2">
                    Review #{review.pk}
                  </h2>
                  <div className="mb-4">
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">Customer:</span> {review.customer?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">Email:</span> {review.customer?.email || 'N/A'}
                    </p>
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">Phone:</span> {review.customer?.phoneNumber || 'N/A'}
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">Restaurant:</span> {review.restaurant?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">Courier:</span> {review.courier?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">Review:</span> {review.reviewText || 'N/A'}
                    </p>
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">Rating:</span> {review.rating}/5
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-6">
              <p className="text-amber-800">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, filteredReviews.length)} of{' '}
                {filteredReviews.length} reviews
              </p>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-amber-800 text-white rounded disabled:bg-gray-300"
                >
                  Previous
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, Math.ceil(filteredReviews.length / itemsPerPage))
                    )
                  }
                  disabled={currentPage === Math.ceil(filteredReviews.length / itemsPerPage)}
                  className="px-3 py-1 bg-amber-800 text-white rounded disabled:bg-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </div>
  );
}