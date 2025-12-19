import { describe, it, expect } from 'vitest';
import { sortTransactions } from './sorting';
import { Transaction } from '../types';

const mockTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  id: 'tx_123',
  timestamp: '2023-01-01T10:00:00Z',
  amount: 100,
  user_id: 'user_1',
  city: 'NYC',
  category: 'Food',
  riskScore: 10,
  status: 'Safe',
  ...overrides
});

describe('sortTransactions', () => {
  it('should sort by User ID in ascending order', () => {
    const input = [
      mockTransaction({ user_id: 'user_B', id: '2' }),
      mockTransaction({ user_id: 'user_A', id: '1' }),
      mockTransaction({ user_id: 'user_C', id: '3' }),
    ];
    const sorted = sortTransactions(input);
    expect(sorted.map(t => t.user_id)).toEqual(['user_A', 'user_B', 'user_C']);
  });

  it('should sort by timestamp (oldest first) when User IDs are identical', () => {
    const input = [
      mockTransaction({ user_id: 'user_A', timestamp: '2023-01-02T10:00:00Z', id: '2' }),
      mockTransaction({ user_id: 'user_A', timestamp: '2023-01-01T10:00:00Z', id: '1' }),
      mockTransaction({ user_id: 'user_A', timestamp: '2023-01-03T10:00:00Z', id: '3' }),
    ];
    const sorted = sortTransactions(input);
    expect(sorted.map(t => t.id)).toEqual(['1', '2', '3']);
  });

  it('should handle identical timestamps gracefully', () => {
    const input = [
      mockTransaction({ user_id: 'user_A', timestamp: '2023-01-01T10:00:00Z', id: '1' }),
      mockTransaction({ user_id: 'user_A', timestamp: '2023-01-01T10:00:00Z', id: '2' }),
    ];
    const sorted = sortTransactions(input);
    expect(sorted.length).toBe(2);
    expect(sorted[0].user_id).toBe('user_A');
  });

  it('should correctly sort mixed data', () => {
    const input = [
      mockTransaction({ user_id: 'user_B', timestamp: '2023-01-01T10:00:00Z' }),
      mockTransaction({ user_id: 'user_A', timestamp: '2023-01-02T10:00:00Z' }), // A, newer
      mockTransaction({ user_id: 'user_A', timestamp: '2023-01-01T10:00:00Z' }), // A, older
    ];
    const sorted = sortTransactions(input);
    expect(sorted[0].user_id).toBe('user_A');
    expect(sorted[0].timestamp).toBe('2023-01-01T10:00:00Z');
    expect(sorted[1].user_id).toBe('user_A');
    expect(sorted[1].timestamp).toBe('2023-01-02T10:00:00Z');
    expect(sorted[2].user_id).toBe('user_B');
  });

  it('should filter out invalid transactions', () => {
    const input = [
      mockTransaction({ user_id: 'user_A' }),
      // @ts-ignore
      { id: 'invalid', amount: 100 } as Transaction, // Missing user_id and timestamp
    ];
    const sorted = sortTransactions(input);
    expect(sorted.length).toBe(1);
    expect(sorted[0].user_id).toBe('user_A');
  });

  it('should handle large datasets efficiently', () => {
    const size = 10000;
    const input: Transaction[] = [];
    for (let i = 0; i < size; i++) {
      input.push(mockTransaction({
        user_id: `user_${Math.floor(Math.random() * 100)}`,
        timestamp: new Date(Date.now() - Math.floor(Math.random() * 10000000)).toISOString()
      }));
    }
    
    const start = performance.now();
    const sorted = sortTransactions(input);
    const end = performance.now();
    
    expect(sorted.length).toBe(size);
    console.log(`Sorted ${size} items in ${(end - start).toFixed(2)}ms`);
    expect(end - start).toBeLessThan(1000); 
  });
});
