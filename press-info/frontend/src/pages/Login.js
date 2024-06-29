import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Make sure this path is correct
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/login', {
        email,
        password,
      });
      setLoading(false);
      console.log('Login successful:', response.data);
      setMessage('Login successful');
      const token = response.data.token;
      console.log('Received token:', token); // Debugging
      await login(token); // Set the authentication token in context
      navigate('/controller'); // Redirect to the Controller page
    } catch (error) {
      setLoading(false);
      console.error('Login failed:', error);
      setMessage(error.response?.data?.message || 'Login failed');
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>welcome to HB-press 🌍</h1>
        <p> plaise set your email✉&passwoed🔑</p>
        {message && <p>{message}</p>}
        {loading && <div className="loader"></div>}
        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>
        <button onClick={() => navigate('/register')} className="register-button">
          Register
        </button>
        <button onClick={handleForgotPassword} className="forgot-password-button">
          Forgot Password
        </button>
      </div>
    </div>
  );
};

export default Login;
