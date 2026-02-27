import type {
  Furniture,
  LayoutValidationResult,
  RoomLayout,
  Violation,
  ViolationKind,
} from "./types";
import { enforceAbsoluteBoundsForLayout } from "./enforceAbsoluteBounds";
import { getFurnitureSize } from "./furnitureCatalog";

function distance(a: { x: number; z: number }, b: { x: number; z: number }) {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

function overlaps(a: Furniture, b: Furniture): boolean {
  const sizeA = getFurnitureSize(a.type, a.rotation);
  const sizeB = getFurnitureSize(b.type, b.rotation);
  
  const dx = Math.abs(a.position.x - b.position.x);
  const dz = Math.abs(a.position.z - b.position.z);
  const minDx = (sizeA.width + sizeB.width) / 2;
  const minDz = (sizeA.depth + sizeB.depth) / 2;
  return dx < minDx && dz < minDz;
}

type RuleContext = {
  room: RoomLayout;
};

type Rule = (ctx: RuleContext) => Violation[];

const CLEARANCE_AROUND: Partial<Record<Furniture["kind"], number>> = {
  bed: 30,
  desk: 36,
  table: 30,
};

const MIN_PATH_WIDTH = 36; // inches
const DOOR_CLEARANCE_ZONE = 48; // inches deep into room from door opening

function makeViolation(
  kind: ViolationKind,
  message: string,
  position: { x: number; z: number },
  severity: "info" | "warning" | "error" = "warning",
): Violation {
  return {
    id: `${kind}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    message,
    severity,
    position,
  };
}

// Level 1: Physics – inside bounds and no overlap
const physicsRule: Rule = ({ room }) => {
  const violations: Violation[] = [];
  const width = room.room.width;
  const depth = room.room.depth;

  // Out of bounds
  for (const f of room.furniture) {
    const actualSize = getFurnitureSize(f.type, f.rotation);
    const halfW = actualSize.width / 2;
    const halfD = actualSize.depth / 2;
    
    const outOfBounds =
      f.position.x - halfW < 0 ||
      f.position.x + halfW > width ||
      f.position.z - halfD < 0 ||
      f.position.z + halfD > depth;

    if (outOfBounds) {
      violations.push(
        makeViolation(
          "physics_out_of_bounds",
          `${f.name} must be inside the room walls.`,
          f.position,
          "error",
        ),
      );
    }
  }

  // Overlaps
  for (let i = 0; i < room.furniture.length; i++) {
    for (let j = i + 1; j < room.furniture.length; j++) {
      const a = room.furniture[i];
      const b = room.furniture[j];
      if (overlaps(a, b)) {
        violations.push(
          makeViolation(
            "physics_overlap",
            `${a.name} overlaps ${b.name}.`,
            {
              x: (a.position.x + b.position.x) / 2,
              z: (a.position.z + b.position.z) / 2,
            },
            "error",
          ),
        );
      }
    }
  }

  return violations;
};

// Level 3 + 4: Movement, clearances, and door blocking
const movementAndClearanceRule: Rule = ({ room }) => {
  const violations: Violation[] = [];
  const door = room.door;
  const width = room.room.width;
  const depth = room.room.depth;

  if (!door) return violations;

  // Calculate door center position based on wallIndex
  let doorCenter: { x: number; z: number };
  if (door.wallIndex === 0) {
    // Front wall
    doorCenter = { x: door.offsetFromLeft, z: 0 };
  } else if (door.wallIndex === 1) {
    // Right wall
    doorCenter = { x: width, z: door.offsetFromLeft };
  } else if (door.wallIndex === 2) {
    // Back wall
    doorCenter = { x: width - door.offsetFromLeft, z: depth };
  } else {
    // Left wall
    doorCenter = { x: 0, z: depth - door.offsetFromLeft };
  }

  // Check door clearance zone (48" deep into room)
  const doorClearanceStart = doorCenter;
  const doorClearanceEnd = door.wallIndex === 0
    ? { x: doorCenter.x, z: DOOR_CLEARANCE_ZONE }
    : door.wallIndex === 1
      ? { x: width - DOOR_CLEARANCE_ZONE, z: doorCenter.z }
      : door.wallIndex === 2
        ? { x: doorCenter.x, z: depth - DOOR_CLEARANCE_ZONE }
        : { x: DOOR_CLEARANCE_ZONE, z: doorCenter.z };

  for (const f of room.furniture) {
    const actualSize = getFurnitureSize(f.type, f.rotation);
    const halfW = actualSize.width / 2;
    const halfD = actualSize.depth / 2;

    // Check if furniture is in door clearance zone
    const inDoorZone =
      f.position.x + halfW >= Math.min(doorClearanceStart.x, doorClearanceEnd.x) &&
      f.position.x - halfW <= Math.max(doorClearanceStart.x, doorClearanceEnd.x) &&
      f.position.z + halfD >= Math.min(doorClearanceStart.z, doorClearanceEnd.z) &&
      f.position.z - halfD <= Math.max(doorClearanceStart.z, doorClearanceEnd.z);

    if (inDoorZone && (f.kind === "bed" || f.kind === "desk")) {
      violations.push(
        makeViolation(
          "door_blocked",
          `${f.name} blocks the door entry path (needs ${DOOR_CLEARANCE_ZONE}" clearance).`,
          f.position,
          "warning",
        ),
      );
    }

    // Check path width from door to primary targets
    const primaryTargets = room.furniture.filter(
      (f) => f.kind === "bed" || f.kind === "sofa" || f.kind === "desk",
    );

    for (const target of primaryTargets) {
      const d = distance(doorCenter, target.position);
      if (d < MIN_PATH_WIDTH) {
        violations.push(
          makeViolation(
            "path_blocked",
            `Path from door to ${target.name} is tighter than ${MIN_PATH_WIDTH}".`,
            target.position,
            "warning",
          ),
        );
      }
    }

    // Check clearance around furniture
    const clearance = CLEARANCE_AROUND[f.kind];
    if (!clearance) continue;

    for (const other of room.furniture) {
      if (other.id === f.id) continue;
      const d = distance(f.position, other.position);
      if (d < clearance) {
        violations.push(
          makeViolation(
            "clearance_too_small",
            `${f.name} should have at least ${clearance}" of clearance.`,
            f.position,
          ),
        );
        break;
      }
    }
  }

  return violations;
};

// Level 6: relational – wall huggers against walls
const relationalRule: Rule = ({ room }) => {
  const violations: Violation[] = [];
  const width = room.room.width;
  const depth = room.room.depth;

  for (const f of room.furniture) {
    if (f.isWallHugger) {
      const distToFront = f.position.z;
      const distToBack = depth - f.position.z;
      const distToLeft = f.position.x;
      const distToRight = width - f.position.x;
      
      const minDist = Math.min(distToFront, distToBack, distToLeft, distToRight);

      if (minDist > 24) {
        violations.push(
          makeViolation(
            "wall_hugger_not_against_wall",
            `${f.name} should be closer to a wall.`,
            f.position,
          ),
        );
      }
    }
  }

  return violations;
};

const RULES: Rule[] = [physicsRule, movementAndClearanceRule, relationalRule];

export function validateLayout(inputRoom: RoomLayout): LayoutValidationResult {
  // Always enforce hard physics bounds first
  const room = enforceAbsoluteBoundsForLayout(inputRoom);

  const allViolations = RULES.flatMap((rule) => rule({ room }));

  const physicsErrors = allViolations.filter(
    (v) => v.kind === "physics_out_of_bounds" || v.kind === "physics_overlap",
  ).length;
  const otherIssues = allViolations.length - physicsErrors;

  let score = 100;
  score -= physicsErrors * 20;
  score -= otherIssues * 5;
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    violations: allViolations,
  };
}
