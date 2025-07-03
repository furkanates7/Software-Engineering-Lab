import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function MainAdminPage() {
  const [stats, setStats] = useState({
    customers: 0,
    bannedCustomers: 0,
    restaurants: 0,
    bannedRestaurants: 0,
    couriers: 0,
    orders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        // Fetch all in parallel
        const [customerRes, restaurantRes, courierRes, orderRes] = await Promise.all([
          axios.get('http://localhost:8080/api/admin/customer/all', { headers }),
          axios.get('http://localhost:8080/api/admin/restaurant/all', { headers }),
          axios.get('http://localhost:8080/api/admin/courier/all', { headers }),
          axios.get('http://localhost:8080/api/admin/order/all', { headers }),
        ]);
        const customers = customerRes.data.data || [];
        const restaurants = restaurantRes.data.data || [];
        const couriers = courierRes.data.data || [];
        const orders = orderRes.data.data || [];

        // Helper to check ban status for a list of users
        const getBannedCount = async (list: any[]): Promise<number> => {
          const results = await Promise.all(
            list.map(async (item: any) => {
              try {
                const res = await axios.get(`http://localhost:8080/api/admin/getban/${item.pk}`, { headers });
                return res.data.data ? 1 : 0;
              } catch {
                return 0;
              }
            })
          );
          return results.reduce((sum: number, val: number) => sum + val, 0);
        };

        // Get banned counts for customers and restaurants
        const [bannedCustomers, bannedRestaurants] = await Promise.all([
          getBannedCount(customers),
          getBannedCount(restaurants),
        ]);

        setStats({
          customers: customers.length,
          bannedCustomers,
          restaurants: restaurants.length,
          bannedRestaurants,
          couriers: couriers.length,
          orders: orders.length,
        });
      } catch (err) {
        setError('Failed to load statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-4xl font-bold text-orange-700 mt-8 mb-8">
          Admin Dashboard
        </h1>
        {loading ? (
          <div className="text-orange-600 text-xl">Loading statistics...</div>
        ) : error ? (
          <div className="text-red-600 text-xl">{error}</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
              <span className="text-3xl font-bold text-orange-700">{stats.customers}</span>
              <span className="text-lg text-orange-800">Total Customers</span>
              <span className="text-sm text-red-500 mt-2">Banned: {stats.bannedCustomers}</span>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
              <span className="text-3xl font-bold text-orange-700">{stats.restaurants}</span>
              <span className="text-lg text-orange-800">Total Restaurants</span>
              <span className="text-sm text-red-500 mt-2">Banned: {stats.bannedRestaurants}</span>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
              <span className="text-3xl font-bold text-orange-700">{stats.couriers}</span>
              <span className="text-lg text-orange-800">Total Couriers</span>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
              <span className="text-3xl font-bold text-orange-700">{stats.orders}</span>
              <span className="text-lg text-orange-800">Total Orders</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
