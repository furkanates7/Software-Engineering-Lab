import { Restaurant } from '../../types/NewRestaurant';
import RestaurantCardNew from './RestaurantCardNew';

interface RestaurantListProps {
  restaurants: Restaurant[];
  error: string;
  loading?: boolean;
}

export function RestaurantList({ restaurants, error, loading = false }: RestaurantListProps) {
  return (
    <div className="min-h-screen bg-orange-50">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold text-red-700 mb-6">Restoranlar</h1>

        {/* Sticky Header */}
        <div className="sticky top-0 bg-orange-50 z-10 pb-4">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4 space-y-4 md:space-y-0">
            <div className="flex items-center w-full md:w-64">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  className="w-full border border-amber-600 rounded px-3 py-2 pl-10 focus:ring-2 focus:ring-orange-700"
                />
                <svg
                  className="absolute left-3 top-2.5 h-5 w-5 text-amber-800"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(9)
              .fill(0)
              .map((_, index) => (
                <RestaurantCardNew
                  key={`loading-${index}`}
                  restaurant={{} as Restaurant}
                  loading={true}
                />
              ))}
          </div>
        ) : restaurants.length === 0 ? (
          <div className="text-center py-12">
            <img
              src="https://via.placeholder.com/200?text=No+Restaurants"
              alt="No restaurants"
              className="mx-auto mb-4"
            />
            <p className="text-amber-800 text-lg">No restaurants found. Add a new restaurant to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <RestaurantCardNew
                key={restaurant.pk}
                restaurant={restaurant}
                to={`/customer/restaurants/${restaurant.pk}`}
                toData={restaurant}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {restaurants.length > 0 && (
          <div className="flex justify-between items-center mt-6">
            <p className="text-amber-800">
              Showing 1 to {restaurants.length} of {restaurants.length} restaurants
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
