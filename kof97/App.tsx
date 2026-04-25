import React, { useEffect, useRef } from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Phaser from 'phaser';
import { MainMenuScene } from './game/scenes/MainMenuScene';
import { FightScene } from './game/scenes/FightScene';

// Web platform - run Phaser directly
function PhaserGame() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 450,
      parent: containerRef.current,
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

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
    };
  }, []);

  return (
    <View style={styles.webContainer}>
      <div ref={containerRef} id="game-container" />
    </View>
  );
}

// Native platform - use WebView pointing to web build
function WebViewGame() {
  // In development, this would load from the metro bundler
  // In production, this would load from the bundled web assets
  const uri = Platform.OS === 'ios'
    ? 'asset-library:///placeholder/index.html'
    : 'file:///android_asset/web/index.html';

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri }}
        style={styles.webview}
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo
        domStorageEnabled
      />
    </View>
  );
}

export default function App() {
  if (Platform.OS === 'web') {
    return <PhaserGame />;
  }

  // For Android/iOS - WebView approach
  // Note: This requires the web build to be bundled with the app
  // For now, we show a placeholder message
  return (
    <View style={styles.container}>
      <View style={styles.placeholder}>
        <View style={styles.placeholderContent}>
          <Text style={styles.title}>KOF 97</Text>
          <Text style={styles.subtitle}>Exhibition</Text>
          <Text style={styles.instructions}>
            Controls:{'\n'}
            Arrow Keys / WASD - Move{'\n'}
            Z - Light Punch{'\n'}
            X - Medium Punch{'\n'}
            C - Heavy Punch{'\n'}
            , - Light Kick{'\n'}
            . - Medium Kick{'\n'}
            / - Heavy Kick
          </Text>
          <Text style={styles.note}>
            Run 'npm run web' to play in browser
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  webview: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  placeholderContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ff0',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    color: '#fff',
    marginBottom: 30,
  },
  instructions: {
    fontSize: 14,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  note: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

// Import for text
import { Text } from 'react-native';
