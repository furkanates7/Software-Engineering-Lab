export interface CourierDTO {
    pk: number;
    name: string;
    phoneNumber: string;
    isAvailable: boolean;
    isOnline: boolean; 
    email?: string;    // Added - from creation form
    profilePictureUrl?: string;
  }