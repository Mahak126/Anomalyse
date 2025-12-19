import { Transaction } from '../types';

/**
 * Validates if a transaction has the necessary fields for sorting.
 * @param t The transaction to validate
 * @returns true if valid, false otherwise
 */
export const validateTransaction = (t: Transaction): boolean => {
  return !!(t && t.user_id && t.timestamp);
};

/**
 * Sorts transactions based on User ID (ascending) and Timestamp (chronological).
 * Time Complexity: O(n log n)
 * 
 * @param transactions The list of transactions to sort
 * @returns A new sorted array of transactions
 */
export const sortTransactions = (transactions: Transaction[]): Transaction[] => {
  // Create a shallow copy to avoid mutating the original array
  // and filter out invalid transactions to ensure sorting integrity.
  const validTransactions = transactions.filter(validateTransaction);
  
  if (validTransactions.length !== transactions.length) {
      console.warn(`Filtered out ${transactions.length - validTransactions.length} invalid transactions during sort.`);
  }

  return validTransactions.sort((a, b) => {
    // Primary Key: User ID (Ascending)
    const userComparison = a.user_id.localeCompare(b.user_id);
    if (userComparison !== 0) {
      return userComparison;
    }

    // Secondary Key: Timestamp (Oldest to Newest)
    const timeA = new Date(a.timestamp).getTime();
    const timeB = new Date(b.timestamp).getTime();
    
    // Handle invalid dates if any slipped through (though unlikely with basic validation)
    if (isNaN(timeA)) return 1; // Push invalid dates to end
    if (isNaN(timeB)) return -1;

    return timeA - timeB;
  });
};
