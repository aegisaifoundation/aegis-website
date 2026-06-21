"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Server Array Component
function ServerArray() {
  const groupRef = useRef<THREE.Group>(null);
  
  // Create coordinates for server racks in a grid
  const racks = useMemo(() => {
    const temp: { x: number; z: number }[] = [];
    const cols = 3;
    const rows = 2;
    const spacingX = 1.6;
    const spacingZ = 1.6;
    
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const x = (c - (cols - 1) / 2) * spacingX;
        const z = (r - (rows - 1) / 2) * spacingZ;
        temp.push({ x, z });
      }
    }
    return temp;
  }, []);

  // Generate EdgesGeometry for racks and servers to avoid diagonal wireframe lines
  const { rackEdgesGeometry, serverEdgesGeometry } = useMemo(() => {
    const rackBox = new THREE.BoxGeometry(0.8, 2.5, 0.8);
    const rackEd = new THREE.EdgesGeometry(rackBox);
    rackBox.dispose();

    const serverBox = new THREE.BoxGeometry(0.74, 0.32, 0.74);
    const serverEd = new THREE.EdgesGeometry(serverBox);
    serverBox.dispose();

    return { rackEdgesGeometry: rackEd, serverEdgesGeometry: serverEd };
  }, []);

  // Dispose geometries on unmount
  useEffect(() => {
    return () => {
      rackEdgesGeometry.dispose();
      serverEdgesGeometry.dispose();
    };
  }, [rackEdgesGeometry, serverEdgesGeometry]);

  // Generate coordinate points for server indicator lights inside each rack
  const serverLights = useMemo(() => {
    const temp: { pos: THREE.Vector3; speed: number; color: string; phase: number }[] = [];
    const heightLevels = 5;
    
    racks.forEach((rack, rackIdx) => {
      for (let h = 0; h < heightLevels; h++) {
        const y = -1.2 + h * 0.55; // Stack vertically
        // Left side light
        temp.push({
          pos: new THREE.Vector3(rack.x - 0.28, y, rack.z + 0.36),
          speed: 1 + Math.random() * 2,
          color: Math.random() > 0.4 ? "#7DD3FC" : "#4D7CFE",
          phase: Math.random() * Math.PI
        });
        // Right side light
        temp.push({
          pos: new THREE.Vector3(rack.x + 0.28, y, rack.z + 0.36),
          speed: 1 + Math.random() * 2,
          color: Math.random() > 0.3 ? "#4D7CFE" : "#10B981",
          phase: Math.random() * Math.PI
        });
      }
    });
    return temp;
  }, [racks]);

  // Generate data-stream particles traveling vertically
  const dataParticles = useMemo(() => {
    const temp: { x: number; z: number; y: number; speed: number; size: number }[] = [];
    const count = 30;
    
    for (let i = 0; i < count; i++) {
      const rack = racks[Math.floor(Math.random() * racks.length)];
      temp.push({
        x: rack.x + (Math.random() - 0.5) * 0.4,
        z: rack.z + (Math.random() - 0.5) * 0.4,
        y: -1.5 + Math.random() * 3,
        speed: 0.015 + Math.random() * 0.02,
        size: 0.02 + Math.random() * 0.03
      });
    }
    return temp;
  }, [racks]);

  const lightRefs = useRef<THREE.MeshBasicMaterial[]>([]);

  // Slow rotation and light pulsing animation
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Rotate the entire array
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.12;
      groupRef.current.rotation.x = Math.sin(time * 0.05) * 0.08;
    }

    // Pulse/blink server lights
    serverLights.forEach((light, idx) => {
      const mat = lightRefs.current[idx];
      if (mat) {
        const opacity = 0.3 + Math.sin(time * light.speed + light.phase) * 0.7;
        mat.opacity = Math.max(0.1, opacity);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Server Racks Wireframes */}
      {racks.map((rack, idx) => (
        <group key={idx} position={[rack.x, 0, rack.z]}>
          {/* Rack outer casing (horizontal and vertical lines only) */}
          <lineSegments geometry={rackEdgesGeometry}>
            <lineBasicMaterial 
              color="#4D7CFE" 
              transparent 
              opacity={0.12} 
            />
          </lineSegments>
          
          {/* Solid server units stacking vertically inside */}
          {[0, 1, 2, 3, 4].map((u) => (
            <mesh key={u} position={[0, -0.9 + u * 0.45, 0]}>
              <boxGeometry args={[0.72, 0.3, 0.72]} />
              <meshStandardMaterial 
                color="#08111F" 
                roughness={0.8} 
                metalness={0.4} 
              />
              {/* Inner outline casing (horizontal and vertical lines only) */}
              <lineSegments geometry={serverEdgesGeometry}>
                <lineBasicMaterial 
                  color="#4D7CFE" 
                  transparent 
                  opacity={0.06} 
                />
              </lineSegments>
            </mesh>
          ))}
        </group>
      ))}

      {/* Pulsing Server status lights */}
      {serverLights.map((light, idx) => (
        <mesh key={idx} position={light.pos}>
          <sphereGeometry args={[0.024, 6, 6]} />
          <meshBasicMaterial
            ref={(el) => {
              if (el) lightRefs.current[idx] = el;
            }}
            color={light.color}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      {/* Floating vertical data particles */}
      {dataParticles.map((pt, idx) => {
        // Simple animated vertical particle
        return <DataParticle key={idx} particle={pt} />;
      })}
    </group>
  );
}

// Inner helper component to animate individual vertical data particles
function DataParticle({ particle }: { particle: any }) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.y += particle.speed;
      if (meshRef.current.position.y > 1.5) {
        meshRef.current.position.y = -1.5;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={[particle.x, particle.y, particle.z]}>
      <sphereGeometry args={[particle.size, 6, 6]} />
      <meshBasicMaterial color="#7DD3FC" transparent opacity={0.6} />
    </mesh>
  );
}

export default function DataCenter3D() {
  return (
    <div className="three-canvas-container interactive-canvas">
      <Canvas
        camera={{ position: [0, 0, 4.2], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#4D7CFE" />
        <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7DD3FC" />
        
        <ServerArray />
      </Canvas>
    </div>
  );
}
