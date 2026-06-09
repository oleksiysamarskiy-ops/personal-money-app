# Finance Tracker

Personal finance tracker built with React + TypeScript + Zustand.

## Stack

- **React 18** + TypeScript
- **Zustand** — state management
- **React Hook Form** + **Zod** — forms & validation
- **Recharts** — charts
- **date-fns** — date formatting
- **uuid** — unique IDs
- **Vite** — build tool
- **localStorage** — persistence (no backend needed)

## Features

### Dashboard
- Monthly & all-time stats: income, expenses, savings, free cash
- Income vs Expenses bar/line chart
- Expenses by category pie chart

### Income
- Add / edit / delete entries
- Search by source or note
- Filter by month
- Area chart — income trend

### Expenses
- Add / edit / delete entries
- 10 categories with color coding
- Search + month + category filters
- Pie chart — breakdown by category

### Savings
- Add / edit / delete entries
- Monthly bar chart
- Free Cash = Income − Expenses − Savings

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Next Steps (Этап 7+)

- [ ] API + Prisma backend (replace localStorage)
- [ ] Multi-currency conversion
- [ ] Debts module
- [ ] CSV export
- [ ] Budget targets per category
- [ ] Auth (next-auth or clerk)
