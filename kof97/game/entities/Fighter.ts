import Phaser from 'phaser';
import { FighterState, StateMachine } from '../systems/StateMachine';
import { CharacterConfig, MoveConfig } from '../config/characters';

export enum Direction {
  LEFT = -1,
  RIGHT = 1,
}

export interface HitboxData {
  x: number;
  y: number;
  width: number;
  height: number;
  damage: number;
  hitStun: number;
  blockStun: number;
  knockdown: boolean;
  isActive: boolean;
}

export class Fighter extends Phaser.Physics.Arcade.Sprite {
  public config: CharacterConfig;
  public stateMachine: StateMachine;
  public health: number;
  public maxHealth: number;
  public direction: Direction;
  public opponent: Fighter | null = null;

  // Combat state
  private currentMove: MoveConfig | null = null;
  private moveFrameIndex: number = 0;
  private hitboxes: HitboxData[] = [];
  private isBlocking: boolean = false;
  private comboCount: number = 0;
  private lastHitTime: number = 0;

  // Physics state
  private isGrounded: boolean = true;
  private groundY: number = 0;

  // Visual elements
  private hitboxGraphics: Phaser.GameObjects.Graphics | null = null;
  private comboText: Phaser.GameObjects.Text | null = null;
  private damageFlash: number = 0;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    config: CharacterConfig,
    direction: Direction
  ) {
    super(scene, x, y, 'fighter_placeholder');

    this.config = config;
    this.health = config.maxHealth;
    this.maxHealth = config.maxHealth;
    this.direction = direction;
    this.groundY = y;

    this.stateMachine = new StateMachine(FighterState.IDLE);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(false);
    this.setBounce(0);
    this.setDragX(0);
    this.setGravityY(800);

    // Create placeholder texture if not exists
    this.createPlaceholderTexture(scene);

    // Set initial size and offset
    this.setDisplaySize(60, 120);
    this.setOrigin(0.5, 1);
  }

  private createPlaceholderTexture(scene: Phaser.Scene): void {
    const graphics = scene.make.graphics({ x: 0, y: 0 });

    // Body
    graphics.fillStyle(this.config.id === 'kyo' ? 0xff0000 : 0x0000ff, 1);
    graphics.fillRect(0, 0, 60, 100);

    // Head
    graphics.fillStyle(0xffcc99, 1);
    graphics.fillRect(15, -30, 30, 30);

    graphics.generateTexture('fighter_placeholder', 60, 130);
    graphics.destroy();
  }

  public setOpponent(opponent: Fighter): void {
    this.opponent = opponent;
  }

  public enableHitboxes(): void {
    if (!this.hitboxGraphics) {
      this.hitboxGraphics = this.scene.add.graphics();
      this.hitboxGraphics.setDepth(100);
    }
  }

  public disableHitboxes(): void {
    if (this.hitboxGraphics) {
      this.hitboxGraphics.clear();
    }
  }

  public updateHitboxes(): void {
    if (!this.hitboxGraphics || !this.currentMove) return;

    this.hitboxGraphics.clear();

    const frameProgress = this.moveFrameIndex / this.currentMove.startup;

    if (frameProgress >= 1 && frameProgress < 1 + this.currentMove.active / this.currentMove.startup) {
      // Active frames - draw hitbox
      this.hitboxGraphics.fillStyle(0xff0000, 0.5);

      const hitboxX = this.direction === Direction.RIGHT
        ? this.x + 30
        : this.x - 60;

      this.hitboxGraphics.fillRect(hitboxX, this.y - 60, 30, 40);

      // Store hitbox data for collision
      this.hitboxes = [{
        x: hitboxX,
        y: this.y - 60,
        width: 30,
        height: 40,
        damage: this.currentMove.damage,
        hitStun: this.currentMove.hitStun,
        blockStun: this.currentMove.blockStun,
        knockdown: this.currentMove.knockdown,
        isActive: true,
      }];
    }
  }

  public getHitboxes(): HitboxData[] {
    return this.hitboxes.filter(h => h.isActive);
  }

  public clearHitboxes(): void {
    this.hitboxes = [];
    if (this.hitboxGraphics) {
      this.hitboxGraphics.clear();
    }
  }

  public startMove(move: MoveConfig): boolean {
    if (this.stateMachine.isAttacking()) return false;

    this.currentMove = move;
    this.moveFrameIndex = 0;

    // Set attack state based on move
    let attackState: FighterState;
    if (move === this.config.moves.super) {
      attackState = FighterState.SUPER;
    } else if (move === this.config.moves.special1 || move === this.config.moves.special2) {
      attackState = FighterState.SUPER; // Use super state for specials
    } else if (move.damage <= 3) {
      attackState = move.name.includes('Punch') ? FighterState.ATTACK_LIGHT_PUNCH : FighterState.ATTACK_LIGHT_KICK;
    } else if (move.damage <= 7) {
      attackState = move.name.includes('Punch') ? FighterState.ATTACK_MEDIUM_PUNCH : FighterState.ATTACK_MEDIUM_KICK;
    } else {
      attackState = move.name.includes('Punch') ? FighterState.ATTACK_HEAVY_PUNCH : FighterState.ATTACK_HEAVY_KICK;
    }

    this.stateMachine.transition(attackState);
    return true;
  }

  public updateMove(): void {
    if (!this.currentMove) return;

    this.moveFrameIndex++;

    const totalFrames = this.currentMove.startup + this.currentMove.active + this.currentMove.recovery;

    if (this.moveFrameIndex >= totalFrames) {
      // Move complete
      this.currentMove = null;
      this.moveFrameIndex = 0;
      this.clearHitboxes();

      if (this.isGrounded) {
        this.stateMachine.transition(FighterState.IDLE);
      }
    }

    this.updateHitboxes();
  }

  public takeHit(damage: number, hitStun: number, knockdown: boolean, attackerDirection: Direction): void {
    // Check if blocking
    if (this.isBlocking && this.direction !== attackerDirection) {
      // Blocked - reduced damage and block stun
      this.damageFlash = 5;
      this.scene.time.delayedCall(100, () => {
        if (this.stateMachine.getState() === FighterState.BLOCK) {
          this.stateMachine.transition(FighterState.IDLE);
        }
      });
      return;
    }

    this.health = Math.max(0, this.health - damage);
    this.damageFlash = 10;

    // Combo tracking
    const now = Date.now();
    if (now - this.lastHitTime < 2000) {
      this.comboCount++;
      this.showComboText();
    } else {
      this.comboCount = 1;
    }
    this.lastHitTime = now;

    // Apply knockdown or hit stun
    if (knockdown) {
      this.stateMachine.transition(FighterState.KNOCKDOWN, true);
      this.setVelocityX(5 * attackerDirection);
      this.setVelocityY(-200);
    } else {
      this.stateMachine.transition(FighterState.HIT, true);
      this.setVelocityX(100 * attackerDirection);
    }

    // Reset blocking
    this.isBlocking = false;
  }

  private showComboText(): void {
    if (this.comboCount < 2) return;

    if (this.comboText) {
      this.comboText.destroy();
    }

    this.comboText = this.scene.add.text(
      this.x,
      this.y - 100,
      `${this.comboCount} HITS!`,
      {
        fontSize: '24px',
        color: '#ff0',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 4,
      }
    ).setOrigin(0.5);

    this.scene.tweens.add({
      targets: this.comboText,
      y: this.y - 150,
      alpha: 0,
      duration: 1000,
      onComplete: () => this.comboText?.destroy(),
    });
  }

  public update(delta: number): void {
    // Update move animation
    if (this.currentMove) {
      this.updateMove();
    }

    // Check if grounded
    this.isGrounded = this.y >= this.groundY;

    if (this.isGrounded && this.body?.velocity?.y !== undefined && this.body.velocity.y >= 0) {
      this.y = this.groundY;
      this.setVelocityY(0);

      // Get up from knockdown
      if (this.stateMachine.getState() === FighterState.KNOCKDOWN) {
        this.stateMachine.transition(FighterState.IDLE);
      }
    }

    // Update damage flash
    if (this.damageFlash > 0) {
      this.damageFlash--;
      this.alpha = this.damageFlash % 2 === 0 ? 0.5 : 1;
    } else {
      this.alpha = 1;
    }

    // Facing opponent
    if (this.opponent && !this.stateMachine.isAttacking()) {
      this.direction = this.opponent.x > this.x ? Direction.RIGHT : Direction.LEFT;
      this.flipX = this.direction === Direction.LEFT;
    }
  }

  public move(direction: number): void {
    if (this.stateMachine.isAttacking() || this.stateMachine.getState() === FighterState.KNOCKDOWN) {
      return;
    }

    const speed = this.config.walkSpeed;

    if (direction > 0) {
      this.setVelocityX(speed);
      this.stateMachine.transition(
        direction === this.direction ? FighterState.WALK_FORWARD : FighterState.WALK_BACK
      );
    } else if (direction < 0) {
      this.setVelocityX(-speed);
      this.stateMachine.transition(
        -direction === this.direction ? FighterState.WALK_FORWARD : FighterState.WALK_BACK
      );
    } else {
      this.setVelocityX(0);
      if (this.stateMachine.isGrounded() && !this.stateMachine.isAttacking()) {
        this.stateMachine.transition(FighterState.IDLE);
      }
    }
  }

  public crouch(isCrouching: boolean): void {
    if (this.stateMachine.isAttacking() || !this.stateMachine.isGrounded()) return;

    if (isCrouching) {
      this.stateMachine.transition(FighterState.CROUCH);
      this.setVelocityX(0);
    } else if (this.stateMachine.getState() === FighterState.CROUCH) {
      this.stateMachine.transition(FighterState.IDLE);
    }
  }

  public jump(): void {
    if (!this.stateMachine.isGrounded() || this.stateMachine.isAttacking()) return;

    this.setVelocityY(this.config.jumpForce);
    this.stateMachine.transition(FighterState.JUMP);
  }

  public jumpDirection(direction: number): void {
    if (!this.stateMachine.isGrounded() || this.stateMachine.isAttacking()) return;

    this.setVelocityY(this.config.jumpForce);
    this.setVelocityX(direction * 3);

    if (direction > 0) {
      this.stateMachine.transition(FighterState.JUMP_FORWARD);
    } else if (direction < 0) {
      this.stateMachine.transition(FighterState.JUMP_BACK);
    }
  }

  public setBlock(isBlocking: boolean): void {
    if (this.stateMachine.isAttacking() || !this.stateMachine.isGrounded()) {
      this.isBlocking = false;
      return;
    }

    this.isBlocking = isBlocking;
    if (isBlocking) {
      this.stateMachine.transition(FighterState.BLOCK);
      this.setVelocityX(0);
    } else if (this.stateMachine.getState() === FighterState.BLOCK) {
      this.stateMachine.transition(FighterState.IDLE);
    }
  }

  public isCurrentFrameHitboxActive(): boolean {
    return this.hitboxes.some(h => h.isActive);
  }

  public reset(): void {
    this.health = this.maxHealth;
    this.stateMachine = new StateMachine(FighterState.IDLE);
    this.currentMove = null;
    this.moveFrameIndex = 0;
    this.clearHitboxes();
    this.isBlocking = false;
    this.comboCount = 0;
    this.y = this.groundY;
    this.setVelocity(0, 0);
  }
}
