import { supabase } from '../supabaseClient';

export async function createJobForOrder(order, orderItems, itemRouting) {
  const lines = orderItems.filter(li => li.order_id === order.id);

  if (lines.length === 0) {
    throw new Error("Order has no items");
  }

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

  if (jobError) throw jobError;

  const job = jobData[0];

  const routingSteps = itemRouting
    .filter(r => r.item_id === firstLine.item_id)
    .sort((a, b) => a.sequence - b.sequence);

  if (routingSteps.length === 0) {
    throw new Error("No routing found for this item");
  }

  for (let i = 0; i < routingSteps.length; i++) {
    const step = routingSteps[i];
    const status = i === 0 ? "Ready" : "Pending";

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

  return job;
}