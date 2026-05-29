import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Add from './pages/Add';
import List from './pages/List';
import Orders from './pages/Orders';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // Synchronize admin token changes to localStorage
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  // If the admin token is not set, display the secure admin login gate
  if (!token) {
    return (
      <>
        <ToastContainer position="top-right" autoClose={3000} />
        <Login setToken={setToken} />
      </>
    );
  }

  return (
    <div className='bg-gray-50 min-h-screen'>
      <ToastContainer position="top-right" autoClose={3000} />
      <Navbar setToken={setToken} />
      <hr className='border-gray-200' />
      <div className='flex w-full'>
        <Sidebar />
        <div className='w-[82%] min-h-screen bg-gray-50'>
          <Routes>
            <Route path="/" element={<Navigate to="/orders" replace />} />
            <Route path="/add" element={<Add token={token} />} />
            <Route path="/list" element={<List token={token} />} />
            <Route path="/orders" element={<Orders token={token} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default App;