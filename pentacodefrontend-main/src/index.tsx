import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Bu satırı ekleyin
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import './index.css';
import Navbar from './components/Navbar';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter> {/* App bileşenini buraya sarın */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

reportWebVitals();