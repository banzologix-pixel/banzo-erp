import { useNavigate } from 'react-router-dom';
import React from 'react';
import { supabase } from './supabaseClient';
import { createJobForOrder } from './utils/createJob.js';
import { useState, useEffect } from 'react';

function OrderList() {
const navigate = useNavigate();
const HOURS_PER_DAY = 8;


  const [orders, setOrders] = useState([]);
  const [jobs, setJobs] = useState([]);
const [jobSteps, setJobSteps] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [itemRouting, setItemRouting] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchOrders() {
  const { data } = await supabase.from('orders').select('*');
  setOrders(data || []);
}
  
  
  useEffect(() => {
  loadData();

  const fetchJobs = async () => {
    const { data: jobsData } = await supabase.from('jobs').select('*');
    setJobs(jobsData || []);
  };

  const fetchJobSteps = async () => {
    const { data: stepsData } = await supabase.from('job_steps').select('*');
    setJobSteps(stepsData || []);
  };

  fetchJobs();
  fetchJobSteps();
}, []);

  async function loadData() {
    setLoading(true);

    const [{ data: ordersData, error: ordersError },
           { data: orderItemsData, error: orderItemsError },
           { data: routingData, error: routingError },
           { data: itemsData, error: itemsError }] = await Promise.all([
      supabase.from('orders').select('*'),
      supabase.from('order_items').select('*'),
      supabase.from('item_routing').select('*'),
      supabase.from('items').select('*'),
    ]);

    if (ordersError) console.error('Error fetching orders:', ordersError);
    if (orderItemsError) console.error('Error fetching order items:', orderItemsError);
    if (routingError) console.error('Error fetching routing:', routingError);
    if (itemsError) console.error('Error fetching items:', itemsError);

    setOrders(ordersData || []);
    setOrderItems(orderItemsData || []);
    setItemRouting(routingData || []);
    setItems(itemsData || []);

    setLoading(false);
  }

  function calculateMetrics(order) {
    const today = new Date();
    const due = order.due_date ? new Date(order.due_date) : null;

    let daysRemaining = null;
    if (due) {
      const msDiff = due.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0);
      daysRemaining = msDiff / (1000 * 60 * 60 * 24);
    }

    // All items for this order
    const lines = orderItems.filter((li) => li.order_id === order.id);

    let totalMinutes = 0;

    for (const line of lines) {
      const routingSteps = itemRouting.filter((r) => r.item_id === line.item_id);

      for (const step of routingSteps) {
        const setup = step.setup_time_minutes || 0;
        const std = step.std_time_minutes || 0;

        // Option C: setup once per order line (batch), std time per unit * quantity
        const minutesForLineAndStep = setup + std * line.qty;
        totalMinutes += minutesForLineAndStep;
      }
    }

    const manufacturingDays = totalMinutes / (60 * HOURS_PER_DAY);
    const logisticsDays = order.logistics_time_days || 0;
    const totalRequiredDays = manufacturingDays + logisticsDays;

    let slackDays = null;
    let statusColor = 'grey';

    if (daysRemaining !== null) {
      slackDays = daysRemaining - totalRequiredDays;

      if (slackDays < 0) statusColor = 'red';
      else if (slackDays < 3) statusColor = 'orange';
      else statusColor = 'green';
    }

    return {
      daysRemaining: daysRemaining !== null ? daysRemaining.toFixed(1) : null,
      manufacturingDays: manufacturingDays.toFixed(1),
      logisticsDays,
      totalRequiredDays: totalRequiredDays.toFixed(1),
      slackDays: slackDays !== null ? slackDays.toFixed(1) : null,
      statusColor,
    };
  }

  function getStatusStyle(color) {
    const base = {
      display: 'inline-block',
      width: '14px',
      height: '14px',
      borderRadius: '50%',
    };

    if (color === 'red') return { ...base, backgroundColor: '#e53935' };
    if (color === 'orange') return { ...base, backgroundColor: '#fb8c00' };
    if (color === 'green') return { ...base, backgroundColor: '#43a047' };
    return { ...base, backgroundColor: '#9e9e9e' };
  }
function calculateJobProgress(jobId) {
  const steps = jobSteps.filter(s => s.job_id === jobId);
  if (steps.length === 0) return 0;

  const completed = steps.filter(s => s.status === 'Completed').length;
  return Math.round((completed / steps.length) * 100);
}

async function handleCreateJob(order) {
  try {
    const job = await createJobForOrder(order, orderItems, itemRouting);
    alert(`Job created successfully! Job ID: ${job.id}`);

    // Optional: refresh the order list if needed

    const { data: jobsData } = await supabase.from('jobs').select('*');
    setJobs(jobsData || []);
    // loadOrders(); or setState to trigger re-render
  } catch (err) {
    alert(err.message);
    console.error(err);
  }
}

  return (
    <div>
      <h2>Order List</h2>

      {loading && <p>Loading...</p>}

      {!loading && (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Status</th>
              <th>Customer</th>
              <th>Client PO</th>
              <th>Due Date</th>
              <th>Priority</th>
              <th>Days Left</th>
              <th>Manufacturing Days</th>
              <th>Logistics Days</th>
              <th>Total Required Days</th>
              <th>Slack Days</th>
              <th>Job Status</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const m = calculateMetrics(order);
              const job = jobs.find(j => j.order_id === order.id);
              const progress = job ? calculateJobProgress(job.id) : null;

             


              return (
                <tr key={order.id}>
                  <td>
                    <span style={getStatusStyle(m.statusColor)}></span>
                  </td>
                  <td>{order.customer_name}</td>
                  <td>{order.client_po_number}</td>
                  <td>{order.due_date}</td>
                  <td>{order.priority_level}</td>
                  <td>{m.daysRemaining !== null ? m.daysRemaining : '-'}</td>
                  <td>{m.manufacturingDays}</td>
                  <td>{m.logisticsDays}</td>
                  <td>{m.totalRequiredDays}</td>
                  <td>{m.slackDays !== null ? m.slackDays : '-'}</td>
                  <td>{job ? job.status : 'Not Started'}</td>
                  <td>{progress !== null ? `${progress}%` : '-'}</td>
                
                <td>
  {(() => {
    const job = jobs.find(j => j.order_id === order.id);

    if (!job) {
      return (
        <button onClick={() => handleCreateJob(order)}>
          Create Job
        </button>
      );
    }

    return (
      <button onClick={() => navigate(`/traveller/${job.id}`)}>
        View Traveller
      </button>
    );
  })()}
</td>

                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default OrderList;