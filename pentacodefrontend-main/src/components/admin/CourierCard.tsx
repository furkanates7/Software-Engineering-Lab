import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CourierDTO } from '../../types/Courier';
import { toast } from 'react-toastify';

interface CourierCardProps {
  courier: CourierDTO;
  onManage: (courier: CourierDTO) => void;
  onBan: (pk: number) => Promise<void>;
  onUnban: (pk: number) => Promise<void>;
  // onStatusUpdate is handled by edit now, so not directly needed here for individual toggles
  // If you still want separate quick toggles on the card, it can be added back.
}

const CourierCard: React.FC<CourierCardProps> = ({
  courier,
  onManage,
  onBan,
  onUnban,
}) => {
  const [isBanned, setIsBanned] = useState<boolean | null>(null);
  // isOnline and isAvailable will now be managed in the modal or via onManage -> edit
  // They are part of the courier object, so no separate state here needed.

  useEffect(() => {
    const fetchBanStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token not found for fetching ban status for courier ' + courier.pk);
          setIsBanned(false);
          return;
        }
        const res = await axios.get<{ data: boolean }>(
          `http://localhost:8080/api/admin/getban/${courier.pk}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsBanned(res.data.data);
      } catch (error) {
        console.error('Error fetching ban status for courier ' + courier.pk + ':', error);
        setIsBanned(false);
      }
    };
    if (courier.pk) {
      fetchBanStatus();
    }
  }, [courier.pk]);

  const handleBanToggle = async () => {
    try {
      if (isBanned) {
        await onUnban(courier.pk);
        setIsBanned(false);
        toast.success(`${courier.name} has been unbanned.`);
      } else {
        await onBan(courier.pk);
        setIsBanned(true);
        toast.success(`${courier.name} has been banned.`);
      }
    } catch (error) {
      toast.error(`Failed to update ban status for ${courier.name}.`);
      console.error('Ban toggle error for courier ' + courier.pk + ':', error);
    }
  };

  const defaultProfilePic = 'https://via.placeholder.com/100/FFA500/FFFFFF?Text=Courier';

  if (isBanned === null) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center justify-center min-h-[180px]">
        <p className="text-orange-600 animate-pulse">Checking status...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md flex flex-col">
      <div className="flex-grow mb-3 flex flex-col items-center text-center">
        <img
          src={courier.profilePictureUrl || defaultProfilePic}
          alt={courier.name}
          className="w-20 h-20 rounded-full object-cover mb-2 border-2 border-orange-200"
          onError={(e) => (e.currentTarget.src = defaultProfilePic)}
        />
        <h3 className="text-md font-semibold text-orange-800 truncate w-full" title={courier.name}>{courier.name || 'N/A'}</h3>
        <p className="text-xs text-orange-600 truncate w-full" title={courier.email}>{courier.email || 'No email'}</p>
        <p className="text-xs text-gray-500 truncate w-full" title={courier.phoneNumber}>{courier.phoneNumber || 'No phone'}</p>
        <div className="mt-1 flex space-x-2 text-xs">
            <span className={`px-1.5 py-0.5 rounded-full ${courier.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {courier.isOnline ? 'Online' : 'Offline'}
            </span>
            <span className={`px-1.5 py-0.5 rounded-full ${courier.isAvailable ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'}`}>
                {courier.isAvailable ? 'Available' : 'Unavailable'}
            </span>
        </div>
      </div>
      <div className="flex gap-2 border-t border-orange-100 pt-3">
        <button
          onClick={() => onManage(courier)}
          className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors"
        >
          Manage
        </button>
        <button
          onClick={handleBanToggle}
          className={`flex-grow-0 px-3 py-1.5 text-white text-xs rounded-md transition-colors ${
            isBanned ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {isBanned ? 'Unban' : 'Ban'}
        </button>
        {/* Delete button can be added if there's a delete courier functionality */}
      </div>
    </div>
  );
};

export default CourierCard;