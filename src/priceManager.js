import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PRICE_FILE = path.join(__dirname, '../../data/price.json');

let currentPrice = 50.00; // valore di default all'avvio

// Carica prezzo da file all'avvio (se esiste)
async function loadPrice() {
  try {
    const data = await readFile(PRICE_FILE, 'utf8');
    const parsed = JSON.parse(data);
    if (typeof parsed.price === 'number' && parsed.price > 0) {
      currentPrice = parsed.price;
      console.log(`Prezzo caricato da file: €${currentPrice}`);
    }
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error('Errore lettura price.json:', err.message);
    }
    // Se file non esiste → usa default e crea file
    await savePrice(currentPrice);
  }
}

// Salva prezzo su disco
async function savePrice(newPrice) {
  try {
    const data = {
      price: newPrice,
      token: "SEBRO",
      updatedAt: new Date().toISOString(),
      source: "admin-update"
    };
    await writeFile(PRICE_FILE, JSON.stringify(data, null, 2), 'utf8');
    currentPrice = newPrice;
    console.log(`Prezzo aggiornato e salvato: €${newPrice}`);
  } catch (err) {
    console.error('Errore salvataggio price.json:', err.message);
    throw err;
  }
}

export function getCurrentPrice() {
  return currentPrice;
}

export async function updatePrice(newPrice) {
  if (typeof newPrice !== 'number' || newPrice <= 0) {
    throw new Error('Prezzo non valido: deve essere numero positivo');
  }
  await savePrice(newPrice);
}

await loadPrice(); // Esegui al caricamento del modulo
