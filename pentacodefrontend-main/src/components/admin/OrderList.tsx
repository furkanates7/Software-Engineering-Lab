// components/admin/OrderList.tsx
import React from 'react';
import { OrderDTO, OrderStatusEnum } from '../../types/Order';
import GenericCard from '../GenericCard';

interface OrderListProps {
  orders: OrderDTO[];
  loading: boolean;
  openCourierModal: (orderId: number) => void;
  onChangeStatus: (orderId: number, newStatus: OrderStatusEnum) => void;
  statusLoading: number | null;
}

export const OrderList: React.FC<OrderListProps> = ({ orders, loading, openCourierModal, onChangeStatus, statusLoading }) => {
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
        <OrderCard 
          key={order.pk} 
          order={order} 
          openCourierModal={openCourierModal} 
          onChangeStatus={onChangeStatus}
          statusLoading={statusLoading}
        />
      ))}
    </div>
  );
};

interface OrderCardProps {
  order: OrderDTO;
  openCourierModal: (orderId: number) => void;
  onChangeStatus: (orderId: number, newStatus: OrderStatusEnum) => void;
  statusLoading: number | null;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, openCourierModal, onChangeStatus, statusLoading }) => {
  const getStatusBackgroundColor = (status: string) => {
    switch (status) {
      case OrderStatusEnum.READY_FOR_PICKUP:
        return 'bg-yellow-200';
      case OrderStatusEnum.ASSIGNED:
        return 'bg-blue-200';
      case OrderStatusEnum.DELIVERED:
        return 'bg-green-200';
      default:
        return 'bg-gray-200';
    }
  };

  const canManageCourier = 
    order.status === OrderStatusEnum.READY_FOR_PICKUP || 
    order.status === OrderStatusEnum.ASSIGNED;

  // All possible statuses for admin
  const statusOptions = Object.values(OrderStatusEnum);

  return (
    <GenericCard
      title={`Order #${order.pk}`}
      description={`${order.restaurant?.name} - Total: $${order.totalPrice.toFixed(2)}`}
      imageUrl={order.restaurant?.imageUrl}
    >
      <div className="flex flex-col gap-2 mt-2">
        <div className="flex justify-between items-center">
          <span className={`px-2 py-1 rounded ${getStatusBackgroundColor(order.status)}`}>
            {order.status}
          </span>
          {canManageCourier && (
            <button
              className="text-orange-700 hover:underline"
              onClick={() => openCourierModal(order.pk)}
            >
              {order.status === OrderStatusEnum.READY_FOR_PICKUP ? 'Assign Courier' : 'Manage Courier'}
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor={`status-select-${order.pk}`} className="text-sm font-medium">Change Status:</label>
          <select
            id={`status-select-${order.pk}`}
            className="border rounded px-2 py-1 text-sm"
            value={order.status}
            disabled={statusLoading === order.pk}
            onChange={e => onChangeStatus(order.pk, e.target.value as OrderStatusEnum)}
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          {statusLoading === order.pk && <span className="ml-2 text-xs text-gray-500">Updating...</span>}
        </div>
      </div>
    </GenericCard>
  );
};