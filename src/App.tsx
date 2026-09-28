import { AnimatePresence, motion } from 'framer-motion'
import {
  Bell,
  BookOpen,
  Brain,
  Bus,
  Calculator,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Database,
  Goal,
  Home,
  Lightbulb,
  LineChart,
  Moon,
  PlusCircle,
  Search,
  Settings,
  Sparkles,
  Sun,
  Target,
  Trash2,
  Wallet,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart as ReLineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Toaster, toast } from 'sonner'

import { Badge } from './components/ui/badge'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog'
import { Input } from './components/ui/input'
import { Progress } from './components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './components/ui/tooltip'
import { formatINR } from './lib/utils'

type Category =
  | 'Food'
  | 'Transport'
  | 'Education'
  | 'Entertainment'
  | 'Shopping'
  | 'Bills'
  | 'Groceries'
  | 'Healthcare'
  | 'Income'
  | 'Other'

type PaymentMethod = 'UPI' | 'Cash' | 'Card' | 'Bank Transfer'
type TransactionType = 'Income' | 'Expense'

type Transaction = {
  id: string
  date: string
  description: string
  category: Category
  predictedCategory: Category
  amount: number
  type: TransactionType
  paymentMethod: PaymentMethod
  confidence: number
  explanation: string
}

type Budget = { category: Exclude<Category, 'Income' | 'Other'>; limit: number; kind: 'Essential' | 'Flexible' | 'Non-essential' }

type LearningRecord = {
  input: string
  original: Category
  corrected: Category
  date: string
  status: string
}

const navItems = [
  ['Dashboard', '/', Home],
  ['Transactions', '/transactions', Wallet],
  ['Add Transaction', '/add', PlusCircle],
  ['Smart Budgets', '/budgets', Calculator],
  ['AI Insights', '/insights', Brain],
  ['Savings Planner', '/planner', Target],
  ['Goals', '/goals', Goal],
  ['Knowledge Base', '/knowledge', Database],
  ['Learning Center', '/learning', BookOpen],
  ['Settings', '/settings', Settings],
] as const

const initialTransactions: Transaction[] = [
  { id: 't1', date: '2026-09-02', description: 'Monthly pocket money', category: 'Income', predictedCategory: 'Income', amount: 8000, type: 'Income', paymentMethod: 'Bank Transfer', confidence: 99, explanation: 'Recurring monthly credit from family.' },
  { id: 't2', date: '2026-09-03', description: 'Freelance website payment', category: 'Income', predictedCategory: 'Income', amount: 4000, type: 'Income', paymentMethod: 'UPI', confidence: 98, explanation: 'Client transfer with freelance keyword.' },
  { id: 't3', date: '2026-09-04', description: 'Hostel rent', category: 'Bills', predictedCategory: 'Bills', amount: 3000, type: 'Expense', paymentMethod: 'Bank Transfer', confidence: 97, explanation: 'Rent and accommodation terms map to bills.' },
  { id: 't4', date: '2026-09-05', description: 'College canteen lunch', category: 'Food', predictedCategory: 'Food', amount: 90, type: 'Expense', paymentMethod: 'UPI', confidence: 92, explanation: 'Canteen meal merchant classified as food.' },
  { id: 't5', date: '2026-09-05', description: 'Tea and snacks', category: 'Food', predictedCategory: 'Food', amount: 60, type: 'Expense', paymentMethod: 'Cash', confidence: 84, explanation: 'Snack-related keywords indicate food expense.' },
  { id: 't6', date: '2026-09-06', description: 'Bus ticket', category: 'Transport', predictedCategory: 'Transport', amount: 22, type: 'Expense', paymentMethod: 'UPI', confidence: 91, explanation: 'Public transport keyword match.' },
  { id: 't7', date: '2026-09-06', description: 'Auto ride', category: 'Transport', predictedCategory: 'Transport', amount: 120, type: 'Expense', paymentMethod: 'UPI', confidence: 89, explanation: 'Ride and location movement pattern.' },
  { id: 't8', date: '2026-09-07', description: 'Swiggy order', category: 'Food', predictedCategory: 'Food', amount: 280, type: 'Expense', paymentMethod: 'UPI', confidence: 94, explanation: 'Swiggy merchant has high food probability.' },
  { id: 't9', date: '2026-09-08', description: 'Jio recharge', category: 'Bills', predictedCategory: 'Bills', amount: 299, type: 'Expense', paymentMethod: 'UPI', confidence: 96, explanation: 'Telecom recharge modeled as utility bill.' },
  { id: 't10', date: '2026-09-08', description: 'Netflix subscription', category: 'Entertainment', predictedCategory: 'Entertainment', amount: 199, type: 'Expense', paymentMethod: 'Card', confidence: 95, explanation: 'Streaming subscription service mapping.' },
  { id: 't11', date: '2026-09-09', description: 'Udemy Python course', category: 'Education', predictedCategory: 'Education', amount: 499, type: 'Expense', paymentMethod: 'Card', confidence: 93, explanation: 'Course and learning intent detected.' },
  { id: 't12', date: '2026-09-10', description: 'Amazon stationery', category: 'Education', predictedCategory: 'Education', amount: 250, type: 'Expense', paymentMethod: 'UPI', confidence: 76, explanation: 'Stationery purchase connected to study patterns.' },
  { id: 't13', date: '2026-09-10', description: 'Football turf booking', category: 'Entertainment', predictedCategory: 'Entertainment', amount: 250, type: 'Expense', paymentMethod: 'UPI', confidence: 87, explanation: 'Sports leisure booking behavior cluster.' },
  { id: 't14', date: '2026-09-11', description: 'Pharmacy', category: 'Healthcare', predictedCategory: 'Healthcare', amount: 180, type: 'Expense', paymentMethod: 'UPI', confidence: 93, explanation: 'Medical store transaction.' },
  { id: 't15', date: '2026-09-12', description: 'Grocery purchase', category: 'Groceries', predictedCategory: 'Groceries', amount: 300, type: 'Expense', paymentMethod: 'UPI', confidence: 88, explanation: 'Groceries merchant and basket profile.' },
  { id: 't16', date: '2026-09-12', description: 'Zomato dinner', category: 'Food', predictedCategory: 'Food', amount: 320, type: 'Expense', paymentMethod: 'UPI', confidence: 94, explanation: 'Food delivery platform with meal timing.' },
  { id: 't17', date: '2026-09-13', description: 'Café coffee', category: 'Food', predictedCategory: 'Food', amount: 140, type: 'Expense', paymentMethod: 'UPI', confidence: 86, explanation: 'Cafe and beverage pattern.' },
  { id: 't18', date: '2026-09-14', description: 'Bus pass recharge', category: 'Transport', predictedCategory: 'Transport', amount: 300, type: 'Expense', paymentMethod: 'UPI', confidence: 90, explanation: 'Transport pass recurring spend.' },
  { id: 't19', date: '2026-09-15', description: 'PhonePe scan snacks', category: 'Food', predictedCategory: 'Food', amount: 110, type: 'Expense', paymentMethod: 'UPI', confidence: 81, explanation: 'Small snack spend detected via merchant note.' },
  { id: 't20', date: '2026-09-16', description: 'Lab printouts', category: 'Education', predictedCategory: 'Education', amount: 120, type: 'Expense', paymentMethod: 'Cash', confidence: 82, explanation: 'Academic support expense.' },
  { id: 't21', date: '2026-09-16', description: 'Canteen combo', category: 'Food', predictedCategory: 'Food', amount: 130, type: 'Expense', paymentMethod: 'UPI', confidence: 88, explanation: 'Canteen and food keywords.' },
  { id: 't22', date: '2026-09-17', description: 'Book fair purchase', category: 'Education', predictedCategory: 'Education', amount: 130, type: 'Expense', paymentMethod: 'UPI', confidence: 84, explanation: 'Books and education relevance.' },
  { id: 't23', date: '2026-09-17', description: 'Swiggy Instamart', category: 'Groceries', predictedCategory: 'Food', amount: 212, type: 'Expense', paymentMethod: 'UPI', confidence: 67, explanation: 'Swiggy keyword biased model toward food.' },
  { id: 't24', date: '2026-09-18', description: 'Canteen sandwich', category: 'Food', predictedCategory: 'Food', amount: 140, type: 'Expense', paymentMethod: 'UPI', confidence: 90, explanation: 'Meal item in canteen.' },
  { id: 't25', date: '2026-09-18', description: 'Headphone cover', category: 'Shopping', predictedCategory: 'Shopping', amount: 180, type: 'Expense', paymentMethod: 'UPI', confidence: 79, explanation: 'Accessory purchase mapped to shopping.' },
]

const initialBudgets: Budget[] = [
  { category: 'Food', limit: 3000, kind: 'Flexible' },
  { category: 'Transport', limit: 1200, kind: 'Essential' },
  { category: 'Entertainment', limit: 800, kind: 'Non-essential' },
  { category: 'Education', limit: 1500, kind: 'Essential' },
  { category: 'Groceries', limit: 1000, kind: 'Essential' },
  { category: 'Bills', limit: 3500, kind: 'Essential' },
]

const weeklyTrend = [
  { name: 'W1', amount: 1820 },
  { name: 'W2', amount: 2040 },
  { name: 'W3', amount: 2420 },
  { name: 'W4', amount: 2180 },
]

const smallSpendByDay = [
  { day: 'Mon', count: 2 },
  { day: 'Tue', count: 2 },
  { day: 'Wed', count: 4 },
  { day: 'Thu', count: 2 },
  { day: 'Fri', count: 5 },
  { day: 'Sat', count: 2 },
  { day: 'Sun', count: 1 },
]

const riskLevels = [
  { category: 'Food', risk: 78, level: 'High' },
  { category: 'Entertainment', risk: 64, level: 'Medium' },
  { category: 'Transport', risk: 25, level: 'Low' },
]

const aiTerms = [
  ['BFS', 'Finds a plan with minimum number of actions.'],
  ['DFS', 'Explores one strategy deeply before trying alternatives.'],
  ['Bayesian Networks', 'A probability graph that combines evidence to estimate risk.'],
  ['Forward Chaining', 'Starts from facts and applies rules to derive conclusions.'],
  ['Backward Chaining', 'Starts from a goal and works backward to required conditions.'],
  ['Heuristic Search', 'Uses scoring to prioritize high-value low-effort actions.'],
] as const

const STORAGE_KEYS = {
  transactions: 'finwise_transactions',
  budgets: 'finwise_budgets',
  learning: 'finwise_learning',
  dark: 'finwise_dark_mode',
}

function usePersistentState<T>(key: string, fallback: T) {
  const [state, setState] = useState<T>(() => {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    try {
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  })

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state))
  }, [key, state])

  return [state, setState] as const
}

function App() {
  return (
    <BrowserRouter>
      <FinWiseApp />
    </BrowserRouter>
  )
}

function FinWiseApp() {
  const [transactions, setTransactions] = usePersistentState(STORAGE_KEYS.transactions, initialTransactions)
  const [budgets, setBudgets] = usePersistentState(STORAGE_KEYS.budgets, initialBudgets)
  const [learningHistory, setLearningHistory] = usePersistentState<LearningRecord[]>(STORAGE_KEYS.learning, [
    { input: 'Swiggy Instamart', original: 'Food', corrected: 'Groceries', date: '2026-09-17', status: 'Applied to model memory' },
  ])
  const [darkMode, setDarkMode] = usePersistentState(STORAGE_KEYS.dark, false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showSearchTree, setShowSearchTree] = useState(false)
  const [showDemo, setShowDemo] = useState(false)
  const [demoStep, setDemoStep] = useState(1)
  const [foodRisk, setFoodRisk] = useState(78)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  const totals = useMemo(() => {
    const income = transactions.filter((t) => t.type === 'Income').reduce((s, t) => s + t.amount, 0)
    const expenses = transactions.filter((t) => t.type === 'Expense').reduce((s, t) => s + t.amount, 0)
    return { income, expenses, balance: income - expenses, savingsRate: income > 0 ? ((income - expenses) / income) * 100 : 0 }
  }, [transactions])

  const categorySpend = useMemo(() => {
    return ['Food', 'Bills', 'Transport', 'Education', 'Entertainment', 'Groceries'].map((category) => ({
      category,
      amount: transactions
        .filter((t) => t.type === 'Expense' && t.category === category)
        .reduce((sum, t) => sum + t.amount, 0),
    }))
  }, [transactions])

  const handleDelete = (id: string) => {
    if (!confirm('Delete this transaction? This action cannot be undone.')) return
    setTransactions((prev) => prev.filter((t) => t.id !== id))
    toast.success('Transaction deleted')
  }

  const handleCorrection = (tx: Transaction, corrected: Category) => {
    setTransactions((prev) =>
      prev.map((item) =>
        item.id === tx.id ? { ...item, category: corrected, predictedCategory: tx.predictedCategory } : item,
      ),
    )
    setLearningHistory((prev) => [
      {
        input: tx.description,
        original: tx.predictedCategory,
        corrected,
        date: new Date().toISOString().slice(0, 10),
        status: 'Added to adaptive mapping',
      },
      ...prev,
    ])
    toast.success('Thanks — FinWise AI will use this correction to improve future predictions.')
  }

  const runDemoStep = () => {
    if (demoStep === 1) {
      const newTx: Transaction = {
        id: crypto.randomUUID(),
        date: '2026-09-19',
        description: 'Swiggy order ₹350',
        category: 'Food',
        predictedCategory: 'Food',
        amount: 350,
        type: 'Expense',
        paymentMethod: 'UPI',
        confidence: 93,
        explanation: 'Matched food-delivery merchant and meal-related keywords.',
      }
      setTransactions((p) => [newTx, ...p])
      toast.success('Step 1: Added Swiggy order ₹350')
      setDemoStep(2)
      return
    }
    if (demoStep === 2) {
      toast.info('Step 2: FinWise AI categorized it as Food with 93% confidence.')
      setDemoStep(3)
      return
    }
    if (demoStep === 3) {
      setFoodRisk(84)
      toast.warning('Step 3: Food budget risk increased from 78% to 84%.')
      setDemoStep(4)
      return
    }
    if (demoStep === 4) {
      toast.info('Step 4: Rule engine: projected food spending now exceeds budget.')
      setDemoStep(5)
      return
    }
    toast.success('FinWise AI does not only track spending—it understands patterns, predicts risk, and recommends explainable actions.')
    setShowDemo(false)
    setDemoStep(1)
  }

  const exportCsv = () => {
    const rows = [['Date', 'Description', 'Category', 'Payment Method', 'Amount', 'Type'], ...transactions.map((t) => [t.date, t.description, t.category, t.paymentMethod, String(t.amount), t.type])]
    const csv = rows.map((r) => r.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'finwise-transactions.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const applyAiBudget = () => {
    if (!confirm('Apply AI recommended budgets?')) return
    setBudgets((prev) =>
      prev.map((b) => {
        if (b.category === 'Food') return { ...b, limit: 2800 }
        if (b.category === 'Transport') return { ...b, limit: 1100 }
        if (b.category === 'Entertainment') return { ...b, limit: 650 }
        return b
      }),
    )
    toast.success('AI recommended budgets applied.')
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Toaster richColors position="top-right" />
        <div className="flex min-h-screen">
          <aside className={`border-r border-slate-200 bg-white transition-all dark:border-slate-800 dark:bg-slate-900 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-2">
                <CircleDollarSign className="h-8 w-8 text-indigo-600" />
                {sidebarOpen && <div><p className="font-semibold">FinWise AI</p><p className="text-xs text-slate-500">Finance Coach</p></div>}
              </div>
              <button onClick={() => setSidebarOpen((v) => !v)} aria-label="Toggle sidebar">
                {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            </div>
            <nav className="space-y-1 px-3">
              {navItems.map(([label, path, Icon]) => (
                <NavLink key={path} to={path} className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-indigo-50 text-indigo-700 dark:bg-slate-800 dark:text-indigo-300' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <Icon className="h-4 w-4" />
                  {sidebarOpen && label}
                </NavLink>
              ))}
            </nav>
            <div className="absolute bottom-0 w-inherit p-4">
              <Card className="dark:bg-slate-900">
                <CardContent className="p-3">
                  <p className="text-sm font-semibold">Arun Kumar</p>
                  <p className="text-xs text-slate-500">Student</p>
                </CardContent>
              </Card>
            </div>
          </aside>

          <main className="flex-1">
            <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
              <div className="flex items-center gap-2 text-sm text-slate-500"><Sparkles className="h-4 w-4 text-indigo-600" /> Explainable student finance AI demo</div>
              <div className="flex items-center gap-2">
                <Button variant="secondary" size="icon" aria-label="Notifications"><Bell className="h-4 w-4" /></Button>
                <Button variant="secondary" size="icon" aria-label="Toggle dark mode" onClick={() => setDarkMode((d) => !d)}>{darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>
              </div>
            </header>

            <div className="p-6">
              <Routes>
                <Route path="/" element={<DashboardPage totals={totals} categorySpend={categorySpend} budgets={budgets} transactions={transactions} onRunDemo={() => setShowDemo(true)} foodRisk={foodRisk} />} />
                <Route
                  path="/transactions"
                  element={<TransactionsPage transactions={transactions} onDelete={handleDelete} onSelect={setSelectedTransaction} onExport={exportCsv} />}
                />
                <Route
                  path="/add"
                  element={<AddTransactionPage onAdd={(tx) => {
                    setTransactions((prev) => [{ ...tx, id: crypto.randomUUID() }, ...prev])
                    toast.success('Transaction added. Financial Coach Agent triggered.')
                    if (tx.category !== 'Income') toast.info('AI recommendation: This affects your budget trajectory.')
                  }} />}
                />
                <Route path="/budgets" element={<BudgetsPage budgets={budgets} setBudgets={setBudgets} onApplyAi={applyAiBudget} />} />
                <Route path="/insights" element={<AIInsightsPage foodRisk={foodRisk} setShowSearchTree={setShowSearchTree} />} />
                <Route path="/planner" element={<SavingsPlannerPage setShowSearchTree={setShowSearchTree} />} />
                <Route path="/goals" element={<GoalsPage />} />
                <Route path="/knowledge" element={<KnowledgePage />} />
                <Route path="/learning" element={<LearningPage records={learningHistory} />} />
                <Route path="/settings" element={<SettingsPage setTransactions={setTransactions} setBudgets={setBudgets} setLearning={setLearningHistory} darkMode={darkMode} setDarkMode={setDarkMode} />} />
              </Routes>
            </div>
          </main>
        </div>

        <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
          <DialogContent>
            {selectedTransaction && (
              <>
                <DialogHeader>
                  <DialogTitle>{selectedTransaction.description}</DialogTitle>
                  <DialogDescription>{selectedTransaction.date} • {selectedTransaction.paymentMethod}</DialogDescription>
                </DialogHeader>
                <div className="space-y-3 text-sm">
                  <p><strong>Predicted category:</strong> {selectedTransaction.predictedCategory}</p>
                  <p><strong>Confidence:</strong> {selectedTransaction.confidence}%</p>
                  <p><strong>Why this category?</strong> {selectedTransaction.explanation}</p>
                  <label className="block">
                    User correction
                    <select className="mt-1 w-full rounded-lg border border-slate-200 p-2" onChange={(e) => handleCorrection(selectedTransaction, e.target.value as Category)} defaultValue={selectedTransaction.category}>
                      {['Food', 'Transport', 'Education', 'Entertainment', 'Shopping', 'Bills', 'Groceries', 'Healthcare', 'Income', 'Other'].map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </label>
                  <Button onClick={() => handleCorrection(selectedTransaction, selectedTransaction.category)}>Correct AI Category</Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={showSearchTree} onOpenChange={setShowSearchTree}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Search Tree View</DialogTitle>
              <DialogDescription>State-space for saving-plan generation.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 text-sm md:grid-cols-3">
              <Card><CardContent className="p-3">Start → ₹0</CardContent></Card>
              <Card><CardContent className="p-3">Pause Subscription → ₹199</CardContent></Card>
              <Card><CardContent className="p-3">Reduce Food Delivery → ₹599</CardContent></Card>
              <Card><CardContent className="p-3">Skip Movie → ₹899</CardContent></Card>
              <Card><CardContent className="p-3">Reduce Snacks → ₹1,049 ✅</CardContent></Card>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showDemo} onOpenChange={setShowDemo}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Run AI Demo</DialogTitle>
              <DialogDescription>Step {demoStep} of 5</DialogDescription>
            </DialogHeader>
            <p className="text-sm text-slate-600">{[
              'Add a new “Swiggy order ₹350” transaction.',
              'FinWise AI categorizes it as Food with 93% confidence.',
              'Food budget risk increases from 78% to 84%.',
              'Rule engine explains projected food spending exceeds budget.',
              'Saving Planner generates a realistic ₹1,000 saving plan.',
            ][demoStep - 1]}</p>
            <Button onClick={runDemoStep}>{demoStep < 5 ? 'Next Step' : 'Finish Demo'}</Button>
          </DialogContent>
        </Dialog>

        <footer className="border-t border-slate-200 bg-white p-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          {aiTerms.map(([term, tip]) => (
            <Tooltip key={term}>
              <TooltipTrigger className="mx-2 underline decoration-dotted">{term}</TooltipTrigger>
              <TooltipContent>{tip}</TooltipContent>
            </Tooltip>
          ))}
        </footer>
      </div>
    </TooltipProvider>
  )
}

function DashboardPage({ totals: _totals, categorySpend, budgets, transactions, onRunDemo, foodRisk }: { totals: { income: number; expenses: number; balance: number; savingsRate: number }; categorySpend: { category: string; amount: number }[]; budgets: Budget[]; transactions: Transaction[]; onRunDemo: () => void; foodRisk: number }) {
  const recent = [...transactions].slice(0, 5)
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Good morning, Arun 👋</h1>
          <p className="text-slate-500">Your financial health is improving. Let’s make every rupee count.</p>
        </div>
        <Button onClick={onRunDemo}>Run AI Demo</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Income" value={formatINR(12000)} icon={<CircleDollarSign className="h-4 w-4" />} />
        <StatCard title="Total Expenses" value={formatINR(8460)} icon={<Wallet className="h-4 w-4" />} />
        <StatCard title="Available Balance" value={formatINR(3540)} icon={<Bus className="h-4 w-4" />} />
        <StatCard title="Savings Rate" value="29.5%" icon={<LineChart className="h-4 w-4" />} />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Financial Health Score</CardTitle><CardDescription>Improving</CardDescription></CardHeader>
          <CardContent className="space-y-3">
            <div className="mx-auto grid h-32 w-32 place-items-center rounded-full border-8 border-indigo-100 text-2xl font-semibold text-indigo-700">72/100</div>
            {[
              ['Savings discipline', '22/30'],
              ['Budget control', '19/25'],
              ['Spending consistency', '12/15'],
              ['Goal progress', '11/15'],
              ['Essential expense balance', '8/15'],
            ].map(([k, v]) => <p className="flex justify-between text-sm" key={k}><span>{k}</span><span>{v}</span></p>)}
            <Button variant="secondary">View AI score explanation</Button>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Monthly spending trend</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ReLineChart data={weeklyTrend}><XAxis dataKey="name" /><YAxis /><ReTooltip /><Line type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={3} /></ReLineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Category spending</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categorySpend} dataKey="amount" nameKey="category" innerRadius={55} outerRadius={80}>
                  {categorySpend.map((_, i) => <Cell key={i} fill={['#4f46e5', '#10b981', '#f59e0b', '#0ea5e9', '#ef4444', '#8b5cf6'][i % 6]} />)}
                </Pie>
                <ReTooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Budget status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {budgets.slice(0, 5).map((b) => {
              const spent = categorySpend.find((c) => c.category === b.category)?.amount ?? 0
              const pct = (spent / b.limit) * 100
              return <div key={b.category}>
                <div className="mb-1 flex items-center justify-between text-sm"><span>{b.category}: {formatINR(spent)} / {formatINR(b.limit)}</span><Badge variant={pct > 79 ? 'warning' : 'secondary'}>{Math.round(pct)}%</Badge></div>
                <Progress value={pct} />
              </div>
            })}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <InsightCard text={`Food budget risk: ${foodRisk}%`} />
        <InsightCard text="You made 18 small purchases below ₹150." />
        <InsightCard text="You can save ₹650 by reducing food delivery and café purchases." />
        <InsightCard text="Your Football Boots goal is 40% complete." />
      </div>
      <Card>
        <CardHeader><CardTitle>Recent transactions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {recent.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3 text-sm">
              <span>{tx.description} • {tx.date}</span>
              <span className={tx.type === 'Income' ? 'text-emerald-600' : 'text-red-600'}>{tx.type === 'Income' ? '+' : '-'}{formatINR(tx.amount)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function TransactionsPage({ transactions, onDelete, onSelect, onExport }: { transactions: Transaction[]; onDelete: (id: string) => void; onSelect: (tx: Transaction) => void; onExport: () => void }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [kind, setKind] = useState('All')
  const [sort, setSort] = useState('newest')

  const filtered = useMemo(() => {
    return [...transactions]
      .filter((t) => t.description.toLowerCase().includes(search.toLowerCase()))
      .filter((t) => (category === 'All' ? true : t.category === category))
      .filter((t) => (kind === 'All' ? true : t.type === kind))
      .sort((a, b) => (sort === 'amount' ? b.amount - a.amount : b.date.localeCompare(a.date)))
  }, [transactions, search, category, kind, sort])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input className="pl-9" placeholder="Search transactions" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <select className="h-10 rounded-lg border border-slate-200 px-3" onChange={(e) => setCategory(e.target.value)}><option>All</option>{['Food', 'Transport', 'Education', 'Entertainment', 'Shopping', 'Bills', 'Groceries', 'Healthcare', 'Income', 'Other'].map((c) => <option key={c}>{c}</option>)}</select>
        <Input type="date" className="w-[170px]" aria-label="Date range start" />
        <select className="h-10 rounded-lg border border-slate-200 px-3" onChange={(e) => setKind(e.target.value)}><option>All</option><option>Income</option><option>Expense</option></select>
        <select className="h-10 rounded-lg border border-slate-200 px-3" onChange={(e) => setSort(e.target.value)}><option value="newest">Newest</option><option value="amount">Amount</option></select>
        <Button variant="secondary" onClick={onExport}>Export CSV</Button>
      </div>
      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr><th className="p-3">Date</th><th>Description</th><th>Category</th><th>Payment</th><th>Amount</th><th>AI Confidence</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((tx) => (
                <tr key={tx.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="p-3">{tx.date}</td>
                  <td><button className="text-left text-indigo-700" onClick={() => onSelect(tx)}>{tx.description}</button></td>
                  <td>{tx.category}</td>
                  <td>{tx.paymentMethod}</td>
                  <td className={tx.type === 'Income' ? 'text-emerald-600' : 'text-red-600'}>{tx.type === 'Income' ? '+' : '-'}{formatINR(tx.amount)}</td>
                  <td>{tx.confidence}%</td>
                  <td><div className="flex gap-1"><Button size="sm" variant="secondary" onClick={() => onSelect(tx)}>Edit</Button><Button size="sm" variant="danger" onClick={() => onDelete(tx.id)}><Trash2 className="h-3 w-3" /></Button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

function AddTransactionPage({ onAdd }: { onAdd: (tx: Omit<Transaction, 'id' | 'predictedCategory' | 'confidence' | 'explanation'> & Pick<Transaction, 'predictedCategory' | 'confidence' | 'explanation'>) => void }) {
  const [form, setForm] = useState({ type: 'Expense' as TransactionType, amount: 350, description: 'Swiggy biryani order', date: '2026-09-19', paymentMethod: 'UPI' as PaymentMethod, category: 'Food' as Category, notes: '' })
  const [processing, setProcessing] = useState(false)
  const ai = { category: form.description.toLowerCase().includes('swiggy') ? 'Food' : form.category, confidence: 93, reason: 'Matched food-delivery merchant and meal-related keywords.', alternatives: [{ c: 'Groceries', p: 5 }, { c: 'Entertainment', p: 2 }] }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle>Add Transaction</CardTitle></CardHeader>
        <CardContent className="grid gap-3">
          <div className="flex gap-2">
            <Button variant={form.type === 'Income' ? 'default' : 'secondary'} onClick={() => setForm({ ...form, type: 'Income', category: 'Income' })}>Income</Button>
            <Button variant={form.type === 'Expense' ? 'default' : 'secondary'} onClick={() => setForm({ ...form, type: 'Expense', category: 'Food' })}>Expense</Button>
          </div>
          <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} aria-label="Amount" />
          <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} aria-label="Description" />
          <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} aria-label="Date" />
          <select className="h-10 rounded-lg border border-slate-200 px-3" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}><option>UPI</option><option>Cash</option><option>Card</option><option>Bank Transfer</option></select>
          <select className="h-10 rounded-lg border border-slate-200 px-3" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })}><option>Food</option><option>Transport</option><option>Education</option><option>Entertainment</option><option>Shopping</option><option>Bills</option><option>Groceries</option><option>Healthcare</option><option>Income</option><option>Other</option></select>
          <Input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          <Button
            onClick={() => {
              setProcessing(true)
              setTimeout(() => {
                onAdd({ ...form, predictedCategory: ai.category as Category, confidence: ai.confidence, explanation: ai.reason })
                setProcessing(false)
              }, 800)
            }}
            disabled={processing}
          >
            {processing ? 'Simulating AI processing...' : 'Add transaction'}
          </Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>Live AI classification</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>AI suggested category:</strong> {ai.category}</p>
          <p><strong>Confidence:</strong> {ai.confidence}%</p>
          <p><strong>Reason:</strong> {ai.reason}</p>
          <p><strong>Alternatives:</strong></p>
          {ai.alternatives.map((a) => <p key={a.c}>- {a.c}: {a.p}%</p>)}
        </CardContent>
      </Card>
    </div>
  )
}

function BudgetsPage({ budgets, setBudgets, onApplyAi }: { budgets: Budget[]; setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>; onApplyAi: () => void }) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Monthly budget total: ₹10,000</CardTitle></CardHeader>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {budgets.map((b, i) => (
          <Card key={b.category}>
            <CardContent className="space-y-2 p-4">
              <p className="font-medium">{b.category}</p>
              <Input type="number" value={b.limit} onChange={(e) => setBudgets((p) => p.map((x, idx) => idx === i ? { ...x, limit: Number(e.target.value) } : x))} />
              <select className="h-10 w-full rounded-lg border border-slate-200 px-3" value={b.kind} onChange={(e) => setBudgets((p) => p.map((x, idx) => idx === i ? { ...x, kind: e.target.value as Budget['kind'] } : x))}><option>Essential</option><option>Flexible</option><option>Non-essential</option></select>
              <Progress value={Math.min(100, (b.limit / 3500) * 100)} />
            </CardContent>
          </Card>
        ))}
      </div>
      <Button variant="secondary">Add Category Budget</Button>
      <Card>
        <CardHeader><CardTitle>AI Budget Recommendation</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Based on your last 3 months of spending, FinWise AI suggests:</p>
          <p>- Food budget: ₹2,800</p>
          <p>- Transport budget: ₹1,100</p>
          <p>- Entertainment budget: ₹650</p>
          <p>These recommendations protect essential expenses while improving your projected savings by ₹750.</p>
          <Button onClick={onApplyAi}>Apply AI Recommended Budget</Button>
        </CardContent>
      </Card>
    </div>
  )
}

function AIInsightsPage({ foodRisk, setShowSearchTree }: { foodRisk: number; setShowSearchTree: (v: boolean) => void }) {
  const [challenge, setChallenge] = useState(false)
  const [showWhy, setShowWhy] = useState(false)

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">FinWise AI Insights</h1>
        <p className="text-sm text-slate-500">Transparent recommendations generated from your transactions, finance rules, and budget-risk prediction.</p>
      </div>
      <Tabs defaultValue="coach">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          <TabsTrigger value="coach">Financial Coach</TabsTrigger>
          <TabsTrigger value="leak">Expense Leak Detector</TabsTrigger>
          <TabsTrigger value="risk">Budget Risk Predictor</TabsTrigger>
          <TabsTrigger value="rules">Explainable Rules</TabsTrigger>
          <TabsTrigger value="bayes">Bayesian Risk Model</TabsTrigger>
          <TabsTrigger value="patterns">Spending Patterns</TabsTrigger>
        </TabsList>
        <TabsContent value="coach" className="grid gap-3 md:grid-cols-3">
          {[['Food budget may exceed by ₹600', 'You have spent ₹2,400 out of your ₹3,000 food budget in 18 days. At the current daily average, you may spend ₹3,600 by month-end.', ['View explanation', 'Create saving mission', 'Ignore suggestion']], ['Hidden expense leak detected', 'You made 18 transactions below ₹150. Together they total ₹1,260, which is 10.5% of your monthly income.', ['See transactions', 'Start micro-spend challenge']], ['Reach your football boots goal faster', 'Reducing food delivery by two orders per week can add approximately ₹600 per month toward your goal.', ['Add to my savings plan', 'See goal simulation']]].map(([title, msg, actions]) => (
            <Card key={title as string}><CardContent className="space-y-2 p-4"><p className="font-semibold">{title}</p><p className="text-sm text-slate-600">{msg}</p><div className="flex flex-wrap gap-2">{(actions as string[]).map((a) => <Button key={a} size="sm" variant="secondary">{a}</Button>)}</div></CardContent></Card>
          ))}
        </TabsContent>
        <TabsContent value="leak" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-4">{[['Total small purchases', '18'], ['Total amount', '₹1,260'], ['Most common time', '4 PM–7 PM'], ['Most common category', 'Food']].map(([k, v]) => <StatCard key={k as string} title={k as string} value={v as string} icon={<Lightbulb className="h-4 w-4" />} />)}</div>
          <Card><CardContent className="h-56 p-4"><ResponsiveContainer width="100%" height="100%"><BarChart data={smallSpendByDay}><XAxis dataKey="day" /><YAxis /><ReTooltip /><Bar dataKey="count" fill="#0ea5e9" /></BarChart></ResponsiveContainer></CardContent></Card>
          <p className="text-sm text-slate-600">Each expense looks small, but repeated transactions are affecting your monthly savings.</p>
          <Button onClick={() => setChallenge(true)}>Start 7-Day Micro-Spend Challenge</Button>
          {challenge && <Card><CardContent className="p-4">Limit expenses below ₹150 to a maximum of 3 per day.</CardContent></Card>}
        </TabsContent>
        <TabsContent value="risk" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">{riskLevels.map((r) => <Card key={r.category}><CardContent className="p-4"><p className="font-medium">{r.category} budget risk</p><p className="text-xl font-semibold">{r.risk}%</p><Badge variant={r.level === 'High' ? 'danger' : r.level === 'Medium' ? 'warning' : 'success'}>{r.level}</Badge></CardContent></Card>)}</div>
          <Card><CardContent className="space-y-2 p-4 text-sm"><p>Current budget used: 80%</p><p>Days remaining: 12</p><p>Current daily average: ₹133</p><p>Predicted month-end spending: ₹3,600</p><p>Predicted overrun: ₹600</p><Progress value={foodRisk} /><Button onClick={() => setShowWhy(true)}>Why is this risk high?</Button></CardContent></Card>
          {showWhy && <Card><CardContent className="p-4 text-sm">FinWise AI calculated risk using current spending rate, small-payment frequency, remaining days, and historical category behavior.</CardContent></Card>}
        </TabsContent>
        <TabsContent value="rules" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Card><CardHeader><CardTitle>Facts</CardTitle></CardHeader><CardContent className="text-sm">User: Arun<br />Food budget: ₹3,000<br />Food spent: ₹2,400<br />Day: 18/30<br />Predicted food spend: ₹3,600</CardContent></Card>
            <Card><CardHeader><CardTitle>Rule</CardTitle></CardHeader><CardContent className="text-sm">IF Predicted Spending &gt; Category Budget THEN High Budget Risk</CardContent></Card>
            <Card><CardHeader><CardTitle>Conclusion</CardTitle></CardHeader><CardContent className="text-sm">Food category is at High Budget Risk.</CardContent></Card>
          </div>
          <Card><CardContent className="p-4 text-sm">New transaction → Update spending total → Calculate daily average → Predict month-end expense → Compare with budget → Trigger alert</CardContent></Card>
          <Button variant="secondary">Why did I receive this?</Button>
        </TabsContent>
        <TabsContent value="bayes" className="space-y-4">
          <Card><CardContent className="grid gap-2 p-4 text-sm md:grid-cols-5"><Node label="Spending Rate\nHigh" /><Node label="Micro-Spending\nHigh" /><Node label="Days Remaining\n12" /><Node label="Previous Overrun\nYes" /><Node label={`Budget Overrun Risk\n${foodRisk}%`} /></CardContent></Card>
          <p className="text-sm text-slate-600">This is an educational probability estimate based on current spending behavior, not a financial guarantee.</p>
        </TabsContent>
        <TabsContent value="patterns" className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            {['You spend most on food between 4 PM and 7 PM.', 'Friday is your highest-spending day.', 'Food-delivery purchases increased by 25% compared with the previous month.', 'Your entertainment spending is concentrated on weekends.'].map((p) => <Card key={p}><CardContent className="p-4 text-sm">{p}</CardContent></Card>)}
          </div>
          <Button variant="secondary" onClick={() => setShowSearchTree(true)}>View Search Tree</Button>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Node({ label }: { label: string }) {
  return <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-center whitespace-pre-line">{label}</div>
}

function SavingsPlannerPage({ setShowSearchTree }: { setShowSearchTree: (v: boolean) => void }) {
  const [generated, setGenerated] = useState(false)
  const [loading, setLoading] = useState(false)
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">AI Savings Plan Generator</h1>
      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-2">
          <Input value="₹1,000" readOnly />
          <Input value="End of this month" readOnly />
          <select className="h-10 rounded-lg border border-slate-200 px-3"><option>Fewest lifestyle changes</option><option>Lowest difficulty</option><option>Maximum savings</option></select>
          <Input value="Protected: Rent/Bills, Education, Healthcare" readOnly />
          <Button
            onClick={() => {
              setLoading(true)
              setTimeout(() => {
                setGenerated(true)
                setLoading(false)
                toast.success('Best-First Search generated a savings plan.')
              }, 900)
            }}
          >
            Generate AI Saving Plan
          </Button>
        </CardContent>
      </Card>
      <AnimatePresence>
        {loading && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><Card><CardContent className="p-4">Searching state-space...</CardContent></Card></motion.div>}
      </AnimatePresence>
      {generated && (
        <Card>
          <CardContent className="space-y-2 p-4 text-sm">
            <p>1. Pause unused subscription — Save ₹199 — Difficulty 1/5</p>
            <p>2. Reduce food delivery — Save ₹400 — Difficulty 2/5</p>
            <p>3. Skip one movie outing — Save ₹300 — Difficulty 2/5</p>
            <p>4. Reduce snack purchases — Save ₹150 — Difficulty 2/5</p>
            <p className="font-semibold">Total estimated saving: ₹1,049 | Target achieved: Yes | Lifestyle difficulty: Low to Medium</p>
            <p>Best-First Search selected options with the strongest balance of expected savings and low difficulty.</p>
            <div className="grid gap-2 md:grid-cols-2">
              <Card><CardContent className="p-3 text-xs">BFS: Finds a plan with minimum number of actions</CardContent></Card>
              <Card><CardContent className="p-3 text-xs">DFS: Explores one saving strategy deeply before trying another</CardContent></Card>
              <Card><CardContent className="p-3 text-xs">Best-First Search: Prioritizes actions with high savings and low difficulty</CardContent></Card>
              <Card><CardContent className="p-3 text-xs">Heuristic: Expected Savings × Confidence / Difficulty</CardContent></Card>
            </div>
            <Button variant="secondary" onClick={() => setShowSearchTree(true)}>View Search Tree</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function GoalsPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card><CardContent className="space-y-2 p-4"><p className="text-lg font-semibold">Football Boots</p><p>Target: ₹3,500</p><p>Saved: ₹1,400</p><p>Remaining: ₹2,100</p><p>Deadline: 2 months</p><div className="mx-auto grid h-28 w-28 place-items-center rounded-full border-8 border-emerald-100 text-xl font-semibold text-emerald-700">40%</div><p>Monthly required saving: ₹1,050</p><p>AI recommendation: Save ₹263 per week to reach your goal on time.</p></CardContent></Card>
      <Card className="lg:col-span-2"><CardHeader><CardTitle>What-if Simulator</CardTitle></CardHeader><CardContent className="space-y-2 text-sm"><Input value="Buy headphones" readOnly /><Input value="₹1,500" readOnly /><Input value="Shopping" readOnly /><Input value="Today" readOnly /><p>Buying this item today may reduce your monthly savings from ₹2,000 to ₹500 and delay your Football Boots goal by approximately 1 month.</p><div className="flex flex-wrap gap-2"><Button variant="danger">Proceed anyway</Button><Button variant="secondary">Add to wishlist</Button><Button>Find saving plan instead</Button></div></CardContent></Card>
    </div>
  )
}

function KnowledgePage() {
  return (
    <Tabs defaultValue="facts" className="space-y-4">
      <TabsList>
        <TabsTrigger value="facts">Financial Facts</TabsTrigger>
        <TabsTrigger value="rules">Finance Rules</TabsTrigger>
        <TabsTrigger value="logic">Predicate Logic</TabsTrigger>
        <TabsTrigger value="forward">Forward Reasoning</TabsTrigger>
        <TabsTrigger value="backward">Backward Reasoning</TabsTrigger>
        <TabsTrigger value="learned">Learned Knowledge</TabsTrigger>
      </TabsList>
      <TabsContent value="facts"><Card><CardContent className="grid gap-2 p-4 text-sm md:grid-cols-2">{['income(arun, september, 12000)', 'budget(arun, food, 3000)', 'spent(arun, food, 2400)', 'predicted_spend(arun, food, 3600)', 'goal(arun, football_boots, 3500)', 'saved(arun, football_boots, 1400)'].map((f) => <Badge key={f} variant="secondary" className="justify-start">{f}</Badge>)}</CardContent></Card></TabsContent>
      <TabsContent value="rules"><Card><CardContent className="space-y-2 p-4 text-sm"><p>IF predicted_spend(User, Category) &gt; budget(User, Category) THEN high_budget_risk(User, Category)</p><p>IF small_expense_total(User) &gt; 10% of monthly_income(User) THEN micro_spending_leak(User)</p><p>IF savings_rate(User) &lt; 10% THEN low_savings_alert(User)</p></CardContent></Card></TabsContent>
      <TabsContent value="logic"><Card><CardContent className="p-4 text-sm">PredictedSpend(u, c, p) ∧ Budget(u, c, b) ∧ p &gt; b → HighBudgetRisk(u, c)<br />u = Arun, c = Food, p = ₹3,600, b = ₹3,000</CardContent></Card></TabsContent>
      <TabsContent value="forward"><Card><CardContent className="p-4 text-sm">New food transaction added → Food total updated → Forecast recalculated → Budget compared → High-risk rule fired → Personalized advice shown</CardContent></Card></TabsContent>
      <TabsContent value="backward"><Card><CardContent className="p-4 text-sm">Goal: Save ₹1,000 → Find flexible/non-essential categories → Find possible saving actions → Evaluate savings and difficulty → Generate action plan</CardContent></Card></TabsContent>
      <TabsContent value="learned"><Card><CardContent className="p-4 text-sm">User corrected “Swiggy Instamart” from Food to Groceries. FinWise AI learned a merchant-category association. Future similar transactions will receive a better category prediction.</CardContent></Card></TabsContent>
    </Tabs>
  )
}

function LearningPage({ records }: { records: LearningRecord[] }) {
  return (
    <div className="space-y-4">
      <Card><CardHeader><CardTitle>Transaction Categorization Model</CardTitle></CardHeader><CardContent className="text-sm">Input: “Swiggy biryani order” • Extracted keywords: Swiggy, biryani, order • Predicted class: Food • Confidence: 93% • Learning method: Hybrid keyword rules + neural-network classifier</CardContent></Card>
      <Card><CardContent className="p-4 text-sm">From repeated examples, FinWise AI discovered that Arun spends frequently on food during weekday evenings.</CardContent></Card>
      <Card><CardContent className="p-4 text-sm">Observed case: repeated evening food-delivery purchases caused food-budget risk. Learned reusable rule: frequent evening restaurant payments may indicate early food-budget risk.</CardContent></Card>
      <Card>
        <CardHeader><CardTitle>Correction History</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-3">Input transaction</th><th>Original AI category</th><th>User-corrected category</th><th>Date</th><th>Learning status</th></tr></thead><tbody>{records.map((r, i) => <tr key={i} className="border-t border-slate-100"><td className="p-3">{r.input}</td><td>{r.original}</td><td>{r.corrected}</td><td>{r.date}</td><td>{r.status}</td></tr>)}</tbody></table>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsPage({ setTransactions, setBudgets, setLearning, darkMode, setDarkMode }: { setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>; setBudgets: React.Dispatch<React.SetStateAction<Budget[]>>; setLearning: React.Dispatch<React.SetStateAction<LearningRecord[]>>; darkMode: boolean; setDarkMode: React.Dispatch<React.SetStateAction<boolean>> }) {
  return (
    <div className="space-y-4">
      <Card><CardContent className="grid gap-3 p-4 md:grid-cols-2"><Input value="Arun Kumar" readOnly /><Input value="B.Tech CSE Student" readOnly /><Input value="₹12,000" readOnly /><Input value="INR" readOnly /></CardContent></Card>
      <Card><CardContent className="space-y-2 p-4"><p className="text-sm">Notification settings: Budget alerts ON, AI coaching ON</p><p className="text-sm">Data privacy: Local-only demo data. No external API used.</p><div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={() => toast.success('Data exported (demo).')}>Export data</Button><Button variant="danger" onClick={() => { if (!confirm('Reset demo data?')) return; setTransactions(initialTransactions); setBudgets(initialBudgets); setLearning([]); toast.success('Demo data reset.') }}>Reset demo data</Button><Button variant="secondary" onClick={() => setDarkMode((d) => !d)}>{darkMode ? 'Disable dark mode' : 'Enable dark mode'}</Button></div></CardContent></Card>
    </div>
  )
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return <Card><CardContent className="flex items-center justify-between p-4"><div><p className="text-sm text-slate-500">{title}</p><p className="text-xl font-semibold">{value}</p></div><div className="rounded-lg bg-indigo-50 p-2 text-indigo-700">{icon}</div></CardContent></Card>
}

function InsightCard({ text }: { text: string }) {
  return <Card><CardContent className="p-4 text-sm">{text}</CardContent></Card>
}

export default App
