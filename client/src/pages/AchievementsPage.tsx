import MainLayout from '@/components/layout/MainLayout';

export default function AchievementsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Achievements</h1>
          <p className="text-slate-600 dark:text-slate-300">Track your legendary accomplishments</p>
        </div>
        {/* Achievements list will go here */}
      </div>
    </MainLayout>
  );
}

