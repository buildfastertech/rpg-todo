import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/services/api';

export default function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await apiClient.delete('/users/account');
      
      toast.success('Account deleted', {
        description: 'Your account and all data have been permanently deleted.',
      });
      
      // Logout and redirect to login
      await logout();
      navigate('/login');
    } catch (error: any) {
      toast.error('Failed to delete account', {
        description: error.response?.data?.message || error.message,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Settings</h1>
          <p className="text-slate-600 dark:text-slate-300">
            Manage your preferences and account settings
          </p>
        </div>

        {/* Legal */}
        <Card>
          <CardHeader>
            <CardTitle>Legal</CardTitle>
            <CardDescription>Terms, privacy policy, and legal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <a
              href="https://www.termsfeed.com/live/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-slate-50 dark:hover:bg-neutral-900"
            >
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Terms of Service
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Read our terms and conditions
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400" />
            </a>

            <a
              href="https://www.termsfeed.com/live/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-slate-50 dark:hover:bg-neutral-900"
            >
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  Privacy Policy
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Learn how we protect your data
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400" />
            </a>

            <a
              href="https://gdpr.eu/what-is-gdpr/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-slate-50 dark:hover:bg-neutral-900"
            >
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  GDPR Information
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Your rights under GDPR
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-slate-400" />
            </a>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions - proceed with caution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-destructive">
                  Delete Account
                </Label>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" disabled={isDeleting}>
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </>
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your account,
                      all your tasks, XP progress, achievements, and remove your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/* App Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-sm text-slate-500 dark:text-slate-400">
              <p className="mb-1">RPG Todo - Version 1.0.0</p>
              <p>Made with ❤️ for productive heroes</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
