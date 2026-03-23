import { MagnitudeLabelPipe } from './magnitude-label.pipe';

describe('MagnitudeLabelPipe', () => {
  let pipe: MagnitudeLabelPipe;

  beforeEach(() => {
    pipe = new MagnitudeLabelPipe();
  });

  it('should return "Unknown" for null magnitude', () => {
    expect(pipe.transform(null)).toBe('Unknown');
  });

  it('should return "Micro" for magnitude < 2.0', () => {
    expect(pipe.transform(1.5)).toBe('Micro');
    expect(pipe.transform(0.0)).toBe('Micro');
  });

  it('should return "Minor" for magnitude 2.0–3.9', () => {
    expect(pipe.transform(2.0)).toBe('Minor');
    expect(pipe.transform(3.9)).toBe('Minor');
  });

  it('should return "Light" for magnitude 4.0–4.9', () => {
    expect(pipe.transform(4.0)).toBe('Light');
    expect(pipe.transform(4.9)).toBe('Light');
  });

  it('should return "Moderate" for magnitude 5.0–5.9', () => {
    expect(pipe.transform(5.0)).toBe('Moderate');
    expect(pipe.transform(5.9)).toBe('Moderate');
  });

  it('should return "Strong" for magnitude 6.0–6.9', () => {
    expect(pipe.transform(6.0)).toBe('Strong');
    expect(pipe.transform(6.9)).toBe('Strong');
  });

  it('should return "Major" for magnitude >= 7.0', () => {
    expect(pipe.transform(7.0)).toBe('Major');
    expect(pipe.transform(9.5)).toBe('Major');
  });
});
