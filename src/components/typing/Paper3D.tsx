import { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Box, OrbitControls } from '@react-three/drei';

export const PaperModel = () => {
  const meshRef = useRef(null);

  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      {/* The Paper Sheet */}
      <Box 
        ref={meshRef}
        args={[8.5, 11, 0.05]} // Standard letter ratio, slight thickness
        position={[0, 0, 0]}
      >
        <meshStandardMaterial 
          color="#ffffff" 
          roughness={0.6}
          metalness={0.1}
        />
      </Box>
    </group>
  );
};

export default function Paper3D() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '500px', position: 'relative' }}>
      <Canvas camera={{ position: [0, 10, 10], fov: 45 }} shadows>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} castShadow />
        <spotLight position={[-10, 15, 5]} intensity={0.8} angle={0.3} penumbra={1} castShadow />
        
        <PaperModel />
        
        <OrbitControls 
          enableZoom={true}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}

