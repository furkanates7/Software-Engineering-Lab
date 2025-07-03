import { Menu } from './Menu';



export interface Restaurant {
  pk: number;
  name: string;
  version:  string | null;
  menus: Menu[];
  imageUrl: string;
  address?: string;
  phoneNumber?: string;
  description?: string;
  email?: string;
  deliveryFee?: number;
  deliveryTime?: string;
  foodType?: string;
  latitude?: number;  // Added
  longitude?: number; // Added
  openingHours?: string;
  closingHours?: string;
  minOrderAmount?: string;
  maxOrderAmount?: string;
}