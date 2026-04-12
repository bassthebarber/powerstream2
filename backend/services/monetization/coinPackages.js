/** Shared coin SKUs — single list for checkout + packages API */
export const COIN_PACKAGES = [
  { id: "pack_100", coins: 100, price: 0.99, currency: "USD", label: "100 Coins" },
  { id: "pack_500", coins: 500, price: 4.99, currency: "USD", label: "500 Coins", popular: true },
  { id: "pack_1000", coins: 1000, price: 9.99, currency: "USD", label: "1,000 Coins" },
  { id: "pack_5000", coins: 5000, price: 39.99, currency: "USD", label: "5,000 Coins", bestValue: true },
  { id: "pack_10000", coins: 10000, price: 74.99, currency: "USD", label: "10,000 Coins" },
];

export function getCoinPackages() {
  return COIN_PACKAGES;
}
