import type { Furniture, RawFurnitureInput, RoomLayout } from "./types";
import { enforceAbsoluteBoundsForLayout } from "./enforceAbsoluteBounds";
import { getFurnitureCatalogEntry, getFurnitureSize } from "./furnitureCatalog";

// Coordinate system: origin (0,0) at front-left corner
// x → right (0 → width)
// z → back (0 → depth)
// Walls: 0=front/door, 1=right, 2=back, 3=left

function createDefaultRectangularRoom(): RoomLayout {
  const width = 120; // 10ft
  const depth = 156; // 13ft
  const wallThickness = 6;

  // Build walls from room dimensions
  const walls = [
    {
      id: "wall-0-front",
      wallIndex: 0,
      start: { x: 0, z: 0 },
      end: { x: width, z: 0 },
      thickness: wallThickness,
    },
    {
      id: "wall-1-right",
      wallIndex: 1,
      start: { x: width, z: 0 },
      end: { x: width, z: depth },
      thickness: wallThickness,
    },
    {
      id: "wall-2-back",
      wallIndex: 2,
      start: { x: width, z: depth },
      end: { x: 0, z: depth },
      thickness: wallThickness,
    },
    {
      id: "wall-3-left",
      wallIndex: 3,
      start: { x: 0, z: depth },
      end: { x: 0, z: 0 },
      thickness: wallThickness,
    },
  ];

  const door = {
    id: "main-door",
    wallIndex: 0,
    offsetFromLeft: width / 2, // centered
    width: 36,
    swing: "in_right" as const,
  };

  // Default furniture for MVP: bed, desk, nightstand
  const defaultFurniture: Furniture[] = [
    {
      id: "bed-1",
      name: "Twin Bed",
      kind: "bed",
      type: "bed_twin",
      position: { x: 60, z: 50 }, // Left side of room
      size: { x: 39, z: 80 },
      rotation: 0,
      isWallHugger: true,
      isCenterpiece: false,
    },
    {
      id: "desk-1",
      name: "Standard Desk",
      kind: "desk",
      type: "desk_standard",
      position: { x: 60, z: 120 }, // Back wall
      size: { x: 48, z: 24 },
      rotation: 0,
      isWallHugger: true,
      isCenterpiece: false,
    },
    {
      id: "nightstand-1",
      name: "Nightstand",
      kind: "nightstand",
      type: "nightstand",
      position: { x: 110, z: 50 }, // Next to bed
      size: { x: 18, z: 18 },
      rotation: 0,
      isWallHugger: true,
      isCenterpiece: false,
    },
  ];

  return {
    units: "in",
    room: {
      width,
      depth,
      height: 96, // 8ft ceiling
      wallThickness,
    },
    door,
    fixedZones: [],
    walls,
    doors: [door],
    furniture: defaultFurniture,
  };
}

function normalizeFurniture(raw: RawFurnitureInput[]): Furniture[] {
  return raw
    .filter((f) => f.type || f.kind)
    .map((f, idx) => {
      const type = f.type || `unknown_${idx}`;
      const catalogEntry = getFurnitureCatalogEntry(type);
      
      // Infer kind from type if not provided
      const kind = f.kind || (catalogEntry?.type as any) || "custom";
      
      // Get size from catalog or use provided size (raw may have x/y/z from 3D)
      const catalogSize = catalogEntry
        ? getFurnitureSize(type, f.rotation || 0)
        : { width: f.size?.x ?? 24, depth: f.size?.z ?? f.size?.y ?? 24 };
      
      const size = f.size
        ? { x: f.size.x ?? catalogSize.width, z: f.size.z ?? f.size.y ?? f.size.x ?? catalogSize.depth }
        : { x: catalogSize.width, z: catalogSize.depth };

      const isWallHugger = catalogEntry?.isWallHugger ?? f.isWallHugger ?? false;
      const isCenterpiece = f.isCenterpiece ?? false;

      // Normalize position: raw may use z (2D) or y (3D)
      const position = f.position
        ? { x: f.position.x ?? 0, z: f.position.z ?? f.position.y ?? 0 }
        : { x: 0, z: 0 };

      // Normalize rotation: snap to allowed values for wall-huggers
      let rotation = f.rotation ?? 0;
      if (isWallHugger && catalogEntry) {
        const allowed = catalogEntry.allowedRotations;
        rotation = allowed.reduce((closest, r) => 
          Math.abs(r - rotation) < Math.abs(closest - rotation) ? r : closest
        );
      }

      return {
        id: f.id || `${type}-${idx}`,
        name: f.name || catalogEntry?.name || type,
        kind,
        type,
        position,
        size,
        rotation,
        isWallHugger,
        isCenterpiece,
      };
    });
}

export function normalizeModelData(raw?: Partial<RoomLayout> | any): RoomLayout {
  const base = createDefaultRectangularRoom();

  // Handle both new format (room.room) and legacy format (room.width/height)
  let width = raw?.room?.width ?? raw?.width ?? base.room.width;
  let depth = raw?.room?.depth ?? raw?.height ?? base.room.depth;
  const wallThickness = raw?.room?.wallThickness ?? raw?.wallThickness ?? base.room.wallThickness;

  // Rebuild walls from dimensions
  const walls = [
    {
      id: "wall-0-front",
      wallIndex: 0,
      start: { x: 0, z: 0 },
      end: { x: width, z: 0 },
      thickness: wallThickness,
    },
    {
      id: "wall-1-right",
      wallIndex: 1,
      start: { x: width, z: 0 },
      end: { x: width, z: depth },
      thickness: wallThickness,
    },
    {
      id: "wall-2-back",
      wallIndex: 2,
      start: { x: width, z: depth },
      end: { x: 0, z: depth },
      thickness: wallThickness,
    },
    {
      id: "wall-3-left",
      wallIndex: 3,
      start: { x: 0, z: depth },
      end: { x: 0, z: 0 },
      thickness: wallThickness,
    },
  ];

  // Handle door: new format (door) or legacy (doors array)
  const doorData = raw?.door || raw?.doors?.[0];
  const door = doorData
    ? {
        id: doorData.id || "main-door",
        wallIndex: doorData.wallIndex ?? 0,
        offsetFromLeft: doorData.offsetFromLeft ?? width / 2,
        width: doorData.width ?? 36,
        swing: doorData.swing || "in_right",
      }
    : base.door;

  const furniture = normalizeFurniture(raw?.furniture ?? []);

  const room: RoomLayout = {
    units: "in",
    room: {
      width,
      depth,
      height: raw?.room?.height ?? base.room.height,
      wallThickness,
    },
    door,
    fixedZones: raw?.fixedZones ?? [],
    walls,
    doors: [door],
    furniture,
  };

  // Clamp everything to the absolute physics law
  return enforceAbsoluteBoundsForLayout(room);
}
