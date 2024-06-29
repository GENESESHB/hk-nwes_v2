import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import avatar from './avatar.png';
import './Controller.css';
import { FaLinkedin, FaFacebook, FaInstagram, FaCamera, FaCloud, FaFutbol } from 'react-icons/fa';

const Controller = () => {
  const { user } = useAuth();
  console.log('User info:', user); // Log user info to check its structure
  const navigate = useNavigate();

  const [freelancer, setFreelancer] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    profile_picture: '',
    bio: '',
    date_of_birth: null,
    languages_spoken: '',
    linkedin_url: '',
    facebook_url: '',
    instagram_url: '',
    role: ''
  });

  const [editMode, setEditMode] = useState(false);
  const [profilePicture, setProfilePicture] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [activeCard, setActiveCard] = useState(1);

  useEffect(() => {
    authenticateUser();
  }, []);

  const authenticateUser = async () => {
    try {
      if (!user) {
        navigate('/login');
        return;
      }

      setFreelancer({
        name: user.fullName || '',
        email: user.email || '',
        phone: user.phoneNumber || '',
        country: user.country || '',
        city: user.city || '',
        profile_picture: user.profile_picture || '',
        bio: user.bio || '',
        date_of_birth: user.date_of_birth || null,
        languages_spoken: user.languages_spoken || '',
        linkedin_url: user.linkedin_url || '',
        facebook_url: user.facebook_url || '',
        instagram_url: user.instagram_url || '',
        role: user.role || ''
      });
    } catch (error) {
      console.error('Error authenticating user:', error);
      navigate('/login');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFreelancer({
      ...freelancer,
      [name]: value
    });
  };

  const handleProfilePictureChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleEditProfile = () => {
    setEditMode(true);
    setActiveCard(2);
  };

  const handleSaveProfile = async () => {
    try {
      const userId = user._id;
      if (userId == null) {
         console.log('User id is null');
         return; // Exit early or handle the scenario where userId is null
      }
      console.log('User id for save profile:', userId);

      const formData = new FormData();
      formData.append('name', freelancer.name);
      formData.append('phone', freelancer.phone);
      formData.append('country', freelancer.country);
      formData.append('city', freelancer.city);
      formData.append('bio', freelancer.bio);
      formData.append('date_of_birth', freelancer.date_of_birth);
      formData.append('languages_spoken', freelancer.languages_spoken);
      formData.append('linkedin_url', freelancer.linkedin_url);
      formData.append('facebook_url', freelancer.facebook_url);
      formData.append('instagram_url', freelancer.instagram_url);
      if (profilePicture) {
        formData.append('profile_picture', profilePicture);
      }
      console.log('FormData before fetch:', formData);
      const response = await fetch(`http://localhost:5000/api/users/update-information/${userId}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include', // Include credentials if using cookies or sessions
      });

      if (!response.ok) {
        const errorData = await response.json();
        setFieldErrors(errorData);
        throw new Error('Failed to update profile.');
      }

      const updatedUserData = await response.json(); // Assuming backend returns updated user data
      console.log('Updated User Data:', updatedUserData);
      setSuccessMessage('Profile updated successfully.');
      setFieldErrors({});
      setErrorMessage('');
      setEditMode(false);
      setActiveCard(1);

      // Optionally update local user state or navigate to another page
      // Example: updateLocalUserData(updatedUserData);
      // navigate('/profile'); // Redirect to profile page
    } catch (error) {
      console.error('Error saving profile:', error);
      setErrorMessage('Failed to update profile.');
    }
  };

  const handleMediaClick = () => {
    navigate('/mediainfo');
  };

  const handleSportClick = () => {
    navigate('/sportinfos');
  };

  const handleMeteoClick = () => {
    navigate('/meteoinfo');
  };

  return (
    <div className="controller-container">
      <div className="controller-profile">
        <div className="controller-profile-header">
          <img src={freelancer.profile_picture ? `http://localhost:5000/${freelancer.profile_picture}` : avatar} alt="Profile" />
          <h1>{freelancer.name || "N/A"}</h1>
          <p>{freelancer.bio}</p>
        </div>
        <div className="controller-profile-links">
          {freelancer.linkedin_url && (
            <a href={freelancer.linkedin_url} target="_blank" rel="noopener noreferrer">
              <FaLinkedin />
            </a>
          )}
          {freelancer.facebook_url && (
            <a href={freelancer.facebook_url} target="_blank" rel="noopener noreferrer">
              <FaFacebook />
            </a>
          )}
          {freelancer.instagram_url && (
            <a href={freelancer.instagram_url} target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
          )}
        </div>
        {errorMessage && (
          <div className="controller-message controller-error-message">{errorMessage}</div>
        )}
        {successMessage && (
          <div className="controller-message controller-success-message">{successMessage}</div>
        )}
        {activeCard === 1 && (
          <div class="card1">
            <div class=" addservice">
              <button onClick={handleMediaClick} className="mediainfo"><FaCamera /><span> add medio info</span></button>
              <button onClick={handleSportClick} className="sportinfo"><FaFutbol /><span> add sport info</span></button>
              <button onClick={handleMeteoClick} className="meteoinfo"><FaCloud /><span> add meteo info</span></button>
            </div>
            <div class=" items">
               <div className="controller-info-item">
                  <label>الهاتف:</label>
                  <p>{freelancer.phone}</p>
               </div>
A               <div className="controller-info-item">
                  <label>البلد:</label>
                  <p>{freelancer.country}</p>
               </div>
               <div className="controller-info-item">
                  <label>المدينة:</label>
                  <p>{freelancer.city}</p>
               </div>
               <div className="controller-info-item">
                  <label>أتكلم:</label>
                  <p>{freelancer.languages_spoken}</p>
               </div>
               {freelancer.date_of_birth && (
                   <div className="controller-info-item">
                      <label>تاريخ الازدياد:</label>
                      <p>{new Date(freelancer.date_of_birth).toLocaleDateString()}</p>
                   </div>
               )}
               <div className="controller-btn-group">
                  <button className="edit-btn" onClick={handleEditProfile}>تعد يل</button>
               </div>
            </div>
          </div>
        )}
        {activeCard === 2 && (
          <div className="controller-profile-info">
            <div className="controller-info-item">
              <label>ألاسم:</label>
              <input
                type="text"
                name="name"
                value={freelancer.name}
                onChange={handleInputChange}
              />
              {fieldErrors.name && (
                <div className="controller-message controller-error-message">{fieldErrors.name}</div>
              )}
            </div>
            <div className="controller-info-item">
              <label>الهاتف:</label>
              <input
                type="tel"
                name="phone"
                value={freelancer.phone}
                onChange={handleInputChange}
              />
              {fieldErrors.phone && (
                <div className="controller-message controller-error-message">{fieldErrors.phone}</div>
              )}
            </div>
            <div className="controller-info-item">
              <label>البلد:</label>
              <input
                type="text"
                name="country"
                value={freelancer.country}
                onChange={handleInputChange}
              />
              {fieldErrors.country && (
                <div className="controller-message controller-error-message">{fieldErrors.country}</div>
              )}
            </div>
            <div className="controller-info-item">
              <label>المدينة:</label>
              <input
                type="text"
                name="city"
                value={freelancer.city}
                onChange={handleInputChange}
              />
              {fieldErrors.city && (
                <div className="controller-message controller-error-message">{fieldErrors.city}</div>
              )}
            </div>
            <div className="controller-info-item">
              <label>اتكلم للاات</label>
              <input
                type="text"
                name="languages_spoken"
                value={freelancer.languages_spoken}
                onChange={handleInputChange}
              />
              {fieldErrors.languages_spoken && (
                <div className="controller-message controller-error-message">{fieldErrors.languages_spoken}</div>
              )}
            </div>
            <div className="controller-info-item">
              <label>مزداد في :</label>
              <input
                type="date"
                name="date_of_birth"
                value={freelancer.date_of_birth || ''}
                onChange={handleInputChange}
              />
              {fieldErrors.date_of_birth && (
                <div className="controller-message controller-error-message">{fieldErrors.date_of_birth}</div>
              )}
            </div>
            <div className="controller-info-item">
              <label>تعريف شخصي :</label>
              <textarea
                name="bio"
                value={freelancer.bio}
                onChange={handleInputChange}
              />
              {fieldErrors.bio && (
                <div className="controller-message controller-error-message">{fieldErrors.bio}</div>
              )}
            </div>
            <div className="controller-info-item">
              <label>LinkedIn URL:</label>
              <input
                type="text"
                name="linkedin_url"
                value={freelancer.linkedin_url}
                onChange={handleInputChange}
              />
              {fieldErrors.linkedin_url && (
                <div className="controller-message controller-error-message">{fieldErrors.linkedin_url}</div>
              )}
            </div>
            <div className="controller-info-item">
              <label>Facebook URL:</label>
              <input
                type="text"
                name="facebook_url"
                value={freelancer.facebook_url}
                onChange={handleInputChange}
              />
              {fieldErrors.facebook_url && (
                <div className="controller-message controller-error-message">{fieldErrors.facebook_url}</div>
              )}
            </div>
            <div className="controller-info-item">
              <label>Instagram URL:</label>
              <input
                type="text"
                name="instagram_url"
                value={freelancer.instagram_url}
                onChange={handleInputChange}
              />
              {fieldErrors.instagram_url && (
                <div className="controller-message controller-error-message">{fieldErrors.instagram_url}</div>
              )}
            </div>
            <div className="controller-info-item">
              <label>أظافة صورة:</label>
              <input
                type="file"
                name="profile_picture"
                onChange={handleProfilePictureChange}
              />
              {fieldErrors.profile_picture && (
                <div className="controller-message controller-error-message">{fieldErrors.profile_picture}</div>
              )}
            </div>
            <div className="controller-btn-group">
              <button className="save-btn" onClick={handleSaveProfile}>حفظ</button>
              <button className="cancel-btn" onClick={() => {
                setEditMode(false);
                setActiveCard(1);
              }}>لا</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Controller;

