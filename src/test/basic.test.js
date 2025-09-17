import { describe, it, expect } from '@jest/globals';

describe('Basic test suite', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });

  it('should handle simple math', () => {
    expect(2 + 2).toBe(4);
  });
});
