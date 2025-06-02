import React, { useEffect, useState } from 'react';
import { Tab, Tabs, Form, Table, Image, Badge, Spinner } from 'react-bootstrap';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../services/firebaseService';
import ActionButtons from './ActionButtons';
import EditServiceModal from './EditServiceModal';

const ServiceTable = () => {
  const [services, setServices] = useState([]);
  const [key, setKey] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'services'));
        const servicesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setServices(servicesData);
      } catch (error) {
        console.error('Error al obtener los servicios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  const handleEdit = (service) => {
    setSelectedService(service);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (updatedService) => {
    try {
      const { id, ...dataToUpdate } = updatedService;
      const serviceRef = doc(db, 'services', id);
      await updateDoc(serviceRef, dataToUpdate);
  
      setServices(prev =>
        prev.map(s => (s.id === id ? { ...s, ...dataToUpdate } : s))
      );
    } catch (error) {
      console.error('Error al actualizar el servicio:', error);
    } finally {
      setShowEditModal(false);
    }
  };
  
  const handleToggleStatus = async (service) => {
    try {
      const serviceRef = doc(db, 'services', service.id);
      await updateDoc(serviceRef, { status: !service.status });
      setServices(prev =>
        prev.map(s =>
          s.id === service.id ? { ...s, status: !s.status } : s
        )
      );
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
    }
  };

  const handleDelete = async (service) => {
    if (!window.confirm('¿Estás seguro de que querés eliminar este servicio?')) return;
    try {
      await deleteDoc(doc(db, 'services', service.id));
      setServices(prev => prev.filter(s => s.id !== service.id));
    } catch (error) {
      console.error('Error al eliminar servicio:', error);
    }
  };

  const filtered = services
  .filter(service => {
    const matchesSearch =
      service.fullName?.toLowerCase().includes(search.toLowerCase()) ||
      service.postTitle?.toLowerCase().includes(search.toLowerCase());

    if (key === 'active') return service.status === true && matchesSearch;
    if (key === 'inactive') return service.status === false && matchesSearch;
    return matchesSearch;
  })
  .sort((a, b) => {
    const dateA = a.createdAt?.toDate?.() || null;
    const dateB = b.createdAt?.toDate?.() || null;

    // Si ambos tienen fecha
    if (dateA && dateB) {
      if (key === 'inactive') {
        return dateA - dateB; // Más antiguos primero
      } else if (key === 'active') {
        return dateB - dateA; // Más recientes primero
      }
    }

    // Si solo uno tiene fecha, lo ponemos antes
    if (dateA && !dateB) return -1;
    if (!dateA && dateB) return 1;

    // Ninguno tiene fecha, no ordenar
    return 0;
  });

  const totalCount = services.length;
  const activeCount = services.filter(s => s.status === true).length;
  const inactiveCount = services.filter(s => s.status === false).length;

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <div>Cargando servicios...</div>
      </div>
    );
  }

  return (
    <div className="container mt-2">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center mb-3">
        <h4 className='mb-3'>Servicios registrados</h4>
        <Form.Control
          type="text"
          placeholder="Buscar por nombre o título..."
          style={{ maxWidth: '300px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs activeKey={key} onSelect={(k) => setKey(k)} className="mb-3">
        <Tab eventKey="all" title={`Todos (${totalCount})`} />
        <Tab eventKey="active" title={`Activos (${activeCount})`} />
        <Tab eventKey="inactive" title={`Inactivos (${inactiveCount})`} />
      </Tabs>

      <div className="table-responsive-sm">
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Imagen</th>
              <th style={{ minWidth: '200px' }}>Título</th>
              <th style={{ minWidth: '160px' }}>Nombre</th>
              <th style={{ width: '90px' }}>Estado</th>
              <th style={{ width: '120px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(service => (
              <tr key={service.id}>
                <td style={{ width: '100px' }}>
                  <Image
                    src={service.imageUrl || `https://via.placeholder.com/80?text=${service.fullName?.[0] || 'S'}`}
                    rounded
                    width={80}
                    height={80}
                    alt={service.fullName}
                  />
                </td>
                <td>{service.postTitle}</td>
                <td>{service.fullName}</td>
                <td style={{ width: '90px' }}>
                  {service.status ? (
                    <Badge bg="success">Activo</Badge>
                  ) : (
                    <Badge bg="secondary">Inactivo</Badge>
                  )}
                </td>
                <td>
                  <ActionButtons
                    service={service}
                    onEdit={handleEdit}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No se encontraron servicios.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </div>

      {/* Modal de edición */}
      <EditServiceModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        service={selectedService}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default ServiceTable;
