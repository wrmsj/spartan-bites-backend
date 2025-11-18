const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Store orders in memory
let orders = [];
let orderIdCounter = 1000;

// Create a new order
app.post('/api/orders', (req, res) => {
  try {
    const { customerInfo, items, total } = req.body;

    if (!customerInfo || !items || items.length === 0 || !total) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required order information' 
      });
    }

    const order = {
      orderId: orderIdCounter++,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone,
      specialRequests: customerInfo.specialRequests || '',
      items: items.map(item => ({
        itemName: item.name,
        price: item.price,
        quantity: item.qty,
        itemTotal: item.itemTotal
      })),
      orderTotal: total,
      itemCount: items.reduce((sum, item) => sum + item.qty, 0),
      orderDate: new Date().toISOString(),
      status: 'pending'
    };

    orders.push(order);
    console.log('Order received:', order.orderId);

    res.status(201).json({
      success: true,
      message: 'Order received successfully!',
      orderId: order.orderId,
      timestamp: order.orderDate
    });

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process order' 
    });
  }
});

// Get all orders
app.get('/api/orders', (req, res) => {
  res.json({
    success: true,
    totalOrders: orders.length,
    orders: orders
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    ordersStored: orders.length,
    timestamp: new Date().toISOString() 
  });
});

// Export CSV
app.get('/api/export/csv', (req, res) => {
  let csv = 'Order ID,Customer Name,Email,Phone,Order Date,Total,Items,Status\n';
  
  orders.forEach(order => {
    const itemsList = order.items
      .map(i => `${i.quantity}x ${i.itemName}`)
      .join('; ');
    
    csv += `${order.orderId},"${order.customerName}","${order.customerEmail}","${order.customerPhone}",` +
           `"${order.orderDate}",${order.orderTotal},"${itemsList}",${order.status}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
  res.send(csv);
});

// Start the server
app.listen(PORT, () => {
  console.log('Spartan Bites Backend Started');
  console.log('Port:', PORT);
  console.log('Orders:', orders.length);
});
