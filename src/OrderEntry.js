import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';

function OrderEntry() {
  const { orderId } = useParams(); // Detect edit mode

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
    if (orderId) {
      loadOrder(orderId);
    }
  }, [orderId]);

  async function fetchItems() {
    const { data, error } = await supabase.from('items').select('*');
    if (error) {
      console.error('Error fetching items:', error);
      return;
    }
    setItems(data || []);
  }

  async function loadOrder(id) {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error loading order:', error);
      return;
    }

    setCustomerName(data.customer_name);
    setClientPO(data.client_po_number);
    setDueDate(data.due_date);
    setPriority(data.priority_level);
    setLogisticsTime(data.logistics_time_days);
    setSpecialRequest(data.special_request);

    setOrderItems(data.order_items || []);
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

  function updateQty(index, newQty) {
    const updated = [...orderItems];
    updated[index].qty = Number(newQty);
    setOrderItems(updated);
  }

  function deleteItem(index) {
    const updated = [...orderItems];
    updated.splice(index, 1);
    setOrderItems(updated);
  }

  async function saveNewOrder() {
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
      .select()
      .single();

    if (error) {
      console.error('Error saving order:', error);
      return;
    }

    const newOrderId = data.id;

    for (const line of orderItems) {
      await supabase.from('order_items').insert([
        {
          order_id: newOrderId,
          item_id: line.item_id,
          qty: line.qty,
        },
      ]);
    }

    alert('Order saved successfully!');
  }

  async function updateOrder() {
    const { error } = await supabase
      .from('orders')
      .update({
        customer_name: customerName,
        client_po_number: clientPO,
        due_date: dueDate,
        priority_level: priority,
        logistics_time_days: Number(logisticsTime),
        special_request: specialRequest,
      })
      .eq('id', orderId);

    if (error) {
      console.error('Error updating order:', error);
      return;
    }

    await supabase.from('order_items').delete().eq('order_id', orderId);

    for (const line of orderItems) {
      await supabase.from('order_items').insert([
        {
          order_id: orderId,
          item_id: line.item_id,
          qty: line.qty,
        },
      ]);
    }

    alert('Order updated successfully!');
  }

  function handleSave() {
    if (orderId) {
      updateOrder();
    } else {
      saveNewOrder();
    }
  }

  return (
    <div>
      <h2>{orderId ? 'Edit Order' : 'New Order'}</h2>

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

      <select value={priority} onChange={(e) => setPriority(e.target.value)}>
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
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {orderItems.map((line, index) => (
            <tr key={index}>
              <td>{line.item_code} — {line.description}</td>
              <td>
                <input
                  type="number"
                  value={line.qty}
                  onChange={(e) => updateQty(index, e.target.value)}
                />
              </td>
              <td>
                <button onClick={() => deleteItem(index)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleSave}>
        {orderId ? 'Update Order' : 'Save Order'}
      </button>
    </div>
  );
}

export default OrderEntry;