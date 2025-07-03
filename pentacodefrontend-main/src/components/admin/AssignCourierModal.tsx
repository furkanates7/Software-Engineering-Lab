// components/admin/AssignCourierModal.tsx
import React, { useState } from 'react';
import { OrderDTO } from '../../types/Order';
import { CourierDTO } from '../../types/Courier';

interface AssignCourierModalProps {
  orderId: number;
  orders: OrderDTO[];
  couriers: CourierDTO[];
  onAssign: (orderId: number, courierId: number) => void;
  onUnassign: (orderId: number) => void;
  onClose: () => void;
}

export const AssignCourierModal: React.FC<AssignCourierModalProps> = ({
  orderId,
  orders,
  couriers,
  onAssign,
  onUnassign,
  onClose,
}) => {
  const [courierSearch, setCourierSearch] = useState('');
  
  const currentOrder = orders.find(o => o.pk === orderId);
  const currentCourierId = currentOrder?.courier?.pk;

  const filteredCouriers = couriers.filter(c => 
    c.name.toLowerCase().includes(courierSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full">
        <h3 className="text-lg font-bold mb-4">Manage Courier for Order #{orderId}</h3>
        
        <input
          type="text"
          placeholder="Search couriers..."
          className="border rounded-lg p-2 w-full mb-4"
          value={courierSearch}
          onChange={(e) => setCourierSearch(e.target.value)}
        />
        
        <div className="max-h-64 overflow-y-auto">
          {filteredCouriers.map((courier) => (
            <CourierItem
              key={courier.pk}
              courier={courier}
              isAssigned={currentCourierId === courier.pk}
              onAssign={() => onAssign(orderId, courier.pk)}
            />
          ))}
        </div>
        
        <div className="mt-4 flex justify-between">
          {currentCourierId && (
            <button
              className="text-red-600 hover:underline"
              onClick={() => onUnassign(orderId)}
            >
              Unassign Courier
            </button>
          )}
          <button
            className="text-gray-600 hover:underline ml-auto"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface CourierItemProps {
  courier: CourierDTO;
  isAssigned: boolean;
  onAssign: () => void;
}

const CourierItem: React.FC<CourierItemProps> = ({ courier, isAssigned, onAssign }) => {
  return (
    <div className="flex justify-between items-center py-2 border-b">
      <span>
        {courier.name} ({courier.phoneNumber})
      </span>
      <button
        className={`px-3 py-1 rounded ${
          isAssigned ? 'bg-green-500 text-white' : 'bg-orange-700 text-white'
        }`}
        onClick={onAssign}
        disabled={isAssigned}
      >
        {isAssigned ? 'Assigned' : 'Assign'}
      </button>
    </div>
  );
};