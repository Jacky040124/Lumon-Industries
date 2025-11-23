import { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Cylinder, Box, Text, useCursor } from '@react-three/drei';
import * as THREE from 'three';

interface Timer3DProps {
  totalTime?: number; // in seconds (e.g., 25 * 60)
  timeLeft?: number; // in seconds
  isRunning?: boolean;
  onToggle?: () => void;
  onReset?: () => void;
}

export const TimerModel = ({ 
  totalTime = 60, 
  timeLeft = 60, 
  isRunning = false, 
  onToggle 
}: Timer3DProps) => {
  const topDialRef = useRef<THREE.Group>(null);
  const buttonRef = useRef<THREE.Group>(null);
  const [hovered, setHover] = useState(false);
  
  // Cursor pointer on hover
  useCursor(hovered);

  // Animation for the button press
  useFrame(() => {
    // Gentle floating for the whole timer to make it feel alive
    if (topDialRef.current) {
       // Rotate dial based on time progress
       // 0 degrees at start, 360 degrees (2PI) at end
       const progress = 1 - (timeLeft / totalTime);
       const targetRotation = progress * Math.PI * 2;
       
       // Smoothly interpolate rotation
       topDialRef.current.rotation.y = THREE.MathUtils.lerp(
         topDialRef.current.rotation.y, 
         -targetRotation, 
         0.1
       );
    }

    // Button press animation
    if (buttonRef.current) {
       const targetY = isRunning ? 0.02 : 0.1; // Pressed down if running
       buttonRef.current.position.y = THREE.MathUtils.lerp(
         buttonRef.current.position.y, 
         targetY, 
         0.2
       );
    }
  });

  // Colors (matching Monkey3D palette)
  const colors = {
    base: "#e0ac69",    // Golden brown (like monkey fur)
    top: "#f3d5b2",     // Pale skin tone
    dial: "#f0f0f0",    // White-ish plastic
    mark: "#ff4444",    // Red marker
    text: "#1a1a1a"     // Black
  };

  const materialProps = { toneMapped: false };

  // Format time for display (MM:SS)
  const displayTime = useMemo(() => {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }, [timeLeft]);

  return (
    <group position={[0, 0, 0]} 
      onPointerOver={() => setHover(true)} 
      onPointerOut={() => setHover(false)}
    >
      {/* --- TIMER BASE --- */}
      <group position={[0, -0.5, 0]}>
        {/* Main Body */}
        <Cylinder args={[1, 1.1, 1.2, 32]}>
          <meshToonMaterial color={colors.dial} {...materialProps} />
        </Cylinder>
        
        {/* Rim */}
        <Cylinder args={[1.1, 1.1, 0.1, 32]} position={[0, -0.6, 0]}>
           <meshToonMaterial color="#ccc" {...materialProps} />
        </Cylinder>

        {/* Tick Marks Ring (Texture or simple geometry) */}
        {/* We'll simulate ticks with small boxes arranged in a circle */}
        {Array.from({ length: 12 }).map((_, i) => (
           <Box 
             key={i} 
             args={[0.05, 0.1, 0.05]} 
             position={[
               Math.sin((i / 12) * Math.PI * 2) * 0.9, 
               0.6, 
               Math.cos((i / 12) * Math.PI * 2) * 0.9
             ]}
             rotation={[0, (i / 12) * Math.PI * 2, 0]}
           >
             <meshStandardMaterial color="#333" />
           </Box>
        ))}
      </group>

      {/* --- ROTATING UPPER DIAL --- */}
      <group ref={topDialRef} position={[0, 0.1, 0]}>
         {/* Dome Shape */}
         <Cylinder args={[0.9, 1, 0.4, 32]} position={[0, 0, 0]}>
            <meshToonMaterial color={colors.base} {...materialProps} />
         </Cylinder>
         
         {/* The Indicator/Triangle */}
         <Box args={[0.1, 0.1, 0.3]} position={[0, 0.1, 0.75]} rotation={[0, 0, 0]}>
            <meshToonMaterial color={colors.mark} {...materialProps} />
         </Box>
      </group>

      {/* --- START/STOP BUTTON --- */}
      <group 
        ref={buttonRef} 
        position={[0, 0.1, 0]} 
        onClick={(e) => {
          e.stopPropagation();
          onToggle?.();
        }}
      >
         <Cylinder args={[0.4, 0.4, 0.2, 32]} position={[0, 0.3, 0]}>
            <meshToonMaterial color={isRunning ? "#4caf50" : colors.mark} {...materialProps} />
         </Cylinder>
         <Text 
            position={[0, 0.41, 0]} 
            rotation={[-Math.PI / 2, 0, 0]} 
            fontSize={0.15} 
            color="white"
            anchorX="center"
            anchorY="middle"
          >
            {isRunning ? "STOP" : "START"}
         </Text>
      </group>

      {/* --- DIGITAL DISPLAY (Front Face) --- */}
      <group position={[0, -0.5, 1.06]} rotation={[0, 0, 0]}>
         {/* Screen Background */}
         <Box args={[0.8, 0.4, 0.1]} position={[0, 0, 0]}>
           <meshStandardMaterial color="#222" />
         </Box>
         {/* Time Text */}
         <Text
           position={[0, 0, 0.06]}
           fontSize={0.25}
           color="#00ff00" // Retro LCD green
           anchorX="center"
           anchorY="middle"
           font="https://fonts.gstatic.com/s/roboto/v18/KFOmCnqEu92Fr1Mu4mxM.woff" // Standard font fallback
         >
           {displayTime}
         </Text>
      </group>
    </group>
  );
};

// Wrapper for previewing independently
export default function Timer3DWrapper(props: Timer3DProps) {
  return (
    <div style={{ width: '300px', height: '300px', position: 'relative', background: 'transparent' }}>
      <Canvas camera={{ position: [0, 2, 3.5], fov: 45 }} shadows>
        <ambientLight intensity={0.7} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <spotLight position={[0, 5, 0]} intensity={0.8} />
        
        <TimerModel {...props} />
        
        {/* No OrbitControls by default so it feels like a fixed UI element, 
            but can be added if user wants to inspect */}
      </Canvas>
    </div>
  );
}

