import React, { useState } from 'react';
import axios from 'axios';
import { Menu } from '../types/Menu';

export function AddToCartButton({
  menuItem,
  onClick,
}: {
  menuItem: Menu;
  onClick?: (item: Menu) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddToCart = async () => {
    setLoading(true);
    setError('');

    try {
      await axios.post(
        `http://localhost:8080/api/customer/update-order/${menuItem.pk}`,
        null, 
        {
          params: { action: 'add' }, 
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      
      if (onClick) {
        onClick(menuItem); // Trigger the callback to update the cart
      }
    } catch (err) {
      console.error(err);
      setError('Error adding to cart.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <button
        onClick={handleAddToCart}
        disabled={loading}
        className="mt-2 px-3 py-1.5 bg-orange-700 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-wait transition-all"
      >
        {loading ? 'Adding...' : 'Add to Cart'}
      </button>
      {error && <span className="text-red-500 text-xs mt-1">{error}</span>}
    </div>
  );
}
