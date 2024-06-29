import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTrashAlt } from 'react-icons/fa';
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

function SportServices() {
  const { login, logout, user } = useAuth(); // Ensure this is used correctly

  const [services, setServices] = useState([]);
  const [nextPage, setNextPage] = useState(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    image: null,
    heading: '',
    description: '',
    price: '',
  });
  const [selectedTab, setSelectedTab] = useState('write');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    authenticateUser();
    fetchServices('http://localhost:5000/api/users/my-products/');
  }, []);

  const authenticateUser = async () => {
    try {
      const userData = await login(); // Ensure this is called correctly
      if (userData) {
        fetchServices('http://localhost:5000/api/users/my-products/');
      }
    } catch (error) {
      navigate('/Login');
    }
  };

  const fetchServices = async (url) => {
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch services');
      }
      const data = await response.json();
      setServices(prevServices => initialLoad ? data : [...prevServices, ...data]);
      setNextPage(data.next);
      setInitialLoad(false);
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const handleProductClick = (id) => () => { navigate(`/service/${id}`); };

  const handleAddService = () => {
    setIsModalOpen(true);
  };

  const handleDeleteService = async (id) => {
    try {
      const response = await fetch('http://localhost:5000/products/${id}/', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (response.ok) {
        setServices(services.filter(service => service.id !== id));
      } else {
        console.error('Failed to delete service');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewService({
      ...newService,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    setNewService({
      ...newService,
      image: e.target.files[0]
    });
  };

  const handleDescriptionChange = (value) => {
    setNewService({
      ...newService,
      description: value
    });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newService.name);
    formData.append('image', newService.image);
    formData.append('heading', newService.heading);
    formData.append('description', newService.description);
    formData.append('price', newService.price);

    try {
      const response = await fetch('http://localhost:5000/products/', {
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
          price: '',
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
        <h1>مرحبًا بك في خدمات الإعلام والطقس والرياضة</h1>
        <p>هنا يمكنك العثور على خدمات الإعلام الخاصة بك وإدارتها، بالإضافة إلى معلومات الرياضة.</p>
        <button onClick={handleAddService}>إضافة الخبر</button>
      </header>
      <main>
        {services.length === 0 ? (
          <p>لا يوجد خدمات متاحة الآن، يمكنك إضافتها بالنقر على الزر أعلاه</p>
        ) : (
          <div className="service-grid">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <a onClick={() => handleProductClick(service.id)}>
                  <img src={`backendhb/${service.image}`} alt="صورة الخبر" />
                </a>
                <div className="service-content">
                  <a onClick={() => handleProductClick(service.id)}>
                    <h1>{service.name}</h1>
                  </a>
                  <p>{service.heading}</p>
                  <div className="service-footer">
                    <p>{service.keymarketing}</p>
                    <button onClick={() => handleDeleteService(service.id)}>
                      <FaTrashAlt />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="view-more">
          {nextPage && (
            <button
              type="button"
              onClick={() => fetchServices(nextPage)}
              className="view-more-button"
            >
              عرض المزيد
            </button>
          )}
        </div>
      </main>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="إضافة خدمة جديدة"
        className="modal"
        overlayClassName="modal-overlay"
      >
        <h2 className="modal-title">إضافة الخبر</h2>
        <form onSubmit={handleFormSubmit} className="modal-form">
          <div>
            <label>العنوان</label>
            <input
              placeholder="عنوان الخدمة"
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
            <label>العنوان الفرعي</label>
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
              إلغاء
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default SportServices;
