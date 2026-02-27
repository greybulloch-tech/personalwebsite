import type { RoomLayout } from "./types";
import { enforceAbsoluteBoundsForLayout } from "./enforceAbsoluteBounds";
import { validateLayout } from "./designRules";
import { getFurnitureSize } from "./furnitureCatalog";

const WALL_SNAP_THRESHOLD = 6; // inches - auto-snap wall-huggers within this distance

// Snap wall-huggers flush to nearest wall (within threshold)
function snapToWall(furniture: any, room: RoomLayout): { x: number; z: number } {
  const width = room.room.width;
  const depth = room.room.depth;
  const actualSize = getFurnitureSize(furniture.type, furniture.rotation);
  
  const halfW = actualSize.width / 2;
  const halfD = actualSize.depth / 2;

  const distToFront = furniture.position.z;
  const distToBack = depth - furniture.position.z;
  const distToLeft = furniture.position.x;
  const distToRight = width - furniture.position.x;

  const minDist = Math.min(distToFront, distToBack, distToLeft, distToRight);

  if (minDist > WALL_SNAP_THRESHOLD) {
    return furniture.position; // too far, don't snap
  }

  let pos = { ...furniture.position };

  if (minDist === distToFront) {
    // Snap to front wall
    pos.z = halfD;
  } else if (minDist === distToBack) {
    // Snap to back wall
    pos.z = depth - halfD;
  } else if (minDist === distToLeft) {
    // Snap to left wall
    pos.x = halfW;
  } else {
    // Snap to right wall
    pos.x = width - halfW;
  }

  return pos;
}

export function autoFixLayout(initialRoom: RoomLayout): RoomLayout {
  let room = enforceAbsoluteBoundsForLayout(initialRoom);
  const width = room.room.width;
  const depth = room.room.depth;
  const center = { x: width / 2, z: depth / 2 };

  // 1. Snap wall-huggers to walls (within 6" threshold)
  room = {
    ...room,
    furniture: room.furniture.map((f) => {
      let pos = { ...f.position };

      if (f.isWallHugger) {
        pos = snapToWall(f, room);
      }

      if (f.isCenterpiece) {
        pos.x = center.x;
        pos.z = center.z;
      }

      return {
        ...f,
        position: pos,
      };
    }),
  };

  // Re-clamp after snapping
  room = enforceAbsoluteBoundsForLayout(room);

  // 2. Iteratively push overlapping furniture apart
  const iterations = 8;
  for (let iter = 0; iter < iterations; iter++) {
    const furniture = [...room.furniture];
    let changed = false;

    for (let i = 0; i < furniture.length; i++) {
      for (let j = i + 1; j < furniture.length; j++) {
        const a = furniture[i];
        const b = furniture[j];

        const sizeA = getFurnitureSize(a.type, a.rotation);
        const sizeB = getFurnitureSize(b.type, b.rotation);

        const dx = b.position.x - a.position.x;
        const dz = b.position.z - a.position.z;
        const minDx = (sizeA.width + sizeB.width) / 2;
        const minDz = (sizeA.depth + sizeB.depth) / 2;

        const overlapX = minDx - Math.abs(dx);
        const overlapZ = minDz - Math.abs(dz);

        if (overlapX > 0 && overlapZ > 0) {
          const shiftX = (overlapX / 2) * Math.sign(dx || 1);
          const shiftZ = (overlapZ / 2) * Math.sign(dz || 1);

          a.position = {
            x: a.position.x - shiftX,
            z: a.position.z - shiftZ,
          };
          b.position = {
            x: b.position.x + shiftX,
            z: b.position.z + shiftZ,
          };

          changed = true;
        }
      }
    }

    if (!changed) break;

    room = {
      ...room,
      furniture: furniture,
    };

    room = enforceAbsoluteBoundsForLayout(room);
  }

  // Final validation; caller can show score and violations
  const result = validateLayout(room);

  return {
    ...room,
    // Attach score as metadata if desired in the future
    // @ts-expect-error - not part of RoomLayout, but useful for debugging
    _score: result.score,
  };
}
