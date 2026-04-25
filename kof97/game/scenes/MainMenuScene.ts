import Phaser from 'phaser';

export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainMenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Title
    this.add.text(width / 2, height * 0.2, 'KOF 97', {
      fontSize: '96px',
      color: '#ff0',
      fontStyle: 'bold',
      stroke: '#f00',
      strokeThickness: 12,
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.28, 'EXHIBITION', {
      fontSize: '32px',
      color: '#fff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    // Menu options
    const startY = height * 0.45;
    const spacing = 70;

    const options = [
      { text: 'VS CPU', scene: 'FightScene' },
      { text: 'VS PLAYER', scene: 'FightScene' },
      { text: 'TRAINING', scene: 'FightScene' },
      { text: 'EXIT', action: () => this.handleExit() },
    ];

    options.forEach((option, index) => {
      const y = startY + index * spacing;
      const btnText = this.add.text(width / 2, y, option.text, {
        fontSize: '36px',
        color: '#fff',
        fontStyle: 'bold',
        stroke: '#000',
        strokeThickness: 6,
      }).setOrigin(0.5);

      // Make interactive
      const hitArea = new Phaser.Geom.Rectangle(
        -btnText.width / 2 - 20,
        -btnText.height / 2 - 10,
        btnText.width + 40,
        btnText.height + 20
      );

      const container = this.add.container(width / 2, y, [btnText]);
      container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

      container.on('pointerover', () => {
        btnText.setColor('#ff0');
        btnText.setScale(1.1);
      });

      container.on('pointerout', () => {
        btnText.setColor('#fff');
        btnText.setScale(1);
      });

      container.on('pointerdown', () => {
        if (option.scene) {
          this.scene.start(option.scene);
        } else if (option.action) {
          option.action();
        }
      });
    });

    // Instructions
    this.add.text(width / 2, height - 50, 'Keyboard: Arrows/WASD to move, Z/X/C for punches, ,/.// for kicks', {
      fontSize: '16px',
      color: '#888',
    }).setOrigin(0.5);
  }

  private handleExit(): void {
    // For mobile, this would exit the app
    // For web, show exit message
    const exitText = this.add.text(this.scale.width / 2, this.scale.height / 2, 'Thanks for playing!', {
      fontSize: '48px',
      color: '#fff',
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.time.delayedCall(2000, () => {
      exitText.destroy();
    });
  }
}
