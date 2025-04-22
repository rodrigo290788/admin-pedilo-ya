import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaEdit, FaTrashAlt, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const ActionButtons = ({ service, onEdit, onToggleStatus, onDelete }) => {
  return (
    <div className="d-flex gap-2" style={{ width: '120px' }}>
      <OverlayTrigger placement="top" overlay={<Tooltip>Editar</Tooltip>}>
        <Button variant="outline-primary" size="sm" onClick={() => onEdit(service)}>
          <FaEdit />
        </Button>
      </OverlayTrigger>

      <OverlayTrigger placement="top" overlay={<Tooltip>{service.status ? 'Desactivar' : 'Activar'}</Tooltip>}>
        <Button variant="outline-warning" size="sm" onClick={() => onToggleStatus(service)}>
          {service.status ? <FaToggleOff /> : <FaToggleOn />}
        </Button>
      </OverlayTrigger>

      <OverlayTrigger placement="top" overlay={<Tooltip>Eliminar</Tooltip>}>
        <Button variant="outline-danger" size="sm" onClick={() => onDelete(service)}>
          <FaTrashAlt />
        </Button>
      </OverlayTrigger>
    </div>
  );
};

export default ActionButtons;
