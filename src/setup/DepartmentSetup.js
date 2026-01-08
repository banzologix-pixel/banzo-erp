import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function DepartmentSetup() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  async function loadDepartments() {
    const { data } = await supabase
      .from('departments')
      .select('id, name')
      .order('name');

    setDepartments(data || []);
  }

  async function saveDepartment() {
    const { error } = await supabase
      .from('departments')
      .insert({ name });

    if (error) {
      console.error(error);
      alert('Error saving department');
      return;
    }

    alert('Department saved');
    setName('');
    loadDepartments();
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Department Setup</h2>

      <div>
        <label>Name:</label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      <button onClick={saveDepartment} style={{ marginTop: 10 }}>
        Save Department
      </button>

      <h3 style={{ marginTop: 30 }}>Existing Departments</h3>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {departments.map((d) => (
            <tr key={d.id}>
              <td>{d.name}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DepartmentSetup;