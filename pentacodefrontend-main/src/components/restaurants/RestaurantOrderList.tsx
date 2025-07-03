// components/restaurant/RestaurantOrderList.tsx
import React from 'react';
import { OrderDTO, OrderStatusEnum } from '../../types/Order';
import GenericCard from '../GenericCard';

interface RestaurantOrderListProps {
  orders: OrderDTO[];
  loading: boolean;
  openUpdateStatusModal: (orderId: number) => void;
}

export const RestaurantOrderList: React.FC<RestaurantOrderListProps> = ({ 
  orders, 
  loading, 
  openUpdateStatusModal 
}) => {
  if (loading) {
    return (
      <div className="flex flex-wrap gap-6">
        {Array(9)
          .fill(0)
          .map((_, index) => (
            <GenericCard key={`loading-${index}`} title="" description="" loading={true} />
          ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-6">
      {orders.map((order) => (
        <RestaurantOrderCard
          key={order.pk}
          order={order}
          openUpdateStatusModal={openUpdateStatusModal}
        />
      ))}
    </div>
  );
};

interface RestaurantOrderCardProps {
  order: OrderDTO;
  openUpdateStatusModal: (orderId: number) => void;
}

const RestaurantOrderCard: React.FC<RestaurantOrderCardProps> = ({ order, openUpdateStatusModal }) => {
  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case OrderStatusEnum.PLACED:
        return 'bg-yellow-100';
      case OrderStatusEnum.CONFIRMED:
        return 'bg-blue-100';
      case OrderStatusEnum.PREPARING:
        return 'bg-purple-100';
      case OrderStatusEnum.READY_FOR_PICKUP:
        return 'bg-yellow-200';
      case OrderStatusEnum.ASSIGNED:
        return 'bg-blue-200';
      case OrderStatusEnum.DELIVERED:
        return 'bg-green-200';
      case OrderStatusEnum.CANCELLED:
        return 'bg-red-100';
      case OrderStatusEnum.REJECTED:
        return 'bg-red-200';
      default:
        return 'bg-gray-200';
    }
  };

  // Allow status updates for orders in specific statuses
  const canUpdateStatus = [
    OrderStatusEnum.PLACED,
    OrderStatusEnum.CONFIRMED,
    OrderStatusEnum.PREPARING,
    OrderStatusEnum.READY_FOR_PICKUP
  ].includes(order.status as OrderStatusEnum);

  // Calculate the time since the order was placed
  const getOrderTime = () => {
    if (!order.createdAt) return '';
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const diffMs = now.getTime() - orderDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins} min ago`;
    } else {
      const hours = Math.floor(diffMins / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    }
  };

  return (
    <GenericCard
      title={`Order #${order.pk}`}
      description={`${order.name} - Total: $${order.totalPrice.toFixed(2)}`}
      imageUrl={order.restaurant.imageUrl}
    >
      <div className="mt-2">
        <span className={`px-2 py-1 rounded ${getStatusBackgroundColor(order.status)}`}>
          {order.status}
        </span>
        <p className="text-sm text-gray-500 mt-1">{getOrderTime()}</p>
      </div>
      
      <div className="mt-2">
        <h4 className="font-semibold text-sm">Items:</h4>
        <ul className="text-sm text-gray-600">
          {order.orderItems.slice(0, 2).map((item, index) => (
            <li key={index}>{item.quantity}x {item.menu.name}</li>
          ))}
          {order.orderItems.length > 2 && <li>+{order.orderItems.length - 2} more...</li>}
        </ul>
      </div>
      
      <div className="mt-2 flex justify-end">
        {canUpdateStatus && (
          <button
            className="text-orange-700 hover:underline"
            onClick={() => openUpdateStatusModal(order.pk)}
          >
            Update Status
          </button>
        )}
      </div>
    </GenericCard>
  );
};