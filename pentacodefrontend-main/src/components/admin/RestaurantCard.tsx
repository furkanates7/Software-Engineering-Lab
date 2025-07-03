// src/components/admin/RestaurantCard.tsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Restaurant } from '../../types/Restaurant';
import { toast } from 'react-toastify';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onManage: (restaurant: Restaurant) => void; // Triggers the modal in parent
  onDelete: (restaurantId: number) => Promise<void>;
  onSuspend: (restaurantId: number) => Promise<void>;
  onUnsuspend: (restaurantId: number) => Promise<void>;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({
  restaurant,
  onManage,
  onDelete,
  onSuspend,
  onUnsuspend,
}) => {
  const [isBanned, setIsBanned] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchBanStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token not found for fetching ban status');
          setIsBanned(false);
          return;
        }
        const res = await axios.get<{ data: boolean }>(
          `http://localhost:8080/api/admin/getban/${restaurant.pk}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsBanned(res.data.data);
      } catch (error) {
        console.error('Error fetching ban status for ' + restaurant.name + ':', error);
        setIsBanned(false);
      }
    };
    fetchBanStatus();
  }, [restaurant.pk, restaurant.name]);

  const handleBanToggle = async () => {
    try {
      if (isBanned) {
        await onUnsuspend(restaurant.pk);
        setIsBanned(false);
        toast.success(`${restaurant.name} has been unbanned.`);
      } else {
        await onSuspend(restaurant.pk);
        setIsBanned(true);
        toast.success(`${restaurant.name} has been banned.`);
      }
    } catch (error) {
      toast.error(`Failed to update ban status for ${restaurant.name}.`);
      console.error('Ban toggle error:', error);
    }
  };
  
  const defaultImageUrl = 'https://as2.ftcdn.net/v2/jpg/01/12/60/35/1000_F_112603585_SNY1XNd6JJgMxR8DKFJGTvWQ6STPPKEi.jpg';

  if (isBanned === null) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-lg flex justify-center items-center min-h-[200px]">
        <p className="text-orange-600 animate-pulse">Checking status...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col justify-between">
      <div>
        <img
          src={restaurant.imageUrl || defaultImageUrl}
          alt={restaurant.name}
          className="w-full h-48 object-cover"
          onError={(e) => (e.currentTarget.src = defaultImageUrl)}
        />
        <div className="p-4">
          <h3 className="text-xl font-bold text-orange-800 mb-1 truncate" title={restaurant.name}>{restaurant.name}</h3>
          <p className="text-sm text-orange-600 mb-1 truncate" title={restaurant.foodType || ''}>{restaurant.foodType || 'Variety of foods'}</p>
          <p className="text-xs text-gray-500 truncate" title={restaurant.address || ''}>{restaurant.address || 'Address not available'}</p>
        </div>
      </div>

      <div className="px-4 pb-4 pt-3 border-t border-orange-100 flex flex-wrap gap-2">
        <button
          onClick={() => onManage(restaurant)}
          className="flex-1 px-3 py-2 bg-orange-500 text-white text-sm rounded-md hover:bg-orange-600 transition-colors min-w-[80px]"
        >
          Manage
        </button>
        <button
          onClick={handleBanToggle}
          className={`flex-1 px-3 py-2 text-white text-sm rounded-md transition-colors min-w-[70px] ${
            isBanned ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600 text-orange-900'
          }`}
        >
          {isBanned ? 'Unban' : 'Ban'}
        </button>
        <button
          onClick={() => onDelete(restaurant.pk)}
          className="flex-1 px-3 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors min-w-[70px]"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default RestaurantCard;