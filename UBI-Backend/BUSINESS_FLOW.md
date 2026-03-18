# USAGE-BASED VEHICLE INSURANCE - COMPLETE BUSINESS FLOW

## 🏢 SYSTEM ACTORS

Your system has 4 roles:

| Role | Responsibilities |
|------|-----------------|
| 👨‍💼 **Admin** | Manage users, create policies, approve orders, configure rules, view analytics |
| 👔 **Agent** | Assist customers, process subscriptions, approve orders |
| 👤 **Customer** | Place orders, register vehicles, view usage, pay premiums, raise claims |
| 👨‍⚖️ **Claims Officer** | Review claims, approve/reject claims |

---

## 🔐 STEP 1: USER REGISTRATION & LOGIN

### 👤 Customer Registration

**What Happens:**
1. Customer visits the system
2. Fills registration form with:
   - Full name
   - Email
   - Password
   - Phone number
   - Role = CUSTOMER (roleId: 3)

**Backend Process:**
```java
// AuthService.java
1. Check if email already exists
2. Validate role exists
3. Encrypt password using BCrypt
4. Create user account
5. Save to database
6. Generate JWT token
7. Return token + user details
```

**API:** `POST /api/auth/register`

**Database:**
```sql
INSERT INTO users (full_name, email, password, phone, role_id, status)
VALUES ('John Doe', 'john@example.com', '$2a$10$encrypted...', '1234567890', 3, 'ACTIVE');
```

### 🔑 Customer Login

**What Happens:**
1. Customer enters email and password
2. System validates credentials
3. JWT token issued (valid for 24 hours)
4. Customer can now access secured APIs

**Backend Process:**
```java
// AuthService.java
1. Authenticate using Spring Security
2. Load user from database
3. Validate password
4. Generate JWT token with email + role
5. Return token
```

**API:** `POST /api/auth/login`

**JWT Token Contains:**
- Email
- Role (CUSTOMER)
- Issued date
- Expiration date (24 hours)

---

## 📄 STEP 2: POLICY PRODUCT CREATION (Admin)

### 👨‍💼 Admin Creates Insurance Products

**Before customers can use the system:**

Admin creates policy products like:
- UBI Basic
- UBI Premium
- UBI Economy

**What Admin Sets:**
1. **Policy Name** - "Basic Coverage"
2. **Coverage Type** - "COMPREHENSIVE"
3. **Base Premium** - ₹3000
4. **Description** - "Basic vehicle insurance"
5. **Status** - Active

**Backend Process:**
```java
// PolicyService.java
1. Validate admin role
2. Create policy object
3. Set base premium
4. Set coverage details
5. Mark as active
6. Save to database
```

**API:** `POST /api/policies` (Admin only)

**Database:**
```sql
INSERT INTO policies (policy_name, coverage_type, base_premium, description, is_active)
VALUES ('Basic Coverage', 'COMPREHENSIVE', 3000, 'Basic vehicle insurance', true);
```

**Result:**
- Policy products are now available
- Customers can browse and select policies

---

## 📝 STEP 3: CUSTOMER PLACES POLICY ORDER

### 👤 Customer Selects Policy

**What Happens:**
1. Customer browses available policies
2. Selects "Basic Coverage"
3. Places order

**Backend Process:**
```java
// PolicyOrderService.java
1. Validate customer exists
2. Validate policy exists
3. Create policy order
4. Set status = PENDING
5. Set order date
6. Save to database
```

**API:** `POST /api/policy-orders?userId=1&policyId=1`

**Database:**
```sql
INSERT INTO policy_orders (user_id, policy_id, order_date, order_status)
VALUES (1, 1, NOW(), 'PENDING');
```

**Important:**
- ❌ No insurance coverage yet
- ❌ No subscription created
- ⏳ Waiting for approval

---

## 🛡️ STEP 4: ORDER APPROVAL (Underwriting)

### 👨‍💼 Admin/Agent Reviews Order

**What Happens:**
1. Admin sees pending orders
2. Reviews customer details
3. Makes decision: Approve or Reject

### ✅ If Approved:

**Backend Process:**
```java
// PolicyOrderService.java
1. Get order by ID
2. Check status is PENDING
3. Update order status = APPROVED
4. Create Policy Subscription automatically
5. Set start date = today
6. Set end date = today + 1 year
7. Set status = ACTIVE
8. Save subscription
```

**API:** `PUT /api/policy-orders/1/approve`

**Database:**
```sql
-- Update order
UPDATE policy_orders SET order_status = 'APPROVED' WHERE order_id = 1;

-- Create subscription
INSERT INTO policy_subscriptions (order_id, policy_id, start_date, end_date, subscription_status)
VALUES (1, 1, '2025-01-01', '2026-01-01', 'ACTIVE');
```

### ❌ If Rejected:

**Backend Process:**
```java
1. Update order status = REJECTED
2. Process ends
3. No subscription created
```

**API:** `PUT /api/policy-orders/1/reject`

---

## 📑 STEP 5: SUBSCRIPTION CREATION

### After Approval:

**What Gets Created:**
- **Policy Subscription** entity
- **Subscription ID** generated
- **Start Date** = Today
- **End Date** = Today + 1 year
- **Status** = ACTIVE
- **Billing Cycle** = MONTHLY

**Result:**
✅ Insurance coverage starts  
✅ Customer is now insured  
✅ Can attach vehicles  

---

## 🚘 STEP 6: VEHICLE REGISTRATION & ATTACHMENT

### 👤 Customer Registers Vehicle

**Step 6.1: Register Vehicle**

**What Happens:**
1. Customer provides vehicle details:
   - Vehicle number: "MH12AB1234"
   - Vehicle type: "CAR"
   - Vehicle age: 3 years
   - Registration date

**Backend Process:**
```java
// VehicleService.java
1. Validate vehicle number is unique
2. Create vehicle record
3. Set status = ACTIVE
4. Save to database
```

**API:** `POST /api/vehicles`

**Database:**
```sql
INSERT INTO vehicles (vehicle_number, vehicle_type, vehicle_age, registration_date, status)
VALUES ('MH12AB1234', 'CAR', 3, '2021-01-15', 'ACTIVE');
```

### Step 6.2: Attach Vehicle to Subscription

**What Happens:**
1. Customer links vehicle to subscription
2. Creates Vehicle Subscription

**Backend Process:**
```java
// PolicySubscriptionService.java
1. Validate subscription exists
2. Validate vehicle exists
3. Create vehicle subscription link
4. Set assigned date
5. Save to database
```

**API:** `POST /api/vehicle-subscriptions?subscriptionId=1&vehicleId=1`

**Database:**
```sql
INSERT INTO vehicle_subscriptions (subscription_id, vehicle_id, assigned_date)
VALUES (1, 1, NOW());
```

**Result:**
✅ Subscription ↔ Vehicle connected  
✅ Coverage officially linked to vehicle  
✅ Ready for usage tracking  

---

## 📊 STEP 7: MONTHLY USAGE ENTRY

### Each Month Customer Records Usage

**What Customer Enters:**
1. **Total Distance** - 8000 km
2. **Night Driving Hours** - 20 hours
3. **Trip Count** - 50 trips
4. **Risk Category** - LOW/MEDIUM/HIGH
5. **Billing Month** - January
6. **Billing Year** - 2025

**Backend Process:**
```java
// UsageService.java
1. Validate subscription exists
2. Check if usage already exists for this month
3. Create usage data record
4. Save to database
```

**API:** `POST /api/usage`

**Database:**
```sql
INSERT INTO usage_data (subscription_id, billing_month, billing_year, 
                        total_distance_km, night_driving_hours, trip_count, risk_category)
VALUES (1, 1, 2025, 8000, 20, 50, 'LOW');
```

**Result:**
✅ Monthly usage recorded  
✅ Ready for premium calculation  

---

## 💰 STEP 8: PREMIUM CALCULATION (CORE FEATURE)

### System Runs Rule Engine

**Step 8.1: Admin Creates Rules (One-time)**

**Example Rules:**
```sql
-- High Distance Surcharge
INSERT INTO premium_rules (rule_name, rule_type, rule_condition, value, is_active)
VALUES ('High Distance Surcharge', 'DISTANCE', '> 10000', 1000, true);

-- Low Distance Discount
INSERT INTO premium_rules (rule_name, rule_type, rule_condition, value, is_active)
VALUES ('Low Distance Discount', 'DISTANCE', '< 5000', 500, true);

-- Night Driving Surcharge
INSERT INTO premium_rules (rule_name, rule_type, rule_condition, value, is_active)
VALUES ('Night Driving Surcharge', 'NIGHT_DRIVING', '> 30', 500, true);

-- Safe Driver Discount
INSERT INTO premium_rules (rule_name, rule_type, rule_condition, value, is_active)
VALUES ('Safe Driver Discount', 'NIGHT_DRIVING', '< 10', 300, true);

-- Low Risk Discount
INSERT INTO premium_rules (rule_name, rule_type, rule_condition, value, is_active)
VALUES ('Low Risk Discount', 'RISK_CATEGORY', 'LOW', 400, true);

-- High Risk Surcharge
INSERT INTO premium_rules (rule_name, rule_type, rule_condition, value, is_active)
VALUES ('High Risk Surcharge', 'RISK_CATEGORY', 'HIGH', 800, true);
```

### Step 8.2: Calculate Premium

**Backend Process:**
```java
// PremiumRuleEngine.java (Strategy Pattern)

1. Get base premium from policy = ₹3000
2. Fetch all active rules from database
3. For each rule:
   a. Create appropriate strategy (Distance/NightDriving/RiskCategory)
   b. Evaluate if rule applies to usage data
   c. If applies, add to additions or discounts

4. Calculate:
   Base Premium = ₹3000
   + Total Additions
   - Total Discounts
   = Final Premium

5. Save calculation to database
```

**Example Calculation:**
```
Usage Data:
- Distance: 8000 km
- Night Driving: 20 hours
- Risk: LOW

Rule Evaluation:
✅ Distance < 10000 → No surcharge
✅ Distance > 5000 → No discount
✅ Night Driving < 30 → No surcharge
✅ Night Driving > 10 → No discount
✅ Risk = LOW → -₹400 discount

Final Calculation:
Base Premium: ₹3000
Total Additions: ₹0
Total Discounts: ₹400
Final Premium: ₹2600
```

**API:** `POST /api/premium/calculate/1?usageId=1`

**Database:**
```sql
INSERT INTO premium_calculations (subscription_id, usage_id, base_premium, 
                                  total_additions, total_discounts, final_premium, calculated_date)
VALUES (1, 1, 3000, 0, 400, 2600, NOW());
```

**Result:**
✅ Premium calculated dynamically  
✅ Customer sees breakdown  
✅ Fair pricing based on usage  

---

## 📈 STEP 9: DASHBOARD & ANALYTICS

### 👨‍💼 Admin Views Analytics

**What Admin Can See:**

**1. Dashboard Summary**
```json
{
  "activeSubscriptions": 150,
  "totalClaims": 45,
  "pendingClaims": 12,
  "totalPremiumCalculations": 450
}
```

**2. Risk Distribution**
```json
{
  "LOW": 80,
  "MEDIUM": 50,
  "HIGH": 20
}
```

**3. Monthly Revenue**
```json
{
  "totalRevenue": 450000
}
```

**4. Active Subscriptions Count**
```json
{
  "count": 150
}
```

**Backend Process:**
```java
// DashboardService.java
1. Query all subscriptions with status ACTIVE
2. Count claims by status
3. Calculate risk distribution from usage data
4. Sum all final premiums for revenue
5. Return aggregated data
```

**APIs:**
- `GET /api/dashboard/summary`
- `GET /api/dashboard/risk-distribution`
- `GET /api/dashboard/monthly-revenue`
- `GET /api/dashboard/active-subscriptions`

**Result:**
✅ Business insights  
✅ Decision-making data  
✅ Performance metrics  

---

## 🚑 STEP 10: CLAIM PROCESS

### 👤 Customer Raises Claim

**Scenario:** Accident happens

**What Customer Does:**
1. Goes to claims section
2. Fills claim form:
   - Claim amount: ₹15,000
   - Claim reason: "Minor accident - front bumper damage"
   - Subscription ID: 1

**Backend Process:**
```java
// ClaimService.java
1. Validate subscription exists
2. Create claim record
3. Set status = PENDING
4. Set submitted date
5. Save to database
```

**API:** `POST /api/claims`

**Database:**
```sql
INSERT INTO claims (subscription_id, claim_amount, claim_reason, claim_status, submitted_date)
VALUES (1, 15000, 'Minor accident - front bumper damage', 'PENDING', NOW());
```

### 👨‍⚖️ Claims Officer Reviews

**What Claims Officer Does:**
1. Views all pending claims
2. Reviews claim details
3. Checks policy coverage
4. Makes decision: Approve or Reject

### ✅ Approve Claim

**Backend Process:**
```java
// ClaimService.java
1. Get claim by ID
2. Get claims officer details
3. Update claim status = APPROVED
4. Set reviewed_by = claims officer ID
5. Save to database
```

**API:** `PUT /api/claims/1/approve?reviewerId=4`

**Database:**
```sql
UPDATE claims 
SET claim_status = 'APPROVED', reviewed_by = 4
WHERE claim_id = 1;
```

### ❌ Reject Claim

**Backend Process:**
```java
1. Update claim status = REJECTED
2. Set reviewed_by = claims officer ID
3. Save to database
```

**API:** `PUT /api/claims/1/reject?reviewerId=4`

**Claim Lifecycle:**
```
Submitted → Under Review → Approved → Closed
                        ↓
                     Rejected
```

**Result:**
✅ Claim processed  
✅ Customer notified  
✅ Payment initiated (if approved)  

---

## 🔄 STEP 11: SUBSCRIPTION EXPIRY / RENEWAL

### When Subscription Ends

**What Happens:**
1. End date reaches (e.g., 2026-01-01)
2. System marks subscription status = EXPIRED
3. Coverage stops

### Customer Wants to Renew

**Renewal Process:**
1. Customer places new policy order
2. Admin approves order
3. New subscription created
4. New start date and end date set
5. Cycle continues

**Backend Process:**
```java
// Same as STEP 3-5
1. Create new policy order
2. Approve order
3. Generate new subscription
4. Attach existing vehicle (or new vehicle)
5. Continue usage tracking
```

**Result:**
✅ Continuous coverage  
✅ Seamless renewal  

---

## 📊 COMPLETE FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    SYSTEM START                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Customer Registration & Login (JWT Token)          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Admin Creates Policy Products                      │
│  (Basic, Premium, Economy)                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Customer Places Policy Order                       │
│  Status: PENDING                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Admin/Agent Reviews Order                          │
│  Decision: Approve or Reject                                 │
└─────────────────────────────────────────────────────────────┘
                    ↓                   ↓
              [APPROVED]           [REJECTED]
                    ↓                   ↓
┌──────────────────────────────┐   [END]
│  STEP 5: Subscription Created│
│  Status: ACTIVE               │
│  Coverage: 1 Year             │
└──────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 6: Customer Registers Vehicle & Attaches              │
│  Vehicle ↔ Subscription Linked                              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 7: Monthly Usage Entry                                │
│  (Distance, Night Driving, Trips, Risk)                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 8: Premium Calculation (Rule Engine)                  │
│  Base + Additions - Discounts = Final Premium               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 9: Admin Views Dashboard & Analytics                  │
│  (Subscriptions, Revenue, Risk Distribution)                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 10: Customer Raises Claim (If Accident)               │
│  Claims Officer Approves/Rejects                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  STEP 11: Subscription Expiry & Renewal                     │
│  (Cycle Repeats)                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 KEY BUSINESS RULES

1. **No Coverage Without Approval**
   - Order must be approved before coverage starts

2. **Vehicle Must Be Attached**
   - Subscription needs vehicle link for coverage

3. **Monthly Usage Required**
   - Usage data needed for premium calculation

4. **Dynamic Pricing**
   - Premium changes based on actual usage

5. **Rule-Based Calculation**
   - Admin can configure rules anytime

6. **Claims Need Review**
   - All claims must be reviewed by Claims Officer

7. **Subscription Has Validity**
   - Coverage expires after end date

---

## 📋 SUMMARY

| Step | Actor | Action | Result |
|------|-------|--------|--------|
| 1 | Customer | Register & Login | JWT Token |
| 2 | Admin | Create Policies | Products Available |
| 3 | Customer | Place Order | Order Pending |
| 4 | Admin/Agent | Approve Order | Subscription Created |
| 5 | System | Create Subscription | Coverage Active |
| 6 | Customer | Register & Attach Vehicle | Vehicle Covered |
| 7 | Customer | Enter Usage Data | Usage Recorded |
| 8 | System | Calculate Premium | Fair Pricing |
| 9 | Admin | View Dashboard | Business Insights |
| 10 | Customer/Officer | Raise/Review Claim | Claim Processed |
| 11 | Customer | Renew Subscription | Continuous Coverage |

---

**Your Usage-Based Insurance Platform is Complete!** 🎉

**Total Flow Steps:** 11  
**Total Actors:** 4  
**Total APIs:** 47+  
**Core Innovation:** Dynamic Premium Calculation with Rule Engine  
