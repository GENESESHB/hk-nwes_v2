import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from 'react-modal';
import ReactMde from 'react-mde';
import * as Showdown from 'showdown';
import 'react-mde/lib/styles/css/react-mde-all.css';
import { useAuth } from '../../contexts/AuthContext'; // Adjust path as needed
import './media.css';

Modal.setAppElement('#root');

const converter = new Showdown.Converter({
  tables: true,
  simplifiedAutoLink: true,
  strikethrough: true,
  tasklists: true,
});

function MediaServices() {
  const { user } = useAuth(); // Ensure this is used correctly
  const [services, setServices] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    image: null,
    heading: '',
    description: '',
    keymarketing: '',
  });
  const [selectedTab, setSelectedTab] = useState('write');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    authenticateUser();
    fetchMediaServices();
  }, []); // Ensure that useEffect runs only once on component mount

  const authenticateUser = async () => {
    try {
      const userData = user; // Ensure this is called correctly
      console.log('User data:', userData);
      if (!userData) {
        navigate('/controller');
      }
    } catch (error) {
      console.error('Error authenticating user:', error);
      navigate('/controller');
    }
  };

  const fetchMediaServices = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/user/${user._id}/mediaservices`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const servicesData = await response.json();
        setServices(servicesData);
      } else {
        console.error('Failed to fetch media services');
      }
    } catch (error) {
      console.error('Error fetching media services:', error);
    }
  };

  const handleAddService = () => {
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService({
      ...newService,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    setNewService({
      ...newService,
      image: e.target.files[0],
    });
  };

  const handleDescriptionChange = (value) => {
    setNewService({
      ...newService,
      description: value,
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newService.name);
    formData.append('image', newService.image);
    formData.append('heading', newService.heading);
    formData.append('description', newService.description);
    formData.append('keymarketing', newService.keymarketing);
    formData.append('user_id', user._id);
    try {
      const response = await fetch('http://localhost:5000/api/user/mediaservices', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (response.ok) {
        const newServiceData = await response.json();
        setServices([newServiceData, ...services]);
        setIsModalOpen(false);
        setNewService({
          name: '',
          image: null,
          heading: '',
          description: '',
          keymarketing: '',
        });
        setFieldErrors({});
      } else {
        const errorData = await response.json();
        setFieldErrors(errorData);
        console.error('Failed to create new service');
      }
    } catch (error) {
      console.error('Error creating new service:', error);
    }
  };

  return (
    <div className="containersrv">
      <header>
        <h1>مرحبًا بك في خدمات الإعلام</h1>
        <p>هنا يمكنك العثور على خدمات الإعلام الخاصة بك وإدارتها</p>
        <button onClick={handleAddService}>إضافة خبر</button>
      </header>
      <main>
        {services.length === 0 ? (
          <p>لا يوجد أخبار متاحة الآن، يمكنك إضافتها بالنقر على الزر أعلاه</p>
        ) : (
          <div className="service-grid">
            {services.map((service) => (
              <div key={service._id} className="service-card">
                <a onClick={() => navigate(`/service/${service._id}`)}>
                  <img src={`http://localhost:5000/uploads/${service.image}`} alt="Product Image" />
                </a>
                <div className="service-content">
                  <a onClick={() => navigate(`/service/${service._id}`)}>
                    <h1>{service.name}</h1>
                  </a>
                  <p>{service.heading}</p>
                  <div className="service-footer">
                    <p>{service.keymarketing}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Add New Service"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2 className="modal-title">إضافة خبر</h2>
        <form onSubmit={handleFormSubmit} className="modal-form">
          <div>
            <label>عنوان</label>
            <input
              placeholder="عنوان الخبر"
              type="text"
              name="name"
              value={newService.name}
              onChange={handleInputChange}
              required
            />
            {fieldErrors.name && (
              <p className="error-message">{fieldErrors.name}</p>
            )}
          </div>
          <div>
            <label>صورة الخبر</label>
            <input
              type="file"
              name="image"
              onChange={handleImageChange}
              required
            />
            {fieldErrors.image && (
              <p className="error-message">{fieldErrors.image}</p>
            )}
          </div>
          <div>
            <label>العنوان الفرعي </label>
            <input
              placeholder="يرجى إدخال العنوان الفرعي الخبر"
              type="text"
              name="heading"
              value={newService.heading}
              onChange={handleInputChange}
            />
            {fieldErrors.heading && (
              <p className="error-message">{fieldErrors.heading}</p>
            )}
          </div>
          <div>
            <label>الوصف</label>
            <ReactMde
              value={newService.description}
              onChange={handleDescriptionChange}
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
              generateMarkdownPreview={(markdown) =>
                Promise.resolve(converter.makeHtml(markdown))
              }
              required
              className="description-editor"
            />
            {fieldErrors.description && (
              <p className="error-message">{fieldErrors.description}</p>
            )}
          </div>
          <div>
            <label>كلمة التسويق</label>
            <input
              placeholder="الرجاء إدخال كلمة التسويق (مثال: حصري، الآن ...)"
              type="text"
              name="keymarketing"
              value={newService.keymarketing}
              onChange={handleInputChange}
              required
            />
            {fieldErrors.keymarketing && (
              <p className="error-message">{fieldErrors.keymarketing}</p>
            )}
          </div>
          <div className="modal-buttons">
            <button type="submit" className="save-button">
              حفظ
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className="cancel-button">
              لا
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MediaServices;

