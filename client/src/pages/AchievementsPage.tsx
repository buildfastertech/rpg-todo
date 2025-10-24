import { useState, useEffect } from 'react';
import { achievementService } from '@/services/achievement.service';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Lock, CheckCircle2, Target, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import type { Achievement, AchievementWithProgress } from '@/types';

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achievementsWithProgress, setAchievementsWithProgress] = useState<AchievementWithProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unlocked' | 'locked'>('all');

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    setIsLoading(true);
    try {
      const [allAchievements, progressData] = await Promise.all([
        achievementService.getAllAchievements(),
        achievementService.getAchievementsWithProgress(),
      ]);

      if (allAchievements) {
        setAchievements(allAchievements);
      }

      if (progressData && progressData.achievements) {
        // The API returns { achievements: [], totalCount, unlockedCount, lockedCount }
        // We need to transform AchievementProgress to AchievementWithProgress
        const transformed = progressData.achievements.map((a) => ({
          id: a.id,
          achievementName: a.achievementName,
          achievementDescription: a.achievementDescription,
          unlocked: a.isUnlocked,
          unlockedAt: a.unlockedAt || undefined,
          progress: a.progress && a.required ? (a.progress / a.required) * 100 : undefined,
          current: a.progress, // This is the actual current value (e.g., level 2)
          required: a.required, // This is the requirement (e.g., level 5)
        }));
        setAchievementsWithProgress(transformed);
      }
    } catch (error: any) {
      toast.error('Failed to load achievements', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredAchievements = () => {
    if (!achievementsWithProgress || achievementsWithProgress.length === 0) {
      return [];
    }
    
    if (activeTab === 'all') {
      return achievementsWithProgress;
    } else if (activeTab === 'unlocked') {
      return achievementsWithProgress.filter((a) => a.unlocked);
    } else {
      return achievementsWithProgress.filter((a) => !a.unlocked);
    }
  };

  const unlockedCount = (achievementsWithProgress || []).filter((a) => a.unlocked).length;
  const totalCount = (achievementsWithProgress || []).length;

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Achievements</h1>
            <p className="text-slate-600 dark:text-slate-300">
              Track your progress and unlock rewards
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Progress</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {unlockedCount} / {totalCount}
            </p>
          </div>
        </div>

        {/* Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-600 dark:text-green-400" />
              Achievement Summary
            </CardTitle>
            <CardDescription>Your achievement collection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  Overall Progress
                </span>
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%
                </span>
              </div>
              <Progress
                value={totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}
                className="h-3 bg-slate-200 dark:bg-neutral-800"
              />
              <div className="flex items-center justify-between pt-2 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-slate-600 dark:text-slate-400">
                    Unlocked: {unlockedCount}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-slate-400" />
                  <span className="text-slate-600 dark:text-slate-400">
                    Locked: {totalCount - unlockedCount}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Achievements List with Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All ({totalCount})
            </TabsTrigger>
            <TabsTrigger value="unlocked">
              Unlocked ({unlockedCount})
            </TabsTrigger>
            <TabsTrigger value="locked">
              Locked ({totalCount - unlockedCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {!achievementsWithProgress || achievementsWithProgress.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Trophy className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    No achievements available yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {getFilteredAchievements().map((achievement) => (
                  <Card
                    key={achievement.id}
                    className={
                      achievement.unlocked
                        ? 'border-green-200 bg-green-50/50 dark:border-green-700 dark:bg-green-900/30'
                        : 'border-slate-200 dark:border-neutral-700'
                    }
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-12 w-12 items-center justify-center rounded-full ${
                              achievement.unlocked
                                ? 'bg-green-100 dark:bg-green-800/60'
                                : 'bg-slate-100 dark:bg-neutral-800'
                            }`}
                          >
                            {achievement.unlocked ? (
                              <Trophy className="h-6 w-6 text-green-600 dark:text-green-300" />
                            ) : (
                              <Lock className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                            )}
                          </div>
                          <div>
                            <CardTitle className="text-base">
                              {achievement.achievementName}
                            </CardTitle>
                            <CardDescription className="text-sm">
                              {achievement.achievementDescription}
                            </CardDescription>
                          </div>
                        </div>
                        {achievement.unlocked && (
                          <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-700/50 dark:text-green-200 dark:hover:bg-green-700/70">
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Unlocked
                          </Badge>
                        )}
                      </div>
                    </CardHeader>

                    {!achievement.unlocked && achievement.progress !== undefined && (
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-600 dark:text-slate-400">
                              Progress
                            </span>
                            <span className="font-semibold text-purple-600 dark:text-purple-400">
                              {achievement.current} / {achievement.required}
                            </span>
                          </div>
                          <Progress
                            value={achievement.progress}
                            className="h-2 bg-slate-200 dark:bg-neutral-800"
                          />
                        </div>
                      </CardContent>
                    )}

                    {achievement.unlocked && achievement.unlockedAt && (
                      <CardContent>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <Sparkles className="h-3 w-3" />
                          <span className="font-medium">
                            Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}

            {/* Empty state for filtered views */}
            {getFilteredAchievements().length === 0 && (achievementsWithProgress || []).length > 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Target className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {activeTab === 'unlocked'
                      ? 'No unlocked achievements yet. Keep completing tasks!'
                      : 'All achievements unlocked! 🎉'}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
