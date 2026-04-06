import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/config/firebase";

export interface MediaFile {
  id: string;
  url: string;
  fileName: string;
  type: "image" | "video";
  size: number;
  uploadedAt: string;
}

interface MediaUploadProps {
  onMediaAdded: (media: MediaFile) => void;
  onMediaRemoved: (mediaId: string) => void;
  media: MediaFile[];
  articleId: string;
}

export function MediaUpload({ onMediaAdded, onMediaRemoved, media, articleId }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileType = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : null;

      if (!fileType) {
        toast.error(`${file.name} is not a valid image or video file`);
        continue;
      }

      await uploadFile(file, fileType);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const uploadFile = async (file: File, fileType: "image" | "video") => {
    try {
      setUploading(true);
      const fileExtension = file.name.split(".").pop();
      const fileName = `${articleId}/${Date.now()}.${fileExtension}`;
      const storageRef = ref(storage, `news-media/${fileName}`);

      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const mediaFile: MediaFile = {
        id: Date.now().toString(),
        url: downloadURL,
        fileName: file.name,
        type: fileType,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };

      onMediaAdded(mediaFile);
      toast.success(`${fileType === "image" ? "Image" : "Video"} uploaded successfully`);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveMedia = async (mediaFile: MediaFile) => {
    try {
      setUploading(true);
      const fileRef = ref(storage, `/news-media/${mediaFile.uploadedAt}/${mediaFile.fileName}`);
      
      // Try to delete from Firebase Storage
      try {
        await deleteObject(fileRef);
      } catch (err) {
        // File might already be deleted or path might be different
        console.warn("Could not delete from storage:", err);
      }

      onMediaRemoved(mediaFile.id);
      toast.success("Media removed successfully");
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Failed to remove media");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Images/Videos
            </>
          )}
        </Button>
      </div>

      {media.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {media.map((item) => (
            <div key={item.id} className="relative group rounded-lg overflow-hidden bg-muted h-32">
              {item.type === "image" ? (
                <img
                  src={item.url}
                  alt={item.fileName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <video
                  src={item.url}
                  className="w-full h-full object-cover"
                  controls
                />
              )}
              <button
                onClick={() => handleRemoveMedia(item)}
                disabled={uploading}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-6 h-6 text-white" />
              </button>
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                {item.fileName}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
