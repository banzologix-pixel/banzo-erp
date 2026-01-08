import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

function DepartmentQueue() {
  const [department, setDepartment] = useState('CUTTING'); 
  const [steps, setSteps] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadDepartmentSteps();
  }, [department]);

  async function loadDepartmentSteps() {
    const { data, error } = await supabase
      .from('job_steps')
      .select(`
        id,
        job_id,
        sequence,
        operation_id,
        operations (
          name
        ),
        department,
        qty,
        status,
        start_time,
        end_time,
        jobs (
          job_number,
          quantity_ordered,
          due_date,
          priority,
          items (
            item_code,
            description
          )
        )
      `)
      .eq('department', department)
      .order('sequence', { ascending: true });

    if (error) {
      console.error('Error loading department queue:', error);
      setMessage('Error loading queue: ' + error.message);
    } else {
      setSteps(data || []);
    }
  }

  function getPriorityColor(priority) {
    if (priority === 'HIGH') return '#ff4d4d';
    if (priority === 'MEDIUM') return '#ffcc00';
    return '#66cc66';
  }

  function calculateSlack(dueDate, standardTime) {
    if (!dueDate) return '—';

    const now = new Date();
    const due = new Date(dueDate);

    const remainingMinutes = standardTime || 0;
    const projectedFinish = new Date(now.getTime() + remainingMinutes * 60000);

    const diff = due - projectedFinish;
    const hours = Math.floor(diff / 3600000);

    if (hours > 0) return `${hours}h ahead`;
    if (hours < 0) return `${Math.abs(hours)}h behind`;

    return 'On time';
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Department Queue</h1>

      <label><strong>Select Department:</strong></label>
      <select
        value={department}
        onChange={(e) => setDepartment(e.target.value)}
        style={{ marginLeft: '10px', padding: '5px' }}
      >
        <option value="CUTTING">CUTTING</option>
        <option value="ASSEMBLY">ASSEMBLY</option>
        <option value="FINISHING">FINISHING</option>
        <option value="PACKING">PACKING</option>
      </select>

      <hr />

      {steps.length === 0 ? (
        <p>No jobs waiting for this department.</p>
      ) : (
        steps.map(step => (
          <div key={step.id} style={{
            border: '1px solid #ccc',
            padding: '15px',
            marginBottom: '15px',
            background: '#fafafa'
          }}>
            <div style={{
              background: getPriorityColor(step.jobs.priority),
              padding: '5px',
              color: 'white',
              fontWeight: 'bold',
              marginBottom: '10px'
            }}>
              Priority: {step.jobs.priority}
            </div>

            <p><strong>Job:</strong> {step.jobs.job_number}</p>
            <p><strong>Item:</strong> {step.jobs.items.item_code} — {step.jobs.items.description}</p>
            <p><strong>Operation:</strong> {step.operations?.name || 'Unknown Operation'}</p>
            <p><strong>Sequence:</strong> {step.sequence}</p>
            <p><strong>Quantity:</strong> {step.jobs.quantity_ordered}</p>
            <p><strong>Due Date:</strong> {step.jobs.due_date}</p>
            <p><strong>Status:</strong> {step.status}</p>
            <p><strong>Slack Time:</strong> {calculateSlack(step.jobs.due_date, step.standard_time)}</p>

            <button
              onClick={() => navigate(`/traveller/${step.job_id}`)}
              style={{
                marginTop: '10px',
                padding: '8px 12px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Open Traveller
            </button>
          </div>
        ))
      )}

      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
}

export default DepartmentQueue;