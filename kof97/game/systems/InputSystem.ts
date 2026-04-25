import Phaser from 'phaser';

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  lp: boolean; // Light Punch
  mp: boolean; // Medium Punch
  hp: boolean; // Heavy Punch
  lk: boolean; // Light Kick
  mk: boolean; // Medium Kick
  hk: boolean; // Heavy Kick
}

export type InputCommand =
  | 'left'
  | 'right'
  | 'up'
  | 'down'
  | 'lp'
  | 'mp'
  | 'hp'
  | 'lk'
  | 'mk'
  | 'hk';

// Input buffer for special move detection
export class InputBuffer {
  private buffer: Array<{ command: InputCommand; time: number }> = [];
  private maxBufferTime: number = 500; // ms

  add(command: InputCommand): void {
    const now = Date.now();
    this.buffer.push({ command, time: now });

    // Clean old inputs
    this.buffer = this.buffer.filter(
      (input) => now - input.time < this.maxBufferTime
    );
  }

  // Check for directional inputs in order (e.g., ['down', 'right', 'down-right'] for quarter circle)
  hasSequence(sequence: InputCommand[], maxTime: number = 1000): boolean {
    if (this.buffer.length < sequence.length) return false;

    const now = Date.now();
    const recentInputs = this.buffer.filter(
      (input) => now - input.time < maxTime
    );

    if (recentInputs.length < sequence.length) return false;

    // Check if sequence exists in recent inputs (in order, but allows other inputs in between)
    let seqIndex = 0;
    for (const input of recentInputs) {
      if (input.command === sequence[seqIndex]) {
        seqIndex++;
        if (seqIndex === sequence.length) return true;
      }
    }

    return false;
  }

  has(command: InputCommand, maxTime: number = 500): boolean {
    const now = Date.now();
    return this.buffer.some(
      (input) => input.command === command && now - input.time < maxTime
    );
  }

  clear(): void {
    this.buffer = [];
  }
}

export class InputSystem {
  private scene: Phaser.Scene;
  private inputState: InputState;
  private inputBuffer: InputBuffer;
  private lastInputTime: number = 0;

  // Touch controls
  private leftJoystick: Phaser.GameObjects.Zone | null = null;
  private rightButtons: Map<string, Phaser.GameObjects.Container> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.inputBuffer = new InputBuffer();
    this.inputState = {
      left: false,
      right: false,
      up: false,
      down: false,
      lp: false,
      mp: false,
      hp: false,
      lk: false,
      mk: false,
      hk: false,
    };

    this.setupKeyboard();
    this.setupTouchControls();
  }

  private setupKeyboard(): void {
    const keys = this.scene.input.keyboard!.createCursorKeys();
    const wasd = this.scene.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    });

    // Attack keys
    const attacks = this.scene.input.keyboard!.addKeys({
      lp: Phaser.Input.Keyboard.KeyCodes.Z,
      mp: Phaser.Input.Keyboard.KeyCodes.X,
      hp: Phaser.Input.Keyboard.KeyCodes.C,
      lk: Phaser.Input.Keyboard.KeyCodes.COMMA,
      mk: Phaser.Input.Keyboard.KeyCodes.PERIOD,
      hk: Phaser.Input.Keyboard.KeyCodes.BACK_SLASH,
    });

    // Track key events
    this.scene.input.keyboard!.on('keydown', (event: KeyboardEvent) => {
      this.handleKeyDown(event.code);
    });

    this.scene.input.keyboard!.on('keyup', (event: KeyboardEvent) => {
      this.handleKeyUp(event.code);
    });
  }

  private setupTouchControls(): void {
    // Only setup touch for mobile
    if (!this.scene.sys.game.device.os.android && !this.scene.sys.game.device.os.iOS) {
      return;
    }

    const { width, height } = this.scene.scale;

    // Left joystick zone
    this.leftJoystick = this.scene.add.zone(width * 0.15, height - 80, 150, 150);
    this.leftJoystick.setInteractive();

    // Create touch joystick visuals
    const joystickBase = this.scene.add.circle(
      width * 0.15,
      height - 80,
      50,
      0x333333,
      0.5
    );
    const joystickStick = this.scene.add.circle(
      width * 0.15,
      height - 80,
      25,
      0x666666,
      0.8
    );

    // Joystick drag handling
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && this.leftJoystick) {
        const dx = pointer.x - this.leftJoystick.x;
        const dy = pointer.y - this.leftJoystick.y;
        const distance = Math.min(Math.sqrt(dx * dx + dy * dy), 50);
        const angle = Math.atan2(dy, dx);

        joystickStick.x = this.leftJoystick.x + Math.cos(angle) * distance;
        joystickStick.y = this.leftJoystick.y + Math.sin(angle) * distance;

        // Update input state based on joystick direction
        this.inputState.left = dx < -20;
        this.inputState.right = dx > 20;
        this.inputState.up = dy < -20;
        this.inputState.down = dy > 20;
      }
    });

    this.scene.input.on('pointerup', () => {
      joystickStick.x = this.leftJoystick!.x;
      joystickStick.y = this.leftJoystick!.y;
      this.inputState.left = false;
      this.inputState.right = false;
      this.inputState.up = false;
      this.inputState.down = false;
    });

    // Right side attack buttons
    const buttonY = height - 100;
    const buttonSpacing = 70;
    const startX = width - 200;

    const buttons: Array<{ key: 'lp' | 'mp' | 'hp' | 'lk' | 'mk' | 'hk'; color: number; x: number; y: number }> = [
      { key: 'lp', color: 0xff6666, x: startX + buttonSpacing, y: buttonY + 40 },
      { key: 'mp', color: 0xff6666, x: startX + buttonSpacing * 2, y: buttonY + 40 },
      { key: 'hp', color: 0xff6666, x: startX + buttonSpacing * 3, y: buttonY + 40 },
      { key: 'lk', color: 0x66ff66, x: startX + buttonSpacing, y: buttonY - 20 },
      { key: 'mk', color: 0x66ff66, x: startX + buttonSpacing * 2, y: buttonY - 20 },
      { key: 'hk', color: 0x66ff66, x: startX + buttonSpacing * 3, y: buttonY - 20 },
    ];

    buttons.forEach((btn) => {
      const container = this.scene.add.container(btn.x, btn.y);
      const bg = this.scene.add.circle(0, 0, 30, btn.color, 0.8);
      const text = this.scene.add.text(0, 0, btn.key.toUpperCase(), {
        fontSize: '14px',
        color: '#000',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      container.add([bg, text]);
      container.setInteractive(new Phaser.Geom.Circle(0, 0, 30), Phaser.Geom.Circle.Contains);

      container.on('pointerdown', () => {
        this.inputState[btn.key] = true;
        this.inputBuffer.add(btn.key);
        bg.setFillStyle(btn.color === 0xff6666 ? 0xff3333 : 0x33ff33, 1);
      });

      container.on('pointerup', () => {
        this.inputState[btn.key] = false;
        bg.setFillStyle(btn.color, 0.8);
      });

      container.on('pointerout', () => {
        this.inputState[btn.key] = false;
        bg.setFillStyle(btn.color, 0.8);
      });

      this.rightButtons.set(btn.key, container);
    });
  }

  private handleKeyDown(code: string): void {
    switch (code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.inputState.left = true;
        this.inputBuffer.add('left');
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.inputState.right = true;
        this.inputBuffer.add('right');
        break;
      case 'ArrowUp':
      case 'KeyW':
        this.inputState.up = true;
        this.inputBuffer.add('up');
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.inputState.down = true;
        this.inputBuffer.add('down');
        break;
      case 'KeyZ':
        this.inputState.lp = true;
        this.inputBuffer.add('lp');
        break;
      case 'KeyX':
        this.inputState.mp = true;
        this.inputBuffer.add('mp');
        break;
      case 'KeyC':
        this.inputState.hp = true;
        this.inputBuffer.add('hp');
        break;
      case 'Comma':
        this.inputState.lk = true;
        this.inputBuffer.add('lk');
        break;
      case 'Period':
        this.inputState.mk = true;
        this.inputBuffer.add('mk');
        break;
      case 'BackSlash':
        this.inputState.hk = true;
        this.inputBuffer.add('hk');
        break;
    }
  }

  private handleKeyUp(code: string): void {
    switch (code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.inputState.left = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.inputState.right = false;
        break;
      case 'ArrowUp':
      case 'KeyW':
        this.inputState.up = false;
        break;
      case 'ArrowDown':
      case 'KeyS':
        this.inputState.down = false;
        break;
      case 'KeyZ':
        this.inputState.lp = false;
        break;
      case 'KeyX':
        this.inputState.mp = false;
        break;
      case 'KeyC':
        this.inputState.hp = false;
        break;
      case 'Comma':
        this.inputState.lk = false;
        break;
      case 'Period':
        this.inputState.mk = false;
        break;
      case 'BackSlash':
        this.inputState.hk = false;
        break;
    }
  }

  getInputState(): InputState {
    return this.inputState;
  }

  getInputBuffer(): InputBuffer {
    return this.inputBuffer;
  }

  // Get movement direction (-1, 0, 1)
  getMovementDirection(): number {
    if (this.inputState.left && !this.inputState.right) return -1;
    if (this.inputState.right && !this.inputState.left) return 1;
    return 0;
  }

  // Check if crouching
  isCrouching(): boolean {
    return this.inputState.down && !this.inputState.up;
  }

  // Check if blocking (holding back direction)
  isBlocking(fighterDirection: number): boolean {
    const holdingBack = (fighterDirection > 0 && this.inputState.left) ||
                        (fighterDirection < 0 && this.inputState.right);
    return holdingBack && (this.inputState.down || !this.inputState.up);
  }

  // Get attack input
  getAttackInput(): 'lp' | 'mp' | 'hp' | 'lk' | 'mk' | 'hk' | null {
    if (this.inputState.lp) return 'lp';
    if (this.inputState.mp) return 'mp';
    if (this.inputState.hp) return 'hp';
    if (this.inputState.lk) return 'lk';
    if (this.inputState.mk) return 'mk';
    if (this.inputState.hk) return 'hk';
    return null;
  }

  // Check for special move inputs
  checkQuarterCircleForward(direction: number): boolean {
    const seq: InputCommand[] = direction > 0
      ? ['down', 'right']
      : ['down', 'left'];
    return this.inputBuffer.hasSequence(seq);
  }

  checkDragonPunch(direction: number): boolean {
    const seq: InputCommand[] = direction > 0
      ? ['down', 'right', 'down']
      : ['down', 'left', 'down'];
    return this.inputBuffer.hasSequence(seq);
  }

  reset(): void {
    this.inputBuffer.clear();
    this.inputState = {
      left: false,
      right: false,
      up: false,
      down: false,
      lp: false,
      mp: false,
      hp: false,
      lk: false,
      mk: false,
      hk: false,
    };
  }
}
