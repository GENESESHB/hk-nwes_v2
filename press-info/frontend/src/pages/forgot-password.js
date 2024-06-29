import React, { useState } from 'react';
import axios from 'axios';
import './Register.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleResetRequest = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/forgot-password', { email });
      setMessage(response.data.message);
    } catch (error) {
      console.error('Password reset request failed:', error);
      setMessage(error.response?.data?.message || 'Failed to request password reset');
    }
  };

  return (
    <div className="register-container">
     <div className="register-card">
      <h2>Forgot Password</h2>
      <form onSubmit={handleResetRequest}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      {message && <p>{message}</p>}
     </div>
    </div>
  );
};

export default ForgotPassword;
