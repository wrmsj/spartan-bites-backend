const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage
let orders = [];
let orderIdCounter = 1000;

// POST - Submit new order
app.post('/api/orders', (req, res) => {
  try {
    const { customerInfo, items, total } = req.body;

    // Validation
    if (!customerInfo || !items || items.length === 0 || !total) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required order information' 
      });
    }

    // Create order
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

    // Save order
    orders.push(order);
    console.log(`✅ Order #${order.orderId} received from ${order.customerName}`);

    // Send response
    res.status(201).json({
      success: true,
      message: 'Order received successfully!',
      orderId: order.orderId,
      timestamp: order.orderDate
    });

  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process order' 
    });
  }
});

// GET - View all orders
app.get('/api/orders', (req, res) => {
  res.json({
    success: true,
    totalOrders: orders.length,
    orders: orders
  });
});

// GET - Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    ordersStored: orders.length,
    timestamp: new Date().toISOString() 
  });
});

// GET - Export CSV
app.get('/api/export/csv', (req, res) => {
  let csv = 'Order ID,Customer Name,Email,Phone,Order Date,Total,Items,Status\n';
  
  orders.forEach(order => {
    const itemsList = order.items.map(i => `${i.quantity}x ${i.itemName}`).join('; ');
    csv += `${order.orderId},"${order.customerName}","${order.customerEmail}","${order.customerPhone}","${order.orderDate}",${order.orderTotal},"${itemsList}",${order.status}\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
  res.send(csv);
});

// Start server
app.listen(PORT, () => {
  console.log('================================');
  console.log('🍔 Spartan Bites Backend Running');
  console.log('================================');
  console.log(`Port: ${PORT}`);
  console.log(`Orders: ${orders.length}`);
  console.log('================================');
});
```

4. Scroll down and click **"Commit new file"**

✅ server.js created!

---

## 🌐 STEP 5: Deploy to Render

### 5a. Go to Render
1. Go to: **https://render.com**
2. Log in

### 5b. Delete Old Service (if it exists)
1. If you see the old **"spartan-bites-api"**, click on it
2. Click **"Settings"** at the top
3. Scroll to bottom
4. Click **"Delete Web Service"**
5. Confirm deletion

### 5c. Create New Web Service
1. Click **"New +"** (top right)
2. Click **"Web Service"**
3. Find **"spartan-bites-backend"** in the list
4. Click **"Connect"**

### 5d. Configure Settings

Fill out EXACTLY:

| Field | Value |
|-------|-------|
| Name | `spartan-bites-api` |
| Region | Oregon (US West) or closest to you |
| Branch | `main` |
| Root Directory | (leave blank) |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | **Free** |

### 5e. Deploy!
1. Click **"Create Web Service"** at the bottom
2. **Wait 2-5 minutes**
3. Watch the logs scroll
4. Wait for **🟢 Live** status

---

## ✅ STEP 6: Test Your Backend

Once you see **🟢 Live**:

1. Copy your Render URL (at the top):
```
   https://spartan-bites-api.onrender.com
```

2. Test the health endpoint. Open this in a new browser tab:
```
   https://spartan-bites-api.onrender.com/api/health
