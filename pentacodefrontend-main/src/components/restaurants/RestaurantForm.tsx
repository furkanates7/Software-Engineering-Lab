// src/components/restaurants/RestaurantForm.tsx
import React, { ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Restaurant } from '../../types/Restaurant'; // Adjust path as needed

interface RestaurantFormProps {
  restaurant: Restaurant;
  setRestaurant: React.Dispatch<React.SetStateAction<Restaurant | null>>;
  isEditing: boolean;
  // No handleSubmit, formErrors props needed here as per your request
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm";
const disabledInputClass = "mt-1 block w-full px-3 py-2 bg-gray-100 border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-700";
const labelClass = "block text-sm font-medium text-gray-700";

const RestaurantForm: React.FC<RestaurantFormProps> = ({
  restaurant,
  isEditing,
  handleInputChange,
}) => {
  const renderField = (
    label: string,
    name: keyof Restaurant,
    type: string = 'text',
    placeholder?: string,
    isTextArea: boolean = false
  ) => (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      {isEditing ? (
        isTextArea ? (
          <textarea
            id={name}
            name={name}
            value={(restaurant[name] as string) || ''}
            onChange={handleInputChange}
            rows={3}
            className={inputClass}
            placeholder={placeholder || label}
          />
        ) : (
          <input
            type={type}
            id={name}
            name={name}
            value={(restaurant[name] as string) || ''}
            onChange={handleInputChange}
            className={inputClass}
            placeholder={placeholder || label}
          />
        )
      ) : (
        <p className={`${disabledInputClass} min-h-[38px] flex items-center`}>{(restaurant[name] as string) || 'N/A'}</p>
      )}
    </div>
  );

  return (
    <motion.div
      className="space-y-3" // Reduced spacing for compactness
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {renderField('Name', 'name', 'text', 'Restaurant Name')}
      {renderField('Address', 'address', 'text', 'Full Street Address')}
      {renderField('Phone Number', 'phoneNumber', 'tel', 'e.g., +1234567890')}
      {renderField('Email', 'email', 'email', 'contact@example.com')}
      {renderField('Food Type', 'foodType', 'text', 'e.g., Italian, Mexican')}
      {renderField('Description', 'description', 'text', 'Short description', true)}
      
      {/* Example for other fields if you want to add them */}
      {/* {renderField('Opening Hours', 'openingHours', 'text', 'e.g., 09:00 AM')} */}
      {/* {renderField('Closing Hours', 'closingHours', 'text', 'e.g., 10:00 PM')} */}
      {/* {renderField('Delivery Time', 'deliveryTime', 'text', 'e.g., 30-45 mins')} */}
      {/* {renderField('Delivery Fee', 'deliveryFee', 'number', 'e.g., 2.50')} */}

      {/* imageUrl input is removed as per request, handled by separate upload */}
    </motion.div>
  );
};

export default RestaurantForm;