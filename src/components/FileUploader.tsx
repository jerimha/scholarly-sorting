
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tag } from "@/types";
import { getTags } from "@/lib/storage";
import { useState, useEffect } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import { saveFile } from "@/lib/storage";

interface FileUploaderProps {
  currentPath: string[];
  onFileUploaded?: () => void;
}

const FileUploader = ({ currentPath, onFileUploaded }: FileUploaderProps) => {
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [notes, setNotes] = useState("");
  
  useEffect(() => {
    setAvailableTags(getTags());
  }, []);
  
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
  
  const determineFileType = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    
    if (['pdf'].includes(extension)) return 'pdf';
    if (['doc', 'docx'].includes(extension)) return 'docx';
    if (['txt', 'md'].includes(extension)) return 'txt';
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) return 'image';
    return 'other';
  };
  
  const readFileContent = async (file: File): Promise<string | null> => {
    // Only read content for text files
    if (!file.type.startsWith('text/')) {
      return null;
    }
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string || null);
      };
      reader.readAsText(file);
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedFile || !fileName) {
      toast.error("Please select a file and provide a name");
      return;
    }
    
    try {
      // Read file content if it's a text file
      const content = await readFileContent(selectedFile);
      
      // Get selected tags objects
      const tags = availableTags.filter(tag => selectedTags.includes(tag.id));
      
      // Save the file
      const fileData = {
        name: fileName,
        type: determineFileType(selectedFile.name),
        size: selectedFile.size,
        createdAt: new Date(),
        modifiedAt: new Date(),
        tags: tags,
        path: [...currentPath],
        notes: notes,
        content: content || undefined
      };
      
      saveFile(fileData);
      
      toast.success(`File "${fileName}" uploaded successfully to /${currentPath.join('/')}`);
      setOpen(false);
      
      // Reset form
      setFileName("");
      setSelectedFile(null);
      setSelectedTags([]);
      setNotes("");
      
      // Notify parent component
      if (onFileUploaded) {
        onFileUploaded();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Please try again.");
    }
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
          <DialogDescription>
            Upload a file to your thesis collection
          </DialogDescription>
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
            <Label htmlFor="notes">Notes</Label>
            <Input 
              id="notes" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this file"
            />
          </div>
          
          <div className="grid w-full items-center gap-1.5">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => (
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
