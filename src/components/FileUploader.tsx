
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Tag } from "@/types";
import { sampleTags } from "@/lib/data";
import { useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface FileUploaderProps {
  currentPath: string[];
}

const FileUploader = ({ currentPath }: FileUploaderProps) => {
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would upload the file to a server
    toast.success(`File "${fileName}" uploaded successfully to /${currentPath.join('/')}`);
    setOpen(false);
    
    // Reset form
    setFileName("");
    setSelectedFile(null);
    setSelectedTags([]);
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
