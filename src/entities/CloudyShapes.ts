import type { Point } from '../utils/SoftBodyMesh';

// Every shape feeds the exact same SoftBodyMesh physics (Pass 23 rule: "Soft
// physics phải reuse cùng implementation") — only the home-point geometry
// differs per shape, generated here.

function createBlobSilhouette(
  pointCount: number,
  baseRadius: number,
  wobbleAmplitude: number,
  wobbleFrequency: number,
): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < pointCount; i += 1) {
    const angle = (i / pointCount) * Math.PI * 2;
    const radius = baseRadius + wobbleAmplitude * Math.sin(angle * wobbleFrequency);
    points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius * 0.8 });
  }
  return points;
}

function createHeartSilhouette(pointCount: number, scale: number): Point[] {
  const points: Point[] = [];
  for (let i = 0; i < pointCount; i += 1) {
    const t = (i / pointCount) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    points.push({ x: x * scale, y: y * scale });
  }
  return points;
}

type ShapeConfig =
  | { kind: 'blob'; pointCount: number; baseRadius: number; wobbleAmplitude: number; wobbleFrequency: number }
  | { kind: 'heart'; pointCount: number; scale: number };

export const CLOUDY_SHAPES: Record<string, ShapeConfig> = {
  default: { kind: 'blob', pointCount: 28, baseRadius: 70, wobbleAmplitude: 8, wobbleFrequency: 4 },
  // More points and a bigger, faster wobble reads as a poofier, less regular puff.
  cotton_candy: { kind: 'blob', pointCount: 36, baseRadius: 66, wobbleAmplitude: 16, wobbleFrequency: 7 },
  heart: { kind: 'heart', pointCount: 28, scale: 3.6 },
};

export function createCloudyShapePoints(shapeId: string): Point[] {
  const config = CLOUDY_SHAPES[shapeId] ?? CLOUDY_SHAPES.default;
  return config.kind === 'heart'
    ? createHeartSilhouette(config.pointCount, config.scale)
    : createBlobSilhouette(config.pointCount, config.baseRadius, config.wobbleAmplitude, config.wobbleFrequency);
}
