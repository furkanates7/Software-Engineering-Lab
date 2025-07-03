// src/types/User.ts
import { Restaurant } from './Restaurant';
import { CourierDTO } from './Courier';    
import { Customer } from './Customer';

export type Role = 'ADMIN' | 'CUSTOMER' | 'COURIER' | 'RESTAURANT' | string;


export interface User {
    pk: number;
    name: string;
    username: string;
    password?: string; // Usually omitted on frontend
    email: string;
    accountNonExpired: boolean;
    isEnabled: boolean;
    accountNonLocked: boolean;
    credentialsNonExpired: boolean;
    isBanned: boolean;
    authorities: Role[];
    token?: string;
    restaurant?: Restaurant;
    courier?: CourierDTO;
    customer?: Customer;
}