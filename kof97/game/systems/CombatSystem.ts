import { Fighter } from '../entities/Fighter';

export class CombatSystem {
  private hitCooldown: number = 0;

  constructor() {}

  /**
   * Check collision between attacker's hitboxes and defender
   */
  public checkCollision(attacker: Fighter, defender: Fighter): void {
    if (this.hitCooldown > 0) {
      this.hitCooldown--;
      return;
    }

    const hitboxes = attacker.getHitboxes();
    if (hitboxes.length === 0) return;

    for (const hitbox of hitboxes) {
      if (!hitbox.isActive) continue;

      // Get defender's hurtbox (approximated as their body)
      const hurtbox = {
        x: defender.x - 20,
        y: defender.y - 80,
        width: 40,
        height: 80,
      };

      // AABB collision check
      if (
        hitbox.x < hurtbox.x + hurtbox.width &&
        hitbox.x + hitbox.width > hurtbox.x &&
        hitbox.y < hurtbox.y + hurtbox.height &&
        hitbox.y + hitbox.height > hurtbox.y
      ) {
        // Hit connected
        this.applyHit(attacker, defender, hitbox);
        hitbox.isActive = false; // Prevent multiple hits from same hitbox
        break;
      }
    }
  }

  private applyHit(
    attacker: Fighter,
    defender: Fighter,
    hitbox: { damage: number; hitStun: number; blockStun: number; knockdown: boolean }
  ): void {
    const attackerDirection = attacker.direction;

    defender.takeHit(
      hitbox.damage,
      hitbox.hitStun,
      hitbox.knockdown,
      attackerDirection
    );

    // Create hit effect (simple flash)
    this.createHitEffect(attacker.scene, defender.x, defender.y - 40);
  }

  private createHitEffect(scene: Phaser.Scene, x: number, y: number): void {
    // Create hit spark
    const spark = scene.add.circle(x, y, 20, 0xffff00, 1);
    scene.tweens.add({
      targets: spark,
      scale: 1.5,
      alpha: 0,
      duration: 200,
      onComplete: () => spark.destroy(),
    });

    // Add more particles
    for (let i = 0; i < 5; i++) {
      const particle = scene.add.circle(
        x,
        y,
        Phaser.Math.Between(3, 8),
        0xffffff,
        1
      );

      const angle = (Math.PI * 2 / 5) * i;
      const velocity = 100;

      scene.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * 50,
        y: y + Math.sin(angle) * 50,
        alpha: 0,
        scale: 0,
        duration: 300,
        onComplete: () => particle.destroy(),
      });
    }

    // Screen shake
    scene.cameras.main.shake(100, 0.01);

    // Hit sound (placeholder - would play actual sound file)
    // scene.sound.play('hit');
  }

  public update(attacker: Fighter, defender: Fighter): void {
    this.checkCollision(attacker, defender);
  }

  public reset(): void {
    this.hitCooldown = 0;
  }
}
