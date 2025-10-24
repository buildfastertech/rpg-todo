import MainLayout from '@/components/layout/MainLayout';

export default function ProfilePage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile</h1>
          <p className="text-slate-600 dark:text-slate-300">Manage your hero profile</p>
        </div>
        {/* Profile content will go here */}
      </div>
    </MainLayout>
  );
}

