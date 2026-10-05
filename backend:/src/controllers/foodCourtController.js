const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const foodCourtService = require('../services/foodCourtService');

const listFoodCourts = asyncHandler(async (req, res) => {
  const foodCourts = await foodCourtService.listFoodCourts();
  return success(res, { message: 'Food courts retrieved', data: { foodCourts } });
});

const getFoodCourt = asyncHandler(async (req, res) => {
  const foodCourt = await foodCourtService.getFoodCourtById(req.params.foodCourtId);
  return success(res, { message: 'Food court retrieved', data: { foodCourt } });
});

module.exports = { listFoodCourts, getFoodCourt };
