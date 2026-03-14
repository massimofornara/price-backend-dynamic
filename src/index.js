import express from 'express';
import dotenv from 'dotenv';
import { getCurrentPrice, updatePrice } from './priceManager.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Middleware autenticazione admin (per endpoint di update)
const authenticateAdmin = (req, res, next) => {
  const apiKey = req.headers['x-admin-key'] || req.query.adminKey;
  
  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized – Invalid or missing admin key'
    });
  }
  next();
};

// Endpoint pubblico: Chainlink Functions lo chiama qui
app.get('/api/price', (req, res) => {
  const price = getCurrentPrice();
  const scaled = Math.round(price * 100); // ×100 → es. 50.00 → 5000

  res.json({
    success: true,
    token: "SEBRO",
    price_eur: price,
    scaled_price: scaled,
    timestamp: new Date().toISOString(),
    source: "official-dynamic-backend-v2"
  });
});

// Endpoint admin: aggiorna il prezzo (protetto)
app.post('/api/admin/update-price', authenticateAdmin, async (req, res) => {
  try {
    const { price } = req.body;

    if (!price) {
      return res.status(400).json({ success: false, error: 'Campo "price" richiesto' });
    }

    await updatePrice(Number(price));

    res.json({
      success: true,
      message: 'Prezzo aggiornato con successo',
      new_price_eur: getCurrentPrice(),
      scaled_price: Math.round(getCurrentPrice() * 100)
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    current_price_eur: getCurrentPrice(),
    last_updated: new Date().toISOString()
  });
});

// Usa la porta di Render (obbligatorio!)
const port = process.env.PORT || 3000;  // Render imposta PORT (	ES.10000), fallback 3000 per test locali

app.listen(port, () => {
  console.log(`Dynamic Price Backend avviato su porta ${port}`);
  console.log(`Prezzo corrente: €${getCurrentPrice()}`);
  console.log(`Admin key richiesta per aggiornamenti: ${!!process.env.ADMIN_API_KEY}`);
});
