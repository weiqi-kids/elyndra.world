import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Locale = 'zh-TW' | 'en';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const translations: Record<Locale, Record<string, string>> = {
  'zh-TW': {
    // Common
    'common.loading': '載入中...',
    'common.error': '發生錯誤',
    'common.save': '儲存',
    'common.cancel': '取消',
    'common.confirm': '確認',
    'common.delete': '刪除',
    'common.edit': '編輯',
    'common.search': '搜尋',
    'common.send': '傳送',
    'common.back': '返回',

    // Auth
    'auth.signIn': '登入',
    'auth.signOut': '登出',
    'auth.signInWithGoogle': '使用 Google 登入',
    'auth.signInWithLine': '使用 Line 登入',
    'auth.welcome': '歡迎來到魔法校園',
    'auth.pleaseSignIn': '請登入以繼續',

    // Navigation
    'nav.chat': '聊天',
    'nav.newChat': '新對話',
    'nav.announcements': '校園公告',
    'nav.aboutMe': '關於我',
    'nav.switchRole': '切換角色',

    // Chat
    'chat.conversations': '對話',
    'chat.searchConversations': '搜尋對話...',
    'chat.noConversations': '目前沒有對話',
    'chat.startNewChat': '開始新對話',
    'chat.typeMessage': '輸入訊息...',
    'chat.searchMessages': '搜尋訊息...',
    'chat.noMessages': '目前沒有訊息',
    'chat.read': '已讀',
    'chat.unread': '未讀',
    'chat.groupChat': '群組聊天',
    'chat.directMessage': '私訊',

    // Announcements
    'announcements.title': '校園公告',
    'announcements.noAnnouncements': '目前沒有公告',
    'announcements.pinned': '置頂',
    'announcements.createNew': '發布公告',
    'announcements.editAnnouncement': '編輯公告',
    'announcements.deleteConfirm': '確定要刪除此公告嗎？',

    // Profile
    'profile.title': '個人資料',
    'profile.name': '姓名',
    'profile.email': 'Email',
    'profile.avatar': '頭像',
    'profile.changeAvatar': '更換頭像',
    'profile.updateSuccess': '更新成功',
    'profile.updateError': '更新失敗',

    // Roles
    'role.title': '切換角色',
    'role.description': '選擇你要扮演的角色',
    'role.studentHuman': '學生 (真人)',
    'role.studentAi': '學生 (AI)',
    'role.teacherAi': '老師 (AI)',
    'role.admin': '管理員',
    'role.current': '目前角色',

    // Tags
    'tags.important': '重要',
    'tags.event': '活動',
    'tags.course': '課程',
    'tags.admin': '行政',
    'tags.other': '其他',

    // Errors
    'error.networkError': '網路錯誤，請稍後再試',
    'error.unauthorized': '請先登入',
    'error.notFound': '找不到頁面',
    'error.serverError': '伺服器錯誤',

    // Time
    'time.justNow': '剛剛',
    'time.minutesAgo': '{n} 分鐘前',
    'time.hoursAgo': '{n} 小時前',
    'time.daysAgo': '{n} 天前',
    'time.yesterday': '昨天',
  },
  'en': {
    // Common
    'common.loading': 'Loading...',
    'common.error': 'An error occurred',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.search': 'Search',
    'common.send': 'Send',
    'common.back': 'Back',

    // Auth
    'auth.signIn': 'Sign In',
    'auth.signOut': 'Sign Out',
    'auth.signInWithGoogle': 'Sign in with Google',
    'auth.signInWithLine': 'Sign in with Line',
    'auth.welcome': 'Welcome to Magic Campus',
    'auth.pleaseSignIn': 'Please sign in to continue',

    // Navigation
    'nav.chat': 'Chat',
    'nav.newChat': 'New Chat',
    'nav.announcements': 'Announcements',
    'nav.aboutMe': 'About Me',
    'nav.switchRole': 'Switch Role',

    // Chat
    'chat.conversations': 'Conversations',
    'chat.searchConversations': 'Search conversations...',
    'chat.noConversations': 'No conversations yet',
    'chat.startNewChat': 'Start a new chat',
    'chat.typeMessage': 'Type a message...',
    'chat.searchMessages': 'Search messages...',
    'chat.noMessages': 'No messages yet',
    'chat.read': 'Read',
    'chat.unread': 'Unread',
    'chat.groupChat': 'Group Chat',
    'chat.directMessage': 'Direct Message',

    // Announcements
    'announcements.title': 'Campus Announcements',
    'announcements.noAnnouncements': 'No announcements yet',
    'announcements.pinned': 'Pinned',
    'announcements.createNew': 'Create Announcement',
    'announcements.editAnnouncement': 'Edit Announcement',
    'announcements.deleteConfirm': 'Are you sure you want to delete this announcement?',

    // Profile
    'profile.title': 'Profile',
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.avatar': 'Avatar',
    'profile.changeAvatar': 'Change Avatar',
    'profile.updateSuccess': 'Profile updated successfully',
    'profile.updateError': 'Failed to update profile',

    // Roles
    'role.title': 'Switch Role',
    'role.description': 'Choose the role you want to play',
    'role.studentHuman': 'Student (Human)',
    'role.studentAi': 'Student (AI)',
    'role.teacherAi': 'Teacher (AI)',
    'role.admin': 'Admin',
    'role.current': 'Current Role',

    // Tags
    'tags.important': 'Important',
    'tags.event': 'Event',
    'tags.course': 'Course',
    'tags.admin': 'Administrative',
    'tags.other': 'Other',

    // Errors
    'error.networkError': 'Network error, please try again',
    'error.unauthorized': 'Please sign in first',
    'error.notFound': 'Page not found',
    'error.serverError': 'Server error',

    // Time
    'time.justNow': 'Just now',
    'time.minutesAgo': '{n} minutes ago',
    'time.hoursAgo': '{n} hours ago',
    'time.daysAgo': '{n} days ago',
    'time.yesterday': 'Yesterday',
  },
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

function getInitialLocale(): Locale {
  // Check localStorage first
  const saved = localStorage.getItem('locale');
  if (saved === 'zh-TW' || saved === 'en') {
    return saved;
  }

  // Check browser language
  const browserLang = navigator.language;
  if (browserLang.startsWith('zh')) {
    return 'zh-TW';
  }
  if (browserLang.startsWith('en')) {
    return 'en';
  }

  // Default to Traditional Chinese
  return 'zh-TW';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

// Helper function for time formatting with interpolation
export function formatTimeAgo(date: Date, t: (key: string) => string): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return t('time.justNow');
  }
  if (diffMins < 60) {
    return t('time.minutesAgo').replace('{n}', String(diffMins));
  }
  if (diffHours < 24) {
    return t('time.hoursAgo').replace('{n}', String(diffHours));
  }
  if (diffDays === 1) {
    return t('time.yesterday');
  }
  if (diffDays < 7) {
    return t('time.daysAgo').replace('{n}', String(diffDays));
  }

  // Return formatted date for older messages
  return date.toLocaleDateString();
}
