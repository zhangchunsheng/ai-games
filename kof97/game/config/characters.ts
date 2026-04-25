// Character move configurations
export interface MoveConfig {
  name: string;
  damage: number;
  startup: number;      // frames before active
  active: number;       // frames where hitbox is active
  recovery: number;     // frames after active
  hitStun: number;      // frames opponent is stunned
  blockStun: number;    // frames opponent is blocked
  knockdown: boolean;   // does this move knock down
  projectile?: boolean; // is this a projectile move
}

export interface CharacterConfig {
  id: string;
  name: string;
  walkSpeed: number;
  jumpForce: number;
  maxHealth: number;
  moves: {
    lightPunch: MoveConfig;
    mediumPunch: MoveConfig;
    heavyPunch: MoveConfig;
    lightKick: MoveConfig;
    mediumKick: MoveConfig;
    heavyKick: MoveConfig;
    special1?: MoveConfig;  // special move
    special2?: MoveConfig;
    super?: MoveConfig;     // super move
  };
}

// Kyo Kusanagi configuration
export const KYO_CONFIG: CharacterConfig = {
  id: 'kyo',
  name: 'Kyo Kusanagi',
  walkSpeed: 5,
  jumpForce: -15,
  maxHealth: 100,
  moves: {
    lightPunch: {
      name: 'Jab',
      damage: 3,
      startup: 3,
      active: 2,
      recovery: 4,
      hitStun: 12,
      blockStun: 8,
      knockdown: false,
    },
    mediumPunch: {
      name: 'Strong Punch',
      damage: 6,
      startup: 5,
      active: 3,
      recovery: 8,
      hitStun: 16,
      blockStun: 12,
      knockdown: false,
    },
    heavyPunch: {
      name: 'Fierce Punch',
      damage: 10,
      startup: 8,
      active: 4,
      recovery: 12,
      hitStun: 20,
      blockStun: 16,
      knockdown: true,
    },
    lightKick: {
      name: 'Short Kick',
      damage: 3,
      startup: 4,
      active: 2,
      recovery: 5,
      hitStun: 12,
      blockStun: 8,
      knockdown: false,
    },
    mediumKick: {
      name: 'Forward Kick',
      damage: 7,
      startup: 6,
      active: 3,
      recovery: 9,
      hitStun: 16,
      blockStun: 12,
      knockdown: false,
    },
    heavyKick: {
      name: 'Roundhouse Kick',
      damage: 11,
      startup: 10,
      active: 5,
      recovery: 14,
      hitStun: 22,
      blockStun: 18,
      knockdown: true,
    },
    special1: {
      name: '108 Shiki Yami Barai',
      damage: 12,
      startup: 10,
      active: 20,
      recovery: 15,
      hitStun: 18,
      blockStun: 14,
      knockdown: false,
      projectile: true,
    },
    special2: {
      name: '100 Shiki Oniyaki',
      damage: 15,
      startup: 8,
      active: 10,
      recovery: 20,
      hitStun: 20,
      blockStun: 16,
      knockdown: true,
    },
    super: {
      name: 'Orochinagi',
      damage: 35,
      startup: 15,
      active: 30,
      recovery: 30,
      hitStun: 30,
      blockStun: 25,
      knockdown: true,
    },
  },
};

// Terry Bogard configuration
export const TERRY_CONFIG: CharacterConfig = {
  id: 'terry',
  name: 'Terry Bogard',
  walkSpeed: 5.5,
  jumpForce: -14,
  maxHealth: 100,
  moves: {
    lightPunch: {
      name: 'Jab',
      damage: 3,
      startup: 3,
      active: 2,
      recovery: 4,
      hitStun: 12,
      blockStun: 8,
      knockdown: false,
    },
    mediumPunch: {
      name: 'Strong Punch',
      damage: 6,
      startup: 5,
      active: 3,
      recovery: 8,
      hitStun: 16,
      blockStun: 12,
      knockdown: false,
    },
    heavyPunch: {
      name: 'Fierce Punch',
      damage: 10,
      startup: 8,
      active: 4,
      recovery: 12,
      hitStun: 20,
      blockStun: 16,
      knockdown: true,
    },
    lightKick: {
      name: 'Short Kick',
      damage: 3,
      startup: 4,
      active: 2,
      recovery: 5,
      hitStun: 12,
      blockStun: 8,
      knockdown: false,
    },
    mediumKick: {
      name: 'Forward Kick',
      damage: 7,
      startup: 6,
      active: 3,
      recovery: 9,
      hitStun: 16,
      blockStun: 12,
      knockdown: false,
    },
    heavyKick: {
      name: 'Roundhouse Kick',
      damage: 11,
      startup: 10,
      active: 5,
      recovery: 14,
      hitStun: 22,
      blockStun: 18,
      knockdown: true,
    },
    special1: {
      name: 'Power Wave',
      damage: 12,
      startup: 12,
      active: 15,
      recovery: 12,
      hitStun: 18,
      blockStun: 14,
      knockdown: false,
      projectile: true,
    },
    special2: {
      name: 'Burn Knuckle',
      damage: 15,
      startup: 10,
      active: 8,
      recovery: 18,
      hitStun: 20,
      blockStun: 16,
      knockdown: true,
    },
    super: {
      name: 'Power Geyser',
      damage: 35,
      startup: 18,
      active: 25,
      recovery: 25,
      hitStun: 30,
      blockStun: 25,
      knockdown: true,
    },
  },
};

export const CHARACTERS: CharacterConfig[] = [KYO_CONFIG, TERRY_CONFIG];
