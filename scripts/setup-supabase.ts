#!/usr/bin/env node
/**
 * Supabase 自動化設定腳本
 * 執行: npx tsx scripts/setup-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt: string): Promise<string> =>
  new Promise((resolve) => rl.question(prompt, resolve));

async function main() {
  console.log('\n🚀 Magic Campus Chat - Supabase 設定精靈\n');
  console.log('請提供以下資訊（可在 Supabase Dashboard 找到）:\n');

  const supabaseUrl = await question('Supabase Project URL: ');
  const serviceRoleKey = await question('Supabase Service Role Key (非 anon key): ');

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ 請提供完整的 Supabase 資訊');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  console.log('\n📦 開始設定資料庫...\n');

  try {
    // 1. 建立 Enums
    console.log('1/6 建立 Enums...');
    await supabase.rpc('exec_sql', {
      sql: `
        DO $$ BEGIN
          CREATE TYPE user_role AS ENUM ('student_human', 'student_ai', 'teacher_ai', 'admin');
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;

        DO $$ BEGIN
          CREATE TYPE conversation_type AS ENUM ('direct', 'group');
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;

        DO $$ BEGIN
          CREATE TYPE attachment_type AS ENUM ('image', 'file');
        EXCEPTION WHEN duplicate_object THEN NULL; END $$;
      `,
    });

    // 2. 建立資料表
    console.log('2/6 建立資料表...');

    // Users table
    const { error: usersError } = await supabase.from('users').select('id').limit(1);
    if (usersError?.code === '42P01') {
      // Table doesn't exist, create it
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            avatar_url TEXT,
            role user_role DEFAULT 'student_human',
            locale TEXT DEFAULT 'zh-TW',
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
          );
        `,
      });
    }

    // Other tables...
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.conversations (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT,
          type conversation_type DEFAULT 'direct',
          created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS public.conversation_members (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          joined_at TIMESTAMPTZ DEFAULT NOW(),
          last_read_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(conversation_id, user_id)
        );

        CREATE TABLE IF NOT EXISTS public.messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
          sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS public.message_reads (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
          read_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(message_id, user_id)
        );

        CREATE TABLE IF NOT EXISTS public.attachments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
          type attachment_type NOT NULL,
          file_name TEXT NOT NULL,
          file_url TEXT NOT NULL,
          file_size INTEGER,
          mime_type TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS public.tags (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT UNIQUE NOT NULL,
          color TEXT DEFAULT '#3B82F6',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS public.announcements (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          author_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
          is_pinned BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS public.announcement_tags (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          announcement_id UUID REFERENCES public.announcements(id) ON DELETE CASCADE,
          tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
          UNIQUE(announcement_id, tag_id)
        );
      `,
    });

    // 3. 建立索引
    console.log('3/6 建立索引...');
    await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
        CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_conversation_members_user_id ON public.conversation_members(user_id);
        CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON public.announcements(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_message_reads_message_id ON public.message_reads(message_id);
        CREATE INDEX IF NOT EXISTS idx_attachments_message_id ON public.attachments(message_id);
      `,
    });

    // 4. 啟用 RLS
    console.log('4/6 啟用 Row Level Security...');
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.conversation_members ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
        ALTER TABLE public.announcement_tags ENABLE ROW LEVEL SECURITY;
      `,
    });

    // 5. 建立預設標籤
    console.log('5/6 建立預設標籤...');
    await supabase.from('tags').upsert(
      [
        { name: '重要', color: '#EF4444' },
        { name: '活動', color: '#F59E0B' },
        { name: '課程', color: '#10B981' },
        { name: '行政', color: '#6366F1' },
        { name: '其他', color: '#6B7280' },
      ],
      { onConflict: 'name' }
    );

    // 6. 啟用 Realtime
    console.log('6/6 啟用 Realtime...');
    await supabase.rpc('exec_sql', {
      sql: `
        ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reads;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.announcements;
      `,
    });

    console.log('\n✅ 資料庫設定完成！\n');

  } catch (error) {
    console.error('❌ 設定失敗:', error);
    console.log('\n💡 提示: 請確認 Service Role Key 是否正確，並且確保專案已啟用。');
    console.log('   如果問題持續，請手動執行 supabase/schema.sql\n');
  }

  rl.close();
}

main();
