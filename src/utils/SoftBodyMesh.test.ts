import { describe, expect, it } from 'vitest';
import { SoftBodyMesh, type SoftBodyConfig } from './SoftBodyMesh';

const config: SoftBodyConfig = {
  stiffness: 40,
  damping: 8,
  influenceRadius: 60,
  stretchLimit: 30,
  returnSpeed: 1.5,
};

function squareHomePoints() {
  return [
    { x: -50, y: -50 },
    { x: 50, y: -50 },
    { x: 50, y: 50 },
    { x: -50, y: 50 },
  ];
}

describe('SoftBodyMesh', () => {
  it('starts with every point at its home position', () => {
    const mesh = new SoftBodyMesh(squareHomePoints(), config);
    expect(mesh.getPoints()).toEqual(squareHomePoints());
  });

  it('pulls the nearest point toward the pointer more than a far neighbor', () => {
    const mesh = new SoftBodyMesh(squareHomePoints(), config);
    mesh.applyPointerInfluence({ x: -80, y: -80 });
    mesh.update(1 / 60);

    const points = mesh.getPoints();
    const nearestDisplacement = Math.hypot(points[0].x - -50, points[0].y - -50);
    const farthestDisplacement = Math.hypot(points[2].x - 50, points[2].y - 50);

    expect(nearestDisplacement).toBeGreaterThan(0);
    expect(farthestDisplacement).toBe(0);
  });

  it('never displaces a point beyond stretchLimit', () => {
    const mesh = new SoftBodyMesh(squareHomePoints(), config);
    mesh.applyPointerInfluence({ x: -5000, y: -5000 });

    for (let i = 0; i < 120; i += 1) {
      mesh.update(1 / 60);
    }

    const homes = squareHomePoints();
    mesh.getPoints().forEach((point, index) => {
      const displacement = Math.hypot(point.x - homes[index].x, point.y - homes[index].y);
      expect(displacement).toBeLessThanOrEqual(config.stretchLimit + 1e-6);
    });
  });

  it('settles back to home after release', () => {
    const mesh = new SoftBodyMesh(squareHomePoints(), config);
    mesh.applyPointerInfluence({ x: -80, y: -80 });
    for (let i = 0; i < 10; i += 1) mesh.update(1 / 60);

    mesh.release();
    for (let i = 0; i < 300; i += 1) mesh.update(1 / 60);

    expect(mesh.isSettled(0.5)).toBe(true);
  });
});
