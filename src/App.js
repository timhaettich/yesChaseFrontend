import React, { useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Signin from './site/signin';
import Home from './site/home';
import Admin from './site/admin';
import Ingredient from './site/ingredient';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = process.env.REACT_APP_BASE_URL;

function App() {
  const token = localStorage.getItem('accessToken');
  const targetTimestamp = process.env.REACT_APP_INGREDIENT_TIME * 1000;
  const [ingredient, setIngredient] = useState(null);
  
  useEffect(() => {
    document.title = "YesChase";
  }, []);

  useEffect(() => {
    if ('Notification' in window) {
      // Request permission to show notifications
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Notification permission granted');
        } else {
          console.error('Notification permission denied');
        }
      });
    }
  }, []);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js')
      .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
          console.error('Service Worker registration failed:', error);
      });
  }

    console.log("Time until Special Event: ", new Date(Date.now()), new Date(targetTimestamp), targetTimestamp - Date.now())
    if (Date.now() > targetTimestamp) {
      // Fetch data from the API
      const fetchIngredient = async () => {
        try {
          const token = localStorage.getItem('accessToken');
          const response = await fetch(`${API_BASE_URL}/player/ingredient`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          });
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          setIngredient(data.Ingredient); // Save data to state if needed
        } catch (error) {
          console.error('Error fetching ingredient:', error);
        }
      };

      fetchIngredient();
    }
  }, [targetTimestamp]);

  if(!token) {
    return <Signin />
  }

  if(jwtDecode(token).userId === 1){
    return <Admin />
  }

  if (Date.now() > targetTimestamp && ingredient) {
    return <Ingredient />;
  }

  return (
    <div className="wrapper">
      <BrowserRouter>
        <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;