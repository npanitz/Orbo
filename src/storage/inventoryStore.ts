/**
 * User-inventory store.
 *
 * Today: backed by localStorage. The whole point of this file existing is
 * that the rest of the app talks only to the `InventoryStore` interface —
 * when we swap in Supabase (or any other backend), the only file that
 * changes is this one.
 *
 * Data shape: each custom entry stores the raw SMILES + a display name +
 * a stable id. We deliberately *don't* persist the parsed Recipe; we
 * re-parse SMILES at read time so a future parser improvement
 * automatically upgrades old entries.
 */

export interface CustomEntry {
  id: string;
  name: string;
  smiles: string;
  createdAt: number;
}

export interface InventoryStore {
  list(): CustomEntry[];
  add(name: string, smiles: string): CustomEntry;
  remove(id: string): void;
  subscribe(cb: () => void): () => void;
}

const STORAGE_KEY = "orbo-custom-inventory";

class LocalStorageInventory implements InventoryStore {
  private cache: CustomEntry[] | null = null;
  private listeners = new Set<() => void>();

  list(): CustomEntry[] {
    if (this.cache) return this.cache;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.cache = raw ? (JSON.parse(raw) as CustomEntry[]) : [];
    } catch {
      this.cache = [];
    }
    return this.cache;
  }

  add(name: string, smiles: string): CustomEntry {
    const entry: CustomEntry = {
      id: `custom_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim() || smiles,
      smiles: smiles.trim(),
      createdAt: Date.now(),
    };
    const next = [...this.list(), entry];
    this.persist(next);
    return entry;
  }

  remove(id: string): void {
    const next = this.list().filter((e) => e.id !== id);
    this.persist(next);
  }

  subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private persist(next: CustomEntry[]): void {
    this.cache = next;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // quota exceeded etc. — surface later via a real error path
    }
    for (const cb of this.listeners) cb();
  }
}

export const inventoryStore: InventoryStore = new LocalStorageInventory();
