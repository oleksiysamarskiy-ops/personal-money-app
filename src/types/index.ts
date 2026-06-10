export type Currency = 'USD' | 'EUR' | 'PLN' | 'UAH' | 'GBP'

export interface Income {
  id: string; amount: number; currency: Currency; source: string; note?: string; date: string; createdAt: string
}
export interface Expense {
  id: string; amount: number; currency: Currency; category: string; note?: string; date: string; createdAt: string
}
export interface SavingsEntry {
  id: string; amount: number; currency: Currency; note?: string; date: string; createdAt: string
}

export type InvestmentType = 'crypto' | 'staking' | 'fixed'
export interface CryptoInvestment {
  id: string; type: 'crypto'; coinName: string; symbol: string; quantity: number
  purchasePrice: number; currency: Currency; purchaseDate: string; createdAt: string
}
export interface StakingInvestment {
  id: string; type: 'staking'; name: string; principal: number; currency: Currency
  apr: number; startDate: string; endDate: string; createdAt: string
}
export interface FixedInvestment {
  id: string; type: 'fixed'; name: string; principal: number; currency: Currency
  interestRate: number; startDate: string; endDate: string; createdAt: string
}
export type Investment = CryptoInvestment | StakingInvestment | FixedInvestment

export type DebtDirection = 'i_owe' | 'owed_to_me'
export interface DebtPayment {
  id: string; amount: number; date: string; note?: string
}
export interface Debt {
  id: string; direction: DebtDirection; name: string; amount: number; currency: Currency
  note?: string; dueDate?: string; payments: DebtPayment[]; createdAt: string
}

export type BillingCycle = 'monthly' | 'yearly' | 'weekly'
export interface Subscription {
  id: string; name: string; price: number; currency: Currency
  nextBillingDate: string; billingCycle: BillingCycle; note?: string; createdAt: string
}

export interface AppSettings {
  baseCurrency: Currency
}
