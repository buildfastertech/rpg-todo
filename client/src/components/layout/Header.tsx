import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { userService } from '@/services/user.service';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card } from '@/components/ui/card';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Swords, User, Trophy, Settings, LogOut, Home, Menu } from 'lucide-react';
import type { UserStats } from '@/types';

interface HeaderProps {
  refreshTrigger?: number;
}

export default function Header({ refreshTrigger }: HeaderProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    loadStats();
  }, [refreshTrigger]);

  const loadStats = async () => {
    try {
      const data = await userService.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateXPProgress = () => {
    if (!stats) {
      return 0;
    }
    
    // Level thresholds (matches backend)
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

  const handleLogout = async () => {
    await logout();
  };

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: Home },
    { to: '/achievements', label: 'Achievements', icon: Trophy },
    { to: '/profile', label: 'Profile', icon: User },
    { to: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="border-b border-slate-200 bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Swords className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-slate-900 dark:text-white">RPG Todo</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center space-x-1 md:flex">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={isActive ? 'bg-primary text-primary-foreground font-semibold shadow-lg' : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/10'}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* XP and Level Display */}
          <div className="hidden items-center space-x-4 lg:flex">
            <Card className="border-2 border-slate-300 bg-white dark:border-neutral-700 dark:bg-neutral-950/95 p-3 backdrop-blur-sm">
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">Level</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {isLoading ? '-' : stats?.level || 1}
                  </p>
                </div>
                <div className="min-w-[200px]">
                  <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-100">
                    <span>XP Progress</span>
                    <span className="text-green-600 dark:text-green-400">
                      {isLoading ? '-' : `${getXPDisplayText().current} / ${getXPDisplayText().needed}`}
                    </span>
                  </div>
                  <Progress value={calculateXPProgress()} className="h-2.5 bg-slate-200 dark:bg-neutral-800" />
                </div>
              </div>
            </Card>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5 text-slate-700 dark:text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.username}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center space-x-2 lg:hidden">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5 text-slate-700 dark:text-white" />
            </Button>
          </div>
        </div>

        {/* Mobile XP Display */}
        <div className="mt-4 lg:hidden">
          <Card className="border-2 border-slate-300 bg-white dark:border-neutral-700 dark:bg-neutral-950/95 p-3 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <p className="text-xs font-semibold uppercase tracking-wider text-green-600 dark:text-green-400">Level</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  {isLoading ? '-' : stats?.level || 1}
                </p>
              </div>
              <div className="flex-1">
                <div className="mb-1.5 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-100">
                  <span>XP Progress</span>
                  <span className="text-green-600 dark:text-green-400">
                    {isLoading ? '-' : `${getXPDisplayText().current} / ${getXPDisplayText().needed}`}
                  </span>
                </div>
                <Progress value={calculateXPProgress()} className="h-2.5 bg-slate-200 dark:bg-neutral-800" />
              </div>
            </div>
          </Card>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <nav className="mt-4 flex flex-col space-y-1 md:hidden">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link key={link.to} to={link.to} onClick={() => setMobileMenuOpen(false)}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={isActive ? 'w-full justify-start bg-primary text-primary-foreground font-semibold' : 'w-full justify-start text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/10'}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-white dark:hover:bg-white/10"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
}

