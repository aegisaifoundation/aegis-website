"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";

// Interactive Constellation Sphere Component
function Constellation() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate random points distributed inside a sphere
  const nodes = useMemo(() => {
    const temp: THREE.Vector3[] = [];
    const count = 50;
    const radius = 2.0;
    
    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      // Keep nodes slightly randomized inside the sphere boundary
      const r = radius * (0.8 + Math.random() * 0.2); 
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      
      temp.push(new THREE.Vector3(x, y, z));
    }
    return temp;
  }, []);

  // Dynamically calculate lines between nearby nodes
  const connections = useMemo(() => {
    const temp: [THREE.Vector3, THREE.Vector3][] = [];
    const maxDist = 1.35;
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = nodes[i].distanceTo(nodes[j]);
        if (dist < maxDist) {
          temp.push([nodes[i], nodes[j]]);
        }
      }
    }
    return temp;
  }, [nodes]);

  // Track mouse coordinates to tilt the sphere
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      
      // Auto idle spin
      groupRef.current.rotation.y = time * 0.08;
      
      // Mouse tilt with interpolation
      const targetX = -state.pointer.y * 0.6;
      const targetY = state.pointer.x * 0.6;
      
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.05);
      // Add standard rotation with mouse offset
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY + time * 0.08, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Outer bounding mesh indicator (very thin glowing shell) */}
      <mesh>
        <sphereGeometry args={[2.02, 16, 16]} />
        <meshBasicMaterial 
          color="#7DD3FC" 
          wireframe 
          transparent 
          opacity={0.03} 
        />
      </mesh>

      {/* Dotted Nodes */}
      {nodes.map((pos, idx) => (
        <mesh key={idx} position={pos}>
          <sphereGeometry args={[0.035, 6, 6]} />
          <meshBasicMaterial color="#7DD3FC" />
        </mesh>
      ))}

      {/* Network connection paths */}
      {connections.map(([p1, p2], idx) => (
        <Line
          key={idx}
          points={[p1, p2]}
          color="#4D7CFE"
          lineWidth={0.5}
          transparent
          opacity={0.3}
        />
      ))}
    </group>
  );
}

export default function NetworkSphere() {
  return (
    <div className="three-canvas-container interactive-canvas">
      <Canvas
        camera={{ position: [0, 0, 3.8], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#4D7CFE" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7DD3FC" />
        
        <Constellation />
      </Canvas>
    </div>
  );
}
