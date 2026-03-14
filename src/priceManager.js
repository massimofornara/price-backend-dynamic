// src/priceManager.js  ← VERSIONE SEMPLIFICATA (senza file)

let currentPrice = 50.00; // prezzo di default (puoi cambiarlo qui)

export function getCurrentPrice() {
  return currentPrice;
}

export async function updatePrice(newPrice) {
  if (typeof newPrice !== 'number' || newPrice <= 0) {
    throw new Error('Prezzo non valido: deve essere numero positivo');
  }
  currentPrice = newPrice;
  console.log(`Prezzo aggiornato in memoria: €${newPrice}`);
}

console.log(`PriceManager avviato - Prezzo iniziale: €${currentPrice}`);
