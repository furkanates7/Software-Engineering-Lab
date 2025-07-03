import { useState, useEffect } from 'react';
import { Menu } from '../../types/Menu';

interface MenuFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (menu: Omit<Menu, 'pk'>) => void;
  initialMenu: Menu | null;
}

export function MenuFormModal({ isOpen, onClose, onSubmit, initialMenu }: MenuFormModalProps) {
  const [formData, setFormData] = useState<Omit<Menu, 'pk'>>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    isAvailable: false,
    isDrink: false,
    category: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [descriptionLength, setDescriptionLength] = useState(0);

  useEffect(() => {
    if (initialMenu) {
      setFormData({
        name: initialMenu.name,
        description: initialMenu.description,
        price: initialMenu.price,
        imageUrl: initialMenu.imageUrl,
        isAvailable: initialMenu.isAvailable,
        isDrink: initialMenu.isDrink,
        category: initialMenu.category,
      });
      setDescriptionLength(initialMenu.description.length);
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        imageUrl: '',
        isAvailable: false,
        isDrink: false,
        category: '',
      });
      setDescriptionLength(0);
    }
  }, [initialMenu]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (formData.price < 0) {
      newErrors.price = 'Price cannot be negative';
    }
    if (formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (name === 'description') {
      setDescriptionLength(value.length);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-orange-50 rounded-lg p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
          <h2 className="text-3xl font-bold text-red-700 mb-6">
          {initialMenu ? 'Edit Menu Item' : 'Add New Menu Item'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-amber-800 font-semibold mb-1">
              Name <span className="text-red-600">*</span>
              <span className="ml-2 text-sm text-gray-500" title="Enter the menu item name (e.g., Margherita Pizza)">
                (?)
              </span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full border ${errors.name ? 'border-red-500' : 'border-amber-600'} rounded px-3 py-2 focus:ring-2 focus:ring-orange-700`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-amber-800 font-semibold mb-1">
              Description
              <span className="ml-2 text-sm text-gray-500" title="Provide a brief description (max 500 characters)">
                (?)
              </span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-amber-600 rounded px-3 py-2 focus:ring-2 focus:ring-orange-700"
              rows={4}
            />
            <p className="text-sm text-gray-500 mt-1">{descriptionLength}/500 characters</p>
            {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-amber-800 font-semibold mb-1">
              Price ($) <span className="text-red-600">*</span>
              <span className="ml-2 text-sm text-gray-500" title="Enter the price (e.g., 12.99)">
                (?)
              </span>
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              className={`w-full border ${errors.price ? 'border-red-500' : 'border-amber-600'} rounded px-3 py-2 focus:ring-2 focus:ring-orange-700`}
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-amber-800 font-semibold mb-1">
              Image URL
              <span className="ml-2 text-sm text-gray-500" title="Provide a URL to the menu item image">
                (?)
              </span>
            </label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full border border-amber-600 rounded px-3 py-2 focus:ring-2 focus:ring-orange-700"
            />
            {formData.imageUrl && (
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="mt-2 w-full h-32 object-cover rounded"
                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image')}
              />
            )}
          </div>
          <div className="mb-6">
            <label className="block text-amber-800 font-semibold mb-1">
              Category
              <span className="ml-2 text-sm text-gray-500" title="Enter a category (e.g., Main Course)">
                (?)
              </span>
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full border border-amber-600 rounded px-3 py-2 focus:ring-2 focus:ring-orange-700"
            />
          </div>
          <div className="mb-6 flex space-x-6">
            <label className="flex items-center text-amber-800 font-semibold">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="mr-2 h-5 w-5 text-orange-700"
              />
              Available
            </label>
            <label className="flex items-center text-amber-800 font-semibold">
              <input
                type="checkbox"
                name="isDrink"
                checked={formData.isDrink}
                onChange={handleChange}
                className="mr-2 h-5 w-5 text-orange-700"
              />
              Is Drink
            </label>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-700 text-white rounded hover:bg-orange-800 transition"
            >
              {initialMenu ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}