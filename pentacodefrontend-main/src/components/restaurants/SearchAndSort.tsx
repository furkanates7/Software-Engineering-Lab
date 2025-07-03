// components/SearchAndSort.tsx
export function SearchAndSort() {
  return (
    <div className="flex justify-between items-center p-4 bg-orange-50 shadow-md rounded-lg">
      <input
        type="text"
        placeholder="Search"
        className="border border-gray-300 px-4 py-2 rounded-lg w-1/3 focus:outline-none focus:ring-2 focus:ring-orange-500"
      />
      <div className="flex gap-2">
        <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500">
          Restaurant Rate
        </button>
        <button className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
          Default
        </button>
        <button className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
          Minimum Price
        </button>
        <button className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
          Distance
        </button>
      </div>
    </div>
  );
}
