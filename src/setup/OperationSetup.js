import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function OperationSetup() {
  const [operations, setOperations] = useState([]);
  const [newOperation, setNewOperation] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');

  useEffect(() => {
    fetchOperations();
    fetchDepartments();
  }, []);

  async function fetchOperations() {
    const { data, error } = await supabase.from('operations').select('*');
    if (!error) setOperations(data);
  }

  async function fetchDepartments() {
    const { data, error } = await supabase.from('departments').select('*');
    if (!error) setDepartments(data);
  }

  async function saveOperation() {
    if (!newOperation || !selectedDept) return;

    await supabase.from('operations').insert([
      {
        name: newOperation,
        department_id: selectedDept,
      },
    ]);

    setNewOperation('');
    setSelectedDept('');
    fetchOperations();
  }

  return (
    <div>
      <h2>Operation Setup</h2>

      <input
        type="text"
        placeholder="Operation Name"
        value={newOperation}
        onChange={(e) => setNewOperation(e.target.value)}
      />

      <select
        value={selectedDept}
        onChange={(e) => setSelectedDept(e.target.value)}
      >
        <option value="">Select Department</option>
        {departments.map((dept) => (
          <option key={dept.id} value={dept.id}>
            {dept.name}
          </option>
        ))}
      </select>

      <button onClick={saveOperation}>Save Operation</button>

      <h3>Existing Operations</h3>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Operation Name</th>
            <th>Department</th>
          </tr>
        </thead>
        <tbody>
          {operations.map((op) => {
            const dept = departments.find((d) => d.id === op.department_id);
            return (
              <tr key={op.id}>
                <td>{op.name}</td>
                <td>{dept ? dept.name : 'Not assigned'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default OperationSetup;