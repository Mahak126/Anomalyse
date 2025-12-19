// Future Backend API Contracts:
// POST /api/v1/transactions/upload

export const uploadService = {
  uploadCSV: async (file: File): Promise<{ success: boolean; message: string; rowsProcessed: number }> => {
    // Simulate upload time based on file size
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock logic
    if (file.name.endsWith('.csv')) {
      return {
        success: true,
        message: 'File uploaded and processed successfully.',
        rowsProcessed: 1450
      };
    } else {
      throw new Error('Invalid file format. Please upload a CSV.');
    }
  }
};