import { Link } from 'react-router-dom';
import { Restaurant } from '../../types/Restaurant';

interface Props {
  restaurants: Restaurant[];
}

export function RestaurantTable({ restaurants }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-orange-50">
        <thead>
          <tr className="bg-amber-800 text-white">
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Address</th>
            <th className="p-3 text-left">Phone</th>
            <th className="p-3 text-left">Version</th>
          </tr>
        </thead>
        <tbody>
          {restaurants.map((restaurant) => (
            <tr key={restaurant.pk} className="border-b border-amber-600 hover:bg-orange-100">
              <td className="p-3 text-amber-800">
                <Link to={`/customer/restaurants/${restaurant.pk}`} className="hover:underline">
                  {restaurant.name}
                </Link>
              </td>
              <td className="p-3 text-amber-800">{restaurant.address || 'N/A'}</td>
              <td className="p-3 text-amber-800">{restaurant.phoneNumber || 'N/A'}</td>
              <td className="p-3 text-amber-800">{restaurant.version}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}