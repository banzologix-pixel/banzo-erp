import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './Navbar';
import OrderEntry from './OrderEntry';
import OrderList from './OrderList';
import ItemRouting from './ItemRouting';
import Traveller from './Traveller';
import AddEmployee from './AddEmployee';
import AddItem from './AddItem';
import AddDepartment from './AddDepartment';
import AddOperation from './AddOperation';
import AddRouting from './AddRouting';
import ComponentTypeSetup from './ComponentTypeSetup';
import ComponentSetup from './ComponentSetup';
import UomSetup from './UomSetup';
import BOMSetup from './BOMSetup';
import TravellerSheet from './TravellerSheet';
import DepartmentQueue from './DepartmentQueue';
function App() {
  return (
      <div>
        <Navbar />

        <Routes>
          <Route path="/" element={<OrderEntry />} />
          <Route path="/order-entry" element={<OrderEntry />} />
          <Route path="/order-list" element={<OrderList />} />
          <Route path="/item-routing" element={<ItemRouting />} />
          <Route path="/traveller/:jobId" element={<Traveller />} />
          <Route path="/add-employee" element={<AddEmployee />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/add-department" element={<AddDepartment />} />
          <Route path="/add-operation" element={<AddOperation />} />
          <Route path="/add-routing" element={<AddRouting />} />
          <Route path="/component-type-setup" element={<ComponentTypeSetup />} />
          <Route path="/component-setup" element={<ComponentSetup />} />
          <Route path="/uom-setup" element={<UomSetup />} />
          <Route path="/bom-setup" element={<BOMSetup />} />
          <Route path="/traveller/:jobId" element={<TravellerSheet />} />
          <Route path="/department-queue" element={<DepartmentQueue />} />
        </Routes>
      </div>
  );
}

export default App;