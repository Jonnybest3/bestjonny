import Link from 'next/link';
import { PLANS, naira } from '@/lib/plans';

export default function Home(){return <>
  <main>
    <section className="hero"><div className="container">
      <span className="eyebrow">TRUST • TASKS • TRANSPARENT PAYOUTS</span>
      <h1>Work smarter with <span>Earn3X</span></h1>
      <p>A professional marketplace where clients fund real tasks and workers complete approved work. Your earnings depend on successful task completion—not promises of guaranteed returns.</p>
      <div className="hero-actions"><Link className="btn" href="/register">Create account</Link><Link className="btn secondary" href="/plans">View plans</Link></div>
      <div className="notice">Activation fees provide access to a worker plan. Worker earnings come from genuine, client-funded tasks and are subject to task approval.</div>
    </div></section>
    <section className="section"><div className="container"><h2>Choose your worker plan</h2><p className="sub">Different plans provide different daily task limits. You can upgrade when eligible.</p><div className="grid">
      {PLANS.map(p=><div className={`card plan-card ${p.accent==='gold'?'gold':''} ${p.accent==='star'?'star':''}`} key={p.slug}><h3>{p.name}</h3><div className="price">{naira(p.fee)}</div><div className="plan-meta"><span>Activation fee</span><strong>{p.minTasks}–{p.maxTasks} tasks/day</strong></div><div className="feature">✓ Access to eligible tasks</div><div className="feature">✓ Earnings ledger</div><div className="feature">✓ Manual withdrawal review</div></div>)}
    </div></div></section>
    <section className="section"><div className="container"><div className="grid"><div className="card"><h3>For workers</h3><p className="muted">Register, activate a plan, complete eligible tasks, submit proof, track approvals and request withdrawals.</p></div><div className="card"><h3>For clients</h3><p className="muted">Deposit funds, publish task requirements, review submissions and receive completed work.</p></div><div className="card"><h3>Admin controls</h3><p className="muted">A separate secure administration area manages approvals, tasks, disputes, withdrawals and platform fees.</p></div></div></div></section>
  </main>
</>}
