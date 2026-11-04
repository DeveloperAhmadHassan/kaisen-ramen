"use client";

import { useSyncExternalStore } from "react";

export type CartItem = { id: string; name: string; price: number; src?: string; qty: number };
type State = { items: CartItem[]; open: boolean; ready: boolean };

// The cart is shared by every page and kept in localStorage across reloads.
const KEY = "kr-cart";
const EMPTY: State = { items: [], open: false, ready: false };

let state = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function set(next: Partial<State>) {
  state = { ...state, ...next };
  if (next.items) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state.items));
    } catch {}
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!loaded) {
    loaded = true;
    let items: CartItem[] = [];
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) ?? "[]");
      if (Array.isArray(saved)) items = saved;
    } catch {}
    set({ items, ready: true });
  }
  return () => listeners.delete(listener);
}

export const useCart = () => useSyncExternalStore(subscribe, () => state, () => EMPTY);

export function addToCart(item: Omit<CartItem, "qty" | "id"> & { id?: string }, qty = 1) {
  const id = item.id ?? item.name;
  const found = state.items.some((i) => i.id === id);
  set({
    items: found
      ? state.items.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i))
      : [...state.items, { id, name: item.name, price: item.price, src: item.src, qty }],
  });
}

export const setQty = (id: string, qty: number) =>
  set({ items: qty < 1 ? state.items.filter((i) => i.id !== id) : state.items.map((i) => (i.id === id ? { ...i, qty } : i)) });

export const clearCart = () => set({ items: [] });
export const openCart = () => set({ open: true });
export const closeCart = () => set({ open: false });

export const countOf = (items: CartItem[]) => items.reduce((n, i) => n + i.qty, 0);
export const subtotalOf = (items: CartItem[]) => items.reduce((n, i) => n + i.qty * i.price, 0);
export const money = (n: number) => `$${n.toFixed(2)}`;

// placeholder pricing rules
export const FREE_DELIVERY_AT = 30;
export const DELIVERY_FEE = 3.5;
export const TAX_RATE = 0.08;
