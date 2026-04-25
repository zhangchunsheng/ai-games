import Phaser from 'phaser';
import { Fighter, Direction } from '../entities/Fighter';
import { InputSystem } from '../systems/InputSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { KYO_CONFIG, TERRY_CONFIG } from '../config/characters';

export class FightScene extends Phaser.Scene {
  private player1: Fighter | null = null;
  private player2: Fighter | null = null;
  private inputSystem: InputSystem | null = null;
  private combatSystem: CombatSystem | null = null;

  // UI elements
  private p1HealthBar: Phaser.GameObjects.Graphics | null = null;
  private p2HealthBar: Phaser.GameObjects.Graphics | null = null;
  private p1Name: Phaser.GameObjects.Text | null = null;
  private p2Name: Phaser.GameObjects.Text | null = null;
  private timerText: Phaser.GameObjects.Text | null = null;
  private roundTimer: number = 99;
  private timerEvent: Phaser.Time.TimerEvent | null = null;

  // Game state
  private isGameOver: boolean = false;
  private groundY: number = 0;

  constructor() {
    super({ key: 'FightScene' });
  }

  preload(): void {
    // Loading text
    const loadingText = this.add.text(400, 300, 'Loading...', {
      fontSize: '32px',
      color: '#fff',
    }).setOrigin(0.5);

    this.load.on('complete', () => loadingText.destroy());
  }

  create(): void {
    const { width, height } = this.scale;
    this.groundY = height - 150;

    // Create background
    this.createBackground();

    // Create ground
    const ground = this.add.rectangle(
      width / 2,
      height - 25,
      width,
      50,
      0x333333
    );

    // Initialize systems
    this.inputSystem = new InputSystem(this);
    this.combatSystem = new CombatSystem();

    // Create fighters
    this.player1 = new Fighter(this, 200, this.groundY, KYO_CONFIG, Direction.RIGHT);
    this.player2 = new Fighter(this, width - 200, this.groundY, TERRY_CONFIG, Direction.LEFT);

    this.player1.setOpponent(this.player2);
    this.player2.setOpponent(this.player1);

    // Enable hitbox debugging
    this.player1.enableHitboxes();
    this.player2.enableHitboxes();

    // Create UI
    this.createUI();

    // Camera follow
    this.cameras.main.startFollow(
      this.player1,
      true,
      0.1,
      0.1,
      0,
      height * 0.3
    );
    this.cameras.main.setZoom(1);

    // Pause on blur (mobile) - disabled for now due to API changes
    // this.sys.game.onPause = () => this.scene.pause();
    // this.sys.game.onResume = () => this.scene.resume();
  }

  private createBackground(): void {
    const { width, height } = this.scale;

    // Sky gradient
    const sky = this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e);

    // Buildings silhouette (simplified)
    const buildings = this.add.graphics();
    buildings.fillStyle(0x0f0f23, 1);

    let x = 0;
    while (x < width) {
      const buildingWidth = Phaser.Math.Between(30, 80);
      const buildingHeight = Phaser.Math.Between(50, 150);
      buildings.fillRect(x, height - 150 - buildingHeight, buildingWidth + 2, buildingHeight);
      x += buildingWidth;
    }

    // Add some windows
    const windows = this.add.graphics();
    windows.fillStyle(0xffff00, 0.3);
    for (let i = 0; i < 20; i++) {
      const wx = Phaser.Math.Between(0, width);
      const wy = Phaser.Math.Between(height - 280, height - 100);
      windows.fillRect(wx, wy, 8, 12);
    }
  }

  private createUI(): void {
    const { width, height } = this.scale;

    // Player 1 health bar background
    this.p1HealthBar = this.add.graphics();
    this.p1HealthBar.fillStyle(0x330000, 1);
    this.p1HealthBar.fillRect(20, 20, 300, 30);

    // Player 2 health bar background
    this.p2HealthBar = this.add.graphics();
    this.p2HealthBar.fillStyle(0x330000, 1);
    this.p2HealthBar.fillRect(width - 320, 20, 300, 30);

    // Names
    this.p1Name = this.add.text(20, 55, 'P1: KYO', {
      fontSize: '18px',
      color: '#fff',
      fontStyle: 'bold',
    });

    this.p2Name = this.add.text(width - 320, 55, 'P2: TERRY', {
      fontSize: '18px',
      color: '#fff',
      fontStyle: 'bold',
    });

    // Timer
    this.timerText = this.add.text(width / 2, 35, '99', {
      fontSize: '48px',
      color: '#ff0',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Start timer
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.onTimerTick,
      callbackScope: this,
      loop: true,
    });

    // Round start text
    const roundText = this.add.text(width / 2, height / 2, 'ROUND 1\nFIGHT!', {
      fontSize: '64px',
      color: '#ff0',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 8,
      align: 'center',
    }).setOrigin(0.5);

    this.tweens.add({
      targets: roundText,
      alpha: 0,
      scale: 1.5,
      duration: 2000,
      delay: 1000,
      onComplete: () => roundText.destroy(),
    });
  }

  private onTimerTick(): void {
    if (this.isGameOver) return;

    this.roundTimer--;
    this.timerText?.setText(this.roundTimer.toString());

    if (this.roundTimer <= 0) {
      this.endGame();
    }
  }

  private updateHealthBars(): void {
    if (!this.player1 || !this.player2) return;

    const p1Percent = this.player1.health / this.player1.maxHealth;
    const p2Percent = this.player2.health / this.player2.maxHealth;

    // P1 health (left to right)
    this.p1HealthBar?.clear();
    this.p1HealthBar?.fillStyle(0x330000, 1);
    this.p1HealthBar?.fillRect(20, 20, 300, 30);
    this.p1HealthBar?.fillStyle(p1Percent > 0.5 ? 0x00ff00 : p1Percent > 0.25 ? 0xffff00 : 0xff0000, 1);
    this.p1HealthBar?.fillRect(22, 22, 296 * p1Percent, 26);

    // P2 health (right to left)
    this.p2HealthBar?.clear();
    this.p2HealthBar?.fillStyle(0x330000, 1);
    this.p2HealthBar?.fillRect(this.scale.width - 320, 20, 300, 30);
    this.p2HealthBar?.fillStyle(p2Percent > 0.5 ? 0x00ff00 : p2Percent > 0.25 ? 0xffff00 : 0xff0000, 1);
    this.p2HealthBar?.fillRect(this.scale.width - 318, 22, 296 * p2Percent, 26);
  }

  update(time: number, delta: number): void {
    if (this.isGameOver || !this.player1 || !this.player2 || !this.inputSystem) return;

    const inputState = this.inputSystem.getInputState();

    // Player 1 controls
    const moveDir = this.inputSystem.getMovementDirection();
    this.player1.move(moveDir);

    this.player1.crouch(this.inputSystem.isCrouching());

    if (inputState.up && !inputState.left && !inputState.right) {
      this.player1.jump();
    } else if (inputState.up && moveDir !== 0) {
      this.player1.jumpDirection(moveDir);
    }

    this.player1.setBlock(this.inputSystem.isBlocking(this.player1.direction));

    // Attack input
    const attack = this.inputSystem.getAttackInput();
    if (attack) {
      const move = this.getPlayerMove(this.player1, attack);
      if (move) {
        this.player1.startMove(move);
      }
    }

    // Player 2 AI (simple)
    this.updateAI();

    // Update fighters
    this.player1.update(delta);
    this.player2.update(delta);

    // Combat system
    if (this.combatSystem) {
      this.combatSystem.update(this.player1, this.player2);
      this.combatSystem.update(this.player2, this.player1);
    }

    // Update UI
    this.updateHealthBars();

    // Check for KO
    if (this.player1.health <= 0 || this.player2.health <= 0) {
      this.endGame();
    }
  }

  private getPlayerMove(
    fighter: Fighter,
    attack: 'lp' | 'mp' | 'hp' | 'lk' | 'mk' | 'hk'
  ) {
    switch (attack) {
      case 'lp': return fighter.config.moves.lightPunch;
      case 'mp': return fighter.config.moves.mediumPunch;
      case 'hp': return fighter.config.moves.heavyPunch;
      case 'lk': return fighter.config.moves.lightKick;
      case 'mk': return fighter.config.moves.mediumKick;
      case 'hk': return fighter.config.moves.heavyKick;
      default: return null;
    }
  }

  private updateAI(): void {
    if (!this.player2 || !this.player1) return;

    const ai = this.player2;
    const player = this.player1;
    const distance = Math.abs(ai.x - player.x);

    // Simple AI behavior
    const aiDirection = player.x > ai.x ? 1 : -1;
    ai.direction = aiDirection as Direction;

    // Attack if close
    if (distance < 80 && !ai.stateMachine.isAttacking()) {
      const rand = Math.random();
      if (rand < 0.3) {
        ai.startMove(ai.config.moves.lightPunch);
      } else if (rand < 0.5) {
        ai.startMove(ai.config.moves.lightKick);
      } else if (rand < 0.7) {
        ai.startMove(ai.config.moves.mediumPunch);
      } else {
        ai.startMove(ai.config.moves.heavyKick);
      }
    }
    // Move toward player
    else if (distance > 60) {
      ai.move(aiDirection);
    }
    // Block sometimes
    else if (player.stateMachine.isAttacking() && Math.random() < 0.3) {
      ai.setBlock(true);
    } else {
      ai.setBlock(false);
    }

    // Random jump
    if (ai.stateMachine.isGrounded() && Math.random() < 0.01) {
      ai.jump();
    }
  }

  private endGame(): void {
    if (this.isGameOver) return;
    this.isGameOver = true;

    this.timerEvent?.remove();

    let winner = '';
    if (this.player1 && this.player1.health > 0) {
      winner = 'P1 WINS!';
    } else if (this.player2 && this.player2.health > 0) {
      winner = 'P2 WINS!';
    } else {
      winner = 'DOUBLE KO!';
    }

    const endText = this.add.text(
      this.scale.width / 2,
      this.scale.height / 2,
      winner,
      {
        fontSize: '64px',
        color: '#ff0',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 8,
      }
    ).setOrigin(0.5);

    this.time.delayedCall(3000, () => {
      endText.destroy();
      this.scene.restart();
    });
  }
}
