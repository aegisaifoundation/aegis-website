"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Line } from "@react-three/drei";
import * as THREE from "three";

// Rotating Globe Component
function Globe() {
  const globeRef = useRef<THREE.Group>(null);

  // Generate random network node positions on the sphere surface
  const nodes = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const radius = 2.2;
    const count = 12;

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      const x = radius * Math.sin(phi) * Math.cos(theta);
      const y = radius * Math.sin(phi) * Math.sin(theta);
      const z = radius * Math.cos(phi);
      points.push(new THREE.Vector3(x, y, z));
    }
    return points;
  }, []);

  // Generate connection line paths between nearby nodes
  const connections = useMemo(() => {
    const lines: [THREE.Vector3, THREE.Vector3][] = [];
    const maxDistance = 1.8;

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = nodes[i].distanceTo(nodes[j]);
        if (dist < maxDistance && Math.random() > 0.3) {
          lines.push([nodes[i], nodes[j]]);
        }
      }
    }
    return lines;
  }, [nodes]);

  // Slow rotation loop
  useFrame((state) => {
    if (globeRef.current) {
      globeRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
      globeRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.015) * 0.05;
    }
  });

  return (
    <group ref={globeRef}>
      {/* Dark Core Sphere */}
      <mesh>
        <sphereGeometry args={[2.16, 32, 32]} />
        <meshStandardMaterial 
          color="#030712" 
          roughness={0.9} 
          metalness={0.2} 
        />
      </mesh>

      {/* Grid Wireframe (Holographic Lat/Long Lines) */}
      <mesh>
        <sphereGeometry args={[2.18, 24, 24]} />
        <meshBasicMaterial 
          color="#4D7CFE" 
          wireframe 
          transparent 
          opacity={0.06} 
        />
      </mesh>

      {/* Glowing Nodes */}
      {nodes.map((pos, idx) => (
        <group key={idx}>
          {/* Main Node */}
          <mesh position={pos}>
            <sphereGeometry args={[0.02, 8, 8]} />
            <meshBasicMaterial color="#7DD3FC" />
          </mesh>
          {/* Node Glow Halo */}
          <mesh position={pos}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#4D7CFE" transparent opacity={0.1} />
          </mesh>
        </group>
      ))}

      {/* Connection Arcs */}
      {connections.map(([p1, p2], idx) => {
        // Draw slightly arched lines by creating a mid-point bent outwards
        const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
        midPoint.normalize().multiplyScalar(2.35); // pull mid point outward for curvature
        
        const curve = new THREE.QuadraticBezierCurve3(p1, midPoint, p2);
        const curvePoints = curve.getPoints(12);

        return (
          <Line
            key={idx}
            points={curvePoints}
            color="#4D7CFE"
            lineWidth={0.8}
            transparent
            opacity={0.1}
          />
        );
      })}
    </group>
  );
}

export default function EarthNetwork() {
  return (
    <div className="three-canvas-container">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#4D7CFE" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7DD3FC" />
        
        <Globe />
        
        {/* Subtle Starfield Background */}
        <Stars 
          radius={100} 
          depth={50} 
          count={600} 
          factor={3} 
          saturation={0} 
          fade 
          speed={0.4} 
        />
      </Canvas>
    </div>
  );
}
