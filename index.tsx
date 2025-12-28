
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Retro Godzilla Platformer - Multi-Level Edition
 * Enhanced with 5 Barrel Types, Power-Ups, Detailed Player Animations, 
 * Advanced Sound Synthesis, Health Bar, 15 Progressive Levels, Parachute, 
 * Pause Menu, and a Dynamic Godzilla Boss with Heavy Waddle and Fire-Breathing Attacks!
 */

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const GRAVITY = 0.5;
const PLAYER_SPEED = 4;
const JUMP_STRENGTH = -9;
const BARREL_SPEED = 3;
const SPAWN_RATE = 90;
const MAX_HEALTH = 100;

enum BarrelType {
  NORMAL = 'NORMAL',
  FAST = 'FAST',
  BOUNCY = 'BOUNCY',
  EXPLODING = 'EXPLODING',
  GHOST = 'GHOST'
}

enum PowerUpType {
  SPEED = 'SPEED',
  SHIELD = 'SHIELD'
}

interface Platform {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface Ladder {
  x: number;
  y: number;
  height: number;
}

interface PowerUp {
  x: number;
  y: number;
  type: PowerUpType;
  collected: boolean;
  pulse: number;
}

interface LevelData {
  name: string;
  color: string;
  platforms: Platform[];
  ladders: Ladder[];
  goal: { x: number; y: number };
  kong: { x: number; y: number }; 
  powerUps: { x: number; y: number, type: PowerUpType }[];
}

const LEVELS: LevelData[] = [
  {
    name: "LEVEL 1: THE GIRDERS",
    color: '#e91e63',
    platforms: [
      { x1: 0, y1: 580, x2: 800, y2: 580 },
      { x1: 0, y1: 500, x2: 700, y2: 480 },
      { x1: 100, y1: 380, x2: 800, y2: 400 },
      { x1: 0, y1: 300, x2: 700, y2: 280 },
      { x1: 100, y1: 180, x2: 800, y2: 200 },
      { x1: 0, y1: 100, x2: 400, y2: 100 },
    ],
    ladders: [
      { x: 650, y: 490, height: 90 },
      { x: 150, y: 390, height: 110 },
      { x: 650, y: 290, height: 110 },
      { x: 150, y: 190, height: 110 },
      { x: 350, y: 100, height: 100 },
    ],
    goal: { x: 40, y: 45 },
    kong: { x: 300, y: 40 },
    powerUps: [
      { x: 400, y: 360, type: PowerUpType.SPEED },
      { x: 100, y: 160, type: PowerUpType.SHIELD }
    ]
  },
  {
    name: "LEVEL 2: THE FACTORY",
    color: '#4caf50',
    platforms: [
      { x1: 0, y1: 580, x2: 800, y2: 580 },
      { x1: 50, y1: 480, x2: 350, y2: 480 },
      { x1: 450, y1: 480, x2: 750, y2: 480 },
      { x1: 0, y1: 380, x2: 800, y2: 380 },
      { x1: 100, y1: 280, x2: 400, y2: 280 },
      { x1: 500, y1: 280, x2: 800, y2: 280 },
      { x1: 0, y1: 180, x2: 700, y2: 180 },
      { x1: 100, y1: 80, x2: 400, y2: 80 },
    ],
    ladders: [
      { x: 200, y: 480, height: 100 },
      { x: 600, y: 480, height: 100 },
      { x: 400, y: 380, height: 100 },
      { x: 250, y: 280, height: 100 },
      { x: 650, y: 280, height: 100 },
      { x: 350, y: 180, height: 100 },
      { x: 150, y: 80, height: 100 },
    ],
    goal: { x: 350, y: 25 },
    kong: { x: 120, y: 20 },
    powerUps: [
      { x: 600, y: 360, type: PowerUpType.SPEED },
      { x: 700, y: 160, type: PowerUpType.SHIELD }
    ]
  },
  {
    name: "LEVEL 3: THE SPIRE",
    color: '#ff9800',
    platforms: [
      { x1: 0, y1: 580, x2: 800, y2: 580 },
      { x1: 100, y1: 500, x2: 400, y2: 520 },
      { x1: 400, y1: 520, x2: 700, y2: 500 },
      { x1: 200, y1: 420, x2: 600, y2: 420 },
      { x1: 50, y1: 320, x2: 350, y2: 340 },
      { x1: 450, y1: 340, x2: 750, y2: 320 },
      { x1: 150, y1: 220, x2: 650, y2: 220 },
      { x1: 400, y1: 120, x2: 700, y2: 120 },
      { x1: 100, y1: 60, x2: 300, y2: 60 },
    ],
    ladders: [
      { x: 400, y: 520, height: 60 },
      { x: 250, y: 420, height: 90 },
      { x: 550, y: 420, height: 90 },
      { x: 200, y: 330, height: 90 },
      { x: 600, y: 330, height: 90 },
      { x: 400, y: 220, height: 110 },
      { x: 200, y: 60, height: 160 },
      { x: 600, y: 120, height: 100 },
    ],
    goal: { x: 120, y: 10 },
    kong: { x: 500, y: 50 },
    powerUps: [
      { x: 400, y: 400, type: PowerUpType.SPEED },
      { x: 150, y: 200, type: PowerUpType.SHIELD }
    ]
  },
  {
    name: "LEVEL 4: THE VOID",
    color: '#2196f3',
    platforms: [
      { x1: 0, y1: 580, x2: 800, y2: 580 },
      { x1: 100, y1: 480, x2: 300, y2: 480 },
      { x1: 500, y1: 480, x2: 700, y2: 480 },
      { x1: 300, y1: 380, x2: 500, y2: 380 },
      { x1: 50, y1: 280, x2: 250, y2: 280 },
      { x1: 550, y1: 280, x2: 750, y2: 280 },
      { x1: 200, y1: 180, x2: 600, y2: 180 },
      { x1: 0, y1: 80, x2: 250, y2: 80 },
    ],
    ladders: [
      { x: 150, y: 480, height: 100 },
      { x: 650, y: 480, height: 100 },
      { x: 400, y: 380, height: 100 },
      { x: 200, y: 280, height: 100 },
      { x: 600, y: 280, height: 100 },
      { x: 400, y: 180, height: 100 },
      { x: 100, y: 80, height: 100 },
    ],
    goal: { x: 30, y: 25 },
    kong: { x: 600, y: 110 },
    powerUps: [
      { x: 400, y: 330, type: PowerUpType.SPEED },
      { x: 700, y: 240, type: PowerUpType.SHIELD }
    ]
  },
  {
    name: "LEVEL 5: THE LABYRINTH",
    color: '#9c27b0',
    platforms: [
      { x1: 0, y1: 580, x2: 800, y2: 580 },
      { x1: 0, y1: 520, x2: 200, y2: 520 },
      { x1: 300, y1: 520, x2: 500, y2: 520 },
      { x1: 600, y1: 520, x2: 800, y2: 520 },
      { x1: 100, y1: 440, x2: 700, y2: 440 },
      { x1: 0, y1: 360, x2: 300, y2: 360 },
      { x1: 500, y1: 360, x2: 800, y2: 360 },
      { x1: 100, y1: 280, x2: 700, y2: 280 },
      { x1: 0, y1: 200, x2: 300, y2: 200 },
      { x1: 500, y1: 200, x2: 800, y2: 200 },
      { x1: 200, y1: 100, x2: 600, y2: 100 },
    ],
    ladders: [
      { x: 100, y: 520, height: 60 },
      { x: 400, y: 520, height: 60 },
      { x: 700, y: 520, height: 60 },
      { x: 250, y: 440, height: 80 },
      { x: 550, y: 440, height: 80 },
      { x: 150, y: 360, height: 80 },
      { x: 650, y: 360, height: 80 },
      { x: 400, y: 280, height: 80 },
      { x: 200, y: 200, height: 80 },
      { x: 600, y: 200, height: 80 },
      { x: 400, y: 100, height: 100 },
    ],
    goal: { x: 380, y: 45 },
    kong: { x: 50, y: 130 },
    powerUps: [
      { x: 750, y: 320, type: PowerUpType.SPEED },
      { x: 50, y: 160, type: PowerUpType.SHIELD }
    ]
  },
  {
    name: "LEVEL 6: THE FINAL ASCENT",
    color: '#ffffff',
    platforms: [
      { x1: 0, y1: 580, x2: 800, y2: 580 },
      { x1: 50, y1: 510, x2: 750, y2: 510 },
      { x1: 0, y1: 440, x2: 700, y2: 440 },
      { x1: 100, y1: 370, x2: 800, y2: 370 },
      { x1: 0, y1: 300, x2: 700, y2: 300 },
      { x1: 100, y1: 230, x2: 800, y2: 230 },
      { x1: 0, y1: 160, x2: 700, y2: 160 },
      { x1: 250, y1: 80, x2: 550, y2: 80 },
    ],
    ladders: [
      { x: 400, y: 510, height: 70 },
      { x: 100, y: 440, height: 70 },
      { x: 700, y: 370, height: 70 },
      { x: 100, y: 300, height: 70 },
      { x: 700, y: 230, height: 70 },
      { x: 100, y: 160, height: 70 },
      { x: 400, y: 80, height: 80 },
    ],
    goal: { x: 385, y: 25 },
    kong: { x: 100, y: 20 },
    powerUps: [
      { x: 700, y: 470, type: PowerUpType.SPEED },
      { x: 100, y: 330, type: PowerUpType.SHIELD }
    ]
  },
  {
    name: "LEVEL 7: THE VOLCANO",
    color: '#ff4500',
    platforms: [
      { x1: 0, y1: 580, x2: 800, y2: 580 },
      { x1: 200, y1: 490, x2: 600, y2: 490 },
      { x1: 0, y1: 400, x2: 300, y2: 410 },
      { x1: 500, y1: 410, x2: 800, y2: 400 },
      { x1: 150, y1: 310, x2: 650, y2: 310 },
      { x1: 0, y1: 210, x2: 350, y2: 200 },
      { x1: 450, y1: 200, x2: 800, y2: 210 },
      { x1: 250, y1: 100, x2: 550, y2: 100 },
    ],
    ladders: [
      { x: 400, y: 490, height: 90 },
      { x: 250, y: 410, height: 80 },
      { x: 550, y: 410, height: 80 },
      { x: 100, y: 310, height: 90 },
      { x: 700, y: 310, height: 90 },
      { x: 400, y: 205, height: 105 },
      { x: 300, y: 100, height: 100 },
    ],
    goal: { x: 500, y: 35 },
    kong: { x: 600, y: 40 },
    powerUps: [
      { x: 400, y: 280, type: PowerUpType.SHIELD },
      { x: 50, y: 170, type: PowerUpType.SPEED }
    ]
  },
  {
    name: "LEVEL 8: CRYSTAL CAVE",
    color: '#00bcd4',
    platforms: [
      { x1: 0, y1: 580, x2: 800, y2: 580 },
      { x1: 50, y1: 500, x2: 750, y2: 500 },
      { x1: 0, y1: 420, x2: 700, y2: 420 },
      { x1: 100, y1: 340, x2: 800, y2: 340 },
      { x1: 0, y1: 260, x2: 700, y2: 260 },
      { x1: 100, y1: 180, x2: 800, y2: 180 },
      { x1: 0, y1: 100, x2: 500, y2: 100 },
    ],
    ladders: [
      { x: 700, y: 500, height: 80 },
      { x: 100, y: 420, height: 80 },
      { x: 700, y: 340, height: 80 },
      { x: 100, y: 260, height: 80 },
      { x: 700, y: 180, height: 80 },
      { x: 200, y: 100, height: 80 },
    ],
    goal: { x: 50, y: 45 },
    kong: { x: 350, y: 40 },
    powerUps: [
      { x: 400, y: 470, type: PowerUpType.SPEED },
      { x: 600, y: 150, type: PowerUpType.SHIELD }
    ]
  },
  {
    name: "LEVEL 9: SKY FORTRESS",
    color: '#03a9f4',
    platforms: [
      { x1: 0, y1: 580, x2: 800, y2: 580 },
      { x1: 50, y1: 490, x2: 250, y2: 490 },
      { x1: 350, y1: 490, x2: 550, y2: 490 },
      { x1: 650, y1: 490, x2: 800, y2: 490 },
      { x1: 100, y1: 400, x2: 700, y2: 400 },
      { x1: 0, y1: 310, x2: 300, y2: 310 },
      { x1: 500, y1: 310, x2: 800, y2: 310 },
      { x1: 150, y1: 220, x2: 650, y2: 220 },
      { x1: 0, y1: 130, x2: 400, y2: 130 },
    ],
    ladders: [
      { x: 150, y: 490, height: 90 },
      { x: 450, y: 490, height: 90 },
      { x: 720, y: 490, height: 90 },
      { x: 400, y: 400, height: 90 },
      { x: 150, y: 310, height: 90 },
      { x: 650, y: 310, height: 90 },
      { x: 400, y: 220, height: 90 },
      { x: 200, y: 130, height: 90 },
    ],
    goal: { x: 350, y: 75 },
    kong: { x: 550, y: 160 },
    powerUps: [
      { x: 50, y: 280, type: PowerUpType.SPEED },
      { x: 750, y: 370, type: PowerUpType.SHIELD }
    ]
  },
  {
    name: "LEVEL 10: THE ARMAGEDDON",
    color: '#ff0000',
    platforms: [
      { x1: 0, y1: 580, x2: 800, y2: 580 },
      { x1: 100, y1: 510, x2: 700, y2: 510 },
      { x1: 50, y1: 440, x2: 750, y2: 440 },
      { x1: 100, y1: 370, x2: 700, y2: 370 },
      { x1: 50, y1: 300, x2: 750, y2: 300 },
      { x1: 100, y1: 230, x2: 700, y2: 230 },
      { x1: 50, y1: 160, x2: 750, y2: 160 },
      { x1: 200, y1: 90, x2: 600, y2: 90 },
    ],
    ladders: [
      { x: 150, y: 510, height: 70 },
      { x: 650, y: 510, height: 70 },
      { x: 400, y: 440, height: 70 },
      { x: 150, y: 370, height: 70 },
      { x: 650, y: 370, height: 70 },
      { x: 400, y: 300, height: 70 },
      { x: 150, y: 230, height: 70 },
      { x: 650, y: 230, height: 70 },
      { x: 400, y: 160, height: 70 },
      { x: 300, y: 90, height: 70 },
      { x: 500, y: 90, height: 70 },
    ],
    goal: { x: 385, y: 35 },
    kong: { x: 50, y: 100 },
    powerUps: [
      { x: 400, y: 200, type: PowerUpType.SPEED },
      { x: 400, y: 550, type: PowerUpType.SHIELD }
    ]
  },
  {
    name: "LEVEL 11: NEON NIGHTS",
    color: '#ff00ff',
    platforms: [
      { x1: 0, y1: 580, x2: 800, y2: 580 },
      { x1: 0, y1: 490, x2: 750, y2: 510 },
      { x1: 50, y1: 400, x2: 800, y2: 380 },
      { x1: 0, y1: 290, x2: 750, y2: 310 },
      { x1: 50, y1: 180, x2: 800, y2: 200 },
      { x1: 200, y1: 100, x2: 600, y2: 100 },
    ],
    ladders: [
      { x: 700, y: 510, height: 70 },
      { x: 100, y: 400, height: 100 },
      { x: 700, y: 310, height: 90 },
      { x: 100, y: 200, height: 90 },
      { x: 400, y: 100, height: 100 },
    ],
    goal: { x: 400, y: 45 },
    kong: { x: 100, y: 20 },
    powerUps: [
      { x: 400, y: 350, type: PowerUpType.SPEED },
      { x: 750, y: 150, type: PowerUpType.SHIELD }
    ]
  },
  {
    name: "LEVEL 12: THE DEEP",
    color: '#1a237e',
    platforms: [
      { x1: 0, y1: 580, x2: 800, y2: 580 },
      { x1: 100, y1: 500, x2: 300, y2: 500 },
      { x1: 500, y1: 500, x2: 700, y2: 500 },
      { x1: 0, y1: 400, x2: 800, y2: 400 },
      { x1: 100, y1: 300, x2: 300, y2: 300 },
      { x1: 500, y1: 300, x2: 700, y2: 300 },
      { x1: 0, y1: 200, x2: 800, y2: 200 },
      { x1: 200, y1: 100, x2: 600, y2: 100 },
    ],
    ladders: [
      { x: 200, y: 500, height: 80 },
      { x: 600, y: 500, height: 80 },
      { x: 400, y: 400, height: 100 },
      { x: 200, y: 300, height: 100 },
      { x: 600, y: 300, height: 100 },
      { x: 400, y: 200, height: 100 },
      { x: 300, y: 100, height: 100 },
    ],
    goal: { x: 500, y: 45 },
    kong: { x: 50, y: 140 },
    powerUps: [
      { x: 400, y: 340, type: PowerUpType.SPEED },
      { x: 50, y: 450, type: PowerUpType.SHIELD }
    ]
  },
  {
    name: "LEVEL 13: TOXIC WASTELAND",
    color: '#76ff03',
    platforms: [
      { x1: 0, y1: 580, x2: 800, y2: 580 },
      { x1: 100, y1: 480, x2: 400, y2: 500 },
      { x1: 400, y1: 500, x2: 700, y2: 480 },
      { x1: 0, y1: 380, x2: 300, y2: 380 },
      { x1: 500, y1: 380, x2: 800, y2: 380 },
      { x1: 150, y1: 280, x2: 650, y2: 280 },
      { x1: 0, y1: 180, x2: 350, y2: 170 },
      { x1: 450, y1: 170, x2: 800, y2: 180 },
      { x1: 300, y1: 80, x2: 500, y2: 80 },
    ],
    ladders: [
      { x: 400, y: 500, height: 80 },
      { x: 150, y: 380, height: 110 },
      { x: 650, y: 380, height: 110 },
      { x: 400, y: 280, height: 100 },
      { x: 250, y: 175, height: 105 },
      { x: 550, y: 175, height: 105 },
      { x: 400, y: 80, height: 95 },
    ],
    goal: { x: 350, y: 25 },
    kong: { x: 100, y: 20 },
    powerUps: [
      { x: 400, y: 420, type: PowerUpType.SPEED },
      { x: 750, y: 240, type: PowerUpType.SHIELD }
    ]
  },
  {
    name: "LEVEL 14: SHADOW REALM",
    color: '#424242',
    platforms: [
      { x1: 0, y1: 580, x2: 800, y2: 580 },
      { x1: 50, y1: 500, x2: 350, y2: 500 },
      { x1: 450, y1: 500, x2: 750, y2: 500 },
      { x1: 100, y1: 410, x2: 700, y2: 410 },
      { x1: 0, y1: 320, x2: 300, y2: 320 },
      { x1: 500, y1: 320, x2: 800, y2: 320 },
      { x1: 150, y1: 230, x2: 650, y2: 230 },
      { x1: 50, y1: 140, x2: 350, y2: 140 },
      { x1: 450, y1: 140, x2: 750, y2: 140 },
      { x1: 300, y1: 60, x2: 500, y2: 60 },
    ],
    ladders: [
      { x: 200, y: 500, height: 80 },
      { x: 600, y: 500, height: 80 },
      { x: 400, y: 410, height: 90 },
      { x: 150, y: 320, height: 90 },
      { x: 650, y: 320, height: 90 },
      { x: 400, y: 230, height: 90 },
      { x: 250, y: 140, height: 90 },
      { x: 550, y: 140, height: 90 },
      { x: 400, y: 60, height: 80 },
    ],
    goal: { x: 385, y: 15 },
    kong: { x: 50, y: 60 },
    powerUps: [
      { x: 400, y: 360, type: PowerUpType.SPEED },
      { x: 50, y: 200, type: PowerUpType.SHIELD }
    ]
  },
  {
    name: "LEVEL 15: THE CORE",
    color: '#ffd700',
    platforms: [
      { x1: 0, y1: 580, x2: 800, y2: 580 },
      { x1: 50, y1: 510, x2: 750, y2: 510 },
      { x1: 0, y1: 440, x2: 700, y2: 440 },
      { x1: 100, y1: 370, x2: 800, y2: 370 },
      { x1: 0, y1: 300, x2: 700, y2: 300 },
      { x1: 100, y1: 230, x2: 800, y2: 230 },
      { x1: 0, y1: 160, x2: 700, y2: 160 },
      { x1: 200, y1: 80, x2: 600, y2: 80 },
    ],
    ladders: [
      { x: 400, y: 510, height: 70 },
      { x: 100, y: 440, height: 70 },
      { x: 700, y: 370, height: 70 },
      { x: 100, y: 300, height: 70 },
      { x: 700, y: 230, height: 70 },
      { x: 100, y: 160, height: 70 },
      { x: 400, y: 80, height: 80 },
      { x: 600, y: 510, height: 70 },
      { x: 200, y: 440, height: 70 },
      { x: 400, y: 370, height: 70 },
    ],
    goal: { x: 385, y: 25 },
    kong: { x: 60, y: 100 },
    powerUps: [
      { x: 700, y: 470, type: PowerUpType.SPEED },
      { x: 100, y: 330, type: PowerUpType.SHIELD }
    ]
  }
];

// Sound Utility
let audioCtx: AudioContext | null = null;
let isMutedGlobal = false;

const initAudio = () => {
  if (!audioCtx) audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();
};

const playSound = (type: 'jump' | 'powerup' | 'impact' | 'gameover' | 'victory' | 'hurt' | 'levelclear' | 'throw' | 'step' | 'land' | 'roar' | 'fireball') => {
  if (isMutedGlobal) return;
  initAudio();
  if (!audioCtx) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const now = audioCtx.currentTime;

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  switch (type) {
    case 'jump':
      osc.type = 'square';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
      break;
    case 'roar':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + 0.5);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    case 'fireball':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    case 'step':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.05);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
    case 'land':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(60, now);
      osc.frequency.linearRampToValueAtTime(20, now + 0.1);
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
      break;
    case 'throw':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.2);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
    case 'powerup':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      osc.frequency.setValueAtTime(1046.5, now + 0.24);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc.start(now);
      osc.stop(now + 0.5);
      break;
    case 'levelclear':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.setValueAtTime(554, now + 0.1);
      osc.frequency.setValueAtTime(659, now + 0.2);
      osc.frequency.setValueAtTime(880, now + 0.3);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc.start(now);
      osc.stop(now + 0.6);
      break;
    case 'impact':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.linearRampToValueAtTime(20, now + 0.3);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
      break;
    case 'hurt':
      osc.type = 'square';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.linearRampToValueAtTime(40, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.15);
      osc.start(now);
      osc.stop(now + 0.15);
      break;
    case 'gameover':
      osc.type = 'square';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 1.5);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 1.5);
      osc.start(now);
      osc.stop(now + 1.5);
      break;
    case 'victory':
      osc.type = 'sine';
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568.0, 2093.0];
      notes.forEach((freq, i) => {
        osc.frequency.setValueAtTime(freq, now + i * 0.12);
      });
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      osc.start(now);
      osc.stop(now + 1.5);
      break;
  }
};

class Barrel {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number = 12;
  onPlatform: boolean = false;
  type: BarrelType;
  timer: number = 0;
  isExploding: boolean = false;
  explosionRadius: number = 0;
  maxExplosionRadius: number = 60;

  constructor(x: number, y: number, type: BarrelType) {
    this.x = x;
    this.y = y;
    this.type = type;
    const baseSpeed = type === BarrelType.FAST ? BARREL_SPEED * 1.8 : BARREL_SPEED;
    this.vx = (Math.random() > 0.5 ? 1 : -1) * baseSpeed;
    this.vy = 0;
  }

  update(platforms: Platform[], playerX: number, playerY: number) {
    if (this.isExploding) {
      this.explosionRadius += 4;
      return;
    }

    this.timer++;
    this.vy += GRAVITY;
    this.x += this.vx;
    this.y += this.vy;

    if (this.type === BarrelType.EXPLODING) {
      const dx = this.x - playerX;
      const dy = this.y - playerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (this.timer > 300 || dist < 40) {
        this.isExploding = true;
        playSound('impact');
      }
    }

    if (this.type !== BarrelType.GHOST) {
      this.onPlatform = false;
      for (const p of platforms) {
        if (this.x >= Math.min(p.x1, p.x2) && this.x <= Math.max(p.x1, p.x2)) {
          const t = (this.x - p.x1) / (p.x2 - p.x1);
          const platformY = p.y1 + t * (p.y2 - p.y1);

          if (this.y + this.radius >= platformY && this.y - this.radius <= platformY + 10 && this.vy >= 0) {
            this.y = platformY - this.radius;
            this.vy = 0;
            this.onPlatform = true;
            if (this.type === BarrelType.BOUNCY && this.timer % 60 === 0) {
              this.vy = -6;
              this.onPlatform = false;
            }
          }
        }
      }
    }

    if (this.x - this.radius < 0) {
      this.x = this.radius;
      this.vx = Math.abs(this.vx);
    } else if (this.x + this.radius > CANVAS_WIDTH) {
      this.x = CANVAS_WIDTH - this.radius;
      this.vx = -Math.abs(this.vx);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.isExploding) {
      ctx.save();
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.explosionRadius, 0, Math.PI * 2);
      const alpha = 1 - (this.explosionRadius / this.maxExplosionRadius);
      ctx.fillStyle = `rgba(255, 69, 0, ${alpha})`;
      ctx.fill();
      ctx.restore();
      return;
    }

    ctx.save();
    if (this.type === BarrelType.GHOST) {
      ctx.globalAlpha = 0.5;
    }

    if (this.type === BarrelType.FAST) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#ff5722';
    } else if (this.type === BarrelType.BOUNCY) {
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#2196f3';
    } else if (this.type === BarrelType.EXPLODING) {
      const flash = Math.sin(this.timer * 0.2) > 0;
      ctx.shadowBlur = 10;
      ctx.shadowColor = flash ? '#f00' : '#440000';
    }

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    switch (this.type) {
      case BarrelType.FAST: ctx.fillStyle = '#ff5722'; break;
      case BarrelType.BOUNCY: ctx.fillStyle = '#2196f3'; break;
      case BarrelType.EXPLODING: ctx.fillStyle = '#f44336'; break;
      case BarrelType.GHOST: ctx.fillStyle = '#b2ebf2'; break;
      default: ctx.fillStyle = '#d35400'; break;
    }
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(this.x - this.radius, this.y - 4);
    ctx.lineTo(this.x + this.radius, this.y - 4);
    ctx.moveTo(this.x - this.radius, this.y + 4);
    ctx.lineTo(this.x + this.radius, this.y + 4);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.stroke();

    if (this.type === BarrelType.GHOST) {
      ctx.font = '12px Arial';
      ctx.fillText('👻', this.x - 7, this.y + 5);
    } else if (this.type === BarrelType.EXPLODING) {
      ctx.font = '12px Arial';
      ctx.fillText('💣', this.x - 7, this.y + 5);
    }

    ctx.restore();
  }
}

class Fireball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number = 10;
  timer: number = 0;
  alive: boolean = true;

  constructor(x: number, y: number, targetX: number, targetY: number) {
    this.x = x;
    this.y = y;
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const speed = 6;
    this.vx = (dx / dist) * speed;
    this.vy = (dy / dist) * speed;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.timer++;
    if (this.x < -100 || this.x > CANVAS_WIDTH + 100 || this.y < -100 || this.y > CANVAS_HEIGHT + 100 || this.timer > 200) {
      this.alive = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff4500';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.5, '#ffeb3b');
    grad.addColorStop(1, '#ff4500');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.restore();
    
    ctx.font = '16px serif';
    ctx.fillText('🔥', this.x - 8, this.y + 6);
  }
}

const ControlButton = ({ onStart, onEnd, label, style }: any) => (
  <div
    onTouchStart={(e) => { e.preventDefault(); onStart(); }}
    onTouchEnd={(e) => { e.preventDefault(); onEnd(); }}
    onMouseDown={(e) => { e.preventDefault(); onStart(); }}
    onMouseUp={(e) => { e.preventDefault(); onEnd(); }}
    onMouseLeave={(e) => { e.preventDefault(); onEnd(); }}
    style={{
      width: '60px',
      height: '60px',
      backgroundColor: '#333',
      border: '3px solid #ffeb3b',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '24px',
      color: '#fff',
      userSelect: 'none',
      touchAction: 'none',
      boxShadow: '0 4px #000',
      cursor: 'pointer',
      active: { transform: 'translateY(2px)', boxShadow: '0 2px #000' },
      ...style
    }}
  >
    {label}
  </div>
);

const GodzillaEscape: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [health, setHealth] = useState(MAX_HEALTH);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [victory, setVictory] = useState(false);
  const [levelIndex, setLevelIndex] = useState(0);
  const [levelTransition, setLevelTransition] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  const [shieldTimer, setShieldTimer] = useState(0);
  const [speedTimer, setSpeedTimer] = useState(0);

  const currentLevel = LEVELS[levelIndex];

  const player = useRef({
    x: 50,
    y: CANVAS_HEIGHT - 50,
    vx: 0,
    vy: 0,
    width: 25,
    height: 35,
    onGround: false,
    onLadder: false,
    facing: 1 as 1 | -1,
    shield: 0,
    speed: 0,
    climbOffset: 0,
    invulnFrames: 0,
    animFrame: 0,
    squash: 1,
    stretch: 1,
    fallFrames: 0 
  });

  const barrels = useRef<Barrel[]>([]);
  const fireballs = useRef<Fireball[]>([]);
  const powerUps = useRef<PowerUp[]>([]);
  const frameCount = useRef(0);
  const keys = useRef<{ [key: string]: boolean }>({});
  
  // Godzilla Animation State
  const godzillaState = useRef({
    x: 0,
    y: 0,
    vx: 1,
    range: 100,
    startX: 0,
    roarTimer: 0,
    stompTimer: 0,
    flameTimer: 0,
    waddleFrame: 0,
  });

  // Sync muted state to global variable for sound utility
  useEffect(() => {
    isMutedGlobal = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (gameStarted && !gameOver && !victory && !levelTransition) {
          setIsPaused(prev => !prev);
        }
      }
      
      initAudio();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    
    const handleBlur = () => {
      keys.current = {};
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [gameStarted, gameOver, victory, levelTransition]);

  const resetGame = (fullReset = false, forcedLevel?: number) => {
    initAudio();
    keys.current = {};

    let targetLevel = levelIndex;
    if (fullReset) {
      setScore(0);
      setLives(3);
      targetLevel = 0;
      setLevelIndex(0);
    } else if (forcedLevel !== undefined) {
      targetLevel = forcedLevel;
      setLevelIndex(forcedLevel);
    }

    const lvl = LEVELS[targetLevel];
    player.current = {
      x: 50,
      y: CANVAS_HEIGHT - 50,
      vx: 0,
      vy: 0,
      width: 25,
      height: 35,
      onGround: false,
      onLadder: false,
      facing: 1,
      shield: 0,
      speed: 0,
      climbOffset: 0,
      invulnFrames: 0,
      animFrame: 0,
      squash: 1,
      stretch: 1,
      fallFrames: 0
    };
    barrels.current = [];
    fireballs.current = [];
    powerUps.current = lvl.powerUps.map(pu => ({ ...pu, collected: false, pulse: 0 }));
    
    godzillaState.current = {
      x: lvl.kong.x,
      y: lvl.kong.y,
      vx: 1.2,
      range: 80,
      startX: lvl.kong.x,
      roarTimer: 0,
      stompTimer: 0,
      flameTimer: 0,
      waddleFrame: 0,
    };

    setHealth(MAX_HEALTH);
    setShieldTimer(0);
    setSpeedTimer(0);
    setGameOver(false);
    setVictory(false);
    setLevelTransition(false);
    setIsPaused(false);
    setGameStarted(true);
  };

  const nextLevel = () => {
    // Current index is levelIndex
    if (levelIndex < LEVELS.length - 1) {
      const nextIdx = levelIndex + 1;
      setLevelIndex(nextIdx);
      setLevelTransition(true);
      playSound('levelclear');
      keys.current = {};
      
      // Delay before starting the next actual stage
      setTimeout(() => {
        resetGame(false, nextIdx);
      }, 2000);
    } else {
      setVictory(true);
      playSound('victory');
    }
  };

  const update = () => {
    if (gameOver || victory || !gameStarted || levelTransition || isPaused) return;

    const p = player.current;
    p.animFrame++;

    // Update Godzilla counters and Movement
    const gz = godzillaState.current;
    if (gz.roarTimer > 0) gz.roarTimer--;
    if (gz.stompTimer > 0) gz.stompTimer--;
    if (gz.flameTimer > 0) gz.flameTimer--;

    // Godzilla Heavy Waddle Logic
    if (gz.roarTimer === 0) {
      gz.x += gz.vx;
      gz.waddleFrame++;
      if (Math.abs(gz.x - gz.startX) > gz.range) {
        gz.vx *= -1;
      }
      // Play a heavy step sound periodically during walk
      if (Math.floor(gz.waddleFrame * 0.1) % 10 === 0 && gz.waddleFrame % 10 === 0) {
        playSound('step');
      }
    }

    if (p.shield > 0) {
      p.shield--;
      if (frameCount.current % 10 === 0) setShieldTimer(Math.ceil(p.shield / 60));
    } else if (shieldTimer > 0) setShieldTimer(0);

    if (p.speed > 0) {
      p.speed--;
      if (frameCount.current % 10 === 0) setSpeedTimer(Math.ceil(p.speed / 60));
    } else if (speedTimer > 0) setSpeedTimer(0);

    if (p.invulnFrames > 0) p.invulnFrames--;

    frameCount.current++;
    if (frameCount.current % SPAWN_RATE === 0) {
      const rand = Math.random();
      let type = BarrelType.NORMAL;
      if (rand > 0.90) {
        type = BarrelType.EXPLODING;
        gz.flameTimer = 40; 
      } else if (rand > 0.80) type = BarrelType.GHOST;
      else if (rand > 0.65) type = BarrelType.FAST;
      else if (rand > 0.50) type = BarrelType.BOUNCY;
      
      barrels.current.push(new Barrel(gz.x + 30, gz.y + 60, type));
      gz.roarTimer = 50; 
      gz.stompTimer = 20; 
      playSound('throw');
      playSound('roar');
      
      setTimeout(() => {
        if (!gameOver && !victory && !isPaused) {
          fireballs.current.push(new Fireball(gz.x + 30, gz.y + 40, p.x, p.y));
          playSound('fireball');
        }
      }, 200);
      setTimeout(() => {
        if (!gameOver && !victory && !isPaused) {
          fireballs.current.push(new Fireball(gz.x + 30, gz.y + 40, p.x, p.y));
          playSound('fireball');
        }
      }, 400);
      setTimeout(() => {
        if (!gameOver && !victory && !isPaused) {
          fireballs.current.push(new Fireball(gz.x + 30, gz.y + 40, p.x, p.y));
          playSound('fireball');
        }
      }, 600);
    }

    const currentSpeed = p.speed > 0 ? PLAYER_SPEED * 1.5 : PLAYER_SPEED;
    p.vx = 0;
    
    if (keys.current['ArrowLeft'] || keys.current['KeyA']) {
      p.vx = -currentSpeed;
      p.facing = -1;
    } else if (keys.current['ArrowRight'] || keys.current['KeyD']) {
      p.vx = currentSpeed;
      p.facing = 1;
    }

    if (p.onGround && Math.abs(p.vx) > 0 && p.animFrame % 15 === 0) {
      playSound('step');
    }

    p.onLadder = false;
    for (const l of currentLevel.ladders) {
      if (Math.abs(p.x + p.width / 2 - l.x) < 20 && p.y + p.height > l.y && p.y < l.y + l.height) {
        p.onLadder = true;
        break;
      }
    }

    if (p.onLadder) {
      p.vy = 0;
      if (keys.current['ArrowUp'] || keys.current['KeyW']) {
        p.vy = -currentSpeed;
        p.climbOffset += 0.25;
        if (Math.floor(p.climbOffset * 10) % 20 === 0) playSound('step');
      }
      if (keys.current['ArrowDown'] || keys.current['KeyS']) {
        p.vy = currentSpeed;
        p.climbOffset += 0.25;
        if (Math.floor(p.climbOffset * 10) % 20 === 0) playSound('step');
      }
    } else {
      p.vy += GRAVITY;
      if ((keys.current['Space'] || keys.current['ArrowUp'] || keys.current['KeyW']) && p.onGround) {
        p.vy = JUMP_STRENGTH;
        p.onGround = false;
        p.stretch = 1.35;
        p.squash = 0.65;
        playSound('jump');
      }
    }

    p.x += p.vx;
    p.y += p.vy;

    const prevOnGround = p.onGround;
    p.onGround = false;
    if (!p.onLadder) {
      for (const plat of currentLevel.platforms) {
        if (p.x + p.width > Math.min(plat.x1, plat.x2) && p.x < Math.max(plat.x1, plat.x2)) {
          const t = (p.x + p.width / 2 - plat.x1) / (plat.x2 - plat.x1);
          const platY = plat.y1 + t * (plat.y2 - plat.y1);
          if (p.y + p.height >= platY && p.y + p.height <= platY + 15 && p.vy >= 0) {
            p.y = platY - p.height;
            p.vy = 0;
            p.onGround = true;
            if (!prevOnGround) {
              p.squash = 1.35;
              p.stretch = 0.65;
              playSound('land');
            }
          }
        }
      }
    }

    if (!p.onGround && !p.onLadder && p.vy > 1) {
        p.fallFrames++;
    } else {
        p.fallFrames = 0;
    }

    p.squash += (1 - p.squash) * 0.15;
    p.stretch += (1 - p.stretch) * 0.15;

    powerUps.current.forEach(pu => {
      if (!pu.collected) {
        pu.pulse += 0.1;
        const dx = (p.x + p.width / 2) - pu.x;
        const dy = (p.y + p.height / 2) - pu.y;
        if (Math.sqrt(dx * dx + dy * dy) < 30) {
          pu.collected = true;
          playSound('powerup');
          if (pu.type === PowerUpType.SHIELD) {
            p.shield = 300;
            setShieldTimer(5);
          } else {
            p.speed = 480;
            setSpeedTimer(8);
          }
          setScore(s => s + 500);
        }
      }
    });

    if (p.x < 0) p.x = 0;
    if (p.x + p.width > CANVAS_WIDTH) p.x = CANVAS_WIDTH - p.width;

    fireballs.current = fireballs.current.filter(fb => fb.alive);
    fireballs.current.forEach(fb => {
      fb.update();
      const dx = (p.x + p.width / 2) - fb.x;
      const dy = (p.y + p.height / 2) - fb.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < fb.radius + p.width / 2 && p.invulnFrames <= 0) {
        if (p.shield > 0) {
          fb.alive = false;
          setScore(s => s + 300);
          playSound('impact');
        } else {
          fb.alive = false;
          playSound('hurt');
          p.invulnFrames = 60;
          setHealth(prev => Math.max(0, prev - 15));
        }
      }
    });

    barrels.current.forEach((b, index) => {
      b.update(currentLevel.platforms, p.x + p.width / 2, p.y + p.height / 2);
      
      const dx = (p.x + p.width / 2) - b.x;
      const dy = (p.y + p.height / 2) - b.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      let damage = 0;
      if (b.isExploding) {
        if (dist < b.explosionRadius + p.width / 2 && p.shield <= 0 && p.invulnFrames <= 0) {
          damage = 50;
        }
        if (b.explosionRadius > b.maxExplosionRadius) {
          barrels.current.splice(index, 1);
        }
      } else if (dist < b.radius + p.width / 2) {
        if (p.shield > 0) {
          barrels.current.splice(index, 1);
          setScore(s => s + 200);
          playSound('impact');
        } else if (p.invulnFrames <= 0) {
          switch (b.type) {
            case BarrelType.FAST: damage = 35; break;
            case BarrelType.NORMAL:
            case BarrelType.BOUNCY:
            case BarrelType.GHOST: damage = 20; break;
            default: damage = 20;
          }
          barrels.current.splice(index, 1);
        }
      }

      if (damage > 0) {
        playSound('hurt');
        p.invulnFrames = 60; 
        setHealth(prev => {
          const nextHealth = prev - damage;
          if (nextHealth <= 0) {
            setLives(l => {
              if (l <= 1) {
                setGameOver(true);
                playSound('gameover');
                return 0;
              }
              p.x = 50; p.y = CANVAS_HEIGHT - 50;
              barrels.current = [];
              fireballs.current = [];
              setHealth(MAX_HEALTH);
              return l - 1;
            });
            return 0;
          }
          return nextHealth;
        });
      }

      if (!b.isExploding && b.y > CANVAS_HEIGHT) {
        barrels.current.splice(index, 1);
        setScore(s => s + 100);
      }
    });

    const goalX = currentLevel.goal.x;
    const goalY = currentLevel.goal.y;
    if (Math.abs(p.x - goalX) < 50 && Math.abs(p.y - goalY) < 60) {
      nextLevel();
    }
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.save();
    const gz = godzillaState.current;
    if (gz.roarTimer > 0) {
      const intensity = (gz.roarTimer / 50) * 8; 
      const sx = (Math.random() - 0.5) * intensity;
      const sy = (Math.random() - 0.5) * intensity;
      ctx.translate(sx, sy);
    }

    ctx.lineWidth = 6;
    ctx.strokeStyle = currentLevel.color;
    currentLevel.platforms.forEach(p => {
      ctx.beginPath();
      ctx.moveTo(p.x1, p.y1);
      ctx.lineTo(p.x2, p.y2);
      ctx.stroke();
      ctx.setLineDash([5, 5]);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#fff';
      ctx.beginPath();
      ctx.moveTo(p.x1, p.y1 + 10);
      ctx.lineTo(p.x2, p.y2 + 10);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.lineWidth = 6;
      ctx.strokeStyle = currentLevel.color;
    });

    ctx.strokeStyle = '#2196f3';
    ctx.lineWidth = 4;
    currentLevel.ladders.forEach(l => {
      ctx.beginPath();
      ctx.moveTo(l.x - 10, l.y);
      ctx.lineTo(l.x - 10, l.y + l.height);
      ctx.moveTo(l.x + 10, l.y);
      ctx.lineTo(l.x + 10, l.y + l.height);
      ctx.stroke();
      ctx.lineWidth = 2;
      for (let ry = l.y + 10; ry < l.y + l.height; ry += 10) {
        ctx.beginPath();
        ctx.moveTo(l.x - 10, ry);
        ctx.lineTo(l.x + 10, ry);
        ctx.stroke();
      }
      ctx.lineWidth = 4;
    });

    // Draw Godzilla Boss
    ctx.save();
    ctx.translate(gz.x, gz.y);
    
    let waddleRotation = 0;
    let waddleScaleX = 1;
    let waddleScaleY = 1;
    let waddleYOffset = 0;

    if (gz.roarTimer === 0) {
      // Slower, heavier walk cycle
      const waddleSpeed = 0.15;
      waddleRotation = Math.sin(gz.waddleFrame * waddleSpeed) * 0.15;
      // Step lift
      waddleYOffset = Math.abs(Math.sin(gz.waddleFrame * waddleSpeed)) * -8;
      // Squash and stretch based on cycle
      waddleScaleY = 1 + Math.sin(gz.waddleFrame * waddleSpeed * 2) * 0.05;
      waddleScaleX = 1 - Math.sin(gz.waddleFrame * waddleSpeed * 2) * 0.05;
      
      ctx.translate(0, waddleYOffset);
    }
    
    if (gz.stompTimer > 0) {
      ctx.translate(Math.sin(gz.stompTimer * 2) * 6, Math.cos(gz.stompTimer * 2) * 6);
    } else if (gz.roarTimer === 0) {
      // Subtle float breath
      ctx.translate(0, Math.sin(frameCount.current * 0.1) * 2);
    }
    
    if (gz.roarTimer > 0) {
      const roarScale = 1 + Math.sin(gz.roarTimer * 0.5) * 0.25;
      ctx.scale(roarScale, roarScale);
      ctx.rotate(Math.sin(gz.roarTimer * 0.8) * 0.2);
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00ffff';

      ctx.save();
      ctx.font = '14px "Press Start 2P"';
      ctx.fillStyle = '#ffeb3b';
      ctx.textAlign = 'center';
      ctx.fillText('SKREEEONK!', 0, -30);
      ctx.restore();
    } else {
      ctx.rotate(waddleRotation);
      ctx.scale(waddleScaleX, waddleScaleY);
    }

    if (gz.flameTimer > 0 || gz.roarTimer > 20) {
      ctx.font = '40px serif';
      ctx.fillText('🔥', 40, 20);
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ff4500';
    }

    ctx.font = '70px serif';
    const flipDirection = gz.vx < 0 ? -1 : 1;
    ctx.scale(flipDirection, 1);
    
    ctx.fillText('🦖', 0, 40);
    ctx.restore();

    // Draw Goal
    ctx.font = '40px serif';
    ctx.fillText('💃', currentLevel.goal.x, currentLevel.goal.y + 35);

    powerUps.current.forEach(pu => {
      if (!pu.collected) {
        ctx.save();
        ctx.translate(pu.x, pu.y);
        if (pu.type === PowerUpType.SHIELD) {
          const scale = 1 + Math.sin(pu.pulse * 1.5) * 0.15;
          ctx.scale(scale, scale);
          ctx.shadowBlur = 15;
          ctx.shadowColor = '#00e5ff';
          ctx.font = '30px serif';
          ctx.fillText('🛡️', -15, 10);
        } else {
          const spin = Math.cos(pu.pulse * 4);
          const bounce = Math.sin(pu.pulse * 2) * 6;
          ctx.translate(0, bounce);
          ctx.scale(spin, 1);
          ctx.shadowBlur = 12;
          ctx.shadowColor = '#ffeb3b';
          ctx.font = '30px serif';
          ctx.fillText('⚡', -15, 10);
        }
        ctx.restore();
      }
    });

    barrels.current.forEach(b => b.draw(ctx));
    fireballs.current.forEach(fb => fb.draw(ctx));

    const p = player.current;
    ctx.save();
    
    if (p.invulnFrames > 0 && Math.floor(frameCount.current / 4) % 2 === 0) {
      ctx.globalAlpha = 0.3;
    }

    if (p.shield > 0) {
      const hue = (frameCount.current * 10) % 360;
      ctx.shadowBlur = 15;
      ctx.shadowColor = `hsl(${hue}, 100%, 50%)`;
    }
    
    let playerEmoji = '🚶';
    let rotation = 0;
    let extraTranslateY = 0;
    let showParachute = false;
    
    if (p.onLadder) {
      playerEmoji = Math.floor(p.climbOffset * 6) % 2 === 0 ? '🧗' : '🧗‍♂️';
      ctx.translate(Math.sin(p.climbOffset * 8) * 3, 0);
      rotation = Math.sin(p.climbOffset * 8) * 0.1;
    } else if (!p.onGround) {
      if (p.vy < 0) {
        playerEmoji = '🏃';
        rotation = p.facing * -0.25; 
      } else {
        playerEmoji = '🤸';
        rotation = p.facing * (0.1 + p.vy * 0.05); 
        if (p.fallFrames > 20) {
            showParachute = true;
        }
      }
    } else if (Math.abs(p.vx) > 0) {
      const runCycle = Math.floor(p.animFrame / 6) % 4;
      switch (runCycle) {
        case 0: playerEmoji = '🚶'; break;
        case 1: playerEmoji = '🏃'; break;
        case 2: playerEmoji = '🚶'; break;
        case 3: playerEmoji = '🏃‍♂️'; break;
      }
      extraTranslateY = Math.abs(Math.sin(p.animFrame * 0.45)) * -6;
    } else {
      playerEmoji = '🚶';
      extraTranslateY = Math.sin(p.animFrame * 0.08) * 2;
    }
    
    const fontSize = p.height;
    ctx.font = `${fontSize}px serif`;
    ctx.translate(p.x + p.width / 2, p.y + p.height / 2 + extraTranslateY);

    if (showParachute) {
        ctx.save();
        const sway = Math.sin(p.animFrame * 0.1) * 0.1;
        ctx.rotate(sway);
        ctx.font = `${fontSize * 1.5}px serif`;
        ctx.textAlign = 'center';
        ctx.fillText('🪂', 0, -fontSize * 0.8);
        ctx.restore();
    }

    if (p.facing === -1 && !p.onLadder) {
        ctx.scale(-1, 1);
    }
    
    ctx.scale(p.squash, p.stretch);
    ctx.rotate(rotation);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(playerEmoji, 0, 0);
    ctx.restore();
    
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationId: number;
    const loop = () => {
      update();
      draw(ctx);
      animationId = requestAnimationFrame(loop);
    };
    animationId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationId);
  }, [gameOver, victory, gameStarted, levelIndex, levelTransition, isPaused]);

  const getHealthColor = () => {
    if (health > 60) return '#4caf50';
    if (health > 30) return '#ffeb3b';
    return '#f44336';
  };

  const handleQuit = () => {
    setIsPaused(false);
    setGameStarted(false);
    setGameOver(false);
    setVictory(false);
    setLevelIndex(0);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', backgroundColor: '#1a1a1a', color: '#fff', fontFamily: '"Press Start 2P", system-ui', userSelect: 'none',
      padding: '10px'
    }}>
      <div style={{ marginBottom: '10px', textAlign: 'center', maxWidth: '100%', width: '100%' }}>
        <h1 style={{ color: '#ffeb3b', textShadow: '2px 2px #f44336', fontSize: 'clamp(0.8rem, 4vw, 1.5rem)', margin: '5px' }}>GODZILLA ESCAPE</h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
           <div style={{ 
              fontSize: '0.6rem', 
              color: currentLevel.color,
              transition: 'color 0.5s ease',
              animation: levelTransition ? 'pulse 0.5s infinite alternate' : 'none'
            }}>{currentLevel.name}</div>
           {gameStarted && !gameOver && !victory && !levelTransition && (
             <div style={{ display: 'flex', gap: '5px' }}>
                <button 
                  onClick={() => { initAudio(); setIsPaused(prev => !prev); }}
                  style={{
                    background: 'none', border: '1px solid #fff', color: '#fff', fontSize: '0.5rem',
                    cursor: 'pointer', padding: '4px 8px', fontFamily: 'inherit'
                  }}
                >
                  {isPaused ? 'RESUME' : 'PAUSE'}
                </button>
                <button 
                  onClick={() => { initAudio(); setIsMuted(prev => !prev); }}
                  style={{
                    background: 'none', border: '1px solid #fff', color: '#fff', fontSize: '0.5rem',
                    cursor: 'pointer', padding: '4px 8px', fontFamily: 'inherit'
                  }}
                >
                  {isMuted ? 'UNMUTE' : 'MUTE'}
                </button>
             </div>
           )}
        </div>

        <div style={{ display: 'flex', gap: '20px', fontSize: 'clamp(0.5rem, 2.2vw, 0.8rem)', justifyContent: 'center', alignItems: 'center', margin: '8px 0' }}>
          <div>SCORE: {score.toString().padStart(6, '0')}</div>
          <div>LIVES: {'❤️'.repeat(lives)}</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.5rem' }}>HP:</span>
          <div style={{ width: '120px', height: '12px', backgroundColor: '#333', border: '2px solid #fff', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
            <div style={{ width: `${health}%`, height: '100%', backgroundColor: getHealthColor(), transition: 'width 0.2s ease-out, background-color 0.2s ease' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px', fontSize: '0.5rem', justifyContent: 'center', height: '1rem' }}>
          {shieldTimer > 0 && <div style={{ color: '#00e5ff' }}>🛡️ {shieldTimer}s</div>}
          {speedTimer > 0 && <div style={{ color: '#ff9800' }}>⚡ {speedTimer}s</div>}
        </div>
      </div>

      <div style={{ position: 'relative', border: '4px solid #fff', boxShadow: '0 0 20px rgba(255,255,255,0.2)', maxWidth: '100%', backgroundColor: '#000', lineHeight: 0 }}>
        <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={{ display: 'block', maxWidth: '100%', height: 'auto', aspectRatio: '800/600' }} />
        
        {!gameStarted && (
          <div style={overlayStyle}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '10px' }}>READY?</h2>
            <div style={{ textAlign: 'left', marginBottom: '15px', fontSize: '0.5rem', lineHeight: '1.6' }}>
              <p>🛢️ NORMAL: -20 HP</p>
              <p style={{ color: '#ff5722' }}>🔥 FAST: -35 HP</p>
              <p style={{ color: '#b2ebf2' }}>👻 GHOST: -20 HP</p>
              <p style={{ color: '#f44336' }}>💣 BOMB: -50 HP</p>
              <p style={{ color: '#ffeb3b' }}>🔥 FIREBALL: -15 HP</p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => resetGame(true)} style={buttonStyle}>START GAME</button>
              <button 
                onClick={() => { initAudio(); setIsMuted(prev => !prev); }}
                style={{ ...buttonStyle, backgroundColor: '#555', color: '#fff' }}
              >
                {isMuted ? 'UNMUTE' : 'MUTE'}
              </button>
            </div>
          </div>
        )}

        {isPaused && (
          <div style={overlayStyle}>
            <h2 style={{ fontSize: '1.5rem', color: '#ffeb3b', marginBottom: '20px' }}>PAUSED</h2>
            <button onClick={() => setIsPaused(false)} style={{ ...buttonStyle, width: '200px' }}>RESUME</button>
            <button onClick={() => resetGame(false)} style={{ ...buttonStyle, width: '200px', backgroundColor: '#2196f3' }}>RESTART LEVEL</button>
            <button onClick={handleQuit} style={{ ...buttonStyle, width: '200px', backgroundColor: '#f44336' }}>QUIT</button>
          </div>
        )}

        {levelTransition && (
          <div style={overlayStyle}>
            <h2 style={{ color: '#4caf50', fontSize: '1.5rem' }}>LEVEL CLEAR!</h2>
            <p style={{ fontSize: '0.8rem' }}>PREPARING ZONE {levelIndex + 1}...</p>
          </div>
        )}

        {gameOver && (
          <div style={overlayStyle}>
            <h2 style={{ color: '#f44336', fontSize: '1.5rem' }}>GAME OVER</h2>
            <p style={{ fontSize: '0.8rem' }}>Score: {score}</p>
            <button onClick={() => resetGame(true)} style={buttonStyle}>RETRY</button>
          </div>
        )}

        {victory && (
          <div style={overlayStyle}>
            <h2 style={{ color: '#ffd700', fontSize: '1.8rem', textShadow: '0 0 10px #fff' }}>ALL ZONES CLEARED!</h2>
            <p style={{ fontSize: '0.8rem' }}>You reached the top of Zone {LEVELS.length}!</p>
            <p style={{ fontSize: '1.2rem', margin: '15px 0' }}>FINAL SCORE: {score}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => resetGame(true)} style={buttonStyle}>REPLAY</button>
              <button onClick={handleQuit} style={{ ...buttonStyle, backgroundColor: '#f44336' }}>MENU</button>
            </div>
          </div>
        )}
      </div>

      {gameStarted && !levelTransition && (
        <div style={{ width: '100%', maxWidth: '800px', marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 60px)', gridTemplateRows: 'repeat(2, 60px)', gap: '10px' }}>
            <div />
            <ControlButton onStart={() => { initAudio(); keys.current['ArrowUp'] = true; }} onEnd={() => keys.current['ArrowUp'] = false} label="▲" />
            <div />
            <ControlButton onStart={() => { initAudio(); keys.current['ArrowLeft'] = true; }} onEnd={() => keys.current['ArrowLeft'] = false} label="◀" />
            <ControlButton onStart={() => { initAudio(); keys.current['ArrowDown'] = true; }} onEnd={() => keys.current['ArrowDown'] = false} label="▼" />
            <ControlButton onStart={() => { initAudio(); keys.current['ArrowRight'] = true; }} onEnd={() => keys.current['ArrowRight'] = false} label="▶" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
             <ControlButton onStart={() => { initAudio(); keys.current['Space'] = true; }} onEnd={() => keys.current['Space'] = false} label="JUMP" style={{ width: '100px', height: '100px', borderRadius: '50px', backgroundColor: '#f44336', border: '4px solid #fff', fontSize: '18px' }} />
          </div>
        </div>
      )}

      <div style={{ marginTop: '20px', display: 'flex', gap: '10px', fontSize: '0.45rem', opacity: 0.6, textAlign: 'center' }}>
        <div>PC: ARROWS/WASD + SPACE | P/ESC: PAUSE</div>
        <div>MOBILE: USE CONTROLS</div>
      </div>
      <style>{`
        @keyframes pulse {
          from { opacity: 0.4; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

const overlayStyle: React.CSSProperties = {
  position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
  backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', flexDirection: 'column',
  alignItems: 'center', justifyContent: 'center', textAlign: 'center', zIndex: 10,
  padding: '20px'
};

const buttonStyle: React.CSSProperties = {
  marginTop: '10px', padding: '12px 24px', fontSize: '0.8rem', backgroundColor: '#ffeb3b',
  border: 'none', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '4px 4px #000',
  color: '#000'
};

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<GodzillaEscape />);
}
