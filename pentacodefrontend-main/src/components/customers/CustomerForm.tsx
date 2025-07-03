import React, { ChangeEvent } from 'react';
import { motion } from 'framer-motion';
import { Customer } from '../../types/Customer'; // Adjust path as needed

interface CustomerFormProps {
  customer: Customer;
  setCustomer: React.Dispatch<React.SetStateAction<Customer | null>>;
  isEditing: boolean;
  handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm";
const disabledInputClass = "mt-1 block w-full px-3 py-2 bg-gray-100 border-gray-300 rounded-md shadow-sm sm:text-sm text-gray-700";
const labelClass = "block text-sm font-medium text-gray-700";

const CustomerForm: React.FC<CustomerFormProps> = ({
  customer,
  isEditing,
  handleInputChange,
}) => {
  const renderField = (
    label: string,
    name: keyof Customer,
    type: string = 'text',
    placeholder?: string
  ) => (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      {isEditing ? (
        <input
          type={type}
          id={name}
          name={name}
          value={(customer[name] as string) || ''}
          onChange={handleInputChange}
          className={inputClass}
          placeholder={placeholder || label}
        />
      ) : (
        <p className={`${disabledInputClass} min-h-[38px] flex items-center`}>{(customer[name] as string) || 'N/A'}</p>
      )}
    </div>
  );

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {renderField('Name', 'name', 'text', 'Your Name')}
      {renderField('Address', 'address', 'text', 'Full Street Address')}
      {renderField('Phone Number', 'phoneNumber', 'tel', 'e.g., +1234567890')}
      {renderField('Email', 'email', 'email', 'contact@example.com')}
    </motion.div>
  );
};

export default CustomerForm;