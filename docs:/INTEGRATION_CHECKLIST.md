# Integration Checklist

## Before Merging

### Repository
- [ ] Correct branch
- [ ] No `.env`
- [ ] No secrets
- [ ] No unnecessary generated files
- [ ] README updated where needed

### Frontend
- [ ] `npm install` works
- [ ] `npm run build` works
- [ ] Routes work
- [ ] API base URL comes from environment
- [ ] No direct MySQL connection
- [ ] No payment secrets

### Backend
- [ ] Server starts
- [ ] Database connection works
- [ ] Environment variables documented
- [ ] Authentication works
- [ ] RBAC works
- [ ] Error handling works
- [ ] API contract matches

### Database
- [ ] Migration works
- [ ] Foreign keys work
- [ ] Indexes exist
- [ ] No duplicate tables
- [ ] Transactions used where needed

### Orders
- [ ] Food availability validated
- [ ] Inventory protected
- [ ] Pickup capacity protected
- [ ] Total calculated server-side
- [ ] Status transitions validated
- [ ] Expiry enforced server-side

### Payment
- [ ] Amount verified server-side
- [ ] Signature/webhook verified
- [ ] Duplicate webhook handled
- [ ] Payment secrets protected

### QR
- [ ] Token is secure
- [ ] Backend validates token
- [ ] Expired order rejected
- [ ] Already picked-up order rejected
- [ ] Wrong food court rejected

### Real-time
- [ ] Socket connection works
- [ ] Events match contract
- [ ] Unauthorized data is not broadcast

### ML
- [ ] FastAPI starts
- [ ] Model loads
- [ ] Input validation works
- [ ] Prediction endpoint works
- [ ] Metrics are documented
- [ ] No fabricated results

## End-to-End Flow

- [ ] Register
- [ ] Login
- [ ] Browse food court
- [ ] Browse menu
- [ ] Add to cart
- [ ] Select pickup slot
- [ ] Checkout
- [ ] Payment
- [ ] Confirmation
- [ ] Shopkeeper receives order
- [ ] Preparing
- [ ] Ready
- [ ] QR scan
- [ ] Picked up
- [ ] Analytics updated
- [ ] Waste recorded
- [ ] Demand prediction available
