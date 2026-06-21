"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Interactive Lat/Long Sphere Grid Component
function LatLongSphere() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Generate a clean latitude/longitude grid (no diagonals) for the sphere
  const sphereEdgesGeometry = useMemo(() => {
    // 24 segments around (longitude lines), 16 segments vertically (latitude lines)
    const sphereGeo = new THREE.SphereGeometry(2.0, 24, 16);
    // Use default threshold angle (1 degree) to keep lat/long lines while removing coplanar diagonals
    const edges = new THREE.EdgesGeometry(sphereGeo, 1);
    sphereGeo.dispose();
    return edges;
  }, []);

  // Dispose geometries on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      sphereEdgesGeometry.dispose();
    };
  }, [sphereEdgesGeometry]);

  // Slow rotation and mouse-tracking tilt
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    if (groupRef.current) {
      // Auto idle spin
      groupRef.current.rotation.y = time * 0.06;
      
      // Mouse tilt with interpolation
      const targetX = -state.pointer.y * 0.4;
      const targetY = state.pointer.x * 0.4;
      
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY + time * 0.06, 0.05);
    }
  });

  return (
    <group ref={groupRef}>
      {/* Latitude / Longitude lines of the Earth */}
      <lineSegments geometry={sphereEdgesGeometry}>
        <lineBasicMaterial 
          color="#7DD3FC" 
          transparent 
          opacity={0.25} 
          linewidth={1} 
        />
      </lineSegments>
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
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.0} color="#4D7CFE" />
        
        <LatLongSphere />
      </Canvas>
    </div>
  );
}
