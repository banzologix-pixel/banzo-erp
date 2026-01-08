import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useParams } from 'react-router-dom';

function TravellerSheet() {
  const { jobId } = useParams(); // jobId passed from your board screen
  const [job, setJob] = useState(null);
  const [routingSteps, setRoutingSteps] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadJobHeader();
    loadRoutingSteps();
  }, [jobId]);

  async function loadJobHeader() {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        id,
        job_number,
        item_id,
        quantity,
        due_date,
        priority,
        customer_po,
        items (item_code, description)
      `)
      .eq('id', jobId)
      .single();

    if (error) {
      console.error('Error loading job header:', error);
      setMessage('Error loading job header: ' + error.message);
    } else {
      setJob(data);
    }
  }

  async function loadRoutingSteps() {
    const { data, error } = await supabase
      .from('job_steps')
      .select(`
        id,
        sequence,
        operation_name,
        department,
        standard_time,
        status,
        operator_id,
        start_time,
        end_time
      `)
      .eq('job_id', jobId)
      .order('sequence', { ascending: true });

    if (error) {
      console.error('Error loading routing steps:', error);
      setMessage('Error loading routing steps: ' + error.message);
    } else {
      setRoutingSteps(data || []);
    }
  }

  async function startStep(stepId) {
    const { error } = await supabase
      .from('job_steps')
      .update({
        status: 'in_progress',
        start_time: new Date().toISOString()
      })
      .eq('id', stepId);

    if (error) {
      console.error('Error starting step:', error);
      setMessage('Error starting step: ' + error.message);
    } else {
      loadRoutingSteps();
    }
  }

  async function endStep(stepId) {
    const { error } = await supabase
      .from('job_steps')
      .update({
        status: 'completed',
        end_time: new Date().toISOString()
      })
      .eq('id', stepId);

    if (error) {
      console.error('Error ending step:', error);
      setMessage('Error ending step: ' + error.message);
    } else {
      loadRoutingSteps();
    }
  }

  if (!job) return <p>Loading traveller...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Traveller Sheet</h1>

      <div style={{
        border: '1px solid #ccc',
        padding: '15px',
        marginBottom: '20px',
        background: '#f9f9f9'
      }}>
        <h2>Job Header</h2>
        <p><strong>Job Number:</strong> {job.job_number}</p>
        <p><strong>Item:</strong> {job.items.item_code} — {job.items.description}</p>
        <p><strong>Quantity:</strong> {job.quantity}</p>
        <p><strong>Customer PO:</strong> {job.customer_po}</p>
        <p><strong>Due Date:</strong> {job.due_date}</p>
        <p><strong>Priority:</strong> {job.priority}</p>
      </div>

      <h2>Routing Steps</h2>

      {routingSteps.length === 0 ? (
        <p>No routing steps found.</p>
      ) : (
        routingSteps.map(step => (
          <div key={step.id} style={{
            border: '1px solid #ddd',
            padding: '10px',
            marginBottom: '10px'
          }}>
            <p><strong>Seq:</strong> {step.sequence}</p>
            <p><strong>Operation:</strong> {step.operation_name}</p>
            <p><strong>Department:</strong> {step.department}</p>
            <p><strong>Std Time:</strong> {step.standard_time} min</p>
            <p><strong>Status:</strong> {step.status}</p>
            <p><strong>Operator:</strong> {step.operator_id || '—'}</p>
            <p><strong>Start:</strong> {step.start_time || '—'}</p>
            <p><strong>End:</strong> {step.end_time || '—'}</p>

            {step.status === 'not_started' && (
              <button onClick={() => startStep(step.id)}>Start Step</button>
            )}

            {step.status === 'in_progress' && (
              <button onClick={() => endStep(step.id)}>End Step</button>
            )}
          </div>
        ))
      )}

      {message && <p style={{ color: 'red' }}>{message}</p>}
    </div>
  );
}

export default TravellerSheet;