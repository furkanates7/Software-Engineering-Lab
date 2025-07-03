import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { SkeletonLoader } from '../../components/restaurants/SkeletonLoader';

interface RestaurantDTO {
  id: number;
  name: string;
  imageUrl?: string;
}

interface CourierDTO {
  id: number;
  name: string;
}

interface Review {
  pk: number;
  reviewText: string;
  rating: number;
  restaurant?: RestaurantDTO;
  courier?: CourierDTO;
}

export default function ReviewPage() {
  const [searchParams] = useSearchParams();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemsPerPage = 6;

  const token = localStorage.getItem('token');
  const courier = searchParams.get('courier') === 'true' ? true : searchParams.get('courier') === 'false' ? false : "null";

  // Fetch all reviews based on courier parameter
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8080/api/order/get-all-reviews', {
          headers: { Authorization: `Bearer ${token}` },
          params: { courier: courier },
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
  }, [token, courier]);

  // Filter reviews based on searchQuery
  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const filtered = reviews.filter((review) =>
      review.reviewText?.toLowerCase().includes(lowerQuery) ||
      review.restaurant?.name?.toLowerCase().includes(lowerQuery) ||
      review.courier?.name?.toLowerCase().includes(lowerQuery)
    );
    setFilteredReviews(filtered);
    setCurrentPage(1);
  }, [searchQuery, reviews]);

  // Delete a review with confirmation
  const handleDelete = async (pk: number) => {
    if (!pk || isNaN(pk)) {
      console.error('Invalid review pk in handleDelete:', pk);
      toast.error('Invalid review ID.');
      return;
    }
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        const response = await axios.post(
          'http://localhost:8080/api/delete-review',
          {},
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { reviewPk: pk },
          }
        );
        if (response.status === 200) {
          setReviews((prev) => prev.filter((review) => review.pk !== pk));
          setFilteredReviews((prev) => prev.filter((review) => review.pk !== pk));
          toast.success('Review deleted successfully.');
        }
      } catch (err: any) {
        console.error('Error deleting review with pk:', pk, err);
        toast.error(err.response?.data || 'Failed to delete review.');
      }
    }
  };

  // Update a review
  const handleUpdate = async () => {
    if (!editingReview || !editingReview.pk || isNaN(editingReview.pk)) {
      console.error('Invalid editingReview in handleUpdate:', editingReview);
      toast.error('Invalid review ID or data.');
      setEditingReview(null);
      setIsModalOpen(false);
      return;
    }
    try {
      console.log('Updating review with pk:', editingReview.pk, editingReview);
      const response = await axios.post(
        'http://localhost:8080/api/update-review',
        {
          reviewText: editingReview.reviewText,
          rating: editingReview.rating,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { reviewPk: editingReview.pk },
        }
      );
      const updatedReview: Review = response.data.data;
      if (!updatedReview.pk || isNaN(updatedReview.pk)) {
        console.error('Invalid pk in updated review response:', updatedReview);
        throw new Error('Invalid review ID in response.');
      }
      console.log('Updated review response:', updatedReview);
      setReviews((prev) =>
        prev.map((review) =>
          review.pk === editingReview.pk ? { ...updatedReview } : review
        )
      );
      setFilteredReviews((prev) =>
        prev.map((review) =>
          review.pk === editingReview.pk ? { ...updatedReview } : review
        )
      );
      setEditingReview(null);
      setIsModalOpen(false);
      toast.success('Review updated successfully.');
    } catch (err: any) {
      console.error('Error updating review with pk:', editingReview?.pk, err);
      toast.error(err.response?.data || 'Failed to update review.');
      setEditingReview(null);
      setIsModalOpen(false);
    }
  };

  // Open edit modal
  const openEditModal = (review: Review) => {
    if (!review.pk || isNaN(review.pk)) {
      console.error('Invalid review pk in openEditModal:', review);
      toast.error('Invalid review ID.');
      return;
    }
    console.log('Opening edit modal for review:', review);
    setEditingReview({ ...review });
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    console.log('Closing modal, resetting editingReview');
    setEditingReview(null);
    setIsModalOpen(false);
  };

  // Handle input changes in modal
  const handleEditChange = (field: keyof Review, value: string | number) => {
    if (editingReview) {
      console.log('Editing review field:', field, value);
      setEditingReview({ ...editingReview, [field]: value });
    }
  };

  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="min-h-screen bg-orange-50">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-red-700 mb-6">
          {courier === true ? 'Courier Reviews' : 'All Reviews'}
        </h1>

        {/* Search Bar */}
        <div className="sticky top-0 bg-orange-50 z-10 pb-4">
          <div className="flex items-center w-full md:w-64 mb-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Search reviews, restaurants, or couriers..."
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
          <SkeletonLoader />
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
            {/* Review Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-amber-600 rounded">
                <thead>
                  <tr className="bg-amber-100">
                    <th className="py-3 px-6 border-b text-amber-800 text-left w-1/5">
                      Restaurant
                    </th>
                    <th className="py-3 px-6 border-b text-amber-800 text-left w-1/5">
                      Courier
                    </th>
                    <th className="py-3 px-6 border-b text-amber-800 text-left w-2/5">
                      Review Text
                    </th>
                    <th className="py-3 px-6 border-b text-amber-800 text-center w-1/5">
                      Rating
                    </th>
                    <th className="py-3 px-6 border-b text-amber-800 text-center w-1/5">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedReviews.map((review) => (
                    <tr key={review.pk} className="hover:bg-orange-100">
                      <td className="py-3 px-6 border-b text-amber-800 align-middle">
                        {review.restaurant?.name || 'N/A'}
                      </td>
                      <td className="py-3 px-6 border-b text-amber-800 align-middle">
                        {review.courier?.name || 'N/A'}
                      </td>
                      <td className="py-3 px-6 border-b text-amber-800 align-middle">
                        {review.reviewText}
                      </td>
                      <td className="py-3 px-6 border-b text-amber-800 text-center align-middle">
                        {review.rating}
                      </td>
                      <td className="py-3 px-6 border-b text-center align-middle">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => openEditModal(review)}
                            className="px-3 py-1 bg-amber-800 text-white rounded hover:bg-amber-900"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(review.pk)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Edit Modal */}
            {isModalOpen && editingReview && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
                  <h2 className="text-2xl font-bold text-red-700 mb-4">Edit Review</h2>
                  <div className="mb-4">
                    <label className="block text-amber-800 mb-2">Context</label>
                    <p className="text-sm text-amber-800">
                      Restaurant: {editingReview.restaurant?.name || 'N/A'}
                    </p>
                    <p className="text-sm text-amber-800">
                      Courier: {editingReview.courier?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="mb-4">
                    <label className="block text-amber-800 mb-2">Review Text</label>
                    <textarea
                      value={editingReview.reviewText || ''}
                      onChange={(e) => handleEditChange('reviewText', e.target.value)}
                      className="w-full border border-amber-600 rounded px-3 py-2 focus:ring-2 focus:ring-orange-700"
                      rows={4}
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-amber-800 mb-2">Rating (1-5)</label>
                    <select
                      value={editingReview.rating || 1}
                      onChange={(e) => handleEditChange('rating', parseInt(e.target.value))}
                      className="w-full border border-amber-600 rounded px-3 py-2 focus:ring-2 focus:ring-orange-700"
                    >
                      {[1, 2, 3, 4, 5].map((num) => (
                        <option key={num} value={num}>
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-amber-800 text-white rounded hover:bg-amber-900"
                      disabled={!editingReview.reviewText}
                    >
                      Save
                    </button>
                    <button
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

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
