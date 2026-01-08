import React from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav style={{
      background: '#333',
      padding: '10px',
      display: 'flex',
      gap: '20px'
    }}>
      <Link to="/order-entry" style={{ color: 'white', textDecoration: 'none' }}>
        Order Entry
      </Link>

      <Link to="/order-list" style={{ color: 'white', textDecoration: 'none' }}>
        Order List
      </Link>

      <Link to="/item-routing" style={{ color: 'white', textDecoration: 'none' }}>
        Item Routing
      </Link>

      <Link to="/traveller/1" style={{ color: 'white', textDecoration: 'none' }}>
        Traveller (Test)
      </Link>

      <Link to="/add-employee" style={{ color: 'white', textDecoration: 'none' }}>
        Add Employee
      </Link>

      <Link to="/add-item" style={{ color: 'white', textDecoration: 'none' }}>
        Add Item
      </Link>

      <Link to="/add-department" style={{ color: 'white', textDecoration: 'none' }}>
        Add Department
      </Link>

      <Link to="/add-operation" style={{ color: 'white', textDecoration: 'none' }}>
        Add Operation
      </Link>

      <Link to="/add-routing" style={{ color: 'white', textDecoration: 'none' }}>
        Add Routing
      </Link>

      <Link to="/component-type-setup" style={{ color: 'white', textDecoration: 'none' }}>
        Component Types
      </Link>

      <Link to="/component-setup" style={{ color: 'white', textDecoration: 'none' }}>
        Components
      </Link>

      <Link to="/uom-setup" style={{ color: 'white', textDecoration: 'none' }}>
        UOM Setup
      </Link>

      <Link to="/bom-setup" style={{ color: 'white', textDecoration: 'none' }}>
        BOM Setup
      </Link>

      {/* ⭐ NEW LINK ADDED HERE ⭐ */}
      <Link to="/department-queue" style={{ color: 'white', textDecoration: 'none' }}>
        Department Queue
      </Link>

    </nav>
  );
}

export default Navbar;