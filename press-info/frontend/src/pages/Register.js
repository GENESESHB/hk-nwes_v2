import React, { useState } from 'react';
import axios from 'axios';
import './Register.css'; // Import CSS file for styling
import { useNavigate } from 'react-router-dom'; // Updated import

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false); // Ensure this is initially false
  const navigate = useNavigate(); // Updated line

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true only when submitting
    try {
      if (password !== confirmPassword) {
        setLoading(false);
        setErrorMessage('Passwords do not match.');
        return;
      }

      const response = await axios.post('http://localhost:5000/register', {
        email,
        fullName,
        password,
        phoneNumber,
        city,
      });

      setLoading(false); // Set loading to false after registration attempt
      console.log('Registration successful:', response.data);
      // Redirect to login page with message
      navigate('/login', { state: { message: 'Please verify your email for access.' } });
    } catch (error) {
      setLoading(false); // Set loading to false if registration fails
      console.error('Registration failed:', error.response.data.message);
      setErrorMessage(error.response.data.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h1>register your information and get account</h1>
        <p> plaise verifier your Email✉   active your account</p>
        {loading && <div className="loader"></div>}
        {!loading && (
          <form onSubmit={handleSubmit} className="register-form">
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
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
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              required
            />
            <button type="submit">Register</button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
