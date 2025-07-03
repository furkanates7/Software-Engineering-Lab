import { useEffect, useState } from 'react';
import axios from 'axios';
import { CourierDTO } from '../../types/Courier';
import { OrderDTO, OrderStatusEnum } from '../../types/Order';

const CourierList = () => {
  const [couriers, setCouriers] = useState<CourierDTO[]>([]);
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<OrderDTO | null>(null);

  // Örnek olarak atanacak restoran ID'si (gerçek senaryoda dinamik olmalı)
  const restaurantId = 1;  // Bunu dinamik olarak ayarlayın

  useEffect(() => {
    const fetchCouriers = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/couriers/available',
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setCouriers(response.data.data);
      } catch (err) {
        setError('Kuryeler alınamadı.');
      } finally {
        setLoading(false);
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/restaurant/${restaurantId}/orders`);
        // Sadece READY_FOR_PICKUP durumundaki siparişleri filtrele
        const readyOrders = response.data.data.filter((order: OrderDTO) => order.status === OrderStatusEnum.READY_FOR_PICKUP);
        setOrders(readyOrders);
        if (readyOrders.length > 0) setSelectedOrder(readyOrders[0]);  // İlk siparişi seç
      } catch (err: any) {
        console.error('Hata:', err);  // Hata detayını konsola yazdır
        setError('Siparişler alınırken hata oluştu.');
        
        // Hata mesajını kullanıcıya daha detaylı göstermek için
        if (err.response) {
          // Sunucudan dönen yanıt varsa
          console.error('Response error:', err.response.data);
          setError(`Sunucudan gelen hata: ${err.response.data.message || 'Bilinmeyen hata'}`);
        } else if (err.request) {
          // İstek gönderildiyse ama yanıt alınamadıysa
          console.error('Request error:', err.request);
          setError('Sunucuya istek gönderilemedi.');
        } else {
          // Diğer hatalar
          console.error('Error:', err.message);
          setError(`Hata oluştu: ${err.message}`);
        }
      }
    };

    fetchCouriers();
    fetchOrders();
  }, [restaurantId]);

  const assignCourierToOrder = async (courierId: number) => {
    if (!selectedOrder) {
      setMessage('Lütfen önce bir sipariş seçin.');
      return;
    }

    try {
      // Sipariş ve kurye atama işlemi için API çağrısı
      const response = await axios.post(
        `http://localhost:8080/api/restaurant/${restaurantId}/orders/${selectedOrder.pk}/assign-courier/${courierId}`
      );
      setMessage(`Kurye başarıyla atandı: ${response.data.message}`);
      // Sipariş durumu güncellenebilir (isteğe bağlı)
      const updatedOrder = response.data.data;
      setSelectedOrder(updatedOrder);
    } catch (err: any) {
      console.error('Hata:', err);  // Hata detayını konsola yazdır
      setMessage('Kurye atama sırasında hata oluştu.');
      
      // Hata mesajını kullanıcıya daha detaylı göstermek için
      if (err.response) {
        // Sunucudan dönen yanıt varsa
        console.error('Response error:', err.response.data);
        setMessage(`Sunucudan gelen hata: ${err.response.data.message || 'Bilinmeyen hata'}`);
      } else if (err.request) {
        // İstek gönderildiyse ama yanıt alınamadıysa
        console.error('Request error:', err.request);
        setMessage('Sunucuya istek gönderilemedi.');
      } else {
        // Diğer hatalar
        console.error('Error:', err.message);
        setMessage(`Hata oluştu: ${err.message}`);
      }
    }
  };

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      {/* Order Bar */}
      <div style={{ display: 'flex', padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '20px' }}>
        <h3>Ready for Pickup Orders</h3>
        <select
          style={{ marginLeft: '20px', padding: '8px', fontSize: '16px' }}
          onChange={(e) => {
            const selected = orders.find(order => order.pk === parseInt(e.target.value));
            setSelectedOrder(selected || null);
          }}
        >
          {orders.map((order) => (
            <option key={order.pk} value={order.pk}>
              {order.name} - {order.status}
            </option>
          ))}
        </select>
      </div>

      {selectedOrder && (
        <div style={{ marginBottom: '20px' }}>
          <h4>Seçilen Sipariş:</h4>
          <p><strong>Sipariş Adı:</strong> {selectedOrder.name}</p>
          <p><strong>Durum:</strong> {selectedOrder.status}</p>
          <p><strong>Toplam Fiyat:</strong> {selectedOrder.totalPrice} ₺</p>
        </div>
      )}

      {/* Courier List */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {couriers.map((courier) => (
          <div
            key={courier.pk}
            style={{
              border: '1px solid #ccc',
              borderRadius: '8px',
              padding: '16px',
              width: '200px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              backgroundColor: '#f9f9f9',
            }}
          >
            <h3 style={{ margin: '0 0 8px 0' }}>{courier.name}</h3>
            <p><strong>Telefon:</strong> {courier.phoneNumber}</p>
            <button
              onClick={() => assignCourierToOrder(courier.pk)}
              style={{
                marginTop: '10px',
                padding: '8px 12px',
                backgroundColor: '#4caf50',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Kurye Ata
            </button>
          </div>
        ))}
      </div>

      {message && <p>{message}</p>}
    </div>
  );
};

export default CourierList;
