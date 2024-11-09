import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Signin from './site/signin';
import Home from './site/home';
import Admin from './site/admin';
import { jwtDecode } from 'jwt-decode';

function App() {
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    document.title = "YesChase";
  }, []);

  if(!token) {
    return <Signin />
  }

  if(jwtDecode(token).userId === 1){
    return <Admin />
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