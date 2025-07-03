import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

// 404
import NotFound from './components/NotFound';

// Login/Signup
import Login from './pages/login-signup/Login';
import Signup from './pages/login-signup/Signup';
import AdminLogin from './pages/login-signup/AdminLogin';
import LoginSelector from './LoginSelector';

// Customer
import AccountManagement from './pages/customer/CustomerAccountManagement';
import RestaurantPage from './pages/customer/RestaurantPage';
import OrderPage from './pages/customer/OrderPage';
import SingleRestaurantPage from './pages/customer/SingleRestaurantPage';
import ReviewCart from './pages/customer/ReviewCart';
import FavoriteOrdersPage from './pages/customer/FavoriteOrdersPage';

// Restaurant
import RestaurantAccountManagementPage from './pages/restaurant/RestaurantAccountManagementPage';
import MenuManagementPage from './pages/restaurant/MenuManagementPage';
import Orders from './pages/restaurant/RestaurantOrderManagementPage';
import CourierManagementPage from './pages/restaurant/CourierManagementPage';

// Courier
import CourierAccountManagementPage from './pages/courier/CourierAccountManagementPage';
import AssignedOrders from './pages/courier/AssignedOrders';
import IdleOrders from './pages/courier/IdleOrders';
import OrderDetails from './pages/courier/OrderDetails';
import PastOrders from './pages/courier/PastOrders';

// Admin
import AdminCourierManagementPage from './pages/admin/AdminCourierManagementPage';
import CustomerManagementPage from './pages/admin/CustomerManagementPage';
import DeliveryManagementPage from './pages/admin/AdminOrderControlPage';
import MainAdminPage from './pages/admin/MainAdminPage';
import RestaurantManagementPage from './pages/admin/RestaurantManagementPage';
import ReviewManagementPage from './pages/admin/ReviewManagementPage';
import ActiveOrdersPage from './pages/customer/ActiveOrdersPage';
import SuccessRedirectPage from './pages/login-signup/SuccessRedirectPage';
import TicketPage from './pages/TicketPage';
import AdminTicketPage from './pages/AdminTicketPage';
import ResetPassword from './pages/login-signup/ResetPassword';
import GeneralReviewPage from './pages/GeneralReviewPage';



const App: React.FC = () => {
  return (
    
      <div>
        <Navbar />
        <Routes>
          {/* LoginSelector */}

          <Route path="/choose-login" element={<LoginSelector />} />

          {/* Login/Signup */}
        
          <Route path="/login" element={<Login />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/restaurant/login" element={<Login />} />
          <Route path="/courier/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/restaurant/signup" element={<Signup />} />
          <Route path="/courier/signup" element={<Signup />} />
          <Route path="/admin/signup" element={<Signup />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/" element={<Login />} />

          <Route path="/success" element={<SuccessRedirectPage />} />

    
          {/* Customer */}
          <Route path="/customer/restaurants" element={<RestaurantPage />} />
          <Route path="/customer/main" element={<RestaurantPage />} />
          <Route path="/customer/restaurants/:pk" element={<SingleRestaurantPage />} />
          <Route path="/customer/review-cart" element={<ReviewCart/>} />
          <Route path="/customer/order" element={<OrderPage />} />
          <Route path="/customer/account-management" element={<AccountManagement />} />
          <Route path="/customer/active-orders" element={<ActiveOrdersPage />} />
          <Route path="/customer/favorite-orders" element={<FavoriteOrdersPage />} />
          <Route path="/customer/tickets" element={<TicketPage />} />
           

          {/* Restaurant */}
          <Route path="/restaurant/account-management" element={<RestaurantAccountManagementPage />} />
          <Route path="/restaurant/menu-management" element={<MenuManagementPage />} />
          <Route path="/restaurant/orders" element={<Orders />} />
          <Route path="/restaurant/courier-management" element={<CourierManagementPage />} />
          <Route path="/restaurant/tickets" element={<TicketPage />} />
          <Route path="/restaurant/review-management" element={<GeneralReviewPage/>} />


          {/* Restaurant */}


          {/* Courier */}
          <Route path="/courier/account-management" element={<CourierAccountManagementPage />} />
          <Route path="/courier/assigned-orders" element={<AssignedOrders />} />
          <Route path="/courier/idle-orders" element={<IdleOrders />} />
          <Route path="/courier/order-details" element={<OrderDetails />} />
          <Route path="/courier/past-orders" element={<PastOrders />} />
          <Route path="/courier/tickets" element={<TicketPage />} />
          <Route path="/courier/review-management" element={<GeneralReviewPage/>} />


          {/* Customer */}

          {/* Admin */}
          <Route path="/admin/main" element={<MainAdminPage />} />
          <Route path="/admin/courier-management" element={<AdminCourierManagementPage />} />
          <Route path="/admin/customer-management" element={<CustomerManagementPage />} />
          <Route path="/admin/delivery-management" element={<DeliveryManagementPage />} />
          <Route path="/admin/restaurant-management" element={<RestaurantManagementPage />} />
          <Route path="/admin/review-management" element={<ReviewManagementPage />} />
          <Route path="/admin/tickets" element={<AdminTicketPage />} />


          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
    

        </Routes>
      </div>
    
  );
};

export default App;