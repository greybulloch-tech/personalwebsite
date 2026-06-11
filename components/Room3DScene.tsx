"use client";

import * as React from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import { normalizeModelData } from "../lib/normalizeModelData";
import type { RoomLayout, Furniture } from "../lib/types";
import { getFurnitureSize } from "../lib/furnitureCatalog";
import * as THREE from "three";

type Room3DSceneProps = {
  layout?: Partial<RoomLayout>;
  onFurnitureClick?: (furniture: Furniture) => void;
  cameraView?: "default" | "top" | "front" | "side" | "isometric";
};

// ─── Clickable Furniture Component ───
function FurnitureBox({
  furniture,
  width,
  depth,
  onClick,
}: {
  furniture: Furniture;
  width: number;
  depth: number;
  onClick: (f: Furniture) => void;
}) {
  const actualSize = getFurnitureSize(furniture.type, furniture.rotation);
  // Note: the parent group is already at [-width/2, 0, -depth/2], so we position relative to that
  const x = furniture.position.x / 12;
  const z = furniture.position.z / 12;
  const w = actualSize.width / 12;
  const d = actualSize.depth / 12;
  const h = furniture.kind === "bed" ? 0.8 : furniture.kind === "desk" ? 0.75 : 0.6;

  const color =
    furniture.kind === "bed"
      ? "#00ff41"  // Bright green
      : furniture.kind === "desk"
        ? "#00d9ff"  // Bright cyan
        : furniture.kind === "dresser"
          ? "#d946ef"  // Bright magenta
          : "#fbbf24";  // Bright amber

  const meshRef = React.useRef<THREE.Mesh>(null);

  return (
    <mesh
      ref={meshRef}
      position={[x, h / 2, z]}
      rotation-y={(furniture.rotation * Math.PI) / 180}
      castShadow
      receiveShadow
      onClick={(e) => {
        e.stopPropagation();
        onClick(furniture);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (meshRef.current) {
          (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.3;
        }
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        if (meshRef.current) {
          (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0;
        }
      }}
    >
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={0.2}
        metalness={0.2}
        roughness={0.8}
      />
    </mesh>
  );
}

// ─── Room Component with raycasting ───
function RoomContent({
  room,
  width,
  depth,
  height,
  onFurnitureClick,
  cameraView,
}: {
  room: RoomLayout;
  width: number;
  depth: number;
  height: number;
  onFurnitureClick?: (f: Furniture) => void;
  cameraView?: "default" | "top" | "front" | "side" | "isometric";
}) {
  const { camera } = useThree();

  React.useEffect(() => {
    if (!cameraView) return;

    const duration = 500; // ms
    const startCam = { x: camera.position.x, y: camera.position.y, z: camera.position.z };

    let targetCam = { x: width * 1.5, y: height * 1.2, z: depth * 2 }; // default

    if (cameraView === "top") {
      targetCam = { x: 0, y: Math.max(width, depth) * 1.2, z: 0 };
    } else if (cameraView === "front") {
      targetCam = { x: 0, y: height / 2, z: depth * 0.8 };
    } else if (cameraView === "side") {
      targetCam = { x: width * 0.8, y: height / 2, z: 0 };
    } else if (cameraView === "isometric") {
      targetCam = { x: width * 0.6, y: height * 0.7, z: depth * 0.6 };
    }

    let startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress; // easeInOutQuad

      camera.position.x = startCam.x + (targetCam.x - startCam.x) * easeProgress;
      camera.position.y = startCam.y + (targetCam.y - startCam.y) * easeProgress;
      camera.position.z = startCam.z + (targetCam.z - startCam.z) * easeProgress;
      camera.lookAt(0, 0, 0);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    animate();
  }, [cameraView, camera, width, depth, height]);

  return (
    <group>
      <color attach="background" args={["#1a1a2e"]} />
      <ambientLight intensity={0.8} />
      <directionalLight
        position={[5, 8, 3]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 4, 0]} intensity={0.6} />
      <pointLight position={[5, 2, 5]} intensity={0.5} />

      <group position={[-width / 2, 0, -depth / 2]}>
        {/* Floor */}
        <mesh receiveShadow rotation-x={-Math.PI / 2} position={[width / 2, 0, depth / 2]}>
          <planeGeometry args={[width, depth]} />
          <meshStandardMaterial color="#1a1a2e" />
        </mesh>

        {/* Walls with visible styling */}
        {/* Front Wall (door) */}
        <mesh position={[width / 2, height / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.2, height, depth]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* Right Wall */}
        <mesh position={[width, height / 2, depth / 2]} castShadow receiveShadow>
          <boxGeometry args={[0.2, height, depth]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* Back Wall (window) */}
        <mesh position={[width / 2, height / 2, depth]} castShadow receiveShadow>
          <boxGeometry args={[0.2, height, depth]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* Left Wall */}
        <mesh position={[0, height / 2, depth / 2]} castShadow receiveShadow>
          <boxGeometry args={[0.2, height, depth]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* Ceiling */}
        <mesh position={[width / 2, height, depth / 2]} receiveShadow>
          <boxGeometry args={[width, 0.2, depth]} />
          <meshStandardMaterial color="#111827" />
        </mesh>

        {/* Door Frame (Front Wall) */}
        <mesh position={[width / 2, 0.9, 0]}>
          <boxGeometry args={[0.3, 2, 0.1]} />
          <meshStandardMaterial color="#94a3b8" />
        </mesh>

        {/* Window Frame (Back Wall) */}
        <mesh position={[width / 2, 1.5, depth]}>
          <boxGeometry args={[1.5, 1, 0.1]} />
          <meshStandardMaterial color="#87ceeb" emissive="#87ceeb" emissiveIntensity={0.2} />
        </mesh>

        {/* Furniture Pieces */}
        {room.furniture.map((f) => (
          <FurnitureBox
            key={f.id}
            furniture={f}
            width={width}
            depth={depth}
            onClick={onFurnitureClick || (() => {})}
          />
        ))}
      </group>
    </group>
  );
}

// ─── Main Component ───
export function Room3DScene({ layout, onFurnitureClick, cameraView }: Room3DSceneProps) {
  const room = React.useMemo(() => normalizeModelData(layout), [layout]);

  const width = room.room.width / 12; // feet
  const depth = room.room.depth / 12; // feet
  const height = (room.room.height || 96) / 12; // feet (default 8ft)

  return (
    <div className="h-80 w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 relative">
      <Canvas
        camera={{ position: [width * 1.5, height * 1.2, depth * 2], fov: 45 }}
        shadows
      >
        <RoomContent
          room={room}
          width={width}
          depth={depth}
          height={height}
          onFurnitureClick={onFurnitureClick}
          cameraView={cameraView}
        />
        <OrbitControls
          enablePan
          enableZoom
          enableRotate
          maxPolarAngle={Math.PI / 1.8}
          autoRotate={false}
        />
      </Canvas>

      {/* Camera View Controls */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <button
          className="px-3 py-1 text-xs font-medium bg-zinc-800 hover:bg-zinc-700 text-white rounded transition"
          onClick={() => {}}
          title="Rotate view"
        >
          ↻ Rotate
        </button>
      </div>
    </div>
  );
}
