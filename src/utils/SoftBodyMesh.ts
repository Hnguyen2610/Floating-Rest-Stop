export interface Point {
  x: number;
  y: number;
}

export interface SoftBodyConfig {
  stiffness: number;
  damping: number;
  influenceRadius: number;
  stretchLimit: number;
  returnSpeed: number;
}

interface ControlPoint {
  home: Point;
  offset: Point;
  velocity: Point;
}

function distanceBetween(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export class SoftBodyMesh {
  private points: ControlPoint[];
  private target: Point[];
  private dragging = false;

  constructor(
    homePoints: Point[],
    private config: SoftBodyConfig,
  ) {
    this.points = homePoints.map((home) => ({
      home: { ...home },
      offset: { x: 0, y: 0 },
      velocity: { x: 0, y: 0 },
    }));
    this.target = homePoints.map(() => ({ x: 0, y: 0 }));
  }

  applyPointerInfluence(localPointer: Point): void {
    this.dragging = true;

    let nearestIndex = 0;
    let nearestDistance = Infinity;
    this.points.forEach((point, index) => {
      const distance = distanceBetween(point.home, localPointer);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    const nearestHome = this.points[nearestIndex].home;
    const pull: Point = {
      x: localPointer.x - nearestHome.x,
      y: localPointer.y - nearestHome.y,
    };

    this.points.forEach((point, index) => {
      const distanceFromDragged = distanceBetween(point.home, nearestHome);
      const falloff = Math.max(0, 1 - distanceFromDragged / this.config.influenceRadius);
      this.target[index] = { x: pull.x * falloff, y: pull.y * falloff };
    });
  }

  release(): void {
    this.dragging = false;
    this.target = this.points.map(() => ({ x: 0, y: 0 }));
  }

  update(deltaSeconds: number): void {
    // returnSpeed only boosts the pull-back once released, so drag feels soft
    // but the bounce-back on release feels snappy — see design spec 5.5.
    const effectiveStiffness = this.dragging
      ? this.config.stiffness
      : this.config.stiffness * this.config.returnSpeed;

    this.points.forEach((point, index) => {
      const target = this.target[index];
      const ax =
        effectiveStiffness * (target.x - point.offset.x) - this.config.damping * point.velocity.x;
      const ay =
        effectiveStiffness * (target.y - point.offset.y) - this.config.damping * point.velocity.y;

      point.velocity.x += ax * deltaSeconds;
      point.velocity.y += ay * deltaSeconds;
      point.offset.x += point.velocity.x * deltaSeconds;
      point.offset.y += point.velocity.y * deltaSeconds;

      const magnitude = Math.hypot(point.offset.x, point.offset.y);
      if (magnitude > this.config.stretchLimit) {
        const scale = this.config.stretchLimit / magnitude;
        point.offset.x *= scale;
        point.offset.y *= scale;
      }
    });
  }

  getPoints(): Point[] {
    return this.points.map((point) => ({
      x: point.home.x + point.offset.x,
      y: point.home.y + point.offset.y,
    }));
  }

  isSettled(epsilon = 0.05): boolean {
    return this.points.every(
      (point) =>
        Math.hypot(point.offset.x, point.offset.y) < epsilon &&
        Math.hypot(point.velocity.x, point.velocity.y) < epsilon,
    );
  }
}
