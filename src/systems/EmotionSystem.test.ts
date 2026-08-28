import { describe, expect, it } from 'vitest';
import { EmotionSystem, type EmotionsData } from './EmotionSystem';

const data: EmotionsData = {
  stageThresholds: { distressed: 70, calming: 40, relaxed: 15 },
  emotions: {
    OVERHEATED: { label: 'Overheated', color: '#f28b82' },
  },
};

describe('EmotionSystem', () => {
  const system = new EmotionSystem(data);

  it('classifies intensity into stages at the threshold boundaries', () => {
    expect(system.getStage(100)).toBe('DISTRESSED');
    expect(system.getStage(70)).toBe('DISTRESSED');
    expect(system.getStage(69)).toBe('CALMING');
    expect(system.getStage(40)).toBe('CALMING');
    expect(system.getStage(39)).toBe('RELAXED');
    expect(system.getStage(15)).toBe('RELAXED');
    expect(system.getStage(14)).toBe('HAPPY');
    expect(system.getStage(0)).toBe('HAPPY');
  });

  it('clamps soothe() to the 0-100 range', () => {
    expect(system.soothe(10, 30)).toBe(0);
    expect(system.soothe(95, -30)).toBe(100);
    expect(system.soothe(50, 10)).toBe(40);
  });

  it('throws for an unknown emotion id', () => {
    expect(() => system.getEmotionMeta('NOT_REAL')).toThrow();
  });
});
