'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';
import { PLANS, naira } from '@/lib/plans';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [withdrawals, setWithdrawals] = useState(0);
  const router = useRouter();

  async function loadDashboard() {
    const sb = createClient();

    const {
      data: { user },
    } = await sb.auth.getUser();

    if (!user) {
      router.replace('/login');
      return;
    }

    setUser(user);

    const { data: p } = await sb
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setProfile(p);

    const { data: t } = await sb
      .from('tasks')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(20);

    setTasks(t || []);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count } = await sb
      .from('withdrawals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo.toISOString());

    setWithdrawals(count || 0);
  }

  useEffect(() => {
    loadDashboard();
  }, [router]);

  async function logout() {
    await createClient().auth.signOut();
    router.push('/');
  }

  if (!user) {
    return (
      <main className="auth-wrap">
        <div className="muted">Loading…</div>
      </main>
    );
  }

  const plan = PLANS.find(
    (p) => p.slug === profile?.plan_slug
  );

  return (
    <main className="dash">
      <div className="container">

        <div className="dash-head">
          <div>
            <h2 style={{ marginBottom: 5 }}>
              Hello, {profile?.first_name || user.email}
            </h2>

            <span className="muted">
              {profile?.role === 'client'
                ? 'Client workspace'
                : 'Worker workspace'}
            </span>
          </div>

          <button
            className="btn secondary"
            onClick={logout}
          >
            Sign out
          </button>
        </div>

        {profile?.role === 'client' ? (
          <ClientView
            profile={profile}
            tasks={tasks}
          />
        ) : (
          <WorkerView
            profile={profile}
            plan={plan}
            tasks={tasks}
            withdrawals={withdrawals}
            refresh={loadDashboard}
          />
        )}

      </div>
    </main>
  );
}

function WorkerView({
  profile,
  plan,
  tasks,
  withdrawals,
  refresh,
}: {
  profile: any;
  plan: any;
  tasks: any[];
  withdrawals: number;
  refresh: () => Promise<void>;
}) {
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [proof, setProof] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [taskMessage, setTaskMessage] = useState('');

  async function submitTask() {
    setTaskMessage('');

    if (!selectedTask) {
      return;
    }

    if (!proof.trim()) {
      setTaskMessage('Please enter your proof of completion.');
      return;
    }

    setSubmitting(true);

    try {
      const sb = createClient();

      const { error } = await sb
        .from('submissions')
        .insert({
          task_id: selectedTask.id,
          worker_id: profile.id,
          proof: proof.trim(),
          status: 'pending',
          reward_amount: selectedTask.reward,
        });

      if (error) {
        if (
          error.message.toLowerCase().includes('duplicate') ||
          error.message.toLowerCase().includes('unique')
        ) {
          setTaskMessage(
            'You have already submitted this task.'
          );
        } else {
          setTaskMessage(error.message);
        }

        return;
      }

      setTaskMessage(
        'Task submitted successfully. Your submission is now pending review.'
      );

      setProof('');

    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="stats">

        <div className="card stat">
          <span className="muted">Plan</span>
          <strong>
            {plan?.name || 'Not activated'}
          </strong>
        </div>

        <div className="card stat">
          <span className="muted">Daily limit</span>
          <strong>
            {plan
              ? `${plan.minTasks}–${plan.maxTasks}`
              : '—'}
          </strong>
        </div>

        <div className="card stat">
          <span className="muted">Balance</span>
          <strong>
            {naira(profile.wallet_balance || 0)}
          </strong>
       
