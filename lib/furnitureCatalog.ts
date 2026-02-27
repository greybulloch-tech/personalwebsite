import type { FurnitureKind } from "./types";

export type FurnitureCatalogEntry = {
  type: FurnitureKind;
  name: string;
  width: number; // inches
  depth: number; // inches
  isWallHugger: boolean;
  minClearance: number; // inches
  priority: "anchor" | "secondary" | "accessory";
  allowedRotations: number[]; // degrees: [0, 90, 180, 270] for wall-huggers, or [0, 15, 30, ...] for accessories
};

export const FURNITURE_CATALOG: Record<string, FurnitureCatalogEntry> = {
  bed_twin: {
    type: "bed",
    name: "Twin Bed",
    width: 39,
    depth: 80,
    isWallHugger: true,
    minClearance: 30,
    priority: "anchor",
    allowedRotations: [0, 90, 180, 270],
  },
  bed_wall_run: {
    type: "bed",
    name: "Wall-Run Bed",
    width: 120, // custom width
    depth: 39,
    isWallHugger: true,
    minClearance: 30,
    priority: "anchor",
    allowedRotations: [0, 90],
  },
  desk_standard: {
    type: "desk",
    name: "Standard Desk",
    width: 48,
    depth: 24,
    isWallHugger: true,
    minClearance: 36,
    priority: "anchor",
    allowedRotations: [0, 90, 180, 270],
  },
  dresser_small: {
    type: "dresser",
    name: "Small Dresser",
    width: 32,
    depth: 20,
    isWallHugger: true,
    minClearance: 0,
    priority: "secondary",
    allowedRotations: [0, 90, 180, 270],
  },
  dresser_large: {
    type: "dresser",
    name: "Large Dresser",
    width: 48,
    depth: 20,
    isWallHugger: true,
    minClearance: 0,
    priority: "secondary",
    allowedRotations: [0, 90, 180, 270],
  },
  nightstand: {
    type: "nightstand",
    name: "Nightstand",
    width: 18,
    depth: 18,
    isWallHugger: true,
    minClearance: 0,
    priority: "accessory",
    allowedRotations: [0, 90, 180, 270],
  },
  trash_can: {
    type: "custom",
    name: "Trash Can",
    width: 12,
    depth: 12,
    isWallHugger: false,
    minClearance: 0,
    priority: "accessory",
    allowedRotations: [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 240, 255, 270, 285, 300, 315, 330, 345],
  },
};

export function getFurnitureCatalogEntry(type: string): FurnitureCatalogEntry | null {
  return FURNITURE_CATALOG[type] || null;
}

export function getFurnitureSize(type: string, rotation: number = 0): { width: number; depth: number } {
  const entry = getFurnitureCatalogEntry(type);
  if (!entry) {
    // fallback for unknown types
    return { width: 24, depth: 24 };
  }
  
  // For 90/270 rotations, swap width/depth
  if (rotation === 90 || rotation === 270) {
    return { width: entry.depth, depth: entry.width };
  }
  return { width: entry.width, depth: entry.depth };
}
