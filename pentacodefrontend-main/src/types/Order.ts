// import
import { Menu } from './Menu';
import { Restaurant } from './Restaurant';
import { CourierDTO } from './Courier';
import { OrderItem } from './OrderItem';

export interface OrderDTO {
    pk: number;
    name: string;
    restaurant: Restaurant;
    menus: Menu[];
    orderItems: OrderItem[];
    courier: CourierDTO | null;
    status: OrderStatusEnum;
    courierAssignmentAccepted: boolean;
    version: number;
    totalPrice: number;
    searchString?: string; // Added for client-side search
    createdAt: string;
  }
  
export enum OrderStatusEnum {
  PLACED = 'PLACED',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY_FOR_PICKUP = 'READY_FOR_PICKUP',
  ASSIGNED = 'ASSIGNED',
  IN_TRANSIT = 'IN_TRANSIT',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
}