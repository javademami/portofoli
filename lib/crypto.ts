export const USDT_TRC20_CONTRACT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
export const ORDER_TTL_MS = 30 * 60 * 1000;

// Converts SEK price to USDT micro units (1 USDT = 1,000,000 micro), rounded up to the cent.
export function priceToBaseMicro(priceSek: number): number {
  const rate = Number(process.env.USDT_SEK_RATE);
  if (!rate || rate <= 0) throw new Error("USDT_SEK_RATE is not set");
  const cents = Math.ceil(Number(((priceSek / rate) * 100).toFixed(6)));
  return cents * 10_000; // 1 cent = 10,000 micro
}

// Unique suffix in micro units (0.000001 to 0.009999 USDT).
export function randomSuffix(): number {
  return Math.floor(Math.random() * 9999) + 1;
}

export function formatUsdt(micro: number): string {
  return (micro / 1_000_000).toFixed(6);
}
