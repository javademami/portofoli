const KEY = "guest-cart";

export function readCart(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function writeCart(ids: string[]) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(Array.from(new Set(ids))));
  } catch {
    // storage may be blocked; the cart just won't persist
  }
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToCart(id: string) {
  writeCart([...readCart(), id]);
}

export function removeFromCart(id: string) {
  writeCart(readCart().filter((x) => x !== id));
}

export function clearCart() {
  writeCart([]);
}