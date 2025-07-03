// components/restaurant/UpdateOrderStatusModal.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { OrderDTO, OrderStatusEnum } from '../../types/Order';
import { CourierDTO } from '../../types/Courier';

interface UpdateOrderStatusModalProps {
  orderId: number;
  orders: OrderDTO[];
  onUpdateStatus: (orderId: number, newStatus: string) => void;
  onAssignCourier: (orderId: number, courierId: number) => void;
  onClose: () => void;
}

export const UpdateOrderStatusModal: React.FC<UpdateOrderStatusModalProps> = ({
  orderId,
  orders,
  onUpdateStatus,
  onAssignCourier,
  onClose,
}) => {
  const [couriers, setCouriers] = useState<CourierDTO[]>([]);
  const [courierSearch, setCourierSearch] = useState('');
  const [showCourierSection, setShowCourierSection] = useState(false);
  const [loadingCouriers, setLoadingCouriers] = useState(false);
  
  const currentOrder = orders.find(o => o.pk === orderId);
    // Load available couriers if order status is READY_FOR_PICKUP
    useEffect(() => {
        if (currentOrder?.status === OrderStatusEnum.READY_FOR_PICKUP) {
            setShowCourierSection(true);
            fetchAvailableCouriers();
        } else {
            setShowCourierSection(false);
        }
        }, [currentOrder?.status]);
  if (!currentOrder) {
    return null;
  }



  const fetchAvailableCouriers = async () => {
    try {
      setLoadingCouriers(true);
      const response = await axios.get('http://localhost:8080/api/couriers/available',
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        }
      );
      setCouriers(response.data.data);
    } catch (err) {
      console.error('Failed to load couriers:', err);
    } finally {
      setLoadingCouriers(false);
    }
  };

  // Define available status transitions based on current status
  const getAvailableStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case OrderStatusEnum.PLACED:
        return [OrderStatusEnum.CONFIRMED, OrderStatusEnum.REJECTED];
      case OrderStatusEnum.CONFIRMED:
        return [OrderStatusEnum.PREPARING, OrderStatusEnum.CANCELLED];
      case OrderStatusEnum.PREPARING:
        return [OrderStatusEnum.READY_FOR_PICKUP, OrderStatusEnum.CANCELLED];
      case OrderStatusEnum.READY_FOR_PICKUP:
        return [OrderStatusEnum.CANCELLED];
      default:
        return [];
    }
  };

  const availableStatuses = getAvailableStatusOptions(currentOrder.status);
  
  const filteredCouriers = couriers.filter(c =>
    c.name.toLowerCase().includes(courierSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-lg w-full max-h-screen overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">Update Status for Order #{orderId}</h3>
        
        <div className="mb-4">
          <p className="mb-2">
            <span className="font-semibold">Current Status:</span> 
            <span className="ml-2 px-2 py-1 rounded bg-gray-200">{currentOrder.status}</span>
          </p>
          
          <p className="mb-2">
            <span className="font-semibold">Customer:</span> {currentOrder.name}
          </p>
          
          <p className="mb-2">
            <span className="font-semibold">Total:</span> ${currentOrder.totalPrice.toFixed(2)}
          </p>
          
          <div className="mt-4">
            <h4 className="font-semibold mb-2">Order Items:</h4>
            <ul className="list-disc pl-5">
              {currentOrder.orderItems.map((item, index) => (
                <li key={index}>
                  {item.quantity}x {item.menu.name} - ${item.menu.price.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {availableStatuses.length > 0 && (
          <div className="mt-6">
            <h4 className="font-semibold mb-2">Update Status To:</h4>
            <div className="flex flex-wrap gap-2">
              {availableStatuses.map((status) => (
                <button
                  key={status}
                  className={`px-3 py-2 rounded ${
                    status === OrderStatusEnum.CANCELLED || status === OrderStatusEnum.REJECTED
                      ? 'bg-red-600 text-white'
                      : 'bg-orange-700 text-white'
                  }`}
                  onClick={() => onUpdateStatus(orderId, status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Courier Assignment Section */}
        {showCourierSection && (
          <div className="mt-6 border-t pt-4">
            <h4 className="font-semibold mb-2">Assign Courier</h4>
            
            <input
              type="text"
              placeholder="Search couriers..."
              className="border rounded-lg p-2 w-full mb-4"
              value={courierSearch}
              onChange={(e) => setCourierSearch(e.target.value)}
            />
            
            {loadingCouriers ? (
              <p className="text-gray-500">Loading couriers...</p>
            ) : (
              <div className="max-h-64 overflow-y-auto">
                {filteredCouriers.length > 0 ? (
                  filteredCouriers.map((courier) => (
                    <div key={courier.pk} className="flex justify-between items-center py-2 border-b">
                      <span>
                        {courier.name} ({courier.phoneNumber})
                      </span>
                      <button
                        className="px-3 py-1 rounded bg-orange-700 text-white"
                        onClick={() => onAssignCourier(orderId, courier.pk)}
                      >
                        Assign
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No couriers available</p>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="mt-6 flex justify-end">
          <button
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};