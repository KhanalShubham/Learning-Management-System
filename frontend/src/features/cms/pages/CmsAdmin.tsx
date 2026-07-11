import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Archive, Bell, ImagePlus, Pencil, Pin, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Dialog } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/Table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';
import { useToast } from '@/hooks/use-toast';
import { type AxiosError } from '@/services/api';
import { useAuth } from '@/features/auth/hooks/useAuth';
import {
  useNotices,
  useCreateNotice,
  useUpdateNotice,
  useArchiveNotice,
  useDeleteNotice,
  useUploadNoticeAttachment,
} from '../hooks/useNotices';
import {
  useGalleryImages,
  useUploadGalleryImageFile,
  useAddGalleryImage,
  useUpdateGalleryImage,
  useArchiveGalleryImage,
  useDeleteGalleryImage,
} from '../hooks/useGalleryAdmin';
import type { Notice, NoticeTag, GalleryImage } from '../types';

const errorMessage = (err: unknown) =>
  (err as AxiosError<{ message?: string }>)?.response?.data?.message || 'Please try again.';

const NOTICE_TAGS: NoticeTag[] = ['ADMISSIONS', 'EXAMINATION', 'EVENT', 'NOTICE'];

const noticeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  tag: z.enum(['ADMISSIONS', 'EXAMINATION', 'EVENT', 'NOTICE']),
  excerpt: z.string().min(1, 'Excerpt is required'),
  bodyText: z.string().min(1, 'Body is required'),
  attachmentUrl: z.string().optional(),
  isPinned: z.boolean().optional(),
});
type NoticeFields = z.infer<typeof noticeSchema>;

function NoticesTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const canEdit = !!user?.permissions.includes('cms.edit') || !!user?.permissions.includes('*');
  const canPublish = !!user?.permissions.includes('cms.publish') || !!user?.permissions.includes('*');

  const { data, isLoading } = useNotices(true);
  const createNotice = useCreateNotice();
  const updateNotice = useUpdateNotice();
  const archiveNotice = useArchiveNotice();
  const deleteNotice = useDeleteNotice();
  const uploadAttachment = useUploadNoticeAttachment();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<Notice | null>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<NoticeFields>({ resolver: zodResolver(noticeSchema) });

  const attachmentUrl = watch('attachmentUrl');
  const notices = data?.data ?? [];

  const openCreateModal = () => {
    setEditingNotice(null);
    reset({ title: '', tag: 'NOTICE', excerpt: '', bodyText: '', attachmentUrl: '', isPinned: false });
    setIsModalOpen(true);
  };

  const openEditModal = (notice: Notice) => {
    setEditingNotice(notice);
    reset({
      title: notice.title,
      tag: notice.tag,
      excerpt: notice.excerpt,
      bodyText: notice.body.join('\n\n'),
      attachmentUrl: notice.attachmentUrl ?? '',
      isPinned: notice.isPinned,
    });
    setIsModalOpen(true);
  };

  const handleAttachmentUpload = async (file: File) => {
    try {
      const url = await uploadAttachment.mutateAsync(file);
      setValue('attachmentUrl', url, { shouldValidate: true });
    } catch (err) {
      toast({ title: 'Upload Failed', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const onSubmit = async (data: NoticeFields) => {
    const payload = {
      title: data.title,
      tag: data.tag,
      excerpt: data.excerpt,
      body: data.bodyText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
      attachmentUrl: data.attachmentUrl || undefined,
      isPinned: data.isPinned,
    };
    try {
      if (editingNotice) {
        await updateNotice.mutateAsync({ id: editingNotice.id, payload });
        toast({ title: 'Notice Updated', variant: 'success' });
      } else {
        await createNotice.mutateAsync(payload);
        toast({ title: 'Notice Published', variant: 'success' });
      }
      setIsModalOpen(false);
    } catch (err) {
      toast({ title: 'Could Not Save Notice', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    try {
      await archiveNotice.mutateAsync(archiveTarget.id);
      toast({ title: 'Notice Archived', variant: 'success' });
      setArchiveTarget(null);
    } catch (err) {
      toast({ title: 'Could Not Archive Notice', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleDelete = async (notice: Notice) => {
    if (!window.confirm(`Permanently delete "${notice.title}"? Prefer Archive unless this was posted by mistake.`)) return;
    try {
      await deleteNotice.mutateAsync(notice.id);
      toast({ title: 'Notice Deleted', variant: 'success' });
    } catch (err) {
      toast({ title: 'Could Not Delete Notice', description: errorMessage(err), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {canEdit && (
          <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={openCreateModal}>
            Post Notice
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <LoadingSpinner />
        </div>
      ) : notices.length === 0 ? (
        <EmptyState icon={Bell} title="No notices yet" description="Post your first notice to the public site." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Tag</TableHead>
              <TableHead>Published</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {notices.map((notice) => (
              <TableRow key={notice.id}>
                <TableCell className="font-semibold text-foreground">
                  <span className="flex items-center gap-1.5">
                    {notice.isPinned && <Pin className="h-3 w-3 text-primary" />}
                    {notice.title}
                  </span>
                </TableCell>
                <TableCell>{notice.tag}</TableCell>
                <TableCell>{new Date(notice.publishedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={notice.status === 'ACTIVE' ? 'success' : 'secondary'}>{notice.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {canEdit && (
                      <button
                        onClick={() => openEditModal(notice)}
                        aria-label={`Edit ${notice.title}`}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors cursor-pointer"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                    {canPublish && (
                      <>
                        <button
                          onClick={() => setArchiveTarget(notice)}
                          aria-label={`Archive ${notice.title}`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-warning hover:bg-warning/10 transition-colors cursor-pointer"
                        >
                          <Archive className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(notice)}
                          aria-label={`Delete ${notice.title}`}
                          className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingNotice ? 'Edit Notice' : 'Post Notice'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Title" error={errors.title?.message} {...register('title')} />
          <Select label="Tag" options={NOTICE_TAGS.map((t) => ({ value: t, label: t }))} {...register('tag')} />
          <Input label="Excerpt" error={errors.excerpt?.message} {...register('excerpt')} />
          <Textarea
            label="Body (separate paragraphs with a blank line)"
            rows={6}
            error={errors.bodyText?.message}
            {...register('bodyText')}
          />
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input label="Attachment URL (optional)" readOnly {...register('attachmentUrl')} />
            </div>
            <Button
              type="button"
              variant="outline"
              isLoading={uploadAttachment.isPending}
              onClick={() => attachmentInputRef.current?.click()}
            >
              Upload
            </Button>
            <input
              ref={attachmentInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAttachmentUpload(file);
                e.target.value = '';
              }}
            />
          </div>
          {attachmentUrl && <p className="text-xs text-muted-foreground truncate">{attachmentUrl}</p>}
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            <input type="checkbox" className="h-4 w-4" {...register('isPinned')} />
            Pin to top of notice board
          </label>
          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            {editingNotice ? 'Save Changes' : 'Publish Notice'}
          </Button>
        </form>
      </Modal>

      <Dialog
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        title="Archive Notice?"
        description={`"${archiveTarget?.title}" will be removed from the public notice board but kept in records.`}
        type="warning"
        confirmText="Archive"
        onConfirm={handleArchive}
        isLoading={archiveNotice.isPending}
      />
    </div>
  );
}

function GalleryTab() {
  const { toast } = useToast();
  const { user } = useAuth();
  const canEdit = !!user?.permissions.includes('cms.edit') || !!user?.permissions.includes('*');
  const canPublish = !!user?.permissions.includes('cms.publish') || !!user?.permissions.includes('*');

  const { data: images, isLoading } = useGalleryImages(true);
  const uploadImageFile = useUploadGalleryImageFile();
  const addImage = useAddGalleryImage();
  const updateImage = useUpdateGalleryImage();
  const archiveImage = useArchiveGalleryImage();
  const deleteImage = useDeleteGalleryImage();

  const [caption, setCaption] = useState('');
  const [archiveTarget, setArchiveTarget] = useState<GalleryImage | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    try {
      const imageUrl = await uploadImageFile.mutateAsync(file);
      await addImage.mutateAsync({ imageUrl, caption: caption || undefined });
      setCaption('');
      toast({ title: 'Photo Added', variant: 'success' });
    } catch (err) {
      toast({ title: 'Could Not Add Photo', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleCaptionSave = async (image: GalleryImage, value: string) => {
    if (value === (image.caption ?? '')) return;
    try {
      await updateImage.mutateAsync({ id: image.id, payload: { caption: value || undefined } });
    } catch (err) {
      toast({ title: 'Could Not Update Caption', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleArchive = async () => {
    if (!archiveTarget) return;
    try {
      await archiveImage.mutateAsync(archiveTarget.id);
      toast({ title: 'Photo Archived', variant: 'success' });
      setArchiveTarget(null);
    } catch (err) {
      toast({ title: 'Could Not Archive Photo', description: errorMessage(err), variant: 'destructive' });
    }
  };

  const handleDelete = async (image: GalleryImage) => {
    if (!window.confirm('Permanently delete this photo?')) return;
    try {
      await deleteImage.mutateAsync(image.id);
      toast({ title: 'Photo Deleted', variant: 'success' });
    } catch (err) {
      toast({ title: 'Could Not Delete Photo', description: errorMessage(err), variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {canEdit && (
        <div className="flex flex-col sm:flex-row items-end gap-3">
          <div className="flex-1 w-full">
            <Input label="Caption (optional, applies to next upload)" value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
          <Button
            leftIcon={<ImagePlus className="h-4 w-4" />}
            isLoading={uploadImageFile.isPending || addImage.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Photo
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUpload(file);
              e.target.value = '';
            }}
          />
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <LoadingSpinner />
        </div>
      ) : !images || images.length === 0 ? (
        <EmptyState icon={ImagePlus} title="No photos yet" description="Upload your first campus photo." />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="rounded-lg border border-border/60 overflow-hidden group">
              <div className="relative aspect-square bg-secondary">
                <img src={image.imageUrl} alt={image.caption ?? ''} className="absolute inset-0 h-full w-full object-cover" />
                {image.status === 'ARCHIVED' && (
                  <span className="absolute top-2 left-2 text-[10px] font-bold bg-secondary/90 px-2 py-0.5 rounded">ARCHIVED</span>
                )}
                {canPublish && (
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => (image.status === 'ACTIVE' ? setArchiveTarget(image) : handleDelete(image))}
                      aria-label={image.status === 'ACTIVE' ? 'Archive photo' : 'Delete photo'}
                      className="p-1.5 rounded-lg bg-black/50 text-white hover:bg-destructive transition-colors cursor-pointer"
                    >
                      {image.status === 'ACTIVE' ? <Archive className="h-3.5 w-3.5" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                )}
              </div>
              {canEdit && (
                <input
                  defaultValue={image.caption ?? ''}
                  placeholder="Caption"
                  onBlur={(e) => handleCaptionSave(image, e.target.value)}
                  className="w-full text-xs px-2 py-1.5 bg-transparent border-t border-border/60 focus:outline-none focus:bg-secondary/40"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <Dialog
        isOpen={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        title="Archive Photo?"
        description="This photo will be removed from the public gallery but kept in records."
        type="warning"
        confirmText="Archive"
        onConfirm={handleArchive}
        isLoading={archiveImage.isPending}
      />
    </div>
  );
}

export default function CmsAdmin() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-foreground">Website CMS</h2>
        <p className="text-xs text-muted-foreground mt-0.5">Manage public notices and the campus gallery.</p>
      </div>

      <Tabs defaultValue="notices">
        <TabsList>
          <TabsTrigger value="notices">Notices</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
        </TabsList>
        <TabsContent value="notices">
          <NoticesTab />
        </TabsContent>
        <TabsContent value="gallery">
          <GalleryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
