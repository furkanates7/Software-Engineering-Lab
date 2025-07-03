import { Link } from 'react-router-dom';
import { Restaurant } from '../../types/NewRestaurant';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import { isRestaurantOpen } from '../../utils/restaurantUtils';

interface Props {
  restaurant: Restaurant;
}

interface RestaurantDTO {
  pk: number;
  name: string;
}

interface IsFavoriteResponse {
  message: string;
  status: string;
  data: boolean;
}

export function RestaurantCard({ restaurant }: Props) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const isOpen = isRestaurantOpen(restaurant);

  // Check if restaurant is favorited
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setIsLoading(false);
          return;
        }
        const response = await axios.get<IsFavoriteResponse>(
          `http://localhost:8080/api/customer/is-favorite/${restaurant.pk}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorited(response.data.data);
      } catch {
        toast.error('Failed to check if restaurant is favorite');
      } finally {
        setIsLoading(false);
      }
    };
    checkFavorite();
  }, [restaurant.pk]);

  const handleAddToFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to add to favorites');
        return;
      }
      const response = await axios.post<RestaurantDTO>(
        `http://localhost:8080/api/customer/add-to-favorite/${restaurant.pk}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Added ${response.data.name} to favorites`);
      setIsFavorited(true);
    } catch {
      toast.error('Failed to add restaurant to favorites');
    }
  };

  const handleRemoveFromFavorite = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to remove from favorites');
        return;
      }
      const response = await axios.post<RestaurantDTO>(
        `http://localhost:8080/api/customer/remove-from-favorite/${restaurant.pk}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Removed ${response.data.name} from favorites`);
      setIsFavorited(false);
    } catch {
      toast.error('Failed to remove restaurant from favorites');
    }
  };

  return (
    <div className={`w-full sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto ${isOpen ? 'bg-orange-50' : 'bg-gray-50'} rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out overflow-hidden`}>
      <Link
        to={`/customer/restaurants/${restaurant.pk}`}
        className="group block"
      >
        <div className="relative h-56 overflow-hidden rounded-t-2xl">
          <img
            src={restaurant.imageUrl || 'https://via.placeholder.com/150?text=No+Image'}
            alt={restaurant.name}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out border-b ${
              isOpen ? 'border-orange-200' : 'border-gray-300'
            }`}
          />
          {/* Open/Closed Status Badge */}
          <div
            className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-sm font-semibold ${
              isOpen
                ? 'bg-green-100 text-green-800 border border-green-200'
                : 'bg-red-100 text-red-800 border border-red-200'
            }`}
          >
            {isOpen ? 'Open' : 'Closed'}
          </div>
        </div>

        <div className="p-6 space-y-4">
          <h3 className={`text-2xl font-semibold truncate leading-tight ${isOpen ? 'text-orange-700' : 'text-gray-700'}`}>
            {restaurant.name}
          </h3>

          {/* Rating & Reviews */}
          {restaurant.rating && restaurant.numberOfRatings && (
            <div className="flex items-center space-x-2 text-gray-600 text-sm">
              <span className="flex items-center font-medium">
                ⭐ {restaurant.rating.toFixed(1)}
              </span>
              <span>({restaurant.numberOfRatings} reviews)</span>
            </div>
          )}

          <p className={`text-sm leading-relaxed line-clamp-2 ${isOpen ? 'text-orange-600' : 'text-gray-600'}`}>
            {restaurant.description}
          </p>

          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm ${isOpen ? 'text-orange-500' : 'text-gray-500'}`}>
            {restaurant.address && (
              <div className="flex items-center">
                <span className="mr-2 text-lg">📍</span>
                <span className="truncate">{restaurant.address}</span>
              </div>
            )}
            {restaurant.phoneNumber && (
              <div className="flex items-center">
                <span className="mr-2 text-lg">📞</span>
                <span>{restaurant.phoneNumber}</span>
              </div>
            )}
            {restaurant.foodType && (
              <div className="flex items-center">
                <span className="mr-2 text-lg">🍽️</span>
                <span>{restaurant.foodType}</span>
              </div>
            )}
            {restaurant.deliveryTime && (
              <div className="flex items-center">
                <span className="mr-2 text-lg">🚚</span>
                <span>{restaurant.deliveryTime} Mins</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {restaurant.deliveryFee && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                isOpen ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}>
                💸 Fee: {restaurant.deliveryFee} TL
              </span>
            )}
            {restaurant.minOrderAmount && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                isOpen ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                💰 Min: {restaurant.minOrderAmount} TL
              </span>
            )}
            {restaurant.maxOrderAmount && (
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                isOpen ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
              }`}>
                💳 Max: {restaurant.maxOrderAmount} TL
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Favorite Button */}
      <div className="px-6 pb-6 pt-2 flex justify-end">
        {isLoading ? (
          <button
            className="px-4 py-2 bg-gray-300 text-white rounded-md flex items-center space-x-2 cursor-not-allowed"
            disabled
          >
            <span>Loading...</span>
          </button>
        ) : isFavorited ? (
          <button
            onClick={handleRemoveFromFavorite}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 flex items-center space-x-2"
            title="Remove from Favorites"
            aria-label="Remove from Favorites"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>Remove from Favorites</span>
          </button>
        ) : (
          <button
            onClick={handleAddToFavorite}
            className={`px-4 py-2 text-white rounded-md focus:ring-2 focus:ring-offset-2 transition-colors duration-200 flex items-center space-x-2 ${
              isOpen 
                ? 'bg-amber-800 hover:bg-amber-900 focus:ring-amber-500'
                : 'bg-gray-600 hover:bg-gray-700 focus:ring-gray-500'
            }`}
            title="Add to Favorites"
            aria-label="Add to Favorites"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <span>Add to Favorites</span>
          </button>
        )}
      </div>
    </div>
  );
}