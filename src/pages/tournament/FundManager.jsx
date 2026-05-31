import React, { useState } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, Trash2, Lock, DollarSign, Edit2, Check, X } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const vnd = (amount) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount ?? 0);

const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

const today = () => new Date().toISOString().slice(0, 10);

// ─── Summary Card ────────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, gradient, textColor, darkMode }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl p-5 border transition-all hover:scale-[1.02] ${
        darkMode ? 'bg-white/5 border-white/10 backdrop-blur-md' : 'bg-white border-gray-200 shadow-sm'
      }`}
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${gradient}`}>
        <Icon size={20} className="text-white" />
      </div>
      <p className={`text-xs uppercase tracking-wider font-medium mb-1 ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>
        {label}
      </p>
      <p className={`text-xl font-black ${textColor}`}>{value}</p>
      <div className={`absolute -right-4 -bottom-4 w-20 h-20 rounded-full opacity-10 bg-gradient-to-br ${gradient}`} />
    </div>
  );
}

// ─── Transaction Table ────────────────────────────────────────────────────────

function TransactionTable({ items, type, isAdmin, onDelete, darkMode }) {
  const isIncome = type === 'income';
  const emptyText = isIncome ? 'Chưa có khoản thu nào' : 'Chưa có khoản chi nào';

  return (
    <div className="overflow-x-auto">
      {items.length === 0 ? (
        <div className={`text-center py-8 text-sm ${darkMode ? 'text-white/30' : 'text-gray-400'}`}>{emptyText}</div>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className={`border-b ${darkMode ? 'border-white/10' : 'border-gray-200'}`}>
              {['Nội Dung', 'Số Tiền', 'Ngày', isAdmin ? 'Xóa' : ''].map((h, i) => (
                <th
                  key={i}
                  className={`text-left py-2 px-3 text-xs uppercase tracking-wider font-semibold ${
                    darkMode ? 'text-white/40' : 'text-gray-500'
                  } ${i === 3 ? 'text-center' : ''}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className={`border-b transition-colors ${
                  darkMode
                    ? 'border-white/5 hover:bg-white/5'
                    : 'border-gray-100 hover:bg-gray-50'
                }`}
              >
                <td className={`py-3 px-3 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{item.label}</td>
                <td className={`py-3 px-3 font-bold ${isIncome ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isIncome ? '+' : '-'}{vnd(item.amount)}
                </td>
                <td className={`py-3 px-3 ${darkMode ? 'text-white/50' : 'text-gray-500'}`}>{item.date}</td>
                {isAdmin && (
                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={() => onDelete(item.id)}
                      className="w-7 h-7 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 flex items-center justify-center mx-auto transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Add Form ────────────────────────────────────────────────────────────────

function AddForm({ type, onAdd, darkMode }) {
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');

  const handleAdd = () => {
    const amt = parseFloat(amount);
    if (!label.trim() || isNaN(amt) || amt <= 0) return;
    onAdd({ id: genId(), label: label.trim(), amount: amt, date: today() });
    setLabel('');
    setAmount('');
  };

  const isIncome = type === 'income';
  const placeholder = isIncome ? 'Tên khoản thu...' : 'Tên khoản chi...';
  const inputBase = `px-3 py-2 rounded-xl text-sm border outline-none transition-all focus:ring-2 ${
    darkMode
      ? 'bg-white/8 border-white/10 text-white placeholder-white/30 focus:ring-cyan-500/40 focus:border-cyan-500/40'
      : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-cyan-500/30 focus:border-cyan-500'
  }`;

  return (
    <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-dashed border-white/10">
      <input
        className={`${inputBase} flex-1 min-w-32`}
        placeholder={placeholder}
        value={label}
        onChange={(e) => setLabel(e.target.value)}
      />
      <input
        className={`${inputBase} w-40`}
        placeholder="Số tiền (VND)"
        type="number"
        min="0"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
      />
      <button
        onClick={handleAdd}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all active:scale-95 ${
          isIncome
            ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
            : 'bg-red-500 hover:bg-red-400 text-white'
        }`}
      >
        <Plus size={14} />
        Thêm
      </button>
    </div>
  );
}

// ─── Entry Fee Card ───────────────────────────────────────────────────────────

function EntryFeeCard({ fee, isAdmin, onSave, darkMode }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(fee ?? 0);

  const handleSave = () => {
    onSave(parseFloat(val) || 0);
    setEditing(false);
  };

  const cardBg = darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm';

  return (
    <div className={`rounded-2xl border p-5 ${cardBg}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-amber-400" />
          <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Phí Đăng Ký / Đội</p>
        </div>
        {isAdmin && !editing && (
          <button
            onClick={() => { setVal(fee ?? 0); setEditing(true); }}
            className="w-8 h-8 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 flex items-center justify-center transition-colors"
          >
            <Edit2 size={13} />
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="number"
            min="0"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className={`flex-1 px-3 py-2 rounded-xl text-sm border outline-none focus:ring-2 focus:ring-amber-500/40 ${
              darkMode
                ? 'bg-white/8 border-white/10 text-white'
                : 'bg-gray-50 border-gray-300 text-gray-900'
            }`}
          />
          <button onClick={handleSave} className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/30 transition-colors">
            <Check size={13} />
          </button>
          <button onClick={() => setEditing(false)} className="w-8 h-8 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/30 transition-colors">
            <X size={13} />
          </button>
        </div>
      ) : (
        <p className="text-2xl font-black text-amber-400 mt-1">{vnd(fee ?? 0)}</p>
      )}
    </div>
  );
}

// ─── Ratio Bar ───────────────────────────────────────────────────────────────

function RatioBar({ income, expense, darkMode }) {
  const total = income + expense;
  const incPct = total > 0 ? (income / total) * 100 : 0;
  const expPct = total > 0 ? (expense / total) * 100 : 0;

  return (
    <div className={`rounded-2xl border p-5 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm'}`}>
      <p className={`text-sm font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Tỷ Lệ Thu / Chi</p>
      <div className="flex rounded-full overflow-hidden h-4 mb-3 bg-white/5">
        <div
          className="bg-gradient-to-r from-emerald-500 to-green-400 transition-all duration-700 h-full"
          style={{ width: `${incPct}%` }}
        />
        <div
          className="bg-gradient-to-r from-red-500 to-orange-400 transition-all duration-700 h-full"
          style={{ width: `${expPct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs font-semibold">
        <span className="text-emerald-400">Thu: {incPct.toFixed(1)}%</span>
        <span className="text-red-400">Chi: {expPct.toFixed(1)}%</span>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FundManager({ tournament, darkMode, language, isAdmin, onUpdate }) {
  const fund = tournament?.fund ?? { entryFee: 0, income: [], expenses: [] };
  const income = fund.income ?? [];
  const expenses = fund.expenses ?? [];

  const totalIncome = income.reduce((s, i) => s + Number(i.amount), 0);
  const totalExpense = expenses.reduce((s, i) => s + Number(i.amount), 0);
  const balance = totalIncome - totalExpense;
  const isPositive = balance >= 0;

  const update = (patch) => {
    if (!onUpdate) return;
    onUpdate({ ...tournament, fund: { ...fund, ...patch } });
  };

  const handleAddIncome = (item) => update({ income: [...income, item] });
  const handleDeleteIncome = (id) => update({ income: income.filter((i) => i.id !== id) });
  const handleAddExpense = (item) => update({ expenses: [...expenses, item] });
  const handleDeleteExpense = (id) => update({ expenses: expenses.filter((i) => i.id !== id) });
  const handleSaveFee = (fee) => update({ entryFee: fee });

  const bg = darkMode ? 'bg-[#0a0f1a] text-white' : 'bg-gray-100 text-gray-900';
  const cardBg = darkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm';

  return (
    <div className={`min-h-screen ${bg} p-4 md:p-6 space-y-5`}>

      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
          <Wallet size={20} className="text-white" />
        </div>
        <div>
          <h1 className={`text-xl font-black ${darkMode ? 'text-white' : 'text-gray-900'}`}>Quản Lý Tài Chính</h1>
          <p className={`text-xs ${darkMode ? 'text-white/40' : 'text-gray-500'}`}>{tournament?.name}</p>
        </div>
        {!isAdmin && (
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Lock size={12} className="text-amber-400" />
            <span className="text-xs text-amber-400 font-medium">Chỉ Xem</span>
          </div>
        )}
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCard
          icon={TrendingUp}
          label="Tổng Thu"
          value={vnd(totalIncome)}
          gradient="from-emerald-500 to-green-600"
          textColor="text-emerald-400"
          darkMode={darkMode}
        />
        <SummaryCard
          icon={TrendingDown}
          label="Tổng Chi"
          value={vnd(totalExpense)}
          gradient="from-red-500 to-rose-600"
          textColor="text-red-400"
          darkMode={darkMode}
        />
        <SummaryCard
          icon={Wallet}
          label="Số Dư"
          value={vnd(balance)}
          gradient={isPositive ? 'from-cyan-500 to-blue-600' : 'from-red-600 to-rose-700'}
          textColor={isPositive ? 'text-cyan-400' : 'text-red-400'}
          darkMode={darkMode}
        />
      </div>

      {/* ── Entry Fee + Ratio ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <EntryFeeCard fee={fund.entryFee} isAdmin={isAdmin} onSave={handleSaveFee} darkMode={darkMode} />
        <RatioBar income={totalIncome} expense={totalExpense} darkMode={darkMode} />
      </div>

      {/* ── Income Table ── */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-emerald-400" />
          <h2 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Khoản Thu</h2>
          <span className="ml-auto px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold">
            {income.length}
          </span>
        </div>
        <TransactionTable
          items={income}
          type="income"
          isAdmin={isAdmin}
          onDelete={handleDeleteIncome}
          darkMode={darkMode}
        />
        {isAdmin && <AddForm type="income" onAdd={handleAddIncome} darkMode={darkMode} />}
      </div>

      {/* ── Expense Table ── */}
      <div className={`rounded-2xl border p-5 ${cardBg}`}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown size={16} className="text-red-400" />
          <h2 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Khoản Chi</h2>
          <span className="ml-auto px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 text-xs font-bold">
            {expenses.length}
          </span>
        </div>
        <TransactionTable
          items={expenses}
          type="expense"
          isAdmin={isAdmin}
          onDelete={handleDeleteExpense}
          darkMode={darkMode}
        />
        {isAdmin && <AddForm type="expense" onAdd={handleAddExpense} darkMode={darkMode} />}
      </div>
    </div>
  );
}
