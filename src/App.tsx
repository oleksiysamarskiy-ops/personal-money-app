import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAuthStore } from '@/store/auth'
import { UserIdProvider } from '@/store/userContext'
import Layout from './components/Layout'
import DashboardPage from './pages/Dashboard'
import IncomePage from './features/income'
import ExpensesPage from './features/expenses'
import SavingsPage from './features/savings'
import InvestmentsPage from './features/investments'
import DebtsPage from './features/debts'
import SubscriptionsPage from './features/subscriptions'
import AnalyticsPage from './pages/Analytics'
import MorePage from './pages/More'
import AuthPage from './pages/Auth'

export default function App() {
  const { currentUserId } = useAuthStore()

  if (!currentUserId) {
    return <AuthPage />
  }

  return (
    <UserIdProvider userId={currentUserId}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<DashboardPage />} />
            <Route path="income" element={<IncomePage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="savings" element={<SavingsPage />} />
            <Route path="more" element={<MorePage />} />
            <Route path="investments" element={<InvestmentsPage />} />
            <Route path="debts" element={<DebtsPage />} />
            <Route path="subscriptions" element={<SubscriptionsPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </UserIdProvider>
  )
}
