import { Menu } from '../../types/Menu';

interface Props {
  menus: Menu[];
  onEdit: (menu: Menu) => void;
  onDelete: (menuId: number) => void;
  selectedMenus: number[];
  onSelect: (menuId: number) => void;
}

export function MenuTable({ menus, onEdit, onDelete, selectedMenus, onSelect }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse bg-orange-50">
        <thead>
          <tr className="bg-amber-800 text-white">
            <th className="p-3 text-left">
              <input
                type="checkbox"
                onChange={() => {
                  if (selectedMenus.length === menus.length) {
                    menus.forEach((menu) => onSelect(menu.pk));
                  } else {
                    menus.forEach((menu) => !selectedMenus.includes(menu.pk) && onSelect(menu.pk));
                  }
                }}
                checked={selectedMenus.length === menus.length && menus.length > 0}
                className="h-5 w-5"
              />
            </th>
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Price</th>
            <th className="p-3 text-left">Category</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Type</th>
            <th className="p-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {menus.map((menu) => (
            <tr key={menu.pk} className="border-b border-amber-600 hover:bg-orange-100">
              <td className="p-3">
                <input
                  type="checkbox"
                  checked={selectedMenus.includes(menu.pk)}
                  onChange={() => onSelect(menu.pk)}
                  className="h-5 w-5 text-orange-700"
                />
              </td>
              <td className="p-3 text-amber-800">{menu.name}</td>
              <td className="p-3 text-orange-600">${menu.price.toFixed(2)}</td>
              <td className="p-3 text-amber-700">{menu.category || 'N/A'}</td>
              <td className="p-3">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    menu.isAvailable ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                  }`}
                >
                  {menu.isAvailable ? 'Available' : 'Unavailable'}
                </span>
              </td>
              <td className="p-3 text-amber-800">{menu.isDrink ? 'Drink' : 'Food'}</td>
              <td className="p-3">
                <button
                  onClick={() => onEdit(menu)}
                  className="px-3 py-1 bg-orange-700 text-white rounded hover:bg-orange-800 mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(menu.pk)}
                  className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}