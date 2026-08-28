import type { SoftBodyConfig } from '../utils/SoftBodyMesh';

export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;

export const PALETTE = {
  skyTop: 0xa9d8f0,
  skyBottom: 0xfff6e5,
  cloudWhite: 0xfdfbf7,
  pastelPink: 0xf7c9d0,
  lavender: 0xd9c9ec,
  mint: 0xc8ede0,
  softYellow: 0xfdf2a4,
  eyeColor: 0x5b4a63,
} as const;

export const SOFT_BODY_CONFIG: SoftBodyConfig = {
  stiffness: 55,
  damping: 9,
  influenceRadius: 70,
  stretchLimit: 26,
  returnSpeed: 1.6,
};

export const CLOUDY_CONFIG = {
  pointCount: 28,
  baseRadius: 70,
  wobbleAmplitude: 8,
  wobbleFrequency: 4,
  floatAmplitude: 8,
  floatFrequency: 1.1,
  blinkMinDelay: 2000,
  blinkMaxDelay: 5000,
} as const;
