import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { auth } from '../../../services/firebaseService';
import ServiceTable from '../components/ServiceTable';
import CategoryModal from '../components/CategoryModal'; // 👈 Importamos el modal

const DashboardPage = () => {
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
  };

  return (
    <>
      <div className="container pb-3 pt-3">
        <div className='d-flex justify-content-end'>
          <Button variant="danger" onClick={handleLogout}>Cerrar sesión</Button>
        </div>
        <h2 className='text-center my-2'>Panel de control Pedilo-Ya</h2>

        {/* Botón para abrir el modal de categorías */}
        <div className="text-center mt-3">
          <Button variant="secondary" onClick={() => setShowCategoryModal(true)}>
            Administrar Categorías
          </Button>
        </div>
      </div>

      <div>
        <ServiceTable />
      </div>

      {/* Modal de Categorías */}
      <CategoryModal
        show={showCategoryModal}
        onHide={() => setShowCategoryModal(false)}
      />
    </>
  );
};

export default DashboardPage;
