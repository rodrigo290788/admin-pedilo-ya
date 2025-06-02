import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Image, ListGroup } from 'react-bootstrap';
import { uploadImageToImgur } from '../../../services/uploadImageToImgur';
import { getDocs, collection, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../services/firebaseService'; // Asegúrate de que esté correctamente importado

const EditServiceModal = ({ show, onHide, service, onSave }) => {
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [ratings, setRatings] = useState([]);

  const fieldOrder = [
    'fullName', 'dni', 'professionalLicense', 'address',
    'companyName', 'contactNumber', 'postTitle',
    'shortDescription', 'longDescription',
    'facebookPage', 'website',
    'category', 'subcategory',
    'qualification', 'status'
  ];

  const fieldLabels = {
  fullName: 'Nombre completo',
  dni: 'DNI',
  professionalLicense: 'Matrícula profesional',
  address: 'Dirección',
  companyName: 'Nombre de la empresa',
  contactNumber: 'Teléfono de contacto',
  postTitle: 'Título del anuncio',
  shortDescription: 'Descripción corta',
  longDescription: 'Descripción larga',
  facebookPage: 'Página de Facebook',
  website: 'Sitio web',
  category: 'Categoría',
  subcategory: 'Subcategoría',
  qualification: 'Calificación',
  status: 'Estado'
};

  useEffect(() => {
    if (service) {
      setFormData(service);
      setImagePreview(service.imageUrl || '');

      // Cargar comentarios si hay serviceId
      if (service.id) {
        fetchRatings(service.id);
      }
    }
  }, [service]);

  const handleGalleryImageUpload = async (e) => {
  const files = Array.from(e.target.files);
  setIsUploading(true);
  const uploadedUrls = [];

  for (const file of files) {
    const url = await uploadImageToImgur(file);
    if (url) uploadedUrls.push(url);
  }

  setIsUploading(false);

  setFormData(prev => ({
    ...prev,
    gallery: [...(prev.gallery || []), ...uploadedUrls]
  }));
};

const handleRemoveGalleryImage = (indexToRemove) => {
  setFormData(prev => ({
    ...prev,
    gallery: prev.gallery.filter((_, i) => i !== indexToRemove)
  }));
};


  const fetchRatings = async (serviceId) => {
    try {
      const querySnapshot = await getDocs(collection(db, `services/${serviceId}/ratings`));
      const ratingsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRatings(ratingsData);
    } catch (error) {
      console.error('Error al obtener comentarios:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
  if (!service?.id) return;
  const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este comentario?');
  if (!confirmDelete) return;

  try {
    await deleteDoc(doc(db, `services/${service.id}/ratings`, commentId));
    setRatings(prev => prev.filter(r => r.id !== commentId));
  } catch (error) {
    console.error('Error al eliminar el comentario:', error);
  }
};

  const handleChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleToggleStatus = () => {
    setFormData(prev => ({
      ...prev,
      status: !prev.status
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setIsUploading(true);
    const uploadedUrl = await uploadImageToImgur(file);
    setIsUploading(false);

    if (uploadedUrl) {
      setFormData(prev => ({
        ...prev,
        imageUrl: uploadedUrl
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Editar servicio</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Row className="g-3">
            {fieldOrder.map((key) =>
              key !== 'status' ? (
                <Col md={6} key={key}>
                  <Form.Group>
                    <Form.Label><strong>{fieldLabels[key] || key}</strong></Form.Label>
                    <Form.Control
                      type="text"
                      value={formData[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                    />
                  </Form.Group>
                </Col>
              ) : null
            )}

            <Col md={6}>
              <Form.Label><strong> Estado</strong></Form.Label>
              <div>
                <Button
                  variant={formData.status ? 'success' : 'secondary'}
                  onClick={handleToggleStatus}
                >
                  {formData.status ? 'Activo' : 'Inactivo'}
                </Button>
              </div>
            </Col>

            <Col md={12}>
              <Form.Label><strong>Imagen principal</strong></Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={isUploading}
              />
              {imagePreview && (
                <div className="mt-3">
                  <Image
                    src={imagePreview}
                    alt="Preview"
                    fluid
                    style={{ maxHeight: '200px' }}
                  />
                </div>
              )}
            </Col>

            {/* Galería de imágenes */}
            
            {formData.gallery && formData.gallery.length > 0 && (
  <Col md={12}>
    <Form.Label><strong>Galería de imágenes</strong></Form.Label>
    <div className="d-flex flex-wrap gap-2 mb-3">
      {formData.gallery.map((url, index) => (
        <div key={index} style={{ position: 'relative' }}>
          <Image
            src={url}
            alt={`Imagen ${index + 1}`}
            style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8 }}
          />
          <Button
            variant="danger"
            size="sm"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              borderRadius: '50%',
              padding: '0 6px'
            }}
            onClick={() => handleRemoveGalleryImage(index)}
          >
            ×
          </Button>
        </div>
      ))}
    </div>

    <Form.Control
      type="file"
      accept="image/*"
      multiple
      onChange={handleGalleryImageUpload}
      disabled={isUploading}
    />
  </Col>
)}


            {/* Comentarios con puntuación */}
            {ratings.length > 0 && (
              <Col md={12}>
                <Form.Label><strong>Comentarios</strong></Form.Label>
                <ListGroup>
                  {ratings.map((r) => (
                    <ListGroup.Item key={r.id} className="d-flex justify-content-between align-items-start">
                      <div>
                        <strong>Puntuación:</strong> {r.score} <br />
                        <strong>Comentario:</strong> {r.text} <br />
                        <strong>Fecha:</strong> {r.timestamp?.toDate().toLocaleString()}
                      </div>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteComment(r.id)}
                      >
                        Eliminar
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Col>
            )}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onHide}>Cancelar</Button>
          <Button type="submit" variant="primary" disabled={isUploading}>
            {isUploading ? 'Subiendo imagen...' : 'Guardar cambios'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditServiceModal;
