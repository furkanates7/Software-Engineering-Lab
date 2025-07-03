import { Menu } from '../../types/Menu';

interface Props {
  menu: Menu;
  onEdit: () => void;
  onDelete: (menuId: number) => void;
  isSelected?: boolean;
  onSelect?: (menuId: number) => void;
}

export function MenuCard({ menu, onEdit, onDelete, isSelected, onSelect }: Props) {
  return (
    <div className="relative p-4 border border-amber-600 rounded-lg shadow-md bg-orange-50 hover:shadow-lg transition transform hover:-translate-y-1 w-full max-w-md">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          {onSelect && (
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onSelect(menu.pk)}
              className="h-5 w-5 text-orange-700"
            />
          )}
          <h3 className="text-xl font-bold text-red-700">{menu.name}</h3>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onEdit}
            className="px-3 py-1 bg-orange-700 text-white text-sm rounded hover:bg-orange-800"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(menu.pk)}
            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
      <div className="mt-3 w-full h-48">
        <img
          src={menu.imageUrl || 'https://via.placeholder.com/150?text=No+Image'}
          alt={menu.name}
          className="w-full h-full object-cover rounded"
          style={{ aspectRatio: '1 / 1' }}
        />
      </div>
      <div className="mt-3">
        <p className="text-amber-800 text-base">{menu.description}</p>
        <p className="text-orange-600 font-semibold text-base mt-1">${menu.price.toFixed(2)}</p>
        {menu.category && <p className="text-amber-700 text-base mt-1">Category: {menu.category}</p>}
        <div className="mt-2 flex space-x-2">
          <span
            className={`inline-block px-2 py-1 rounded text-sm ${
              menu.isAvailable ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
            }`}
          >
            {menu.isAvailable ? 'Available' : 'Unavailable'}
          </span>
          <span className="inline-block px-2 py-1 rounded text-sm bg-amber-200 text-amber-800">
            {menu.isDrink ? 'Drink' : 'Food'}
          </span>
        </div>
      </div>
    </div>
  );
}