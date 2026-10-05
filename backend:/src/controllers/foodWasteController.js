const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const foodWasteService = require('../services/foodWasteService');

exports.recordWaste = asyncHandler(async (req, res) => {
  const record = await foodWasteService.recordWaste(req.user.id, req.body);
  success(res, { message: 'Waste recorded', data: { wasteRecord: record } }, 201);
});

exports.getWaste = asyncHandler(async (req, res) => {
  const records = await foodWasteService.getWasteRecords(req.user.id);
  success(res, { message: 'Waste records fetched', data: { wasteRecords: records } });
});
