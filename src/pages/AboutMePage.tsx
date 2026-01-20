import { useState, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { uploadAvatar } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Save, LogOut, Globe } from 'lucide-react';

export default function AboutMePage() {
  const { profile, updateProfile, signOut } = useAuth();
  const { t, locale, setLocale } = useI18n();
  const [name, setName] = useState(profile?.name || '');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    if (!name.trim()) return;

    setSaving(true);
    setMessage(null);

    try {
      await updateProfile({ name: name.trim() });
      setMessage({ type: 'success', text: t('profile.updateSuccess') });
    } catch (error) {
      setMessage({ type: 'error', text: t('profile.updateError') });
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    setUploading(true);
    setMessage(null);

    try {
      await uploadAvatar(profile.id, file);
      setMessage({ type: 'success', text: t('profile.updateSuccess') });
    } catch (error) {
      setMessage({ type: 'error', text: t('profile.updateError') });
    } finally {
      setUploading(false);
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'student_human':
        return t('role.studentHuman');
      case 'student_ai':
        return t('role.studentAi');
      case 'teacher_ai':
        return t('role.teacherAi');
      case 'admin':
        return t('role.admin');
      default:
        return role;
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{t('profile.avatar')}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="relative">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl">
                {profile.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-500">{t('profile.changeAvatar')}</p>
            {uploading && (
              <p className="text-sm text-blue-500 mt-1">{t('common.loading')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">{t('profile.name')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('profile.name')}
              className="flex-1"
            />
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              <Save className="w-4 h-4 mr-2" />
              {t('common.save')}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">{t('profile.email')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{profile.email}</p>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">{t('role.current')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{getRoleName(profile.role)}</p>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Language / 語言
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Button
              variant={locale === 'zh-TW' ? 'default' : 'outline'}
              onClick={() => setLocale('zh-TW')}
            >
              繁體中文
            </Button>
            <Button
              variant={locale === 'en' ? 'default' : 'outline'}
              onClick={() => setLocale('en')}
            >
              English
            </Button>
          </div>
        </CardContent>
      </Card>

      {message && (
        <div
          className={`mt-4 p-3 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="mt-6">
        <Button variant="outline" onClick={signOut} className="text-red-600 hover:text-red-700">
          <LogOut className="w-4 h-4 mr-2" />
          {t('auth.signOut')}
        </Button>
      </div>
    </div>
  );
}
