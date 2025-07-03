import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Customer } from '../../types/Customer';
import { toast } from 'react-toastify';

interface CustomerCardProps {
  customer: Customer;
  onManage: (customer: Customer) => void; // Triggers the modal in parent
  onBan: (pk: number) => Promise<void>;
  onUnban: (pk: number) => Promise<void>;
  onDelete: (pk: number) => Promise<void>;
}

const CustomerCard: React.FC<CustomerCardProps> = ({
  customer,
  onManage,
  onBan,
  onUnban,
  onDelete,
}) => {
  const [isBanned, setIsBanned] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchBanStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('Token not found for fetching ban status for customer ' + customer.pk);
          setIsBanned(false); // Default to not banned
          return;
        }
        const res = await axios.get<{ data: boolean }>(
          `http://localhost:8080/api/admin/getban/${customer.pk}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsBanned(res.data.data);
      } catch (error) {
        console.error('Error fetching ban status for customer ' + customer.pk + ':', error);
        setIsBanned(false); // Default if API call fails
      }
    };
    if (customer.pk) { // Ensure pk is available
        fetchBanStatus();
    }
  }, [customer.pk]);

  const handleBanToggle = async () => {
    try {
      if (isBanned) {
        await onUnban(customer.pk);
        setIsBanned(false);
        toast.success(`${customer.name} has been unbanned.`);
      } else {
        await onBan(customer.pk);
        setIsBanned(true);
        toast.success(`${customer.name} has been banned.`);
      }
    } catch (error) {
      toast.error(`Failed to update ban status for ${customer.name}.`);
      console.error('Ban toggle error for customer ' + customer.pk + ':', error);
    }
  };

  if (isBanned === null) {
    return (
      <div className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center min-h-[100px]">
        <p className="text-orange-600 animate-pulse">Checking status...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-md">
      <div className="mb-3">
        <h3 className="text-lg font-semibold text-orange-800 truncate" title={customer.name}>{customer.name || 'N/A'}</h3>
        <p className="text-sm text-orange-600 truncate" title={customer.email}>{customer.email || 'No email'}</p>
        <p className="text-xs text-gray-500 truncate" title={customer.phoneNumber}>{customer.phoneNumber || 'No phone'}</p>
        <p className="text-xs text-gray-500 truncate" title={customer.address}>{customer.address || 'No address'}</p>
      </div>
      <div className="flex flex-wrap gap-2 border-t border-orange-100 pt-3">
        <button
          onClick={() => onManage(customer)}
          className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors min-w-[70px]"
        >
          Manage
        </button>
        <button
          onClick={handleBanToggle}
          className={`flex-1 px-3 py-1.5 text-white text-xs rounded-md transition-colors min-w-[60px] ${
            isBanned ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {isBanned ? 'Unban' : 'Ban'}
        </button>
        <button
          onClick={() => onDelete(customer.pk)}
          className="flex-1 px-3 py-1.5 bg-gray-700 text-white text-xs rounded-md hover:bg-gray-800 transition-colors min-w-[60px]"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default CustomerCard;