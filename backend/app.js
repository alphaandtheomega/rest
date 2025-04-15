import fs from 'node:fs/promises';
import path from 'path';
import bodyParser from 'body-parser';
import express from 'express';

// Ortam değişkeni için port tanımı
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProduction = NODE_ENV === 'production';

const app = express();

// Güvenlik için body parser limiti
app.use(bodyParser.json({ limit: '10kb' }));
app.use(express.static('public'));

// CORS ayarları - Production'da güvenlik için domain sınırlaması yapılmalı
app.use((req, res, next) => {
  // Production ortamında gerçek domain adresini belirtmelisiniz
  const allowedOrigins = isProduction ? ['https://sizin-domain-adiniz.com'] : ['*'];
  const origin = isProduction ? req.headers.origin : '*';
  
  if (isProduction && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Hata yakalama fonksiyonu
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

app.get('/meals', asyncHandler(async (req, res) => {
  const meals = await fs.readFile(path.join(process.cwd(), 'data', 'available-meals.json'), 'utf8');
  res.json(JSON.parse(meals));
}));

app.post('/orders', asyncHandler(async (req, res) => {
  const orderData = req.body.order;

  await new Promise((resolve) => setTimeout(resolve, 1000)); 

  if (orderData === null || orderData.items === null || orderData.items.length === 0) {
    return res
      .status(400)
      .json({ message: 'Missing data.' });
  }

  if (
    orderData.customer.email === null ||
    !orderData.customer.email.includes('@') ||
    orderData.customer.name === null ||
    orderData.customer.name.trim() === '' ||
    orderData.customer.street === null ||
    orderData.customer.street.trim() === '' ||
    orderData.customer['postal-code'] === null ||
    orderData.customer['postal-code'].trim() === '' ||
    orderData.customer.city === null ||
    orderData.customer.city.trim() === ''
  ) {
    return res.status(400).json({
      message:
        'Missing data: Email, name, street, postal code or city is missing.',
    });
  }

  const newOrder = {
    ...orderData,
    id: (Math.random() * 1000).toString(),
    date: new Date().toISOString()
  };
  
  try {
    const ordersPath = path.join(process.cwd(), 'data', 'orders.json');
    const orders = await fs.readFile(ordersPath, 'utf8');
    const allOrders = JSON.parse(orders);
    allOrders.push(newOrder);
    await fs.writeFile(ordersPath, JSON.stringify(allOrders));
    res.status(201).json({ message: 'Order created!', orderId: newOrder.id });
  } catch (error) {
    console.error('Sipariş kaydederken hata:', error);
    res.status(500).json({ message: 'Siparişiniz kaydedilemedi. Lütfen daha sonra tekrar deneyin.' });
  }
}));

// 404 yanıtı
app.use((req, res) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  res.status(404).json({ message: 'Not found' });
});

// Genel hata işleyici
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: isProduction ? 'Sunucu hatası' : err.message,
    error: isProduction ? {} : err
  });
});

app.listen(PORT, () => {
  console.log(`Server ${isProduction ? 'production' : 'development'} modunda ${PORT} portunda çalışıyor`);
});
