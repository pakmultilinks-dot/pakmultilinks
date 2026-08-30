"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { CartItem, Order, Product, QuoteRequest } from "@/lib/types";
import { getPrice } from "@/lib/catalog";
import { minimumCartons } from "@/lib/utils";
import { trackStorefrontEvent } from "@/lib/analytics";

export const STORE_STORAGE_KEYS = {
  cart: "pmh.cart.v1",
  orders: "pmh.orders.v1",
  quotes: "pmh.quotes.v1",
} as const;

const STORE_EVENT = "pmh:store-updated";

type StoreContextValue = {
  cart: CartItem[];
  itemCount: number;
  subtotal: number;
  addToCart: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  orders: Order[];
  quotes: QuoteRequest[];
};

const StoreContext = createContext<StoreContextValue | null>(null);

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];

  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? "[]");
    return Array.isArray(value) ? (value as T[]) : [];
  } catch {
    return [];
  }
}

function writeList<T>(key: string, value: T[]) {
  if (typeof window === "undefined") return false;

  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new CustomEvent(STORE_EVENT, { detail: key }));
    return true;
  } catch {
    // The in-memory store continues working if storage is unavailable or full.
    return false;
  }
}

function normalizeQuantity(product: Product, requested: number) {
  const minimum = minimumCartons(product);
  if (!Number.isFinite(requested) || requested <= 0) return 0;
  const quantity = Math.max(minimum, Math.floor(requested));
  if (!product.allowBackorder && product.stock < minimum) return 0;
  if (product.allowBackorder) return quantity;
  return Math.min(quantity, Math.max(0, product.stock));
}

export function persistOrder(order: Order) {
  const current = readList<Order>(STORE_STORAGE_KEYS.orders);
  const next = [order, ...current.filter((item) => item.id !== order.id)];
  return writeList(STORE_STORAGE_KEYS.orders, next);
}

export function persistQuote(quote: QuoteRequest) {
  const current = readList<QuoteRequest>(STORE_STORAGE_KEYS.quotes);
  const next = [quote, ...current.filter((item) => item.id !== quote.id)];
  return writeList(STORE_STORAGE_KEYS.quotes, next);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const storedCart = readList<CartItem>(STORE_STORAGE_KEYS.cart).filter(
        (item) =>
          item &&
          typeof item === "object" &&
          item.product &&
          typeof item.product.id === "string" &&
          Number.isFinite(item.quantity) &&
          item.quantity > 0,
      );

      setCart(
        storedCart
          .map((item) => ({
            product: item.product,
            quantity: normalizeQuantity(item.product, item.quantity),
          }))
          .filter((item) => item.quantity > 0),
      );
      setOrders(readList<Order>(STORE_STORAGE_KEYS.orders));
      setQuotes(readList<QuoteRequest>(STORE_STORAGE_KEYS.quotes));
      setHydrated(true);
    });

    const refresh = () => {
      setOrders(readList<Order>(STORE_STORAGE_KEYS.orders));
      setQuotes(readList<QuoteRequest>(STORE_STORAGE_KEYS.quotes));
    };
    window.addEventListener(STORE_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener(STORE_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  useEffect(() => {
    if (hydrated) writeList(STORE_STORAGE_KEYS.cart, cart);
  }, [cart, hydrated]);

  const addToCart = useCallback((product: Product, requestedQuantity?: number) => {
    const requested = requestedQuantity ?? minimumCartons(product);
    if (requested <= 0 || (!product.allowBackorder && product.stock < minimumCartons(product))) return;
    trackStorefrontEvent("add_to_cart", { currency: "PKR", value: product.priceOnRequest ? undefined : getPrice(product) * requested, item_id: product.sku, item_name: product.name, quantity: requested });

    setCart((current) => {
      const existing = current.find((item) => item.product.id === product.id);
      const quantity = normalizeQuantity(
        product,
        (existing?.quantity ?? 0) + requested,
      );

      if (quantity <= 0) return current;
      if (existing) {
        return current.map((item) =>
          item.product.id === product.id ? { product, quantity } : item,
        );
      }
      return [...current, { product, quantity }];
    });
  }, []);

  const updateQuantity = useCallback((productId: string, requestedQuantity: number) => {
    setCart((current) => {
      const existing = current.find((item) => item.product.id === productId);
      if (!existing) return current;

      const quantity = normalizeQuantity(existing.product, requestedQuantity);
      if (quantity <= 0) return current.filter((item) => item.product.id !== productId);
      return current.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item,
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((current) => {
      const item = current.find((entry) => entry.product.id === productId);
      if (item) trackStorefrontEvent("remove_from_cart", { currency: "PKR", value: item.product.priceOnRequest ? undefined : getPrice(item.product) * item.quantity, item_id: item.product.sku, item_name: item.product.name, quantity: item.quantity });
      return current.filter((entry) => entry.product.id !== productId);
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const value = useMemo<StoreContextValue>(
    () => ({
      cart,
      itemCount: cart.reduce((total, item) => total + item.quantity, 0),
      subtotal: cart.reduce(
        (total, item) => total + getPrice(item.product) * item.quantity,
        0,
      ),
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      orders,
      quotes,
    }),
    [cart, addToCart, updateQuantity, removeFromCart, clearCart, orders, quotes],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error("useStore must be used inside StoreProvider");
  return context;
}
