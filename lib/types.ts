export type Vector2 = {
  x: number; // right (0 → width)
  z: number; // back (0 → depth)
};

export type Wall = {
  id: string;
  wallIndex: number; // 0=front/door, 1=right, 2=back, 3=left
  start: Vector2;
  end: Vector2;
  thickness: number; // in inches, default 6
};

export type Door = {
  id: string;
  wallIndex: number; // 0-3
  offsetFromLeft: number; // inches from left corner of that wall
  width: number; // in inches, default 36
  swing: "in_left" | "in_right" | "out_left" | "out_right";
};

export type FixedZone = {
  type: "closet" | "window" | "other";
  x: number;
  z: number;
  width: number;
  depth: number;
};

export type FurnitureKind =
  | "bed"
  | "desk"
  | "sofa"
  | "table"
  | "chair"
  | "dresser"
  | "nightstand"
  | "rug"
  | "plant"
  | "lamp"
  | "custom";

export type Furniture = {
  id: string;
  name: string;
  kind: FurnitureKind;
  type: string; // catalog type like "bed_twin", "desk_standard"
  position: Vector2; // center point, in inches (x→right, z→back)
  size: Vector2; // width/depth in inches (before rotation)
  rotation: number; // degrees (0/90/180/270 for wall-huggers)
  isWallHugger?: boolean;
  isCenterpiece?: boolean;
};

/** Raw furniture input: size/position may use y (3D) or z (2D) for compatibility */
export type RawFurnitureInput = Omit<Partial<Furniture>, "size" | "position"> & {
  size?: { x?: number; y?: number; z?: number };
  position?: { x?: number; y?: number; z?: number };
};

export type RoomLayout = {
  units: "in";
  room: {
    width: number; // inches (x-axis)
    depth: number; // inches (z-axis, was "height")
    height?: number; // ceiling height in inches (optional, for 3D)
    wallThickness: number; // inches, default 6
  };
  door: Door;
  fixedZones?: FixedZone[];
  walls: Wall[]; // computed from room dimensions
  doors: Door[]; // legacy array format (includes door)
  furniture: Furniture[];
};

export type ViolationSeverity = "info" | "warning" | "error";

export type ViolationKind =
  | "physics_out_of_bounds"
  | "physics_overlap"
  | "door_blocked"
  | "path_blocked"
  | "clearance_too_small"
  | "wall_hugger_not_against_wall"
  | "centerpiece_not_centered";

export type Violation = {
  id: string;
  kind: ViolationKind;
  message: string;
  severity: ViolationSeverity;
  position: Vector2; // x, z coordinates
};

export type LayoutValidationResult = {
  score: number; // 0–100
  violations: Violation[];
};

