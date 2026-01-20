import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useI18n } from '@/contexts/I18nContext';
import {
  getAnnouncements,
  getTags,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '@/lib/supabase';
import type { Tag, AnnouncementWithDetails } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Pin, Plus, Edit2, Trash2, X } from 'lucide-react';
import { formatTimeAgo } from '@/contexts/I18nContext';

export default function CampusAnnouncementsPage() {
  const { profile } = useAuth();
  const { t } = useI18n();
  const [announcements, setAnnouncements] = useState<AnnouncementWithDetails[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);

  const isAdmin = profile?.role === 'admin';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [announcementsData, tagsData] = await Promise.all([
        getAnnouncements(),
        getTags(),
      ]);
      setAnnouncements(announcementsData as AnnouncementWithDetails[]);
      setTags(tagsData || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSelectedTagIds([]);
    setIsPinned(false);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (announcement: AnnouncementWithDetails) => {
    setTitle(announcement.title);
    setContent(announcement.content);
    setSelectedTagIds(announcement.tags.map((t) => t.id));
    setIsPinned(announcement.is_pinned);
    setEditingId(announcement.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      if (editingId) {
        await updateAnnouncement(editingId, {
          title,
          content,
          is_pinned: isPinned,
          tagIds: selectedTagIds,
        });
      } else {
        await createAnnouncement(title, content, selectedTagIds, isPinned);
      }
      resetForm();
      await loadData();
    } catch (error) {
      console.error('Error saving announcement:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('announcements.deleteConfirm'))) return;

    try {
      await deleteAnnouncement(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting announcement:', error);
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{t('announcements.title')}</h1>
        {isAdmin && !showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('announcements.createNew')}
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>
                {editingId ? t('announcements.editAnnouncement') : t('announcements.createNew')}
              </span>
              <button onClick={resetForm} className="text-gray-500 hover:text-gray-700">
                <X className="w-5 h-5" />
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder={t('announcements.title')}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder={t('announcements.title')}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
            />
            <div>
              <p className="text-sm text-gray-500 mb-2">標籤</p>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTagIds.includes(tag.id) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    style={{
                      backgroundColor: selectedTagIds.includes(tag.id) ? tag.color : undefined,
                      borderColor: tag.color,
                    }}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded"
              />
              <Pin className="w-4 h-4" />
              <span>{t('announcements.pinned')}</span>
            </label>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={resetForm}>
                {t('common.cancel')}
              </Button>
              <Button onClick={handleSubmit} disabled={saving || !title.trim() || !content.trim()}>
                {t('common.save')}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {announcements.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          {t('announcements.noAnnouncements')}
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              className={announcement.is_pinned ? 'border-yellow-400 border-2' : ''}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {announcement.is_pinned && (
                        <Pin className="w-4 h-4 text-yellow-500" />
                      )}
                      <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {announcement.tags.map((tag) => (
                        <Badge
                          key={tag.id}
                          style={{ backgroundColor: tag.color }}
                          className="text-white text-xs"
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(announcement)}
                        className="text-gray-500 hover:text-blue-500"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(announcement.id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{announcement.content}</p>
                <div className="flex items-center gap-3 mt-4 text-sm text-gray-500">
                  {announcement.author && (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={announcement.author.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {announcement.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{announcement.author.name}</span>
                    </div>
                  )}
                  <span>{formatTimeAgo(new Date(announcement.created_at), t)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
