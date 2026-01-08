import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function CreateJob() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [itemRouting, setItemRouting] = useState([]);

  useEffect(() => {
    loadOrders();
    loadOrderItems();
    loadRouting();
  }, []);

  async function loadOrders() {
    const { data, error } = await supabase.from('orders').select('*');
    if (error) console.error(error);
    setOrders(data || []);
  }

  async function loadOrderItems() {
    const { data, error } = await supabase.from('order_items').select('*');
    if (error) console.error(error);
    setOrderItems(data || []);
  }

  async function loadRouting() {
    const { data, error } = await supabase.from('item_routing').select('*');
    if (error) console.error(error);
    setItemRouting(data || []);
  }

  async function createJob() {
  const order = orders.find(o => o.id.toString() === selectedOrder);

  if (!order) {
    alert("Selected order not found. Please try again.");
    return;
  }

  const lines = orderItems.filter(li => li.order_id === order.id);

  if (lines.length === 0) {
    alert("Order has no items");
    return;
  }
  


    // For now: create one job per order (you can later do per item)
    const firstLine = lines[0];

    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .insert([
        {
          order_id: order.id,
          item_id: firstLine.item_id,
          qty: firstLine.qty,
          due_date: order.due_date,
          priority: order.priority_level,
          status: "Open"
        }
      ])
      .select();

    if (jobError) {
      console.error(jobError);
      return;
    }

    const job = jobData[0];

    // Get routing for this item
    const routingSteps = itemRouting
      .filter(r => r.item_id === firstLine.item_id)
      .sort((a, b) => a.sequence - b.sequence);

    if (routingSteps.length === 0) {
      alert("No routing found for this item");
      return;
    }

    // Insert job steps
    for (let i = 0; i < routingSteps.length; i++) {
      const step = routingSteps[i];

      const status = i === 0 ? "Ready" : "Pending"; // First step is ready

      const { error: stepError } = await supabase
        .from('job_steps')
        .insert([
          {
            job_id: job.id,
            item_id: firstLine.item_id,
            operation_id: step.operation_id,
            department: step.department,
            sequence: step.sequence,
            qty: firstLine.qty,
            status: status
          }
        ]);

      if (stepError) console.error(stepError);
    }

    alert(`Job created successfully! Job ID: ${job.id}`);
}

  return (
    <div>
      <h2>Create Job</h2>

      <select
        value={selectedOrder || ""}
        onChange={(e) => setSelectedOrder(e.target.value)}
      >
        <option value="">Select Order</option>
        {orders.map((o) => (
          <option key={o.id} value={o.id}>
            {o.customer_name} — {o.client_po_number}
          </option>
        ))}
      </select>

      <button onClick={createJob}>Create Job</button>
    </div>
  );
}

export default CreateJob;