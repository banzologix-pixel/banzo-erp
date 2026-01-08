import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { QRCodeSVG } from 'qrcode.react';

function Traveller() {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [routing, setRouting] = useState([]);
  const [operatorId, setOperatorId] = useState('');
  const [activeStepId, setActiveStepId] = useState(null);
  const [jobSteps, setJobSteps] = useState([]);
  
  useEffect(() => {
    async function loadJob() {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) console.log(error);
      else setJob(data);
    }

    loadJob();
  }, [jobId]);

  useEffect(() => {
    async function loadRouting() {
      const { data, error } = await supabase
        .from('item_routing')
        .select('*')
        .eq('item_code', job?.item_code)
        .order('sequence', { ascending: true });

      if (error) console.log(error);
      else setRouting(data);
    }

    if (job) loadRouting();
  }, [job]);
async function startStep() {
  if (!operatorId || !job) return;

  const { data, error } = await supabase
    .from('job_steps')
    .insert([
      {
        job_id: job.id,
        operator_id: operatorId,
        start_time: new Date().toISOString(),
        status: 'In Progress'
      }
    ])
    .select()
    .single();

  if (error) {
    console.log('Error starting step:', error);
  } else {
    console.log('Step started:', data);
    setActiveStepId(data.id);
  }
}

async function completeStep() {
  if (!activeStepId) return;

  const { data, error } = await supabase
    .from('job_steps')
    .update({
      end_time: new Date().toISOString(),
      status: 'Completed'
    })
    .eq('id', activeStepId)
    .select()
    .single();

  if (error) {
    console.log('Error completing step:', error);
  } else {
    console.log('Step completed:', data);
    setActiveStepId(null);
  }
}
 useEffect(() => {
  async function loadJobSteps() {
    const { data, error } = await supabase
      .from('job_steps')
      .select('*')
      .eq('job_id', job.id)
      .order('start_time', { ascending: true });

    if (error) {
      console.log('Error loading job steps:', error);
    } else {
      setJobSteps(data);
    }
  }

  if (job) loadJobSteps();
}, [job]);

if (!job) return <p>Loading job details...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Traveller Sheet</h1>
 
      <div style={{
        border: '1px solid #ccc',
        padding: '15px',
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h2>Job Details</h2>
        <p><strong>Job ID:</strong> {job.id}</p>
        <p><strong>Item Code:</strong> {job.item_code}</p>
        <p><strong>Quantity:</strong> {job.quantity}</p>
        <p><strong>Customer PO:</strong> {job.customer_po}</p>
        <p><strong>Due Date:</strong> {job.due_date}</p>
        <p><strong>Priority:</strong> {job.priority}</p>
      </div>

      <h2>Routing Steps</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc' }}>Seq</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Operation</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Department</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Std Time</th>
            <th style={{ borderBottom: '1px solid #ccc' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {routing.map(step => (
            <tr key={step.id}>
              <td>{step.sequence}</td>
              <td>{step.operation}</td>
              <td>{step.department}</td>
              <td>{step.std_time}</td>
              <td>{step.status || 'Not Started'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Operator Console</h2>

<div style={{ marginBottom: '20px' }}>
  <label>
    Operator ID:{' '}
    <input
      type="text"
      value={operatorId}
      onChange={(e) => setOperatorId(e.target.value)}
      placeholder="Scan or enter operator ID"
    />
  </label>
</div>

<div style={{ marginBottom: '20px' }}>
  <button onClick={startStep} disabled={!operatorId}>
  Start Step
</button>{' '}
  <button onClick={completeStep} disabled={!operatorId || !activeStepId}>
  Complete Step
</button>
</div>

<h3>Job QR Code</h3>
<QRCodeSVG value={job.id.toString()} size={128} />
<h2>Step History</h2>

<table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
  <thead>
    <tr>
      <th style={{ borderBottom: '1px solid #ccc' }}>Operator</th>
      <th style={{ borderBottom: '1px solid #ccc' }}>Start Time</th>
      <th style={{ borderBottom: '1px solid #ccc' }}>End Time</th>
      <th style={{ borderBottom: '1px solid #ccc' }}>Status</th>
      <th style={{ borderBottom: '1px solid #ccc' }}>Duration</th>
    </tr>
  </thead>
  <tbody>
    {jobSteps.map(step => {
      const start = step.start_time ? new Date(step.start_time) : null;
      const end = step.end_time ? new Date(step.end_time) : null;

      const duration = start && end
        ? Math.round((end - start) / 60000) + ' min'
        : '—';

      return (
        <tr key={step.id}>
          <td>{step.operator_id}</td>
          <td>{step.start_time || '—'}</td>
          <td>{step.end_time || '—'}</td>
          <td>{step.status}</td>
          <td>{duration}</td>
        </tr>
      );
    })}
  </tbody>
</table>
</div>
 );
}



export default Traveller;