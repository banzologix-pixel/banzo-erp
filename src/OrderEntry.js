import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

function OrderEntry() {
  const [customerName, setCustomerName] = useState('');
  const [clientPO, setClientPO] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('');
  const [logisticsTime, setLogisticsTime] = useState('');
  const [specialRequest, setSpecialRequest] = useState('');

  const [items, setItems] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  const [selectedItem, setSelectedItem] = useState('');
  const [qty, setQty] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    const { data, error } = await supabase.from('items').select('*');
    if (error) {
      console.error('Error fetching items:', error);
      return;
    }
    setItems(data || []);
  }

  function addOrderItem() {
    if (!selectedItem || !qty) return;

    const item = items.find((i) => i.id === selectedItem);

    setOrderItems([
      ...orderItems,
      {
        item_id: selectedItem,
        qty: Number(qty),
        item_code: item.item_code,
        description: item.description,
      },
    ]);

    setSelectedItem('');
    setQty('');
  }

  async function saveOrder() {
    if (!customerName || !dueDate) {
      console.warn('Missing required order fields');
      return;
    }

    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          customer_name: customerName,
          client_po_number: clientPO,
          due_date: dueDate,
          priority_level: priority,
          logistics_time_days: Number(logisticsTime),
          special_request: specialRequest,
        },
      ])
      .select();

    if (error) {
      console.error('Error saving order:', error);
      return;
    }

    const orderId = data[0].id;

    for (const line of orderItems) {
      const { error: lineError } = await supabase.from('order_items').insert([
        {
          order_id: orderId,
          item_id: line.item_id,
          qty: line.qty,
        },
      ]);

      if (lineError) {
        console.error('Error saving order item:', lineError);
      }
    }

    alert('Order saved successfully!');

    setCustomerName('');
    setClientPO('');
    setDueDate('');
    setPriority('');
    setLogisticsTime('');
    setSpecialRequest('');
    setOrderItems([]);
  }

  return (
    <div>
      <h2>Order Entry</h2>

      <input
        type="text"
        placeholder="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
      />

      <input
        type="text"
        placeholder="Client PO Number"
        value={clientPO}
        onChange={(e) => setClientPO(e.target.value)}
      />

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <select
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="">Select Priority</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      <input
        type="number"
        placeholder="Logistics Time (days)"
        value={logisticsTime}
        onChange={(e) => setLogisticsTime(e.target.value)}
      />

      <textarea
        placeholder="Special Requests / Comments"
        value={specialRequest}
        onChange={(e) => setSpecialRequest(e.target.value)}
      ></textarea>

      <h3>Order Items</h3>

      <select
        value={selectedItem}
        onChange={(e) => setSelectedItem(e.target.value)}
      >
        <option value="">Select Item</option>
        {items.map((item) => (
          <option key={item.id} value={item.id}>
            {item.item_code} — {item.description}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Qty"
        value={qty}
        onChange={(e) => setQty(e.target.value)}
      />

      <button onClick={addOrderItem}>Add Item</button>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {orderItems.map((line, index) => (
            <tr key={index}>
              <td>{line.item_code} — {line.description}</td>
              <td>{line.qty}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={saveOrder}>Save Order</button>
    </div>
  );
}

export default OrderEntry;