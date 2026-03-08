import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreatePost } from '../../hooks/usePosts';
import { ExternalBlob, Visibility } from '../../backend';
import { Image, X } from 'lucide-react';
import { toast } from 'sonner';

export default function CreatePostModal({ onClose }: { onClose: () => void }) {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<ExternalBlob[]>([]);
  const [visibility, setVisibility] = useState<Visibility>(Visibility.pub);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const createPost = useCreatePost();

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newMedia: ExternalBlob[] = [];
    const progressArray = [...uploadProgress];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const bytes = new Uint8Array(await file.arrayBuffer());
      const index = media.length + i;
      const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
        progressArray[index] = percentage;
        setUploadProgress([...progressArray]);
      });
      newMedia.push(blob);
    }

    setMedia([...media, ...newMedia]);
    setUploadProgress([...uploadProgress, ...new Array(files.length).fill(0)]);
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
    setUploadProgress(uploadProgress.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && media.length === 0) {
      toast.error('Please add content or media');
      return;
    }

    try {
      await createPost.mutateAsync({ content: content.trim(), media, visibility });
      toast.success('Post created successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to create post');
      console.error(error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Caption</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Media</Label>
            <div className="grid grid-cols-3 gap-2">
              {media.map((blob, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img src={blob.getDirectURL()} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeMedia(index)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {uploadProgress[index] > 0 && uploadProgress[index] < 100 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-background/80 h-1">
                      <div
                        className="gradient-coral-purple h-1 transition-all"
                        style={{ width: `${uploadProgress[index]}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <Image className="w-8 h-8 text-muted-foreground" />
                <input type="file" accept="image/*,video/*" multiple onChange={handleMediaUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select
              value={visibility}
              onValueChange={(value) => setVisibility(value as Visibility)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Visibility.pub}>Public</SelectItem>
                <SelectItem value={Visibility.priv}>Private (Followers Only)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-coral-purple hover:opacity-90"
              disabled={createPost.isPending}
            >
              {createPost.isPending ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
