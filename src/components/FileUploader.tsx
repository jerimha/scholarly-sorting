
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileType, Tag } from "@/types";
import { sampleTags } from "@/lib/data";
import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { saveFile } from "@/lib/storage";

interface FileUploaderProps {
  currentPath: string[];
  onUploadComplete?: () => void;
}

const FileUploader = ({ currentPath, onUploadComplete }: FileUploaderProps) => {
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setFileName(file.name);
    }
  };
  
  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId)
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile) return;
    
    try {
      // Read file content if it's a text file
      let content = "";
      const fileType = getFileType(selectedFile.type, selectedFile.name);
      
      if (['txt', 'pdf', 'docx', 'pptx', 'xlsx'].includes(fileType)) {
        content = await readFileContent(selectedFile);
      }
      
      // Create file object
      const fileObject = {
        id: crypto.randomUUID(),
        name: fileName || selectedFile.name,
        type: fileType as FileType,
        size: selectedFile.size,
        createdAt: new Date(),
        modifiedAt: new Date(),
        tags: sampleTags.filter(tag => selectedTags.includes(tag.id)),
        path: [...currentPath],
        content: content,
      };
      
      // Save to storage
      const success = saveFile(fileObject);
      
      if (success) {
        toast.success(`File "${fileName}" uploaded successfully to /${currentPath.join('/')}`);
        setOpen(false);
        
        // Reset form
        setFileName("");
        setSelectedFile(null);
        setSelectedTags([]);
        
        // Notify parent component that upload is complete
        if (onUploadComplete) {
          onUploadComplete();
        }
        
        // Force a window reload to see the new file immediately
        window.location.reload();
      } else {
        toast.error("Failed to upload file");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file");
    }
  };
  
  // Helper function to read file content
  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string || "");
      };
      reader.onerror = (e) => {
        reject(e);
      };
      reader.readAsText(file);
    });
  };
  
  // Helper function to determine file type
  const getFileType = (mimeType: string, fileName: string): FileType => {
    // First try to detect by mime type
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('docx')) return 'docx';
    if (mimeType.includes('powerpoint') || mimeType.includes('pptx')) return 'pptx';
    if (mimeType.includes('excel') || mimeType.includes('xlsx')) return 'xlsx';
    if (mimeType.includes('text')) return 'txt';
    if (mimeType.includes('image')) return 'image';
    
    // If mime type doesn't work, try to detect by file extension
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    if (extension === 'pdf') return 'pdf';
    if (extension === 'docx' || extension === 'doc') return 'docx';
    if (extension === 'pptx' || extension === 'ppt') return 'pptx';
    if (extension === 'xlsx' || extension === 'xls') return 'xlsx';
    if (extension === 'txt') return 'txt';
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) return 'image';
    
    return 'other';
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload File
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload File</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="file">File</Label>
            <Input id="file" type="file" onChange={handleFileChange} />
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="fileName">File Name</Label>
            <Input 
              id="fileName" 
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Enter file name"
            />
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="location">Location</Label>
            <Input 
              id="location" 
              value={`/${currentPath.join('/')}`}
              disabled
            />
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {sampleTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => handleTagToggle(tag.id)}
                  className={`tag ${
                    selectedTags.includes(tag.id)
                      ? `${
                          tag.color === "blue" ? "bg-blue-100 text-blue-800" :
                          tag.color === "green" ? "bg-green-100 text-green-800" :
                          tag.color === "purple" ? "bg-purple-100 text-purple-800" :
                          tag.color === "orange" ? "bg-orange-100 text-orange-800" :
                          tag.color === "yellow" ? "bg-yellow-100 text-yellow-800" :
                          tag.color === "red" ? "bg-red-100 text-red-800" : ""
                        }`
                      : "bg-secondary"
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
          
          <Button type="submit" className="w-full" disabled={!selectedFile || !fileName}>
            Upload
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploader;
