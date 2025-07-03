import React, { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';

// Sipariş için tip tanımı
interface Order {
  item: string;
  quantity: number;
}

// API response için tip tanımı (örnek, backend’e göre güncellenebilir)
interface OrderResponse {
  message?: string; // Backend’in döndürdüğü bir şey varsa eklenebilir
}

const OrderPage: React.FC = () => {
  const [order, setOrder] = useState<Order>({ item: '', quantity: 1 });
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token bulunamadı.');
      }
      await axios.post<OrderResponse>('http://localhost:8080/api/orders', order, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate('/customer/main'); // Sipariş başarılıysa ana sayfaya dön
    } catch (err) {
      const axiosError = err as AxiosError | Error;
      setError('Sipariş verilemedi.');
      console.error(axiosError); // Hata detaylarını loglama (opsiyonel)
    }
  };

  return (
    <div>
      <h2>Sipariş Ver</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Yemek:</label>
          <input
            type="text"
            value={order.item}
            onChange={(e) => setOrder({ ...order, item: e.target.value })}
            placeholder="Yemek adını girin"
            required
          />
        </div>
        <div>
          <label>Adet:</label>
          <input
            type="number"
            value={order.quantity}
            onChange={(e) => setOrder({ ...order, quantity: parseInt(e.target.value) || 1 })}
            min="1"
            required
          />
        </div>
        <button type="submit">Sipariş Ver</button>
      </form>
      <Link to="/customer/restaurants">Restoranlara Geri Dön</Link>
    </div>
  );
};

export default OrderPage;