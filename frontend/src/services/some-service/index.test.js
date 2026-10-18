import { describe, it, expect } from 'vitest';
import { someService } from './someService';

describe('someService', () => {
  it('should work correctly', async () => {
    // TODO: implement tests
    const result = await someService();
    expect(result).toBeNull();
  });
});
