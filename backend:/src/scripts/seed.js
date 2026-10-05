/**
 * University Food Pre-Booking System — Database Seed
 *
 * Creates realistic demo data based on the actual food courts and menus
 * provided by the university. All passwords are hashed and must be changed
 * for production. Do NOT use real personal information.
 *
 * Usage: npm run seed
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const {
  sequelize,
  User,
  FoodCourt,
  ShopkeeperAssignment,
  FoodItem,
  PickupSlot,
} = require('../models');

const PASS = 'Password123!';

// ─── Food Courts ─────────────────────────────────────────────────────────────
// 10 food courts as per project requirement
const FOOD_COURTS = [
  { name: 'BH-1 Food Court', description: 'Main hostel food court with diverse cuisines', location: 'BH-1 Block, Near Hostels', opening_time: '09:30:00', closing_time: '21:00:00' },
  { name: 'Central Mess Food Court', description: 'Near the central mess, multiple shops', location: 'Central Mess Building', opening_time: '09:30:00', closing_time: '21:00:00' },
  { name: 'N.K Food Court', description: 'Comprehensive multi-cuisine food court', location: 'N.K Block, Main Campus', opening_time: '09:30:00', closing_time: '21:00:00' },
  { name: 'Engineering Block Canteen', description: 'Waffle, snacks and quick bites near engineering block', location: 'Engineering Block', opening_time: '09:30:00', closing_time: '21:00:00' },
  { name: 'Library Cafe', description: 'Quiet cafe near the library for study breaks', location: 'Main Library Building', opening_time: '09:30:00', closing_time: '20:00:00' },
  { name: 'Sports Complex Canteen', description: 'Quick energy bites near the sports complex', location: 'Sports Complex, East Wing', opening_time: '09:30:00', closing_time: '19:00:00' },
  { name: 'Medical Block Cafeteria', description: 'Healthy food options near the medical department', location: 'Medical Block, Ground Floor', opening_time: '09:30:00', closing_time: '18:00:00' },
  { name: 'MBA Block Food Court', description: 'Premium food court near management block', location: 'MBA Block, Level 1', opening_time: '09:30:00', closing_time: '21:00:00' },
  { name: 'New Campus Canteen', description: 'Food court serving the new campus expansion', location: 'New Campus, Block C', opening_time: '09:30:00', closing_time: '20:00:00' },
  { name: 'Research Park Cafe', description: 'Cafe near the research and innovation park', location: 'Research Park, Innovation Hub', opening_time: '09:30:00', closing_time: '20:00:00' },
];

// ─── Menu Data ───────────────────────────────────────────────────────────────
// Real menu items from the provided dataset, organized by food court index

const MENUS = {
  // BH-1 Food Court (index 0)
  0: [
    // Amritsari Kulcha — Soya Tandoori Items
    { name: 'Spl. Malai Chaap', category: 'Soya Tandoori', price: 99, qty: 50 },
    { name: 'Spl. Punjabi Chaap', category: 'Soya Tandoori', price: 99, qty: 50 },
    { name: 'Spl. Afghani Chaap', category: 'Soya Tandoori', price: 99, qty: 40 },
    { name: 'Spl. Lemon Chaap', category: 'Soya Tandoori', price: 99, qty: 40 },
    { name: 'Spl. Khilafa Chaap', category: 'Soya Tandoori', price: 99, qty: 30 },
    { name: 'Spl. Stuffed Chaap', category: 'Soya Tandoori', price: 99, qty: 30 },
    { name: 'Pure Veg. Chicken Tikka Chaap', category: 'Soya Tandoori', price: 99, qty: 40 },
    { name: 'Pure Veg. Fish Tikka Chaap', category: 'Soya Tandoori', price: 99, qty: 40 },
    { name: 'Pure Veg. Tandoori Leg', category: 'Soya Tandoori', price: 110, qty: 30 },
    { name: 'Pure Veg. Tandoori Chaap', category: 'Soya Tandoori', price: 99, qty: 50 },
    { name: 'Spl. Aachari Chaap', category: 'Soya Tandoori', price: 99, qty: 40 },
    { name: 'Spl. Pudina Chaap', category: 'Soya Tandoori', price: 99, qty: 40 },
    { name: 'Spl. Chilli Garlic Chaap', category: 'Soya Tandoori', price: 99, qty: 40 },
    // Tikka Items
    { name: 'Mushroom Tikka', category: 'Tikka', price: 99, qty: 30 },
    { name: 'Paneer Tikka', category: 'Tikka', price: 99, qty: 40 },
    { name: 'Aachari Paneer Tikka', category: 'Tikka', price: 99, qty: 30 },
    // Tandoori Combos
    { name: 'Malai Chaap + Butter Naan', category: 'Tandoori Combos', price: 110, qty: 40 },
    { name: 'Afghani Chaap + Butter Naan', category: 'Tandoori Combos', price: 110, qty: 30 },
    { name: 'Tandoori Chaap + Butter Naan', category: 'Tandoori Combos', price: 110, qty: 30 },
    // Gravy Combos
    { name: 'Tawa Chaap + Butter Naan', category: 'Gravy Combos', price: 120, qty: 30 },
    { name: 'Butter Chicken Chaap + Butter Naan', category: 'Gravy Combos', price: 120, qty: 30 },
    { name: 'Paneer Butter Masala + Butter Naan', category: 'Paneer Combos', price: 120, qty: 30 },
    { name: 'Shahi Paneer + Butter Naan', category: 'Paneer Combos', price: 120, qty: 30 },
    // Rolls
    { name: 'Malai Chaap Roll', category: 'Soya Tandoori Rolls', price: 80, qty: 60 },
    { name: 'Afghani Chaap Roll', category: 'Soya Tandoori Rolls', price: 80, qty: 50 },
    { name: 'Punjabi Chaap Roll', category: 'Soya Tandoori Rolls', price: 80, qty: 50 },
    { name: 'Lemon Chaap Roll', category: 'Soya Tandoori Rolls', price: 80, qty: 50 },
    // Thali
    { name: 'Amritsari Aloo Kulcha + Channe + Raita', category: 'Thali Special', price: 80, qty: 40 },
    { name: 'Amritsari Paneer Kulcha + Channe + Raita', category: 'Thali Special', price: 110, qty: 30 },
    // Breads
    { name: 'Butter Naan', category: 'Breads', price: 30, qty: 100 },
    { name: 'Garlic Naan', category: 'Breads', price: 40, qty: 80 },
    { name: 'Paneer Naan', category: 'Breads', price: 60, qty: 40 },
    // HUNGRY PANDA
    { name: 'Margherita Pizza (M)', category: 'Pizza', price: 120, qty: 30 },
    { name: 'Margherita Pizza (L)', category: 'Pizza', price: 270, qty: 20 },
    { name: 'Classic Paneer Pizza (M)', category: 'Pizza', price: 140, qty: 25 },
    { name: 'BBQ Paneer Pizza (L)', category: 'Pizza', price: 290, qty: 20 },
    { name: 'Mexican Fiesta Pizza (L)', category: 'Pizza', price: 290, qty: 15 },
    { name: 'Mac & Cheese Pizza (L)', category: 'Pizza', price: 330, qty: 15 },
    { name: 'Classic Veg Chivito', category: 'Chivito', price: 130, qty: 25 },
    { name: 'Crispy Paneer Chivito', category: 'Chivito', price: 160, qty: 20 },
    { name: 'Smoky BBQ Paneer Chivito', category: 'Chivito', price: 190, qty: 20 },
    { name: 'Classic Pita Platter', category: 'Pita', price: 180, qty: 15 },
    { name: 'Classic Veg Footlong (H)', category: 'Footlong', price: 70, qty: 40 },
    { name: 'Classic Paneer Footlong (H)', category: 'Footlong', price: 90, qty: 30 },
    { name: 'Veg Burrito (H)', category: 'Burrito', price: 90, qty: 30 },
    { name: 'Paneer Burrito (H)', category: 'Burrito', price: 100, qty: 25 },
    { name: 'Classic Salt & Pepper Fries (H)', category: 'Fries', price: 90, qty: 50 },
    { name: 'Peri Peri Fries (H)', category: 'Fries', price: 90, qty: 50 },
    { name: 'Black Magic Fries (H)', category: 'Fries', price: 180, qty: 20 },
    // MASTER CHEF KITCHEN
    { name: 'Veg Noodle (H)', category: 'Noodles', price: 50, qty: 60 },
    { name: 'Paneer Noodle', category: 'Noodles', price: 100, qty: 30 },
    { name: 'Hakka Noodle', category: 'Noodles', price: 90, qty: 35 },
    { name: 'Noodles + Manchurian', category: 'Combos', price: 90, qty: 30 },
    { name: 'MCK Spl. Combo', category: 'Combos', price: 140, qty: 20 },
    { name: 'Aloo Tikki Burger', category: 'Burger', price: 40, qty: 60 },
    { name: 'Paneer Burger', category: 'Burger', price: 60, qty: 40 },
    { name: 'MCK Spl. Burger', category: 'Burger', price: 80, qty: 30 },
    { name: 'Veg Steam Momos', category: 'Momos', price: 50, qty: 60 },
    { name: 'Veg Fried Momos', category: 'Momos', price: 60, qty: 50 },
    { name: 'Paneer Steam Momos', category: 'Momos', price: 80, qty: 40 },
    { name: 'Kurkure Momos', category: 'Momos', price: 70, qty: 40 },
    { name: 'Masala Fries (H)', category: 'Snacks', price: 50, qty: 80 },
    { name: 'Chilly Potato (H)', category: 'Snacks', price: 60, qty: 60 },
    { name: 'Honey Chilly (H)', category: 'Snacks', price: 60, qty: 60 },
    { name: 'Paneer Chilly (H)', category: 'Snacks', price: 90, qty: 30 },
    // Tripti by Meall - South Indian
    { name: 'Plain Dosa', category: 'Dosa & Idli', price: 50, qty: 50 },
    { name: 'Masala Dosa + Chutney', category: 'Dosa & Idli', price: 60, qty: 50 },
    { name: 'Paneer Dosa + Chutney', category: 'Dosa & Idli', price: 90, qty: 30 },
    { name: 'Idli + Chutney (3 Pcs)', category: 'Dosa & Idli', price: 40, qty: 60 },
    { name: 'Onion Vada', category: 'South Snacks', price: 10, qty: 100 },
    { name: 'Medu Vada', category: 'South Snacks', price: 10, qty: 80 },
    // Veggie Grill
    { name: 'Aloo Tikki Burger (VG)', category: 'Burger', price: 40, qty: 60 },
    { name: 'Cheese Burger', category: 'Burger', price: 50, qty: 50 },
    { name: 'Maharaja Burger', category: 'Burger', price: 70, qty: 30 },
    { name: 'Red Sauce Pasta', category: 'Pasta', price: 70, qty: 30 },
    { name: 'White Sauce Pasta', category: 'Pasta', price: 70, qty: 30 },
    { name: 'Veggie Delight Wrap', category: 'Wraps', price: 50, qty: 40 },
    { name: 'Paneer Makhani Wrap', category: 'Wraps', price: 80, qty: 30 },
    // Vrindavan Food
    { name: 'Chana Bhatura', category: 'Chaat / North Indian', price: 70, qty: 40 },
    { name: 'Aloo Puri', category: 'Chaat / North Indian', price: 70, qty: 40 },
    { name: 'Pav Bhaji', category: 'Fast Food', price: 70, qty: 50 },
    { name: 'Mix Pakoda', category: 'Snacks', price: 50, qty: 60 },
    { name: 'Poha', category: 'Breakfast', price: 50, qty: 50 },
    // Campus Fusion
    { name: 'Noodles (H)', category: 'Chinese', price: 50, qty: 60 },
    { name: 'Manchurian (H)', category: 'Chinese', price: 60, qty: 50 },
    { name: 'Honey Chilli Potato (H)', category: 'Chinese', price: 60, qty: 50 },
    { name: 'Chilli Paneer', category: 'Chinese', price: 100, qty: 30 },
    { name: 'Momos (8 pcs)', category: 'Chinese', price: 60, qty: 60 },
    { name: 'Paneer Momos (8 pcs)', category: 'Chinese', price: 80, qty: 40 },
    { name: 'Noodles + Chilli Paneer', category: 'Chinese Combo', price: 130, qty: 20 },
    { name: 'Noodles + Manchurian', category: 'Chinese Combo', price: 100, qty: 30 },
    // PAKKA ADDA
    { name: 'Plain Burger (PA)', category: 'Burgers', price: 30, qty: 80 },
    { name: 'Aloo Tikki Burger (PA)', category: 'Burgers', price: 39, qty: 70 },
    { name: 'Double Cheese Burger', category: 'Burgers', price: 69, qty: 40 },
    { name: 'Paneer Patty Burger', category: 'Burgers', price: 89, qty: 30 },
    { name: 'Jumbo Burger', category: 'Burgers', price: 79, qty: 30 },
    { name: 'Veg Grilled Sandwich (H)', category: 'Sandwich', price: 40, qty: 50 },
    { name: 'Cheese Corn Sandwich (H)', category: 'Sandwich', price: 49, qty: 40 },
    { name: 'Paneer Bhurji Sandwich (H)', category: 'Sandwich', price: 79, qty: 30 },
    { name: 'White Sauce Pasta (PA)', category: 'Pasta', price: 69, qty: 30 },
    { name: 'Tandoori Pasta', category: 'Pasta', price: 89, qty: 25 },
    { name: 'Paneer Tikka Pasta', category: 'Pasta', price: 99, qty: 20 },
    { name: 'Plain Jalebi', category: 'Jalebi', price: 40, qty: 40 },
    { name: 'Dahi Jalebi', category: 'Jalebi', price: 60, qty: 30 },
    { name: 'Aloo Tikki Burger + Fries + Coke', category: 'Combo', price: 100, qty: 30 },
    // Hangouts - South Indian
    { name: 'Plain Dosa (Hangouts)', category: 'Dosa', price: 50, qty: 60 },
    { name: 'Masala Dosa (Hangouts)', category: 'Dosa', price: 70, qty: 50 },
    { name: 'Mysore Masala Dosa', category: 'Dosa', price: 90, qty: 30 },
    { name: 'Paneer Rava Dosa', category: 'Dosa', price: 120, qty: 25 },
    { name: 'Paneer Set Dosa (2 pcs)', category: 'Dosa', price: 120, qty: 20 },
    { name: 'Plain Uttapam', category: 'Uttapam', price: 70, qty: 30 },
    { name: 'Idli (4 pcs)', category: 'Idli', price: 50, qty: 60 },
    { name: 'Fried Idli (3 pcs)', category: 'Idli', price: 70, qty: 30 },
    { name: 'Medhu Vada (3 pcs)', category: 'Vada', price: 60, qty: 40 },
    { name: 'Upma', category: 'Upma', price: 50, qty: 40 },
    { name: 'Pongal', category: 'Specials', price: 70, qty: 30 },
    { name: 'Mirchi Bajji', category: 'Specials', price: 20, qty: 60 },
  ],

  // Central Mess Food Court (index 1)
  1: [
    // LOVELY BAKE STUDIO
    { name: 'Espresso Shot', category: 'Hot Coffee', price: 95, qty: 50 },
    { name: 'Black Coffee', category: 'Hot Coffee', price: 115, qty: 40 },
    { name: 'Cappuccino', category: 'Hot Coffee', price: 125, qty: 60 },
    { name: 'Hot Chocolate', category: 'Hot Coffee', price: 125, qty: 40 },
    { name: 'Hazelnut Cappuccino', category: 'Hot Coffee', price: 145, qty: 30 },
    { name: 'Caramel Mocha', category: 'Hot Coffee', price: 145, qty: 30 },
    { name: 'Lovely Cold Coffee', category: 'Cold Coffee', price: 130, qty: 50 },
    { name: 'Lovely Frappe', category: 'Cold Coffee', price: 150, qty: 40 },
    { name: 'Choco Frappe', category: 'Cold Coffee', price: 165, qty: 35 },
    { name: 'Caramel Frappe', category: 'Cold Coffee', price: 165, qty: 30 },
    { name: 'Tiramisu Frappe', category: 'Cold Coffee', price: 165, qty: 25 },
    { name: 'Kesar Elaichi Shake', category: 'Signature Shakes', price: 145, qty: 30 },
    { name: 'Brownie Blast Shake', category: 'Signature Shakes', price: 185, qty: 25 },
    { name: 'Kit Kat Shake', category: 'Signature Shakes', price: 185, qty: 25 },
    { name: 'Oreo Shake', category: 'Signature Shakes', price: 185, qty: 30 },
    { name: 'Monday Blue Mocktail', category: 'Mocktails', price: 165, qty: 20 },
    { name: 'Pina Colada', category: 'Mocktails', price: 165, qty: 20 },
    { name: 'Lemon Ice Tea', category: 'Ice Tea', price: 95, qty: 40 },
    { name: 'Peach Ice Tea', category: 'Ice Tea', price: 95, qty: 35 },
    { name: 'Masala Tea', category: 'Tea', price: 45, qty: 80 },
    { name: 'Chocolate Shake', category: 'Shakes', price: 105, qty: 40 },
    { name: 'Strawberry Shake', category: 'Shakes', price: 105, qty: 35 },
    { name: 'Mango Shake', category: 'Shakes', price: 105, qty: 40 },
    { name: 'Vanilla Fudge Sundae', category: 'Desserts', price: 120, qty: 25 },
    { name: 'Hot Brownie Sundae', category: 'Desserts', price: 160, qty: 20 },
    { name: 'Fresh Lime Soda', category: 'Coolers', price: 105, qty: 50 },
    { name: 'Masala Lemonade', category: 'Coolers', price: 105, qty: 45 },
    { name: 'Pink Lemonade', category: 'Coolers', price: 125, qty: 35 },
    { name: 'Classic Virgin Mojito', category: 'Mojitos', price: 135, qty: 40 },
    { name: 'Watermelon Mojito', category: 'Mojitos', price: 135, qty: 35 },
    { name: 'Peach Mojito', category: 'Mojitos', price: 135, qty: 30 },
    { name: 'Chilli Thai Fries', category: 'Chinese', price: 100, qty: 40 },
    { name: 'Honey Chilli Potato (LBS)', category: 'Chinese', price: 140, qty: 35 },
    { name: 'Veg. Manchurian (LBS)', category: 'Chinese', price: 150, qty: 30 },
    { name: 'Lemon Paneer', category: 'Chinese', price: 180, qty: 20 },
    { name: 'Veg. Noodles (LBS)', category: 'Noodles', price: 100, qty: 40 },
    { name: 'Chilli Garlic Noodles (LBS)', category: 'Noodles', price: 130, qty: 30 },
    { name: 'Paneer Noodles (LBS)', category: 'Noodles', price: 150, qty: 25 },
    { name: 'Penne Red Sauce', category: 'Pasta', price: 200, qty: 20 },
    { name: 'Penne White Sauce', category: 'Pasta', price: 200, qty: 20 },
    { name: 'Veg. N Corn Sandwich (LBS)', category: 'Grilled Sandwich', price: 120, qty: 30 },
    { name: 'Masala Paneer Tikka Sandwich', category: 'Grilled Sandwich', price: 160, qty: 25 },
    // NESCAFE
    { name: 'Veg Cheese Sandwich', category: 'Sandwich', price: 90, qty: 40 },
    { name: 'Chipotle Paneer Sandwich', category: 'Sandwich', price: 140, qty: 25 },
    { name: 'Salted Fries (NS)', category: 'Fries', price: 90, qty: 60 },
    { name: 'Masala / Peri Peri Fries (NS)', category: 'Fries', price: 90, qty: 60 },
    { name: 'Cheesy Fries', category: 'Fries', price: 100, qty: 40 },
    { name: 'Loaded Fries', category: 'Fries', price: 130, qty: 30 },
    { name: 'Onion Rings', category: 'Fries', price: 80, qty: 40 },
    { name: 'Virgin Mojito (NS)', category: 'Mojito', price: 70, qty: 50 },
    { name: 'Watermelon Mojito (NS)', category: 'Mojito', price: 70, qty: 40 },
    { name: 'White Sauce Pasta (NS)', category: 'Pasta', price: 110, qty: 30 },
    { name: 'Aloo Tikki Wrap (NS)', category: 'Wrap', price: 70, qty: 40 },
    { name: 'Paneer Wrap (NS)', category: 'Wrap', price: 90, qty: 35 },
    { name: 'Chocolate Krusher', category: 'Krusher', price: 90, qty: 35 },
    { name: 'Mango Alphonso Krusher', category: 'Krusher', price: 90, qty: 30 },
    { name: 'Kit-Kat Krusher', category: 'Krusher', price: 100, qty: 25 },
    { name: 'Iced Latte', category: 'Cold Coffee', price: 90, qty: 40 },
    { name: 'Classic Cold Coffee (NS)', category: 'Cold Coffee', price: 90, qty: 45 },
    { name: 'Veg Cheese Burger (NS)', category: 'Burger', price: 60, qty: 50 },
    { name: 'Mac-Paneer Burger', category: 'Burger', price: 100, qty: 30 },
    { name: 'Paneer Tikka Sub', category: 'Sub', price: 90, qty: 30 },
    // CHAAT CURRENT
    { name: 'Bhel Puri', category: 'Bhel Puri', price: 50, qty: 60 },
    { name: 'Dahi Puri', category: 'Bhel Puri', price: 60, qty: 50 },
    { name: 'Masala Puri', category: 'Bhel Puri', price: 60, qty: 50 },
    { name: 'Dahi Papdi Chaat', category: 'Chaat', price: 60, qty: 40 },
    { name: 'Dahi Bhalla Chaat', category: 'Chaat', price: 60, qty: 40 },
    { name: 'Raj Kachori Chaat', category: 'Chaat', price: 60, qty: 30 },
    { name: 'Aloo Tikki with Channa', category: 'Aloo Tikki', price: 60, qty: 50 },
    { name: 'Sabudana Tikki', category: 'Aloo Tikki', price: 60, qty: 40 },
    { name: 'Chole Bhature (CC)', category: 'Snacks', price: 60, qty: 40 },
    { name: 'Pav Bhaji (CC)', category: 'Snacks', price: 60, qty: 40 },
    { name: 'Vada Pav', category: 'Snacks', price: 30, qty: 80 },
    // Kitchen Elle
    { name: 'Special Thali', category: 'Thali', price: 140, qty: 30 },
    { name: 'Normal Thali', category: 'Thali', price: 120, qty: 40 },
    { name: 'Paneer + Veg Pulao', category: 'Rice & Pulao', price: 145, qty: 25 },
    { name: 'Dal + Rice', category: 'Rice & Pulao', price: 85, qty: 50 },
    { name: 'Rajmah + Rice', category: 'Rice & Pulao', price: 85, qty: 45 },
    { name: 'Veg Pulao + Raita', category: 'Rice & Pulao', price: 100, qty: 35 },
    { name: 'Paneer Bhurji (KE)', category: 'Main Course', price: 75, qty: 30 },
    { name: 'Paneer Gravy (KE)', category: 'Main Course', price: 75, qty: 30 },
    { name: 'Tawa Roti', category: 'Tawa Se', price: 10, qty: 200 },
    { name: 'Aloo Prantha', category: 'Tawa Se', price: 45, qty: 50 },
    { name: 'Paneer Prantha', category: 'Tawa Se', price: 65, qty: 35 },
    // South City Cafe
    { name: 'Plain Dosa (SCC)', category: 'Dosa', price: 60, qty: 50 },
    { name: 'Masala Dosa (SCC)', category: 'Dosa', price: 80, qty: 40 },
    { name: 'Ghee Podi Plain Dosa', category: 'Dosa', price: 90, qty: 30 },
    { name: 'Mysore Masala Dosa (SCC)', category: 'Dosa', price: 120, qty: 25 },
    { name: 'South City Spl. Dosa', category: 'Dosa', price: 200, qty: 15 },
    { name: 'Plain Idli (4 pcs) (SCC)', category: 'Idli', price: 50, qty: 60 },
    { name: 'Ghee Podi Idli (3 pcs)', category: 'Idli', price: 70, qty: 40 },
    { name: 'Fried Idli (SCC)', category: 'Idli', price: 80, qty: 30 },
    { name: 'Onion Uttapam (SCC)', category: 'Uttapam', price: 80, qty: 35 },
    { name: 'Paneer Uttapam (SCC)', category: 'Uttapam', price: 110, qty: 25 },
    { name: 'Medhu Vada (SCC)', category: 'Snacks', price: 60, qty: 50 },
    { name: 'Sweet Lassi', category: 'Beverages', price: 50, qty: 60 },
    { name: 'Kesar Milk', category: 'Beverages', price: 100, qty: 30 },
  ],

  // N.K Food Court (index 2)
  2: [
    // Dal & Sabzi
    { name: 'Mix Veg', category: 'Dal & Sabzi', price: 90, qty: 40 },
    { name: 'Aloo Jeera', category: 'Dal & Sabzi', price: 65, qty: 50 },
    { name: 'Gobhi Masala', category: 'Dal & Sabzi', price: 95, qty: 35 },
    { name: 'Banarasi Dum Aloo', category: 'Dal & Sabzi', price: 110, qty: 30 },
    { name: 'Bhindi Masala', category: 'Dal & Sabzi', price: 100, qty: 30 },
    { name: 'Palak Paneer (NK)', category: 'Dal & Sabzi', price: 90, qty: 35 },
    { name: 'Kadhi Pakora', category: 'Dal & Sabzi', price: 45, qty: 60 },
    { name: 'Dal Makhani (NK)', category: 'Dal & Sabzi', price: 65, qty: 50 },
    { name: 'Yellow Dal', category: 'Dal & Sabzi', price: 45, qty: 70 },
    { name: 'Rajma Tadka', category: 'Dal & Sabzi', price: 60, qty: 50 },
    { name: 'Nutri Masala', category: 'Dal & Sabzi', price: 90, qty: 30 },
    { name: 'Soya Achari Champ', category: 'Dal & Sabzi', price: 120, qty: 25 },
    { name: 'Kadahi Mushroom', category: 'Dal & Sabzi', price: 135, qty: 20 },
    { name: 'Mushroom Masala', category: 'Dal & Sabzi', price: 140, qty: 20 },
    // Paneer Special
    { name: 'Shahi Paneer (NK)', category: 'Paneer Special', price: 145, qty: 30 },
    { name: 'Kadahi Paneer (NK)', category: 'Paneer Special', price: 140, qty: 30 },
    { name: 'Palak Paneer (NK2)', category: 'Paneer Special', price: 130, qty: 35 },
    { name: 'Paneer Butter Masala (NK)', category: 'Paneer Special', price: 140, qty: 30 },
    { name: 'Paneer Lababdar (NK)', category: 'Paneer Special', price: 145, qty: 25 },
    { name: 'Paneer Bhurji (NK)', category: 'Paneer Special', price: 150, qty: 25 },
    // Indian Breads
    { name: 'Tawa Roti (NK)', category: 'Indian Breads', price: 7, qty: 200 },
    { name: 'Tandoori Roti', category: 'Indian Breads', price: 12, qty: 150 },
    { name: 'Butter Naan (NK)', category: 'Indian Breads', price: 35, qty: 100 },
    { name: 'Garlic Naan (NK)', category: 'Indian Breads', price: 45, qty: 80 },
    { name: 'Stuffed Kulcha', category: 'Indian Breads', price: 55, qty: 40 },
    // Salad & Raita
    { name: 'Boondi Raita', category: 'Salad & Raita', price: 35, qty: 60 },
    { name: 'Plain Curd', category: 'Salad & Raita', price: 35, qty: 80 },
    // Thali
    { name: 'Normal Thali (NK)', category: 'Thali & Rice Meals', price: 100, qty: 50 },
    { name: 'N.K Special Thali', category: 'Thali & Rice Meals', price: 150, qty: 30 },
    { name: 'Rajmah Rice (NK)', category: 'Thali & Rice Meals', price: 80, qty: 60 },
    { name: 'Dal Rice (NK)', category: 'Thali & Rice Meals', price: 80, qty: 70 },
    { name: 'Chana Bhatura (NK)', category: 'Thali & Rice Meals', price: 80, qty: 40 },
    // Rice
    { name: 'Plain Rice (NK)', category: 'Rice Dishes', price: 45, qty: 100 },
    { name: 'Jeera Rice', category: 'Rice Dishes', price: 50, qty: 80 },
    { name: 'Veg Biryani (NK)', category: 'Rice Dishes', price: 90, qty: 40 },
    { name: 'Paneer Biryani (NK)', category: 'Rice Dishes', price: 115, qty: 30 },
    { name: 'Paneer Fried Rice', category: 'Rice Dishes', price: 115, qty: 25 },
    // Desserts
    { name: 'Spl. Gulab Jamun 2pc', category: 'Desserts', price: 45, qty: 50 },
    { name: 'Rabdi Shots', category: 'Desserts', price: 60, qty: 30 },
    // Hot Sips
    { name: 'Special Tea', category: 'Hot Sips', price: 15, qty: 100 },
    { name: 'Hot Coffee (NK)', category: 'Hot Sips', price: 35, qty: 60 },
    { name: 'Bournvita Milk', category: 'Hot Sips', price: 50, qty: 40 },
    // Beat the Heat
    { name: 'Nimbu Paani', category: 'Beat the Heat', price: 27, qty: 80 },
    { name: 'Spl. Sweet Lassi', category: 'Beat the Heat', price: 55, qty: 60 },
    { name: 'Mango Lassi', category: 'Beat the Heat', price: 65, qty: 50 },
    // Milk Shakes
    { name: 'Banana Shake (NK)', category: 'Milk Shakes', price: 60, qty: 40 },
    { name: 'Mango Shake (NK)', category: 'Milk Shakes', price: 70, qty: 40 },
    { name: 'Cold Coffee (NK)', category: 'Milk Shakes', price: 75, qty: 50 },
    { name: 'Oreo Shake (NK)', category: 'Milk Shakes', price: 85, qty: 35 },
    { name: 'Kitkat Shake (NK)', category: 'Milk Shakes', price: 75, qty: 35 },
    // Mocktails
    { name: 'Virgin Mojito (NK)', category: 'Mocktails', price: 90, qty: 40 },
    { name: 'Blue Lagoon', category: 'Mocktails', price: 90, qty: 30 },
    // Chaat
    { name: 'Golgappe (6 Pcs)', category: 'Chaat Bhandar', price: 40, qty: 80 },
    { name: 'Aloo Tikki Chaat (NK)', category: 'Chaat Bhandar', price: 65, qty: 50 },
    { name: 'Bhel Puri (NK)', category: 'Chaat Bhandar', price: 65, qty: 50 },
    { name: 'Papri Chaat', category: 'Chaat Bhandar', price: 65, qty: 40 },
    { name: 'Dahi Bhalla (NK)', category: 'Chaat Bhandar', price: 65, qty: 40 },
    { name: 'Samosa', category: 'Chaat Bhandar', price: 15, qty: 80 },
    { name: 'Pav Bhaji (NK)', category: 'Chaat Bhandar', price: 80, qty: 40 },
    // Chinese
    { name: 'Desi Chowmein', category: 'Chinese', price: 90, qty: 40 },
    { name: 'Hakka Noodles (NK)', category: 'Chinese', price: 100, qty: 35 },
    { name: 'Chilly Paneer (Dry/Gravy)', category: 'Chinese', price: 150, qty: 25 },
    { name: 'Honey Potato Chilly', category: 'Chinese', price: 110, qty: 35 },
    // Burger & Wraps
    { name: 'N.K Veggie Burger', category: 'Burger & Wraps', price: 60, qty: 50 },
    { name: 'Cheese Burger (NK)', category: 'Burger & Wraps', price: 80, qty: 40 },
    { name: 'Vegetable Wrap (NK)', category: 'Burger & Wraps', price: 90, qty: 35 },
    { name: 'Paneer Wrap (NK)', category: 'Burger & Wraps', price: 100, qty: 30 },
    // South Indian
    { name: 'Masala Dosa (NK)', category: 'South Indian', price: 90, qty: 40 },
    { name: 'Paneer Dosa (NK)', category: 'South Indian', price: 120, qty: 25 },
    { name: 'Lemon Rice', category: 'South Indian', price: 100, qty: 30 },
    // Pizza & Pasta
    { name: 'Veggie Blast Pizza 8"', category: 'Pizza, Pasta & Sides', price: 185, qty: 20 },
    { name: 'Paneer Makhni Pizza 8"', category: 'Pizza, Pasta & Sides', price: 195, qty: 20 },
    { name: 'Red Sauce Pasta (NK)', category: 'Pizza, Pasta & Sides', price: 130, qty: 25 },
    { name: 'French Fries (NK)', category: 'Pizza, Pasta & Sides', price: 75, qty: 60 },
    // Toast & Sandwiches
    { name: 'Bread Butter Toast', category: 'Toast & Sandwiches', price: 60, qty: 60 },
    { name: 'Veg Grilled Sandwich (NK)', category: 'Toast & Sandwiches', price: 90, qty: 40 },
    { name: 'Spicy Paneer Grilled Sandwich', category: 'Toast & Sandwiches', price: 120, qty: 30 },
    { name: 'Creamy Paneer Sandwich', category: 'Toast & Sandwiches', price: 130, qty: 25 },
    // Power Meals
    { name: 'Nutri Sandwich', category: 'Power Meals', price: 100, qty: 30 },
    { name: 'Nutri Pulao with Curd', category: 'Power Meals', price: 105, qty: 25 },
    { name: 'Paneer Tikka Rice Bowl', category: 'Power Meals', price: 155, qty: 20 },
  ],

  // Engineering Block (index 3) - Belgian Waffle Express and other shops
  3: [
    // The Belgian Waffle Express
    { name: 'Chocolate Overdose Waffle', category: 'Double Chocolate', price: 100, qty: 30 },
    { name: 'Dark & White Fairys Waffle', category: 'Double Chocolate', price: 100, qty: 30 },
    { name: 'Nuclear Nutella Waffle', category: 'Double Chocolate', price: 120, qty: 25 },
    { name: 'Strawberry Waffle', category: 'Fruits Filling', price: 120, qty: 30 },
    { name: 'Mango Waffle', category: 'Fruits Filling', price: 120, qty: 25 },
    { name: 'Belgian Chocolate Waffle', category: 'Chocolate', price: 100, qty: 35 },
    { name: 'KitKat Crunch Waffle', category: 'Chocolate', price: 110, qty: 30 },
    { name: 'Butterscotch Waffle', category: 'Chocolate', price: 100, qty: 30 },
    { name: 'Fudge Ice-Cream Waffle Sundae', category: 'Waffle Sundae', price: 120, qty: 20 },
    { name: 'Heavy Weight Waffle Sundae', category: 'Waffle Sundae', price: 150, qty: 15 },
    // Snack Bar
    { name: 'Veg Crispy Burger (SB)', category: 'Burger', price: 60, qty: 50 },
    { name: 'Mushroom Burger (SB)', category: 'Burger', price: 70, qty: 40 },
    { name: 'Paneer Tikka Burger (SB)', category: 'Burger', price: 90, qty: 35 },
    { name: 'Mexican Burger (SB)', category: 'Burger', price: 110, qty: 25 },
    { name: 'Veg Sandwich (SB)', category: 'Sandwich', price: 90, qty: 40 },
    { name: 'Paneer Tikka Sandwich (SB)', category: 'Sandwich', price: 110, qty: 30 },
    { name: 'French Fries (SB)', category: 'Quickers', price: 80, qty: 60 },
    { name: 'Peri-Peri Fries (SB)', category: 'Quickers', price: 85, qty: 55 },
    { name: 'Masala Fries (SB)', category: 'Quickers', price: 90, qty: 50 },
    { name: 'Salty Sprinkle Potatoes', category: 'Quickers', price: 40, qty: 80 },
    { name: 'Cheese Sprinkle Potatoes', category: 'Quickers', price: 90, qty: 35 },
    { name: 'Veg Wrap (SB)', category: 'Wrap', price: 60, qty: 50 },
    { name: 'Paneer Wrap (SB)', category: 'Wrap', price: 80, qty: 40 },
    { name: 'Veg Rice (SB)', category: 'Rice Bowl', price: 60, qty: 60 },
    { name: 'Fried Paneer Rice', category: 'Rice Bowl', price: 90, qty: 35 },
    { name: 'Mushroom Rice (SB)', category: 'Rice Bowl', price: 85, qty: 35 },
    { name: 'Margherita Pizza (SB-M)', category: 'Pizza', price: 120, qty: 30 },
    { name: 'Peppy Paneer Pizza (SB-M)', category: 'Pizza', price: 180, qty: 25 },
    { name: 'Veggie Special Pizza (SB-M)', category: 'Pizza', price: 160, qty: 25 },
    { name: 'Paneer Delight Pizza (SB-M)', category: 'Pizza', price: 200, qty: 20 },
    { name: 'Single Topping Small Pizza', category: 'Small Pizza', price: 69, qty: 50 },
    { name: 'Peppy Paneer Small Pizza', category: 'Small Pizza', price: 99, qty: 40 },
    { name: 'Fully Loaded Small Pizza', category: 'Small Pizza', price: 120, qty: 30 },
    { name: 'Cold Coffee (SB)', category: 'Frappe', price: 80, qty: 50 },
    { name: 'Lemon Soda (SB)', category: 'Mojito', price: 60, qty: 60 },
    { name: 'Black Mojito', category: 'Mojito', price: 60, qty: 50 },
    { name: 'Blueberry Mojito (SB)', category: 'Mojito', price: 60, qty: 45 },
    { name: 'Fries + Mojito Combo', category: 'Combo', price: 130, qty: 30 },
    { name: 'Burger + Fries + Mojito Combo', category: 'Combo', price: 190, qty: 25 },
    { name: 'Stuffed Garlic Bread (M)', category: 'SB Special', price: 140, qty: 25 },
    // Oven Express
    { name: 'Aloo Tikki Burger (OE)', category: 'Burger', price: 50, qty: 60 },
    { name: 'Paneer Burger (OE)', category: 'Burger', price: 70, qty: 45 },
    { name: 'Cheese Burger (OE)', category: 'Burger', price: 90, qty: 35 },
    { name: 'Veg Grilled Sandwich (OE)', category: 'Sandwich', price: 100, qty: 40 },
    { name: 'Paneer Cheese Sandwich (OE)', category: 'Sandwich', price: 120, qty: 30 },
    { name: 'Salted Fries (OE)', category: 'Fries', price: 80, qty: 70 },
    { name: 'Peri-Peri Fries (OE)', category: 'Fries', price: 90, qty: 60 },
    { name: 'Margherita Regular Pizza', category: 'Pizza', price: 140, qty: 25 },
    { name: 'Cheese Corn Regular Pizza', category: 'Pizza', price: 150, qty: 25 },
    { name: 'Paneer Regular Pizza', category: 'Pizza', price: 180, qty: 20 },
    { name: 'Cheese Garlic Bread', category: 'Garlic Bread', price: 120, qty: 30 },
    { name: 'Stuffed Garlic Bread (OE)', category: 'Garlic Bread', price: 160, qty: 25 },
    { name: 'Veggie Wrap (OE)', category: 'Wraps', price: 60, qty: 50 },
    { name: 'Paneer Cheese Wrap', category: 'Wraps', price: 120, qty: 30 },
    { name: 'Nugget Rice Bowl', category: 'Rice Bowl', price: 80, qty: 40 },
    { name: 'Paneer Patty Rice Bowl', category: 'Rice Bowl', price: 100, qty: 35 },
    { name: 'Honey Chilly Potato (OE)', category: 'Chinese Starters', price: 80, qty: 50 },
    { name: 'Manchurian Dry/Gravy (OE)', category: 'Chinese Starters', price: 80, qty: 45 },
    { name: 'Veg Momos (OE)', category: 'Chinese', price: 100, qty: 40 },
    { name: 'Fried Momos (OE)', category: 'Chinese', price: 120, qty: 35 },
    { name: 'Veg Noodles (OE)', category: 'Chinese', price: 100, qty: 40 },
    { name: 'Veg Tacos', category: 'Tacos', price: 100, qty: 30 },
    { name: 'Paneer Tacos', category: 'Tacos', price: 120, qty: 25 },
    { name: 'White Sauce Pasta (OE)', category: 'Pasta', price: 120, qty: 30 },
    { name: 'Veg Biryani (OE)', category: 'Biryani', price: 90, qty: 35 },
    { name: 'Paneer Biryani (OE)', category: 'Biryani', price: 120, qty: 25 },
    { name: 'Veg Kathi Roll', category: 'Kathi Rolls', price: 80, qty: 40 },
    { name: 'Paneer Kathi Roll', category: 'Kathi Rolls', price: 110, qty: 30 },
    { name: 'Malai Chaap (OE)', category: 'Chaap', price: 100, qty: 30 },
    { name: 'Afghani Chaap (OE)', category: 'Chaap', price: 100, qty: 25 },
    { name: 'Matar Paneer (OE)', category: 'Indian Main Course', price: 100, qty: 25 },
    { name: 'Kadai Paneer (OE)', category: 'Indian Main Course', price: 100, qty: 25 },
    { name: 'Shahi Paneer (OE)', category: 'Indian Main Course', price: 120, qty: 20 },
    { name: 'Steamed Rice (OE)', category: 'Rice', price: 50, qty: 80 },
    { name: 'Jeera Rice (OE)', category: 'Rice', price: 60, qty: 60 },
    { name: 'Brownie with Ice Cream', category: 'Desserts', price: 120, qty: 20 },
    { name: 'Espresso (OE)', category: 'Hot Coffee', price: 50, qty: 40 },
    { name: 'Cappuccino (OE)', category: 'Hot Coffee', price: 80, qty: 40 },
    { name: 'Cold Coffee (OE)', category: 'Cafe Frappe', price: 100, qty: 50 },
    { name: 'Choco Chip Frappe', category: 'Cafe Frappe', price: 120, qty: 35 },
    // Indian Food
    { name: 'Student Thali', category: 'Thali', price: 90, qty: 50 },
    { name: 'Special Thali (IF)', category: 'Thali', price: 100, qty: 40 },
    { name: 'Aloo Prantha (IF)', category: 'Prantha', price: 35, qty: 60 },
    { name: 'Paneer Prantha (IF)', category: 'Prantha', price: 45, qty: 40 },
    { name: 'Dal Makhni Rice (IF)', category: 'Combo Meal', price: 70, qty: 50 },
    { name: 'Rajma Rice (IF)', category: 'Combo Meal', price: 70, qty: 50 },
    { name: 'Kadai Paneer Rice', category: 'Combo Meal', price: 80, qty: 35 },
    { name: 'Saag-Makki Di Roti', category: 'Combo Meal', price: 80, qty: 30 },
    { name: 'Kulhad Wali Chai', category: 'Roti & Tea Combo', price: 20, qty: 100 },
    // Rolls Empire
    { name: 'Tofu Sandwich (H)', category: 'Zero Oil Veg Sandwich', price: 60, qty: 30 },
    { name: 'Paneer Sandwich (H)', category: 'Zero Oil Veg Sandwich', price: 70, qty: 30 },
    { name: 'Corn Sandwich (H)', category: 'Zero Oil Veg Sandwich', price: 60, qty: 30 },
    { name: 'Aloo Tikki Sandwich (RE)', category: 'Cheat Meal Veg Sandwich', price: 100, qty: 30 },
    { name: 'Paneer Wrap (RE)', category: 'Veg Wrap Zero Oil', price: 100, qty: 30 },
    { name: 'Aloo Tikki Burger (RE)', category: 'Cheat Meal Burger', price: 60, qty: 40 },
    { name: 'Grill Paneer Burger (RE)', category: 'Burger Zero Oil Wheat Bun', price: 100, qty: 30 },
    // Chai Shuta Bar
    { name: 'Adrak Chai (H)', category: 'Chai', price: 20, qty: 100 },
    { name: 'Masala Chai', category: 'Chai', price: 30, qty: 100 },
    { name: 'Kesar Chai', category: 'Chai', price: 30, qty: 80 },
    { name: 'Elaichi Chai', category: 'Chai', price: 30, qty: 80 },
    { name: 'Hot Coffee (CSB)', category: 'Coffee', price: 25, qty: 60 },
    { name: 'Chocolate Coffee', category: 'Coffee', price: 30, qty: 50 },
    { name: 'Hazelnut Coffee', category: 'Coffee', price: 30, qty: 40 },
    // Chinese Food
    { name: 'Veg Noodles (CF)', category: 'Noodles', price: 50, qty: 60 },
    { name: 'Paneer Noodles (CF)', category: 'Noodles', price: 60, qty: 45 },
    { name: 'Hakka Noodles (CF)', category: 'Noodles', price: 60, qty: 40 },
    { name: 'Chilli Garlic Noodles (CF)', category: 'Noodles', price: 50, qty: 45 },
    { name: 'Veg Rice (CF)', category: 'Rice', price: 50, qty: 60 },
    { name: 'Paneer Rice (CF)', category: 'Rice', price: 60, qty: 40 },
    { name: 'Aloo Tikki Rice Bowl', category: 'Rice', price: 70, qty: 35 },
    { name: 'Veg Steam Momos (CF)', category: 'Momos & Spring Roll', price: 60, qty: 60 },
    { name: 'Fried Momos (CF)', category: 'Momos & Spring Roll', price: 60, qty: 55 },
    { name: 'Paneer Momos (CF)', category: 'Momos & Spring Roll', price: 70, qty: 40 },
    { name: 'Veg Kurkure Momos', category: 'Momos & Spring Roll', price: 70, qty: 40 },
    { name: 'Paneer Kurkure Momos', category: 'Momos & Spring Roll', price: 80, qty: 35 },
    { name: 'Spring Roll (CF)', category: 'Momos & Spring Roll', price: 60, qty: 50 },
    // Tanduri Hub
    { name: 'Rajma Rice (TH)', category: 'Rice', price: 60, qty: 50 },
    { name: 'Paneer Rice (TH)', category: 'Rice', price: 70, qty: 40 },
    { name: 'Malai Chaap with Plain Naan', category: 'Soya Chaap', price: 80, qty: 40 },
    { name: 'Afgani Chaap with Plain Naan', category: 'Soya Chaap', price: 80, qty: 35 },
    { name: 'Tandoori Chaap with Plain Naan', category: 'Soya Chaap', price: 80, qty: 35 },
    { name: 'Malai Paneer Tikka with Plain Naan', category: 'Tikka', price: 90, qty: 30 },
    { name: 'Mushroom Tikka with Plain Naan', category: 'Tikka', price: 90, qty: 25 },
    { name: 'Chaap Kulche (2 pc)', category: 'Combo', price: 60, qty: 50 },
    { name: 'Pao with Bhaji', category: 'Combo', price: 60, qty: 45 },
    // Protein Hub
    { name: 'Mix Veg Roll', category: 'Basic Roll', price: 55, qty: 40 },
    { name: 'Malai Chaap Roll (PH)', category: 'Chaap Roll', price: 65, qty: 35 },
    { name: 'Paneer Tikka Roll (PH)', category: 'Paneer Roll', price: 85, qty: 30 },
    { name: 'Chilli Paneer Roll', category: 'Paneer Roll', price: 105, qty: 25 },
    { name: 'Mushroom Roll', category: 'Mushroom Roll', price: 75, qty: 30 },
    { name: 'Mushroom Tikka Roll', category: 'Mushroom Roll', price: 95, qty: 25 },
    // Momo Villa
    { name: 'French Fry + Noodles Combo', category: 'Combo', price: 80, qty: 40 },
    { name: 'Honey Chilli Potato + Noodles Combo', category: 'Combo', price: 90, qty: 35 },
    { name: 'Cheese Chilli + Rice Combo', category: 'Combo', price: 130, qty: 20 },
    { name: 'Gobi Pakora (H)', category: 'Snack Bite', price: 80, qty: 40 },
    { name: 'Onion Rings (6 Pc.)', category: 'Snack Bite', price: 90, qty: 40 },
    { name: 'Paneer Pakora (250g)', category: 'Snack Bite', price: 90, qty: 30 },
    { name: 'Masala Fries (MV)', category: 'Snack Bite', price: 90, qty: 60 },
    { name: 'Honey Chilli Potato (MV)', category: 'Snack Bite', price: 80, qty: 50 },
    { name: 'Gobi Manchurian', category: 'Snack Bite', price: 80, qty: 45 },
    { name: 'Gobi Rice (H)', category: 'Rice', price: 80, qty: 40 },
    { name: 'Lemon Rice (MV)', category: 'Rice', price: 80, qty: 35 },
    { name: 'Schezwan Rice', category: 'Rice', price: 80, qty: 35 },
    { name: 'Spring Veg Noodles Roll (2 Pc.)', category: 'Spring Roll', price: 100, qty: 25 },
    { name: 'Paneer Spring Roll (2 Pc.)', category: 'Spring Roll', price: 120, qty: 20 },
  ],

  // Library Cafe (index 4) - lighter fare
  4: [
    { name: 'Masala Chai (LC)', category: 'Beverages', price: 20, qty: 100 },
    { name: 'Cold Coffee (LC)', category: 'Beverages', price: 60, qty: 70 },
    { name: 'Cappuccino (LC)', category: 'Beverages', price: 60, qty: 60 },
    { name: 'Green Tea', category: 'Beverages', price: 20, qty: 80 },
    { name: 'Lemon Soda (LC)', category: 'Beverages', price: 40, qty: 70 },
    { name: 'Veg Grilled Sandwich (LC)', category: 'Sandwiches', price: 50, qty: 60 },
    { name: 'Cheese Corn Sandwich (LC)', category: 'Sandwiches', price: 60, qty: 50 },
    { name: 'Paneer Sandwich (LC)', category: 'Sandwiches', price: 70, qty: 40 },
    { name: 'Aloo Tikki Burger (LC)', category: 'Burgers', price: 40, qty: 60 },
    { name: 'Cheese Burger (LC)', category: 'Burgers', price: 55, qty: 50 },
    { name: 'Masala Fries (LC)', category: 'Snacks', price: 50, qty: 80 },
    { name: 'Plain Vada (LC)', category: 'Snacks', price: 30, qty: 60 },
    { name: 'Samosa (LC)', category: 'Snacks', price: 15, qty: 100 },
    { name: 'Bread Pakoda (LC)', category: 'Snacks', price: 25, qty: 80 },
    { name: 'White Sauce Pasta (LC)', category: 'Pasta', price: 80, qty: 30 },
    { name: 'Red Sauce Pasta (LC)', category: 'Pasta', price: 80, qty: 30 },
    { name: 'Poha (LC)', category: 'Breakfast', price: 30, qty: 60 },
    { name: 'Upma (LC)', category: 'Breakfast', price: 30, qty: 60 },
    { name: 'Gulab Jamun (2 pcs)', category: 'Desserts', price: 30, qty: 50 },
    { name: 'Cookies (Assorted)', category: 'Desserts', price: 20, qty: 100 },
  ],

  // Sports Complex Canteen (index 5)
  5: [
    { name: 'Energy Drink', category: 'Beverages', price: 60, qty: 80 },
    { name: 'Nimbu Pani (SC)', category: 'Beverages', price: 20, qty: 100 },
    { name: 'Cold Coffee (SC)', category: 'Beverages', price: 50, qty: 70 },
    { name: 'Banana Shake (SC)', category: 'Beverages', price: 60, qty: 60 },
    { name: 'Aloo Tikki Burger (SC)', category: 'Quick Bites', price: 40, qty: 80 },
    { name: 'Veg Sandwich (SC)', category: 'Quick Bites', price: 40, qty: 70 },
    { name: 'Masala Fries (SC)', category: 'Quick Bites', price: 50, qty: 80 },
    { name: 'Veg Momos (SC)', category: 'Quick Bites', price: 50, qty: 70 },
    { name: 'Bread Omelette', category: 'Quick Bites', price: 35, qty: 60 },
    { name: 'Poha (SC)', category: 'Breakfast', price: 30, qty: 70 },
    { name: 'Upma (SC)', category: 'Breakfast', price: 30, qty: 60 },
    { name: 'Pav Bhaji (SC)', category: 'Meals', price: 60, qty: 50 },
    { name: 'Rajma Rice (SC)', category: 'Meals', price: 70, qty: 50 },
    { name: 'Dal Rice (SC)', category: 'Meals', price: 60, qty: 60 },
    { name: 'Veg Thali (SC)', category: 'Meals', price: 80, qty: 40 },
    { name: 'Protein Bar', category: 'Health Snacks', price: 50, qty: 60 },
    { name: 'Fruit Bowl', category: 'Health Snacks', price: 60, qty: 50 },
    { name: 'Boiled Eggs (2 pcs)', category: 'Health Snacks', price: 20, qty: 80 },
  ],

  // Medical Block Cafeteria (index 6) - healthy options
  6: [
    { name: 'Green Salad (MB)', category: 'Healthy Eats', price: 50, qty: 50 },
    { name: 'Fruit Salad (MB)', category: 'Healthy Eats', price: 60, qty: 45 },
    { name: 'Sprout Salad', category: 'Healthy Eats', price: 50, qty: 40 },
    { name: 'Oats Porridge', category: 'Breakfast', price: 40, qty: 50 },
    { name: 'Daliya', category: 'Breakfast', price: 40, qty: 50 },
    { name: 'Idli (MB)', category: 'South Indian', price: 40, qty: 60 },
    { name: 'Masala Dosa (MB)', category: 'South Indian', price: 60, qty: 50 },
    { name: 'Poha (MB)', category: 'Breakfast', price: 30, qty: 70 },
    { name: 'Dal Khichdi', category: 'Meals', price: 60, qty: 50 },
    { name: 'Steamed Rice + Dal', category: 'Meals', price: 60, qty: 60 },
    { name: 'Roti + Sabzi', category: 'Meals', price: 50, qty: 70 },
    { name: 'Plain Lassi', category: 'Beverages', price: 30, qty: 60 },
    { name: 'Sweet Lassi (MB)', category: 'Beverages', price: 40, qty: 60 },
    { name: 'Masala Chaas', category: 'Beverages', price: 25, qty: 80 },
    { name: 'Herbal Tea', category: 'Beverages', price: 20, qty: 80 },
    { name: 'Nimbu Pani (MB)', category: 'Beverages', price: 20, qty: 100 },
    { name: 'Coconut Water', category: 'Beverages', price: 30, qty: 50 },
    { name: 'Whole Wheat Sandwich', category: 'Sandwiches', price: 40, qty: 50 },
    { name: 'Paneer Salad Bowl', category: 'Healthy Eats', price: 70, qty: 30 },
    { name: 'Sprout Tikki', category: 'Healthy Eats', price: 40, qty: 40 },
  ],

  // MBA Block Food Court (index 7) - premium
  7: [
    { name: 'Cappuccino (MBA)', category: 'Hot Coffee', price: 80, qty: 60 },
    { name: 'Cafe Latte (MBA)', category: 'Hot Coffee', price: 90, qty: 50 },
    { name: 'Cold Coffee (MBA)', category: 'Cold Coffee', price: 100, qty: 60 },
    { name: 'Iced Americano (MBA)', category: 'Cold Coffee', price: 90, qty: 50 },
    { name: 'Classic Sandwich (MBA)', category: 'Sandwiches', price: 80, qty: 50 },
    { name: 'Club Sandwich (MBA)', category: 'Sandwiches', price: 120, qty: 35 },
    { name: 'Paneer Tikka Sandwich (MBA)', category: 'Sandwiches', price: 130, qty: 30 },
    { name: 'Margherita Pizza (MBA)', category: 'Pizza', price: 150, qty: 25 },
    { name: 'Paneer Pizza (MBA)', category: 'Pizza', price: 180, qty: 20 },
    { name: 'Farmhouse Pizza (MBA)', category: 'Pizza', price: 200, qty: 15 },
    { name: 'Penne Arrabbiata', category: 'Pasta', price: 150, qty: 25 },
    { name: 'Penne Alfredo', category: 'Pasta', price: 150, qty: 25 },
    { name: 'Caesar Salad', category: 'Salads', price: 120, qty: 25 },
    { name: 'Greek Salad', category: 'Salads', price: 130, qty: 20 },
    { name: 'Business Thali', category: 'Thali', price: 150, qty: 40 },
    { name: 'Paneer Butter Masala (MBA)', category: 'Main Course', price: 150, qty: 30 },
    { name: 'Dal Makhani (MBA)', category: 'Main Course', price: 120, qty: 35 },
    { name: 'Garlic Naan (MBA)', category: 'Breads', price: 50, qty: 80 },
    { name: 'Jeera Rice (MBA)', category: 'Rice', price: 70, qty: 60 },
    { name: 'Tiramisu', category: 'Desserts', price: 120, qty: 20 },
    { name: 'Chocolate Brownie', category: 'Desserts', price: 80, qty: 30 },
    { name: 'Oreo Shake (MBA)', category: 'Shakes', price: 120, qty: 30 },
  ],

  // New Campus Canteen (index 8)
  8: [
    { name: 'Veg Thali (NC)', category: 'Meals', price: 90, qty: 60 },
    { name: 'Dal Rice (NC)', category: 'Meals', price: 70, qty: 70 },
    { name: 'Rajma Rice (NC)', category: 'Meals', price: 80, qty: 60 },
    { name: 'Chana Rice (NC)', category: 'Meals', price: 80, qty: 55 },
    { name: 'Roti + Dal (NC)', category: 'Meals', price: 60, qty: 70 },
    { name: 'Poha (NC)', category: 'Breakfast', price: 30, qty: 80 },
    { name: 'Upma (NC)', category: 'Breakfast', price: 30, qty: 70 },
    { name: 'Masala Chai (NC)', category: 'Beverages', price: 15, qty: 100 },
    { name: 'Nimbu Pani (NC)', category: 'Beverages', price: 20, qty: 100 },
    { name: 'Cold Coffee (NC)', category: 'Beverages', price: 50, qty: 60 },
    { name: 'Aloo Tikki Burger (NC)', category: 'Burgers', price: 40, qty: 80 },
    { name: 'Veg Momos (NC)', category: 'Momos', price: 50, qty: 80 },
    { name: 'Fried Momos (NC)', category: 'Momos', price: 60, qty: 70 },
    { name: 'Paneer Momos (NC)', category: 'Momos', price: 70, qty: 50 },
    { name: 'Veg Noodles (NC)', category: 'Chinese', price: 60, qty: 60 },
    { name: 'Manchurian (NC)', category: 'Chinese', price: 70, qty: 50 },
    { name: 'Masala Fries (NC)', category: 'Snacks', price: 50, qty: 80 },
    { name: 'Samosa (NC)', category: 'Snacks', price: 15, qty: 100 },
    { name: 'Plain Dosa (NC)', category: 'South Indian', price: 60, qty: 50 },
    { name: 'Masala Dosa (NC)', category: 'South Indian', price: 80, qty: 45 },
    { name: 'Pav Bhaji (NC)', category: 'Street Food', price: 70, qty: 50 },
    { name: 'Chole Bhature (NC)', category: 'Street Food', price: 70, qty: 45 },
  ],

  // Research Park Cafe (index 9)
  9: [
    { name: 'Espresso (RP)', category: 'Hot Coffee', price: 60, qty: 50 },
    { name: 'Cappuccino (RP)', category: 'Hot Coffee', price: 80, qty: 60 },
    { name: 'Cafe Mocha (RP)', category: 'Hot Coffee', price: 90, qty: 50 },
    { name: 'Cold Brew Coffee', category: 'Cold Coffee', price: 100, qty: 40 },
    { name: 'Cold Coffee (RP)', category: 'Cold Coffee', price: 80, qty: 60 },
    { name: 'Masala Chai (RP)', category: 'Tea', price: 20, qty: 80 },
    { name: 'Green Tea (RP)', category: 'Tea', price: 25, qty: 70 },
    { name: 'Grilled Sandwich (RP)', category: 'Sandwiches', price: 80, qty: 50 },
    { name: 'Paneer Tikka Sandwich (RP)', category: 'Sandwiches', price: 110, qty: 35 },
    { name: 'Club Sandwich (RP)', category: 'Sandwiches', price: 120, qty: 30 },
    { name: 'Cheese Burger (RP)', category: 'Burgers', price: 80, qty: 45 },
    { name: 'Mushroom Burger (RP)', category: 'Burgers', price: 90, qty: 35 },
    { name: 'French Fries (RP)', category: 'Snacks', price: 80, qty: 70 },
    { name: 'Peri Peri Fries (RP)', category: 'Snacks', price: 90, qty: 60 },
    { name: 'Margherita Pizza (RP)', category: 'Pizza', price: 150, qty: 20 },
    { name: 'Paneer Pizza (RP)', category: 'Pizza', price: 180, qty: 15 },
    { name: 'White Sauce Pasta (RP)', category: 'Pasta', price: 130, qty: 25 },
    { name: 'Red Sauce Pasta (RP)', category: 'Pasta', price: 130, qty: 25 },
    { name: 'Brownie (RP)', category: 'Desserts', price: 60, qty: 40 },
    { name: 'Muffin', category: 'Desserts', price: 50, qty: 50 },
    { name: 'Cookie', category: 'Desserts', price: 30, qty: 80 },
    { name: 'Oreo Shake (RP)', category: 'Shakes', price: 110, qty: 30 },
    { name: 'Mango Shake (RP)', category: 'Shakes', price: 100, qty: 35 },
  ],
};

// ─── Pickup slots ─────────────────────────────────────────────────────────────
function generatePickupSlots(foodCourtId, today) {
  const slots = [];
  for (let d = 0; d < 7; d++) {
    const date = new Date(today);
    date.setDate(date.getDate() + d);
    const slotDate = date.toISOString().slice(0, 10);

    const times = [
      { start: '10:30:00', end: '10:45:00' },
      { start: '11:00:00', end: '11:15:00' },
      { start: '11:30:00', end: '11:45:00' },
      { start: '12:00:00', end: '12:15:00' },
      { start: '12:30:00', end: '12:45:00' },
      { start: '13:00:00', end: '13:15:00' },
      { start: '13:30:00', end: '13:45:00' },
      { start: '14:00:00', end: '14:15:00' },
      { start: '14:30:00', end: '14:45:00' },
      { start: '18:00:00', end: '18:15:00' },
      { start: '18:30:00', end: '18:45:00' },
      { start: '19:00:00', end: '19:15:00' },
      // A late-night safe slot (always in the future for smoke tests)
      { start: '23:00:00', end: '23:30:00' },
    ];

    for (const t of times) {
      slots.push({ food_court_id: foodCourtId, slot_date: slotDate, start_time: t.start, end_time: t.end, capacity: 20, booked_count: 0, status: 'ACTIVE' });
    }
  }
  return slots;
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function seed() {
  await sequelize.authenticate();
  console.log('DB connected. Running seed...\n');

  const hash = await bcrypt.hash(PASS, 10);
  const today = new Date();

  // Admin
  const [admin] = await User.findOrCreate({
    where: { email: 'admin@university.edu' },
    defaults: { name: 'System Admin', password_hash: hash, role: 'ADMIN', status: 'ACTIVE' },
  });
  console.log('✓ Admin:', admin.email);

  // Demo user
  const [demoUser] = await User.findOrCreate({
    where: { email: 'student1@university.edu' },
    defaults: { name: 'Demo Student', password_hash: hash, role: 'USER', status: 'ACTIVE' },
  });
  console.log('✓ Demo user:', demoUser.email);

  // Additional users
  for (let i = 2; i <= 5; i++) {
    await User.findOrCreate({
      where: { email: `student${i}@university.edu` },
      defaults: { name: `Student ${i}`, password_hash: hash, role: 'USER', status: 'ACTIVE' },
    });
  }
  console.log('✓ Additional users created');

  // Create 10 food courts and 10 shopkeepers
  const foodCourtIds = [];
  for (let i = 0; i < FOOD_COURTS.length; i++) {
    const fc = FOOD_COURTS[i];
    const [foodCourt] = await FoodCourt.findOrCreate({
      where: { name: fc.name },
      defaults: { ...fc, status: 'ACTIVE' },
    });
    foodCourtIds.push(foodCourt.id);

    const email = `shopkeeper${i + 1}@university.edu`;
    const [shopkeeper] = await User.findOrCreate({
      where: { email },
      defaults: { name: `Shopkeeper ${i + 1} - ${fc.name}`, password_hash: hash, role: 'SHOPKEEPER', status: 'ACTIVE' },
    });

    await ShopkeeperAssignment.findOrCreate({
      where: { shopkeeper_id: shopkeeper.id, food_court_id: foodCourt.id },
      defaults: { status: 'ACTIVE' },
    });

    // Seed food items for this court
    const menuItems = MENUS[i] || [];
    for (const item of menuItems) {
      await FoodItem.findOrCreate({
        where: { food_court_id: foodCourt.id, name: item.name },
        defaults: {
          description: `${item.category} from ${fc.name}`,
          category: item.category,
          price: item.price,
          quantity_available: item.qty,
          is_available: true,
        },
      });
    }

    // Seed pickup slots
    const slotsData = generatePickupSlots(foodCourt.id, today);
    for (const slot of slotsData) {
      await PickupSlot.findOrCreate({
        where: { food_court_id: slot.food_court_id, slot_date: slot.slot_date, start_time: slot.start_time },
        defaults: slot,
      });
    }

    console.log(`✓ Food court [${i + 1}]: ${fc.name} — ${menuItems.length} items, ${slotsData.length} slots`);
  }

  console.log('\n============================================================');
  console.log('Seed complete!');
  console.log('\nLogin credentials (all use password: Password123!):');
  console.log('  Admin:       admin@university.edu');
  console.log('  User:        student1@university.edu');
  for (let i = 0; i < 10; i++) {
    console.log(`  Shopkeeper ${i + 1}: shopkeeper${i + 1}@university.edu`);
  }
  console.log('============================================================\n');

  await sequelize.close();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
