"use client";

import * as React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { normalizeModelData } from "../lib/normalizeModelData";
import type { RoomLayout } from "../lib/types";
import { getFurnitureSize } from "../lib/furnitureCatalog";

type Room3DSceneProps = {
  layout?: Partial<RoomLayout>;
};

// Simple 3D room box + blocks for furniture.
// Coordinate system: x→right, z→back, y→up
export function Room3DScene({ layout }: Room3DSceneProps) {
  const room = React.useMemo(() => normalizeModelData(layout), [layout]);

  const width = room.room.width / 12; // feet
  const depth = room.room.depth / 12; // feet
  const height = (room.room.height || 96) / 12; // feet (default 8ft)

  return (
    <div className="h-80 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
      <Canvas
        camera={{ position: [width * 1.5, height * 1.2, depth * 2], fov: 45 }}
        shadows
      >
        <color attach="background" args={["#020617"]} />
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 8, 3]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <group position={[-width / 2, 0, -depth / 2]}>
          {/* Floor */}
          <mesh receiveShadow rotation-x={-Math.PI / 2}>
            <planeGeometry args={[width, depth]} />
            <meshStandardMaterial color="#020617" />
          </mesh>

          {/* Walls */}
          <mesh position={[width / 2, height / 2, 0]}>
            <boxGeometry args={[0.1, height, depth]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          <mesh position={[-width / 2, height / 2, 0]}>
            <boxGeometry args={[0.1, height, depth]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          <mesh position={[0, height / 2, depth / 2]}>
            <boxGeometry args={[width, height, 0.1]} />
            <meshStandardMaterial color="#020617" />
          </mesh>
          <mesh position={[0, height / 2, -depth / 2]}>
            <boxGeometry args={[width, height, 0.1]} />
            <meshStandardMaterial color="#020617" />
          </mesh>

          {/* Furniture blocks */}
          {room.furniture.map((f) => {
            const actualSize = getFurnitureSize(f.type, f.rotation);
            const x = f.position.x / 12 - width / 2;
            const z = f.position.z / 12 - depth / 2;
            const w = actualSize.width / 12;
            const d = actualSize.depth / 12;
            const h = f.kind === "bed" ? 0.8 : f.kind === "desk" ? 0.75 : 0.6;

            const color =
              f.kind === "bed"
                ? "#22c55e"
                : f.kind === "desk"
                  ? "#0ea5e9"
                  : f.kind === "dresser"
                    ? "#8b5cf6"
                    : "#a855f7";

            return (
              <mesh
                key={f.id}
                position={[x, h / 2, z]}
                castShadow
                rotation-y={(f.rotation * Math.PI) / 180}
              >
                <boxGeometry args={[w, h, d]} />
                <meshStandardMaterial color={color} />
              </mesh>
            );
          })}
        </group>

        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          maxPolarAngle={Math.PI / 2.1}
        />
      </Canvas>
    </div>
  );
}
