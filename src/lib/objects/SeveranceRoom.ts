import * as THREE from 'three';
import { SEVERANCE_ROOM_CONFIG } from '@/models/constants/scene';

export class SeveranceRoom {
  group: THREE.Group;
  
  constructor(parent: THREE.Object3D) {
    this.group = new THREE.Group();
    parent.add(this.group);
    
    // Create the iconic green carpet
    this.createFloor();
    // Build the surrounding walls with baseboards
    this.createWalls();
    // Add the grid ceiling with panel lights
    this.createCeiling();
  }

  /**
   * Creates the floor using the specific dark green carpet color (0x2d4635)
   * iconic to the MDR room. Using high roughness to simulate fabric texture.
   */
  createFloor() {
    const { DIMENSIONS, COLORS } = SEVERANCE_ROOM_CONFIG;
    
    // High roughness carpet material
    const material = new THREE.MeshStandardMaterial({
      color: COLORS.CARPET,
      roughness: 0.9,
      metalness: 0.0,
      side: THREE.FrontSide,
    });
    
    const geometry = new THREE.PlaneGeometry(DIMENSIONS.WIDTH, DIMENSIONS.DEPTH);
    const floor = new THREE.Mesh(geometry, material);
    
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    
    this.group.add(floor);
  }

  createWalls() {
    const { DIMENSIONS, COLORS } = SEVERANCE_ROOM_CONFIG;
    const halfWidth = DIMENSIONS.WIDTH / 2;
    const halfDepth = DIMENSIONS.DEPTH / 2;
    const height = DIMENSIONS.HEIGHT;
    
    const material = new THREE.MeshStandardMaterial({
      color: COLORS.WALLS,
      roughness: 0.5,
      metalness: 0.1,
      side: THREE.DoubleSide, // Visible from inside
    });
    
    const baseboardMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.BASEBOARD,
      roughness: 0.8,
    });
    
    const wallPositions = [
      { pos: [0, height/2, -halfDepth], rot: [0, 0, 0], size: [DIMENSIONS.WIDTH, height] }, // Back
      { pos: [0, height/2, halfDepth], rot: [0, Math.PI, 0], size: [DIMENSIONS.WIDTH, height] }, // Front
      { pos: [-halfWidth, height/2, 0], rot: [0, Math.PI/2, 0], size: [DIMENSIONS.DEPTH, height] }, // Left
      { pos: [halfWidth, height/2, 0], rot: [0, -Math.PI/2, 0], size: [DIMENSIONS.DEPTH, height] }, // Right
    ];
    
    wallPositions.forEach(({ pos, rot, size }) => {
      // Main Wall
      const geometry = new THREE.PlaneGeometry(size[0], size[1]);
      const wall = new THREE.Mesh(geometry, material);
      wall.position.set(pos[0], pos[1], pos[2]);
      wall.rotation.set(rot[0], rot[1], rot[2]);
      wall.receiveShadow = true;
      wall.castShadow = false; // Walls usually don't cast shadows on floor in this setup
      this.group.add(wall);
      
      // Baseboard
      const baseHeight = 0.15;
      const baseDepth = 0.02;
      const baseGeo = new THREE.BoxGeometry(size[0], baseHeight, baseDepth);
      const baseboard = new THREE.Mesh(baseGeo, baseboardMaterial);
      
      // Position relative to the wall position but slightly offset inward
      baseboard.position.copy(wall.position);
      baseboard.position.y = baseHeight / 2;
      baseboard.rotation.copy(wall.rotation);
      
      // Move slightly inward based on rotation to sit on surface
      const inwardOffset = baseDepth / 2;
      const forward = new THREE.Vector3(0, 0, 1).applyEuler(wall.rotation);
      baseboard.position.add(forward.multiplyScalar(inwardOffset));
      
      baseboard.castShadow = true;
      baseboard.receiveShadow = true;
      this.group.add(baseboard);
    });
  }

  createCeiling() {
    const { DIMENSIONS, COLORS, CEILING } = SEVERANCE_ROOM_CONFIG;
    const height = DIMENSIONS.HEIGHT;
    
    const ceilingGroup = new THREE.Group();
    ceilingGroup.position.y = height;
    this.group.add(ceilingGroup);
    
    // Base white ceiling
    const baseMaterial = new THREE.MeshStandardMaterial({
      color: COLORS.CEILING,
      roughness: 0.9,
      side: THREE.FrontSide,
    });
    
    const baseGeo = new THREE.PlaneGeometry(DIMENSIONS.WIDTH, DIMENSIONS.DEPTH);
    const baseCeiling = new THREE.Mesh(baseGeo, baseMaterial);
    baseCeiling.rotation.x = Math.PI / 2; // Facing down
    ceilingGroup.add(baseCeiling);
    
    // Grid of Light Panels
    // We create a grid of glowing panels
    const lightMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
    });
    
    const gridSize = CEILING.GRID_SIZE;
    const panelSize = gridSize * CEILING.LIGHT_PANEL_RATIO;
    const panelGeo = new THREE.PlaneGeometry(panelSize, panelSize);
    
    const cols = Math.floor(DIMENSIONS.WIDTH / gridSize);
    const rows = Math.floor(DIMENSIONS.DEPTH / gridSize);
    
    // Center offset
    const startX = -((cols * gridSize) / 2) + (gridSize / 2);
    const startZ = -((rows * gridSize) / 2) + (gridSize / 2);
    
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        // Skip every other one or create a pattern if desired, 
        // but MDR ceiling is pretty uniform. 
        // Let's make it a checkerboard of lights vs blank tiles for visual interest?
        // Or just a full grid. The show has large rectangular panels.
        // Let's do a uniform grid but with gaps.
        
        const panel = new THREE.Mesh(panelGeo, lightMaterial);
        panel.rotation.x = Math.PI / 2;
        panel.position.set(
          startX + i * gridSize,
          -0.01, // Slightly below base ceiling
          startZ + j * gridSize
        );
        ceilingGroup.add(panel);
      }
    }
  }
}
