const axios = require('axios');

// ML Service Configuration
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

/**
 * Analyze a single journal entry using ML service
 * @param {string} title - Journal entry title
 * @param {string} content - Journal entry content
 * @returns {Promise<Object>} Analysis result
 */
const analyzeJournalEntry = async (title, content) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/analyze`, {
      title,
      content
    }, {
      timeout: 30000 // 30 seconds timeout
    });

    if (response.data.success) {
      return {
        success: true,
        analysis: response.data.data
      };
    } else {
      throw new Error(response.data.error || 'ML analysis failed');
    }
  } catch (error) {
    console.error('ML Service Error:', error.message);
    
    // Return graceful fallback if ML service is unavailable
    return {
      success: false,
      error: error.message,
      analysis: null
    };
  }
};

/**
 * Analyze multiple journal entries for trend analysis
 * @param {Array} entries - Array of {title, content} objects
 * @returns {Promise<Object>} Batch analysis result with trends
 */
const batchAnalyzeEntries = async (entries) => {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/batch-analyze`, {
      entries
    }, {
      timeout: 60000 // 60 seconds for batch processing
    });

    if (response.data.success) {
      return {
        success: true,
        data: response.data.data
      };
    } else {
      throw new Error(response.data.error || 'Batch analysis failed');
    }
  } catch (error) {
    console.error('ML Batch Analysis Error:', error.message);
    
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Check if ML service is healthy and available
 * @returns {Promise<boolean>}
 */
const checkMLServiceHealth = async () => {
  try {
    const response = await axios.get(`${ML_SERVICE_URL}/health`, {
      timeout: 5000
    });
    
    return response.data.status === 'healthy';
  } catch (error) {
    console.error('ML Service health check failed:', error.message);
    return false;
  }
};

module.exports = {
  analyzeJournalEntry,
  batchAnalyzeEntries,
  checkMLServiceHealth
};
