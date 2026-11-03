"use client";
import { applyCatalog, type LiveCatalog } from "@/lib/live-catalog";

/**
 * Brings the browser's copy of the price catalog in line with the live one the
 * server rendered with. Renders before the rest of the page, so every client
 * component reads the same prices the server used.
 */
export function CatalogSync({ data }: { data: LiveCatalog | null }) {
  applyCatalog(data);
  return null;
}
