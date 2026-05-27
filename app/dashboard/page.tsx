import { createClient } from '../utils/supabase/server';
import DashboardClient from './DashboardClient';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Check user authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Lấy dữ liệu từ Supabase
  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .order('start_time', { ascending: false });

  // Lấy profile để check Strava connection
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return <DashboardClient activities={activities || []} profile={profile} />;
}