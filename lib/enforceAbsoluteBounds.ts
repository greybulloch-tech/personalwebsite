import type { Furniture, RoomLayout, Vector2 } from "./types";
import { getFurnitureSize } from "./furnitureCatalog";

const MARGIN_INCHES = 1; // tiny margin to avoid touching walls exactly

export function clampToRoomBounds(point: Vector2, room: RoomLayout): Vector2 {
  const width = room.room.width;
  const depth = room.room.depth;
  
  return {
    x: Math.min(width - MARGIN_INCHES, Math.max(MARGIN_INCHES, point.x)),
    z: Math.min(depth - MARGIN_INCHES, Math.max(MARGIN_INCHES, point.z)),
  };
}

export function enforceAbsoluteBounds(
  furniture: Furniture,
  room: RoomLayout,
): Furniture {
  // Get actual size accounting for rotation
  const actualSize = getFurnitureSize(furniture.type, furniture.rotation);
  const halfW = actualSize.width / 2;
  const halfD = actualSize.depth / 2;

  const width = room.room.width;
  const depth = room.room.depth;

  const clamped = clampToRoomBounds(furniture.position, room);

  const clampedX = Math.min(
    width - halfW - MARGIN_INCHES,
    Math.max(halfW + MARGIN_INCHES, clamped.x),
  );
  const clampedZ = Math.min(
    depth - halfD - MARGIN_INCHES,
    Math.max(halfD + MARGIN_INCHES, clamped.z),
  );

  return {
    ...furniture,
    position: { x: clampedX, z: clampedZ },
  };
}

export function enforceAbsoluteBoundsForLayout(room: RoomLayout): RoomLayout {
  return {
    ...room,
    furniture: room.furniture.map((f) => enforceAbsoluteBounds(f, room)),
  };
}

