const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

let orders = [];
let orderIdCounter = 1000;

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

app.get('/api/orders', (req, res) => {
  res.json({
    success: true,
    totalOrders: orders.length,
    orders: orders
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok',
    ordersStored: orders.length,
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/export/csv', (req, res) => {
  let csv = 'Order ID,Customer Name,Email,Phone,Order Date,Total,Items,Status\n';
  
  orders.forEach(order => {
    const itemsList = order.items.map(i => i.quantity + 'x ' + i.itemName).join('; ');
    csv += order.orderId + ',"' + order.customerName + '","' + order.customerEmail + '","' + order.customerPhone + '","' + order.orderDate + '",' + order.orderTotal + ',"' + itemsList + '",' + order.status + '\n';
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
  res.send(csv);
});

app.listen(PORT, () => {
  console.log('Spartan Bites Backend Started');
  console.log('Port:', PORT);
  console.log('Orders:', orders.length);
});
```

4. Click **"Commit changes"** at the bottom

---

## 🔄 Step 3: Redeploy on Render

1. Go back to Render: https://dashboard.render.com
2. Click on **"spartan-bites-api"**
3. Click **"Manual Deploy"** button (top right)
4. Select **"Clear build cache & deploy"**
5. Click **"Yes, deploy"**
6. **Wait 2-3 minutes**

---

## 👀 Step 4: Watch the Logs

Look for these lines in the logs:
```
Spartan Bites Backend Started
Port: 10000
Orders: 0
```

And the status should change to **🟢 Live**

---

## ✅ Step 5: Test It

Once it shows **🟢 Live**, open this URL:
```
https://spartan-bites-api.onrender.com/api/health
