import { RoleType } from '../../../models/role.model';

export type RoleName = RoleType;
export type UserStatus = 'ACTIVE' | 'INACTIVE';
export type OrderStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'DOCUMENTS_REQUESTED' | 'PAID';
export type SubscriptionStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
export type VehicleType = 'CAR' | 'BIKE' | 'SUV' | 'TRUCK';
export type VehicleStatus = 'ACTIVE' | 'INACTIVE';
export type RiskCategory = 'LOW' | 'MEDIUM' | 'HIGH';
export type RuleType = 'DISTANCE' | 'NIGHT_DRIVING' | 'RISK_CATEGORY';
export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Role {
    roleId: number;
    roleName: RoleName;
}

export interface User {
    userId: number;
    fullName: string;
    email: string;
    password?: string;
    phone: string;
    role: Role;
    status: UserStatus;
    createdAt: string;
    age?: number;
    address?: string;
}

export interface Policy {
    policyId: number;
    policyName: string;
    coverageType: string;
    basePremium: number;
    description: string;
    isActive: boolean;
    policyTermYears?: number;
    maturityAmount?: number;
    hasPremiumWaiver?: boolean;
    hasPartialWithdrawal?: boolean;
    withdrawalConditions?: string;
}

export interface PolicyOrder {
    orderId: number;
    user: User;
    policy: Policy;
    orderDate: string;
    orderStatus: OrderStatus;
    documentNames?: string;
    storedDocumentNames?: string;
    vehicle?: Vehicle;
    underwriterRemarks?: string;
}

export interface PolicyOrderResponse {
    orderId: number;
    userId: number;
    customerName: string;
    policyId: number;
    policyName: string;
    coverageType: string;
    description: string;
    basePremium: number;
    orderDate: string;
    orderStatus: string;
}

export interface PaymentHistoryResponse {
    transactionId: string;
    userId?: number;
    policyId: number;
    policyName: string;
    customerName: string;
    amount: number;
    status: string;
    date: string;
}

export interface PolicySubscription {
    subscriptionId: number;
    order: PolicyOrder;
    policy: Policy;
    startDate: string;
    endDate: string;
    billingCycle: string;
    subscriptionStatus: SubscriptionStatus;
    vehicles?: Vehicle[];
}

export interface Vehicle {
    vehicleId: number;
    vehicleNumber: string;
    vehicleType: VehicleType;
    vehicleAge: number;
    registrationDate: string;
    status: VehicleStatus;
}

export interface UsageData {
    usageId: number;
    subscription: PolicySubscription;
    billingMonth: number;
    billingYear: number;
    totalDistanceKm: number;
    nightDrivingHours: number;
    tripCount: number;
    riskCategory: RiskCategory;
}

export interface PremiumRule {
    ruleId: number;
    ruleName: string;
    ruleType: RuleType;
    condition: string;
    value: number;
    isActive: boolean;
    description: string;
}

export interface PremiumCalculation {
    calculationId: number;
    subscription: PolicySubscription;
    usage: UsageData;
    basePremium: number;
    totalAdditions: number;
    totalDiscounts: number;
    totalModifier: number;
    finalPremium: number;
    calculatedDate: string;
    calculationDetails?: string;
}

export interface Claim {
    claimId: number;
    subscription: PolicySubscription;
    claimAmount: number;
    claimReason: string;
    claimStatus: ClaimStatus;
    submittedDate: string;
    reviewedBy: User | null;
    documentNames?: string[];
}

export interface VehicleSubscription {
    vehicleSubscriptionId: number;
    subscription: PolicySubscription;
    vehicle: Vehicle;
    assignedDate: string;
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    password: string;
    phone: string;
    age?: number;
    roleId?: number;
    roleName?: string;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterResponse {
    message: string;
    email: string;
    userId: number;
}

export interface AuthResponse {
    token: string;
    email: string;
    role: string;
    userId: number;
}

export interface PolicyRequest {
    policyName: string;
    coverageType: string;
    basePremium?: number;
    description: string;
    policyTermYears?: number;
    maturityAmount?: number;
    hasPremiumWaiver?: boolean;
    hasPartialWithdrawal?: boolean;
    withdrawalConditions?: string;
}

export interface PolicyResponse {
    policyId: number;
    policyName: string;
    coverageType: string;
    basePremium: number;
    description: string;
    isActive: boolean;
    policyTermYears?: number;
    maturityAmount?: number;
    hasPremiumWaiver?: boolean;
    hasPartialWithdrawal?: boolean;
    withdrawalConditions?: string;
}

export interface VehicleRequest {
    vehicleNumber: string;
    vehicleType: VehicleType;
    vehicleAge: number;
}

export interface VehicleResponse {
    vehicleId: number;
    vehicleNumber: string;
    vehicleType: string;
    vehicleAge: number;
    registrationDate: string;
    status: string;
}

export interface UsageRequest {
    subscriptionId: number;
    billingMonth: number;
    billingYear: number;
    totalDistanceKm: number;
    nightDrivingHours: number;
    tripCount: number;
    riskCategory: RiskCategory;
}

export interface UsageResponse {
    usageId: number;
    subscriptionId: number;
    billingMonth: number;
    billingYear: number;
    totalDistanceKm: number;
    nightDrivingHours: number;
    tripCount: number;
    riskCategory: string;
}

export interface ClaimRequest {
    subscriptionId: number;
    claimAmount: number;
    claimReason: string;
}

export interface ClaimResponse {
    claimId: number;
    subscriptionId: number;
    claimAmount: number;
    claimReason: string;
    claimStatus: string;
    submittedDate: string;
    reviewedBy: string | null;
    documentNames?: string[];
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface DashboardSummary {
    totalUsers: number;
    totalPolicies: number;
    totalSubscriptions: number;
    totalClaims: number;
    pendingOrders: number;
    monthlyRevenue: number;
    activeSubscriptions: number;
}

export interface RiskDistribution {
    low: number;
    medium: number;
    high: number;
}

export interface MonthlyRevenue {
    month: string;
    revenue: number;
}

export interface Notification {
    type: 'ORDER_APPROVED' | 'CLAIM_PROCESSED' | 'PREMIUM_DUE';
    message: string;
    timestamp: string;
    read: boolean;
}

export interface StatisticsData {
    totalCustomers: number;
    totalVehicles: number;
    totalPolicies: number;
    activePolicies: number;
    totalClaims: number;
    totalRevenue: number;
    policyDistribution: Record<string, number>;
    claimsOverview: Record<string, number>;
    monthlyRevenue: Record<string, number>;
    avgDistanceTravelled: number;
    avgNightDrivingHours: number;
}
