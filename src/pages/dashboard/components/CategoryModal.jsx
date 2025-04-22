import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Table, Image, OverlayTrigger, Tooltip, Spinner } from 'react-bootstrap';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../services/firebaseService';
import { uploadImageToImgur } from '../../../services/uploadImageToImgur';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';

const CategoryModal = ({ show, onHide }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [subcategories, setSubcategories] = useState(['']);
  const [iconFile, setIconFile] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'categories'));
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setCategories(data);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setLoading(false);
      }
    };
    if (show) fetchCategories();
  }, [show]);

  const resetForm = () => {
    setName('');
    setSubcategories(['']);
    setIconFile(null);
    setEditIndex(null);
  };

  const handleAddSubcategory = () => {
    setSubcategories([...subcategories, '']);
  };

  const handleSubcategoryChange = (index, value) => {
    const updated = [...subcategories];
    updated[index] = value;
    setSubcategories(updated);
  };

  const handleRemoveSubcategory = (index) => {
    const updated = subcategories.filter((_, i) => i !== index);
    setSubcategories(updated);
  };

  const handleSave = async () => {
    try {
      let iconUrl = categories[editIndex]?.iconUrl || '';
      console.log("iconFile:", iconFile);

      if (iconFile) {
        iconUrl = await uploadImageToImgur(iconFile);
        console.log("Imagen subida a:", iconUrl);
      }

      const categoryData = {
        name,
        subcategories: subcategories.filter(sc => sc.trim() !== ''),
        iconUrl
      };

      if (editIndex !== null) {
        const categoryRef = doc(db, 'categories', categories[editIndex].id);
        await updateDoc(categoryRef, categoryData);
        const updatedCategories = [...categories];
        updatedCategories[editIndex] = { ...updatedCategories[editIndex], ...categoryData };
        setCategories(updatedCategories);
      } else {
        const docRef = await addDoc(collection(db, 'categories'), categoryData);
        setCategories(prev => [...prev, { id: docRef.id, ...categoryData }]);
      }

      resetForm();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
    }
  };

  const handleEdit = (index) => {
    const cat = categories[index];
    setName(cat.name);
    setSubcategories(cat.subcategories || []);
    setEditIndex(index);
    setIconFile(null); // Se mantiene null para forzar que se cargue nueva si se desea
  };

  const handleDelete = async (index) => {
    const confirm = window.confirm('¿Estás seguro de que querés eliminar esta categoría?');
    if (!confirm) return;
    try {
      await deleteDoc(doc(db, 'categories', categories[index].id));
      setCategories(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
    }
  };

  return (
    <Modal show={show} onHide={() => { onHide(); resetForm(); }} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Administrar Categorías</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Nombre de la categoría</Form.Label>
            <Form.Control
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Informática, Redes, etc."
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Subcategorías</Form.Label>
            {subcategories.map((sub, index) => (
              <div key={index} className="d-flex gap-2 mb-2">
                <Form.Control
                  type="text"
                  value={sub}
                  onChange={(e) => handleSubcategoryChange(index, e.target.value)}
                  placeholder={`Subcategoría ${index + 1}`}
                />
                <Button variant="danger" onClick={() => handleRemoveSubcategory(index)}>-</Button>
              </div>
            ))}
            <Button variant="secondary" onClick={handleAddSubcategory}>Agregar Subcategoría</Button>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Icono de la categoría</Form.Label>
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setIconFile(e.target.files[0])}
            />
            {iconFile && (
              <div className="mt-2">
                <strong>Vista previa:</strong>
                <br />
                <Image src={URL.createObjectURL(iconFile)} width={60} height={60} rounded />
              </div>
            )}
          </Form.Group>

          <Button variant="primary" onClick={handleSave}>Guardar</Button>
        </Form>

        <hr />

        {loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" />
            <div>Cargando categorías...</div>
          </div>
        ) : (
          <Table striped bordered hover className="mt-4">
            <thead>
              <tr>
                <th>Icono</th>
                <th>Nombre</th>
                <th>Subcategorías</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat, index) => (
                <tr key={cat.id}>
                  <td>
                    {cat.iconUrl ? (
                      <Image src={cat.iconUrl} width={40} height={40} rounded />
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{cat.name}</td>
                  <td>
                    {cat.subcategories?.length ? cat.subcategories.join(', ') : '—'}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <OverlayTrigger placement="top" overlay={<Tooltip>Editar</Tooltip>}>
                        <Button variant="outline-primary" size="sm" onClick={() => handleEdit(index)}>
                          <FaEdit />
                        </Button>
                      </OverlayTrigger>

                      <OverlayTrigger placement="top" overlay={<Tooltip>Eliminar</Tooltip>}>
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(index)}>
                          <FaTrashAlt />
                        </Button>
                      </OverlayTrigger>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center text-muted">
                    No hay categorías registradas.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default CategoryModal;
