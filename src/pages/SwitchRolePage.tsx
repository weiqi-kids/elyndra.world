import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Bot, GraduationCap, Check } from 'lucide-react';
import type { UserRole } from '@/types/database';

interface RoleOption {
  id: UserRole;
  icon: typeof User;
  titleKey: string;
  description: string;
  color: string;
}

const roleOptions: RoleOption[] = [
  {
    id: 'student_human',
    icon: User,
    titleKey: 'role.studentHuman',
    description: '以真人身份參與課堂互動和討論',
    color: 'bg-blue-500',
  },
  {
    id: 'student_ai',
    icon: Bot,
    titleKey: 'role.studentAi',
    description: '以 AI 學生角色進行學習探索',
    color: 'bg-purple-500',
  },
  {
    id: 'teacher_ai',
    icon: GraduationCap,
    titleKey: 'role.teacherAi',
    description: '以 AI 老師角色引導學習和解答問題',
    color: 'bg-green-500',
  },
];

export default function SwitchRolePage() {
  const { profile, updateProfile } = useAuth();
  const { t } = useI18n();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [saving, setSaving] = useState(false);

  const currentRole = profile?.role || 'student_human';

  const handleSelectRole = (role: UserRole) => {
    if (role !== currentRole) {
      setSelectedRole(role);
    }
  };

  const handleConfirm = async () => {
    if (!selectedRole) return;

    setSaving(true);
    try {
      await updateProfile({ role: selectedRole });
      setSelectedRole(null);
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setSelectedRole(null);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">{t('role.title')}</h1>
        <p className="text-gray-500 mt-2">{t('role.description')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {roleOptions.map((option) => {
          const Icon = option.icon;
          const isCurrentRole = currentRole === option.id;
          const isSelected = selectedRole === option.id;

          return (
            <Card
              key={option.id}
              className={`cursor-pointer transition-all ${
                isCurrentRole
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : isSelected
                  ? 'ring-2 ring-green-500 bg-green-50'
                  : 'hover:shadow-md'
              }`}
              onClick={() => handleSelectRole(option.id)}
            >
              <CardHeader className="text-center pb-2">
                <div
                  className={`w-16 h-16 rounded-full ${option.color} flex items-center justify-center mx-auto mb-3`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-lg">{t(option.titleKey)}</CardTitle>
                {isCurrentRole && (
                  <div className="flex items-center justify-center gap-1 text-blue-600 text-sm">
                    <Check className="w-4 h-4" />
                    <span>{t('role.current')}</span>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  {option.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedRole && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-center mb-4">
            確定要切換到 <strong>{t(roleOptions.find((r) => r.id === selectedRole)?.titleKey || '')}</strong> 嗎？
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={handleCancel}>
              {t('common.cancel')}
            </Button>
            <Button onClick={handleConfirm} disabled={saving}>
              {saving ? t('common.loading') : t('common.confirm')}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <h3 className="font-medium text-yellow-800 mb-2">角色說明</h3>
        <ul className="text-sm text-yellow-700 space-y-1">
          <li>• <strong>學生 (真人)</strong>：以自己的身份參與學習</li>
          <li>• <strong>學生 (AI)</strong>：扮演 AI 學生角色，體驗不同的學習視角</li>
          <li>• <strong>老師 (AI)</strong>：扮演 AI 老師角色，練習教學和解答問題</li>
        </ul>
      </div>
    </div>
  );
}
