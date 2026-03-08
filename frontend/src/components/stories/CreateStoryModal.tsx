import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useCreateStory } from '../../hooks/useStories';
import { ExternalBlob } from '../../backend';
import { Image } from 'lucide-react';
import { toast } from 'sonner';

export default function CreateStoryModal({ onClose }: { onClose: () => void }) {
  const [media, setMedia] = useState<ExternalBlob | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const createStory = useCreateStory();

  const handleMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const bytes = new Uint8Array(await file.arrayBuffer());
    const blob = ExternalBlob.fromBytes(bytes).withUploadProgress((percentage) => {
      setUploadProgress(percentage);
    });
    setMedia(blob);
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!media) {
      toast.error('Please select an image or video');
      return;
    }

    try {
      await createStory.mutateAsync(media);
      toast.success('Story created! It will expire in 24 hours.');
      onClose();
    } catch (error) {
      toast.error('Failed to create story');
      console.error(error);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Story</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Media</Label>
            {media ? (
              <div className="relative aspect-[9/16] rounded-lg overflow-hidden bg-muted max-h-96">
                <img src={media.getDirectURL()} alt="" className="w-full h-full object-cover" />
              </div>
            ) : (
              <label className="aspect-[9/16] max-h-96 rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors">
                <Image className="w-12 h-12 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload</span>
                <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} className="hidden" />
              </label>
            )}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="gradient-coral-purple h-2 rounded-full transition-all"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 gradient-coral-purple hover:opacity-90"
              disabled={createStory.isPending || !media}
            >
              {createStory.isPending ? 'Creating...' : 'Share Story'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
