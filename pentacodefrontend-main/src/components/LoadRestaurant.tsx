import { useState, useEffect } from "react";
import { Restaurant} from "../types/NewRestaurant";
import { AddToCartButton } from "./AddToCartButton";
import { Menu } from "../types/Menu";
import GenericCard from "./GenericCard";
import axios from "axios";
import { toast } from "react-toastify";

export default function LoadRestaurant({ restaurant }: { restaurant: Restaurant }) {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [cart, setCart] = useState<Menu[]>([]);
  const isAdmin = localStorage.getItem("role") === "ROLE_ADMIN";

  useEffect(() => {
    if (restaurant) {
      setLoading(false);
    } else {
      setError("Restaurant not found.");
    }
  }, [restaurant]);

  const addToCart = (menuItem: Menu) => {
    setCart((prevCart) => [...prevCart, menuItem]);
    toast.success(`${menuItem.name} added to cart!`);
  };

  const handleEditMenu = (menuId: number) => {
    // Placeholder for edit action (e.g., navigate to edit form)
    toast.info(`Editing menu item ${menuId}`);
    // Example: navigate(`/restaurant/menu/edit/${menuId}`);
  };

  const handleDeleteMenu = async (menuId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to delete menu items");
        return;
      }
      await axios.delete(`/api/restaurant/menu/${menuId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Menu item deleted successfully");
      // Refresh menus (assuming a parent component will re-fetch restaurant)
    } catch {
      toast.error("Failed to delete menu item");
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 p-6 space-y-6">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {!loading ? (
        <>
          {/* ✅ Header */}
          <div className="flex gap-6 bg-white shadow rounded-xl p-4 border border-amber-600">
            <img
              src={restaurant.imageUrl}
              alt={restaurant.name}
              className="w-40 h-40 object-cover rounded-lg"
            />
            <div>
              <h2 className="text-2xl font-semibold text-red-700">{restaurant.name}</h2>
              <p className="text-amber-800">{restaurant.foodType} • {restaurant.address}</p>
              <p className="text-amber-800">{restaurant.phoneNumber} • {restaurant.email}</p>
              <p className="text-amber-800">
                {restaurant.deliveryTime} dk, Delivery Fee: {restaurant.deliveryFee} TL, Min Order: {restaurant.minOrderAmount} TL
              </p>
              <p className="text-orange-600 font-medium">
                ⭐ {restaurant.rating} / 5 ({restaurant.numberOfRatings} Reviews)
              </p>
              <p className="text-amber-800">
                Open {restaurant.openingHours} - {restaurant.closingHours}
              </p>
              {restaurant.description && (
                <p className="text-amber-800 mt-2">{restaurant.description}</p>
              )}
            </div>
          </div>

          {/* ✅ Menu */}
          <div>
            <h3 className="text-2xl font-semibold text-red-700 mb-4">Menu</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurant.menus.map((item) => (
                <GenericCard
                  key={item.pk}
                  title={item.name}
                  description={item.description}
                  imageUrl={item.imageUrl || "https://via.placeholder.com/150?text=No+Image"}
                  footerContent={`${item.price} TL`}
                  to={`/restaurant/menu/${item.pk}`}
                >
                  <div className="flex space-x-2">
                    <AddToCartButton menuItem={item} onClick={addToCart} />
                  </div>
                </GenericCard>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="text-amber-800 text-lg text-center py-12">Loading restaurant details...</p>
      )}
    </div>
  );
}