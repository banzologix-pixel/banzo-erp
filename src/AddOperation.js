import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function AddOperation() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [message, setMessage] = useState('');

  // Load departments for dropdown
  useEffect(() => {
    async function loadDepartments() {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name', { ascending: true });

      if (!error) {
        setDepartments(data);
      }
    }

    loadDepartments();
  }, []);

  async function saveOperation() {
    const { error } = await supabase
      .from('operations')
      .insert([{
        name,
        department_id: departmentId,
        is_active: isActive
      }]);

    if (error) {
      setMessage('Error saving operation: ' + error.message);
    } else {
      setMessage('Operation saved successfully!');
      setName('');
      setDepartmentId('');
      setIsActive(true);
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Add Operation</h1>

      <label>Operation Name:</label>
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      />

      <label>Department:</label>
      <select
        value={departmentId}
        onChange={e => setDepartmentId(e.target.value)}
        style={{ display: 'block', marginBottom: '10px' }}
      >
        <option value="">Select Department</option>
        {departments.map(dep => (
          <option key={dep.id} value={dep.id}>
            {dep.name}
          </option>
        ))}
      </select>

      <label>
        <input
          type="checkbox"
          checked={isActive}
          onChange={e => setIsActive(e.target.checked)}
        />
        Active Operation
      </label>

      <br /><br />

      <button onClick={saveOperation}>Save Operation</button>

      {message && <p>{message}</p>}
    </div>
  );
}

export default AddOperation;