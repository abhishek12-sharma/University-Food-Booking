const { sequelize, Order, OrderItem, FoodItem, FoodCourt, User, Payment, FoodWaste, PickupSlot } = require('../models');
const { Op } = require('sequelize');

async function getAdminOverview() {
  const [totalOrders, totalRevenue, activeUsers, activeFoodCourts, todayOrders, todayRevenue] = await Promise.all([
    Order.count(),
    Payment.sum('amount', { where: { status: 'PAID' } }).then(val => val || 0),
    User.count({ where: { role: 'USER', status: 'ACTIVE' } }),
    FoodCourt.count({ where: { status: 'ACTIVE' } }),
    Order.count({ where: { created_at: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) } } }),
    Payment.sum('amount', {
      where: {
        status: 'PAID',
        created_at: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) }
      }
    }).then(val => val || 0),
  ]);
  return { totalOrders, totalRevenue, activeUsers, activeFoodCourts, todayOrders, todayRevenue };
}

async function getAdminRevenue({ from, to }) {
  const where = { status: 'PAID' };
  if (from || to) {
    where.created_at = {};
    if (from) where.created_at[Op.gte] = new Date(from);
    if (to) where.created_at[Op.lte] = new Date(to);
  }
  const revenue = await Payment.findAll({
    attributes: [
      [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
      [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
    ],
    where,
    group: [sequelize.fn('DATE', sequelize.col('created_at'))],
    order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']],
  });
  return revenue.map(r => ({ date: r.get('date'), total: parseFloat(r.get('total')) }));
}

async function getAdminOrders({ from, to }) {
  const where = {};
  if (from || to) {
    where.created_at = {};
    if (from) where.created_at[Op.gte] = new Date(from);
    if (to) where.created_at[Op.lte] = new Date(to);
  }
  
  const [byStatus, dailyCount] = await Promise.all([
    Order.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where,
      group: ['status']
    }),
    Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where,
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    })
  ]);
  
  return {
    byStatus: byStatus.map(s => ({ status: s.get('status'), count: parseInt(s.get('count'), 10) })),
    dailyCount: dailyCount.map(d => ({ date: d.get('date'), count: parseInt(d.get('count'), 10) }))
  };
}

async function getAdminFoodCourts() {
  const foodCourts = await FoodCourt.findAll({
    attributes: ['id', 'name'],
  });
  const results = await Promise.all(foodCourts.map(async fc => {
    const orderCount = await Order.count({ where: { food_court_id: fc.id } });
    const revenue = await Payment.sum('amount', {
      where: { status: 'PAID' },
      include: [{ model: Order, as: 'order', where: { food_court_id: fc.id } }]
    }) || 0;
    return { id: fc.id, name: fc.name, orderCount, revenue: parseFloat(revenue) };
  }));
  return results;
}

async function getAdminPopularFood({ limit = 10 }) {
  const items = await OrderItem.findAll({
    attributes: [
      'food_item_id',
      [sequelize.fn('MAX', sequelize.col('item_name_snapshot')), 'name'],
      [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity']
    ],
    group: ['food_item_id'],
    order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
    limit: parseInt(limit, 10),
  });
  return items.map(i => ({
    foodItemId: i.get('food_item_id'),
    name: i.get('name'),
    totalQuantity: parseInt(i.get('totalQuantity'), 10)
  }));
}

async function getAdminPeakHours() {
  const orders = await Order.findAll({
    attributes: [
      [sequelize.fn('HOUR', sequelize.col('created_at')), 'hour'],
      [sequelize.fn('COUNT', sequelize.col('id')), 'count']
    ],
    group: [sequelize.fn('HOUR', sequelize.col('created_at'))],
    order: [[sequelize.fn('HOUR', sequelize.col('created_at')), 'ASC']]
  });
  return orders.map(o => ({
    hour: parseInt(o.get('hour'), 10),
    count: parseInt(o.get('count'), 10)
  }));
}

// Shopkeeper analytics
async function getShopkeeperOverview(shopkeeperUserId) {
  const { getAssignedFoodCourtIds } = require('../utils/authz');
  const foodCourtIds = await getAssignedFoodCourtIds(shopkeeperUserId);
  if (!foodCourtIds || foodCourtIds.length === 0) {
    return { totalOrders: 0, totalRevenue: 0, activeFoodCourts: 0, todayOrders: 0, todayRevenue: 0 };
  }

  const [totalOrders, totalRevenue, todayOrders, todayRevenue] = await Promise.all([
    Order.count({ where: { food_court_id: foodCourtIds } }),
    Payment.sum('amount', {
      where: { status: 'PAID' },
      include: [{ model: Order, as: 'order', where: { food_court_id: foodCourtIds } }]
    }).then(val => val || 0),
    Order.count({ 
      where: { 
        food_court_id: foodCourtIds,
        created_at: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) }
      } 
    }),
    Payment.sum('amount', {
      where: {
        status: 'PAID',
        created_at: { [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)) }
      },
      include: [{ model: Order, as: 'order', where: { food_court_id: foodCourtIds } }]
    }).then(val => val || 0),
  ]);

  return { totalOrders, totalRevenue: parseFloat(totalRevenue), activeFoodCourts: foodCourtIds.length, todayOrders, todayRevenue: parseFloat(todayRevenue) };
}

async function getShopkeeperOrders(shopkeeperUserId, { from, to }) {
  const { getAssignedFoodCourtIds } = require('../utils/authz');
  const foodCourtIds = await getAssignedFoodCourtIds(shopkeeperUserId);
  if (!foodCourtIds || foodCourtIds.length === 0) return { byStatus: [], dailyCount: [] };

  const where = { food_court_id: foodCourtIds };
  if (from || to) {
    where.created_at = {};
    if (from) where.created_at[Op.gte] = new Date(from);
    if (to) where.created_at[Op.lte] = new Date(to);
  }

  const [byStatus, dailyCount] = await Promise.all([
    Order.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where,
      group: ['status']
    }),
    Order.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where,
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    })
  ]);
  
  return {
    byStatus: byStatus.map(s => ({ status: s.get('status'), count: parseInt(s.get('count'), 10) })),
    dailyCount: dailyCount.map(d => ({ date: d.get('date'), count: parseInt(d.get('count'), 10) }))
  };
}

async function getShopkeeperRevenue(shopkeeperUserId, { from, to }) {
  const { getAssignedFoodCourtIds } = require('../utils/authz');
  const foodCourtIds = await getAssignedFoodCourtIds(shopkeeperUserId);
  if (!foodCourtIds || foodCourtIds.length === 0) return [];

  const paymentWhere = { status: 'PAID' };
  if (from || to) {
    paymentWhere.created_at = {};
    if (from) paymentWhere.created_at[Op.gte] = new Date(from);
    if (to) paymentWhere.created_at[Op.lte] = new Date(to);
  }

  const revenue = await Payment.findAll({
    attributes: [
      [sequelize.fn('DATE', sequelize.col('Payment.created_at')), 'date'],
      [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
    ],
    where: paymentWhere,
    include: [{ model: Order, as: 'order', attributes: [], where: { food_court_id: foodCourtIds } }],
    group: [sequelize.fn('DATE', sequelize.col('Payment.created_at'))],
    order: [[sequelize.fn('DATE', sequelize.col('Payment.created_at')), 'ASC']],
  });
  return revenue.map(r => ({ date: r.get('date'), total: parseFloat(r.get('total')) }));
}

async function getShopkeeperPopularFood(shopkeeperUserId, { limit = 10 }) {
  const { getAssignedFoodCourtIds } = require('../utils/authz');
  const foodCourtIds = await getAssignedFoodCourtIds(shopkeeperUserId);
  if (!foodCourtIds || foodCourtIds.length === 0) return [];

  const items = await OrderItem.findAll({
    attributes: [
      'food_item_id',
      [sequelize.fn('MAX', sequelize.col('item_name_snapshot')), 'name'],
      [sequelize.fn('SUM', sequelize.col('quantity')), 'totalQuantity']
    ],
    include: [{ model: Order, as: 'order', attributes: [], where: { food_court_id: foodCourtIds } }],
    group: ['food_item_id'],
    order: [[sequelize.fn('SUM', sequelize.col('quantity')), 'DESC']],
    limit: parseInt(limit, 10),
  });
  return items.map(i => ({
    foodItemId: i.get('food_item_id'),
    name: i.get('name'),
    totalQuantity: parseInt(i.get('totalQuantity'), 10)
  }));
}

async function getShopkeeperPickupDemand(shopkeeperUserId) {
  const { getAssignedFoodCourtIds } = require('../utils/authz');
  const foodCourtIds = await getAssignedFoodCourtIds(shopkeeperUserId);
  if (!foodCourtIds || foodCourtIds.length === 0) return [];

  const demand = await Order.findAll({
    attributes: [
      'pickup_slot_id',
      [sequelize.fn('COUNT', sequelize.col('Order.id')), 'orderCount']
    ],
    where: { food_court_id: foodCourtIds },
    include: [{ model: PickupSlot, as: 'pickupSlot', attributes: ['start_time', 'end_time'] }],
    group: ['pickup_slot_id', 'pickupSlot.id'],
    order: [[sequelize.fn('COUNT', sequelize.col('Order.id')), 'DESC']],
    limit: 10
  });

  return demand.map(d => ({
    pickupSlotId: d.get('pickup_slot_id'),
    startTime: d.pickupSlot?.start_time,
    endTime: d.pickupSlot?.end_time,
    orderCount: parseInt(d.get('orderCount'), 10)
  }));
}

async function getShopkeeperWaste(shopkeeperUserId) {
  const { getAssignedFoodCourtIds } = require('../utils/authz');
  const foodCourtIds = await getAssignedFoodCourtIds(shopkeeperUserId);
  if (!foodCourtIds || foodCourtIds.length === 0) return { totalPrepared: 0, totalWasted: 0, wasteByItem: [] };

  const [aggregates, byItem] = await Promise.all([
    FoodWaste.findOne({
      attributes: [
        [sequelize.fn('SUM', sequelize.col('prepared_quantity')), 'totalPrepared'],
        [sequelize.fn('SUM', sequelize.col('wasted_quantity')), 'totalWasted']
      ],
      where: { food_court_id: foodCourtIds }
    }),
    FoodWaste.findAll({
      attributes: [
        'food_item_id',
        [sequelize.fn('SUM', sequelize.col('prepared_quantity')), 'prepared'],
        [sequelize.fn('SUM', sequelize.col('wasted_quantity')), 'wasted']
      ],
      include: [{ model: FoodItem, as: 'foodItem', attributes: ['name'] }],
      where: { food_court_id: foodCourtIds },
      group: ['food_item_id', 'foodItem.id'],
      order: [[sequelize.fn('SUM', sequelize.col('wasted_quantity')), 'DESC']],
      limit: 10
    })
  ]);

  return {
    totalPrepared: parseInt(aggregates?.get('totalPrepared') || 0, 10),
    totalWasted: parseInt(aggregates?.get('totalWasted') || 0, 10),
    wasteByItem: byItem.map(i => ({
      foodItemId: i.get('food_item_id'),
      name: i.foodItem?.name,
      prepared: parseInt(i.get('prepared'), 10),
      wasted: parseInt(i.get('wasted'), 10)
    }))
  };
}

module.exports = {
  getAdminOverview,
  getAdminRevenue,
  getAdminOrders,
  getAdminFoodCourts,
  getAdminPopularFood,
  getAdminPeakHours,
  getShopkeeperOverview,
  getShopkeeperOrders,
  getShopkeeperRevenue,
  getShopkeeperPopularFood,
  getShopkeeperPickupDemand,
  getShopkeeperWaste
};
