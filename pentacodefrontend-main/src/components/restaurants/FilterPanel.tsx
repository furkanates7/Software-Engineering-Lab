// components/FilterPanel.tsx
export function FilterPanel() {
    return (
      <div className="w-64 p-4 border rounded bg-white h-fit">
        <h3 className="text-lg font-semibold mb-2">Meals</h3>
        <input
          type="text"
          placeholder="Search meals"
          className="w-full border px-2 py-1 mb-3 rounded"
        />
        <div className="flex flex-wrap gap-2 mb-4">
          {['Burger', 'Pizza', 'Rib', 'Lahmacun', 'Kebab', 'Soup'].map(tag => (
            <span key={tag} className="bg-gray-200 px-2 py-1 rounded">{tag} ❌</span>
          ))}
        </div>
  
        <div className="mb-4">
          <label className="block mb-1 font-medium">Fast Delivery</label>
          <input type="checkbox" checked readOnly />
        </div>
  
        <div className="mb-4">
          <label className="block font-medium">Payment Methods</label>
          {['Credit Card', 'Bank Card', 'Pluxee', 'Multinet', 'Cash on Delivery'].map(method => (
            <div key={method}>
              <input type="checkbox" checked readOnly className="mr-2" />
              {method}
            </div>
          ))}
        </div>
  
        <div>
          <label className="block font-medium mb-1">Price</label>
          <input type="range" min={0} max={500} className="w-full" />
          <p className="text-sm">TL0-500</p>
        </div>
      </div>
    );
  }
  