const axios = require('axios');
const AppError = require('../utils/AppError');

const ML_BASE_URL = process.env.ML_SERVICE_URL || 'http://localhost:8000';
const INTERNAL_API_KEY = process.env.ML_INTERNAL_API_KEY || '';

async function predictDemand(payload) {
  try {
    const response = await axios.post(`${ML_BASE_URL}/predict-demand`, payload, {
      headers: {
        'Content-Type': 'application/json',
        ...(INTERNAL_API_KEY ? { 'x-internal-api-key': INTERNAL_API_KEY } : {}),
      },
      timeout: 10000,
    });
    return response.data;
  } catch (err) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
      throw AppError.serviceUnavailable('ML service is not reachable. Please try again later.');
    }
    if (err.response?.status === 422) {
      throw AppError.unprocessable('Invalid prediction input: ' + JSON.stringify(err.response.data?.detail || ''));
    }
    throw AppError.internal('ML prediction failed: ' + (err.response?.data?.detail || err.message));
  }
}

module.exports = { predictDemand };
