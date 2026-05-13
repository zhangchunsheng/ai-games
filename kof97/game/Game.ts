import Phaser from 'phaser';
import { MainMenuScene } from './scenes/MainMenuScene';
import { FightScene } from './scenes/FightScene';

const createGame = (parent: string): Phaser.Game => {
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 450,
    parent: parent,
    backgroundColor: '#1a1a2e',
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 800,
      height: 450,
    },
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 800 },
        debug: false,
      },
    },
    scene: [MainMenuScene, FightScene],
    render: {
      pixelArt: false,
      antialias: true,
    },
    input: {
      activePointers: 10,
    },
  };

  return new Phaser.Game(config);
};

export { createGame };
export { MainMenuScene, FightScene };
