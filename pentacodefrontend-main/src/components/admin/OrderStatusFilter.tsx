// components/admin/OrderStatusFilter.tsx
import React from 'react';
import { OrderStatusEnum } from '../../types/Order';

interface OrderStatusFilterProps {
  selectedStatuses: string[];
  setSelectedStatuses: (statuses: string[]) => void;
}

export const OrderStatusFilter: React.FC<OrderStatusFilterProps> = ({ 
  selectedStatuses, 
  setSelectedStatuses 
}) => {
  const toggleStatus = (status: string) => {
    setSelectedStatuses(
      selectedStatuses.includes(status)
        ? selectedStatuses.filter((s) => s !== status)
        : [...selectedStatuses, status]
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-bold mb-2">Filter by Status</h3>
      <div className="space-y-2">
        {Object.values(OrderStatusEnum).map((status) => (
          <label key={status} className="flex items-center">
            <input
              type="checkbox"
              checked={selectedStatuses.includes(status)}
              onChange={() => toggleStatus(status)}
              className="mr-2"
            />
            {status}
          </label>
        ))}
      </div>
    </div>
  );
};