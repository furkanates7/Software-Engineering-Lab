import { Menu } from '../types/Menu'; // Adjust path as needed

export interface CartProps {
  cartItems: Menu[];
}

export function Cart({ cartItems }: CartProps) {
  const total = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="mt-8 p-4 border-t">
      <h3 className="text-2xl font-semibold mb-2">Cart</h3>
      <p className="text-lg">Total: ${total}</p>
    </div>
  );
}
