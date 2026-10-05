const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const mlService = require('../services/mlService');

exports.predictDemand = asyncHandler(async (req, res) => {
  const prediction = await mlService.predictDemand(req.body);
  success(res, { message: 'Prediction successful', data: { prediction } });
});
