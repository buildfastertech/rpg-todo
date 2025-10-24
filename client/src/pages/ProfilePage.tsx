import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/user.service';
import MainLayout from '@/components/layout/MainLayout';
import ProfileSkeleton from '@/components/ProfileSkeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  Target, 
  Sparkles, 
  Edit, 
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { UserProfile, UserStats, XPHistoryEntry } from '@/types';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [xpHistory, setXpHistory] = useState<XPHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotal, setHistoryTotal] = useState(0);
  const historyLimit = 10;

  useEffect(() => {
    loadProfileData();
    loadXPHistory(1);
  }, []);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const [profileData, statsData] = await Promise.all([
        userService.getProfile(),
        userService.getStats(),
      ]);
      
      if (profileData) {
        setProfile(profileData);
        setNewUsername(profileData.username || '');
      }
      
      if (statsData) {
        setStats(statsData);
      }
    } catch (error: any) {
      toast.error('Failed to load profile', { 
        description: error.response?.data?.message || error.message 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadXPHistory = async (page: number) => {
    try {
      const response = await userService.getXPHistory(page, historyLimit);
      setXpHistory(response.items || []);
      setHistoryTotal(response.total || 0);
      setHistoryPage(page);
    } catch (error: any) {
      toast.error('Failed to load XP history', { 
        description: error.response?.data?.message || error.message 
      });
    }
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      toast.error('Username cannot be empty');
      return;
    }

    if (newUsername === profile?.username) {
      setIsEditDialogOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      const updatedProfile = await userService.updateProfile({ username: newUsername });
      setProfile(updatedProfile);
      toast.success('Username updated successfully!');
      setIsEditDialogOpen(false);
    } catch (error: any) {
      toast.error('Failed to update username', { 
        description: error.response?.data?.message || error.message 
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateXPProgress = () => {
    if (!stats) {
      return 0;
    }
    
    const levelThresholds = [
      0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 14500,
      18500, 23000, 28000, 33500, 39500, 46000, 53000, 60500, 68500,
      77000, 86000, 95500, 105500, 116000, 127000, 138500, 150500, 163000, 176000,
    ];
    
    const currentLevel = stats.level;
    const totalXp = stats.totalXp;
    const currentLevelThreshold = levelThresholds[currentLevel - 1] || 0;
    const nextLevelThreshold = levelThresholds[currentLevel] || 999999;
    
    const xpInCurrentLevel = totalXp - currentLevelThreshold;
    const xpNeededForLevel = nextLevelThreshold - currentLevelThreshold;
    
    const progress = (xpInCurrentLevel / xpNeededForLevel) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const getXPDisplayText = () => {
    if (!stats) {
      return { current: 0, needed: 100 };
    }
    
    const levelThresholds = [
      0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000, 14500,
      18500, 23000, 28000, 33500, 39500, 46000, 53000, 60500, 68500,
      77000, 86000, 95500, 105500, 116000, 127000, 138500, 150500, 163000, 176000,
    ];
    
    const currentLevel = stats.level;
    const totalXp = stats.totalXp;
    const currentLevelThreshold = levelThresholds[currentLevel - 1] || 0;
    const nextLevelThreshold = levelThresholds[currentLevel] || 999999;
    
    const xpInCurrentLevel = totalXp - currentLevelThreshold;
    const xpNeededForLevel = nextLevelThreshold - currentLevelThreshold;
    
    return {
      current: xpInCurrentLevel,
      needed: xpNeededForLevel,
    };
  };

  if (isLoading) {
    return (
      <MainLayout>
        <ProfileSkeleton />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Profile</h1>
            <p className="text-slate-600 dark:text-slate-300">Manage your account and view your progress</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Username</Label>
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Username</DialogTitle>
                        <DialogDescription>
                          Change your display name. This is how you'll be identified in the app.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="username">New Username</Label>
                          <Input
                            id="username"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Enter new username"
                            disabled={isUpdating}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdating}>
                          Cancel
                        </Button>
                        <Button onClick={handleUpdateUsername} disabled={isUpdating}>
                          {isUpdating ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{profile?.username}</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{profile?.email}</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                  <Calendar className="h-4 w-4" />
                  Member Since
                </Label>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {profile?.registrationDate ? format(new Date(profile.registrationDate), 'MMMM d, yyyy') : '-'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Level & XP Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                Level & Experience
              </CardTitle>
              <CardDescription>Your progression stats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Current Level</p>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stats?.level || 1}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total XP</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats?.totalXp || 0}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-300">Progress to Level {(stats?.level || 1) + 1}</span>
                  <span className="font-semibold text-purple-600 dark:text-purple-400">
                    {getXPDisplayText().current} / {getXPDisplayText().needed} XP
                  </span>
                </div>
                <Progress value={calculateXPProgress()} className="h-3 bg-slate-200 dark:bg-neutral-800" />
                <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                  {Math.max(0, getXPDisplayText().needed - getXPDisplayText().current)} XP needed to level up
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Task Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                Task Statistics
              </CardTitle>
              <CardDescription>Your task completion record</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
                <div>
                  <p className="text-sm font-medium text-green-800 dark:text-green-300">Completed Tasks</p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{stats?.completedTaskCount || 0}</p>
                </div>
                <Target className="h-12 w-12 text-green-600/20 dark:text-green-400/20" />
              </div>
              
              <div className="space-y-2 border-t pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-600 dark:text-slate-400">Average XP per task</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {stats?.completedTaskCount ? Math.round((stats?.totalXp || 0) / stats.completedTaskCount) : 0} XP
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                Achievements
              </CardTitle>
              <CardDescription>Your unlocked achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">Unlocked</p>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats?.achievementsCount || 0}</p>
                </div>
                <Trophy className="h-12 w-12 text-yellow-600/20 dark:text-yellow-400/20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* XP History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              XP History
            </CardTitle>
            <CardDescription>Recent experience point transactions</CardDescription>
          </CardHeader>
          <CardContent>
            {!xpHistory || xpHistory.length === 0 ? (
              <div className="py-8 text-center text-slate-500 dark:text-slate-400">
                <p className="text-sm font-medium">No XP history yet. Complete tasks to start earning XP!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {xpHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-slate-50 dark:hover:bg-neutral-900"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{entry.description}</p>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {format(new Date(entry.createdAt), 'MMM d, yyyy • h:mm a')}
                      </p>
                    </div>
                    <Badge 
                      variant={entry.xpValue > 0 ? 'default' : 'secondary'}
                      className="ml-4 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400"
                    >
                      {entry.xpValue > 0 ? '+' : ''}{entry.xpValue} XP
                    </Badge>
                  </div>
                ))}

                {/* Pagination */}
                {historyTotal > historyLimit && (
                  <div className="flex items-center justify-between border-t pt-4">
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Showing {(historyPage - 1) * historyLimit + 1} to {Math.min(historyPage * historyLimit, historyTotal)} of {historyTotal}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadXPHistory(historyPage - 1)}
                        disabled={historyPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadXPHistory(historyPage + 1)}
                        disabled={historyPage * historyLimit >= historyTotal}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
