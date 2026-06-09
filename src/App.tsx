import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import DashboardPage from './pages/Dashboard'
import IncomePage from './pages/Income'
import ExpensesPage from './pages/Expenses'
import SavingsPage from './pages/Savings'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<DashboardPage />} />
          <Route path="income" element={<IncomePage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="savings" element={<SavingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
