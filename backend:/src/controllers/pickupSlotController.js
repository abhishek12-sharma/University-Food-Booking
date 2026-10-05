const asyncHandler = require('../utils/asyncHandler');
const { success } = require('../utils/response');
const pickupSlotService = require('../services/pickupSlotService');

const listPickupSlots = asyncHandler(async (req, res) => {
  const pickupSlots = await pickupSlotService.listPickupSlotsByFoodCourt(req.params.foodCourtId);
  return success(res, { message: 'Pickup slots retrieved', data: { pickupSlots } });
});

const createPickupSlot = asyncHandler(async (req, res) => {
  const pickupSlot = await pickupSlotService.createPickupSlot(req.user.id, req.body);
  return success(res, { message: 'Pickup slot created', data: { pickupSlot }, statusCode: 201 });
});

const updatePickupSlotStatus = asyncHandler(async (req, res) => {
  const pickupSlot = await pickupSlotService.updatePickupSlotStatus(
    req.user.id,
    req.params.slotId,
    req.body.status
  );
  return success(res, { message: 'Pickup slot status updated', data: { pickupSlot } });
});

module.exports = { listPickupSlots, createPickupSlot, updatePickupSlotStatus };
