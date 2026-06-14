import { Income, Expense, SavingsEntry, Investment, Debt, Subscription, Currency, CryptoInvestment, StakingInvestment, FixedInvestment } from '@/types'
import { toBase } from './currency'
import { isThisMonth, monthKey, monthLabel } from './date'

// ── Income ──────────────────────────────────────────────────────────────────
export function totalIncome(items: Income[], base: Currency): number {
  return items.reduce((s,i) => s + toBase(i.amount, i.currency, base), 0)
}
export function monthlyIncome(items: Income[], base: Currency): number {
  return items.filter(i=>isThisMonth(i.date)).reduce((s,i) => s + toBase(i.amount, i.currency, base), 0)
}

// ── Expenses ─────────────────────────────────────────────────────────────────
export function totalExpenses(items: Expense[], base: Currency): number {
  return items.reduce((s,e) => s + toBase(e.amount, e.currency, base), 0)
}
export function monthlyExpenses(items: Expense[], base: Currency): number {
  return items.filter(e=>isThisMonth(e.date)).reduce((s,e) => s + toBase(e.amount, e.currency, base), 0)
}
export function avgMonthlyExpenses(items: Expense[], base: Currency): number {
  if (!items.length) return 0
  const keys = [...new Set(items.map(e=>monthKey(e.date)))]
  if (!keys.length) return 0
  return totalExpenses(items, base) / keys.length
}
export function expensesByCategory(items: Expense[], base: Currency) {
  const map: Record<string,number> = {}
  items.forEach(e => { map[e.category] = (map[e.category]||0) + toBase(e.amount,e.currency,base) })
  return Object.entries(map).map(([name,value]) => ({name,value})).sort((a,b)=>b.value-a.value)
}

// ── Savings ──────────────────────────────────────────────────────────────────
export function totalSavings(items: SavingsEntry[], base: Currency): number {
  return items.reduce((s,e) => s + toBase(e.amount, e.currency, base), 0)
}
export function monthlySavings(items: SavingsEntry[], base: Currency): number {
  return items.filter(e=>isThisMonth(e.date)).reduce((s,e) => s + toBase(e.amount, e.currency, base), 0)
}

// ── Investments ───────────────────────────────────────────────────────────────
export function calcCryptoValue(inv: CryptoInvestment, prices: Record<string,number>, base: Currency): {invested:number,current:number,pnl:number,roi:number} {
  const invested = toBase(inv.quantity * inv.purchasePrice, inv.currency, base)
  const currentPrice = prices[inv.symbol.toUpperCase()] || inv.purchasePrice
  const current = toBase(inv.quantity * currentPrice, 'USD', base)
  const pnl = current - invested
  const roi = invested > 0 ? (pnl/invested)*100 : 0
  return {invested, current, pnl, roi}
}
export function calcStakingValue(inv: StakingInvestment, base: Currency): {invested:number,current:number,pnl:number} {
  const invested = toBase(inv.principal, inv.currency, base)
  const now = new Date(); const start = new Date(inv.startDate)
  const days = Math.max(0, (now.getTime()-start.getTime())/86400000)
  const earned = invested * (inv.apr/100) * (days/365)
  return {invested, current: invested+earned, pnl: earned}
}
export function calcFixedValue(inv: FixedInvestment, base: Currency): {invested:number,current:number,pnl:number} {
  const invested = toBase(inv.principal, inv.currency, base)
  const now = new Date(); const start = new Date(inv.startDate)
  const days = Math.max(0, (now.getTime()-start.getTime())/86400000)
  const earned = invested * (inv.interestRate/100) * (days/365)
  return {invested, current: invested+earned, pnl: earned}
}
export function totalInvestments(items: Investment[], prices: Record<string,number>, base: Currency): number {
  return items.reduce((s,inv) => {
    if (inv.type==='crypto') return s + calcCryptoValue(inv,prices,base).current
    if (inv.type==='staking') return s + calcStakingValue(inv,base).current
    return s + calcFixedValue(inv as FixedInvestment,base).current
  }, 0)
}

// ── Debts ────────────────────────────────────────────────────────────────────
export function debtRemaining(d: Debt, base: Currency): number {
  const total = toBase(d.amount, d.currency, base)
  const paid = d.payments.reduce((s,p)=>s+toBase(p.amount,d.currency,base),0)
  return Math.max(0, total-paid)
}
export function totalIOwe(debts: Debt[], base: Currency): number {
  return debts.filter(d=>d.direction==='i_owe').reduce((s,d)=>s+debtRemaining(d,base),0)
}
export function totalOwedToMe(debts: Debt[], base: Currency): number {
  return debts.filter(d=>d.direction==='owed_to_me').reduce((s,d)=>s+debtRemaining(d,base),0)
}

// ── Core Metrics ──────────────────────────────────────────────────────────────
export function calcFreeCash(
  incomes: Income[], expenses: Expense[], savings: SavingsEntry[],
  debts: Debt[], base: Currency
): number {
  const debtPaid = debts.reduce((s,d)=>s+d.payments.reduce((ps,p)=>ps+toBase(p.amount,d.currency,base),0),0)
  return totalIncome(incomes,base) - totalExpenses(expenses,base) - totalSavings(savings,base) - debtPaid
}
export function calcNetWorth(
  savings: SavingsEntry[], investments: Investment[], prices: Record<string,number>,
  freeCash: number, debts: Debt[], base: Currency
): number {
  return totalSavings(savings,base) + totalInvestments(investments,prices,base) + freeCash - totalIOwe(debts,base)
}
export function financialCushion(savings: SavingsEntry[], expenses: Expense[], base: Currency): number {
  const avg = avgMonthlyExpenses(expenses, base)
  if (!avg) return 0
  return totalSavings(savings,base) / avg
}

// ── Monthly chart data ────────────────────────────────────────────────────────
export function buildMonthlyChart(incomes: Income[], expenses: Expense[], base: Currency) {
  const allKeys = [...new Set([...incomes.map(i=>monthKey(i.date)),...expenses.map(e=>monthKey(e.date))])].sort()
  return allKeys.map(k => ({
    month: monthLabel(k),
    income: incomes.filter(i=>monthKey(i.date)===k).reduce((s,i)=>s+toBase(i.amount,i.currency,base),0),
    expenses: expenses.filter(e=>monthKey(e.date)===k).reduce((s,e)=>s+toBase(e.amount,e.currency,base),0),
  }))
}
