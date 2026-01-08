import React, { useState } from 'react';
import { supabase } from './supabaseClient';

function AddEmployee() {
  const [name, setName] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [message, setMessage] = useState('');

  async function saveEmployee() {
    const { data, error } = await supabase
      .from('employees')
      .insert([{ name, employee_code: employeeCode, position, department }]);

    if (error) {
      setMessage('Error saving employee: ' + error.message);
    } else {
      setMessage('Employee saved successfully!');
      setName('');
      setEmployeeCode('');
      setPosition('');
      setDepartment('');
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Add Employee</h1>

      <label>Name:</label>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />

      <label>Employee Code:</label>
      <input
        type="text"
        value={employeeCode}
        onChange={e => setEmployeeCode(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />

      <label>Position:</label>
      <input
        type="text"
        value={position}
        onChange={e => setPosition(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />

      <label>Department:</label>
      <input
        type="text"
        value={department}
        onChange={e => setDepartment(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />

      <button onClick={saveEmployee}>Save Employee</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default AddEmployee;