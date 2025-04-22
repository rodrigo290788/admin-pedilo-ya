import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Row, Col, Image } from 'react-bootstrap';
import { uploadImageToImgur } from '../../../services/uploadImageToImgur'; // Asegúrate de tener esto actualizado

const EditServiceModal = ({ show, onHide, service, onSave }) => {
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const fieldOrder = [
    'fullName',
    'postTitle',
    'description',
    'phone',
    'email',
    'location',
    'status'
  ];

  useEffect(() => {
    if (service) {
      setFormData(service);
      setImagePreview(service.imageUrl || '');
    }
  }, [service]);

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

    // Preview
    setImagePreview(URL.createObjectURL(file));

    setIsUploading(true);
    const uploadedUrl = await uploadImageToImgur(file); // ✅ Pasamos el File, no el ObjectURL
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
                    <Form.Label>{key}</Form.Label>
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
              <Form.Label>Estado</Form.Label>
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
              <Form.Label>Imagen</Form.Label>
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
