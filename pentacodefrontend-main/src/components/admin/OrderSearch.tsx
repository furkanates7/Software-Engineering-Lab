import React from 'react';

interface OrderSearchProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const OrderSearch: React.FC<OrderSearchProps> = ({ searchQuery, setSearchQuery }) => {
  return (
    <div className="mb-4 relative flex items-center">
      <input
        type="text"
        placeholder="Search orders..."
        className="border border-amber-600 rounded-lg p-2 pl-10 w-full text-amber-800 bg-white placeholder-amber-400 focus:outline-none focus:ring-2 focus:ring-orange-700"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
    </div>
  );
};