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
        <div className="muted">Loading…</
