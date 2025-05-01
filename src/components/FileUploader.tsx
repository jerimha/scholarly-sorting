
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { FileType, Tag } from "@/types";
import { sampleTags } from "@/lib/data";
import { useState } from "react";
import { Upload, Link } from "lucide-react";
import { toast } from "sonner";
import { saveFile } from "@/lib/storage";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface FileUploaderProps {
  currentPath: string[];
  onUploadComplete?: () => void;
}

const FileUploader = ({ currentPath, onUploadComplete }: FileUploaderProps) => {
  const [fileName, setFileName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [fileUrl, setFileUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
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
      const fileType = getFileType(selectedFile.type);
      
      if (['txt', 'pdf', 'docx'].includes(fileType)) {
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
        downloadable: false,
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
  
  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fileUrl) return;
    
    setIsLoading(true);
    
    try {
      // Fetch the file from the URL
      const response = await fetch(fileUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }
      
      // Get file name from URL or use default
      const urlFileName = fileUrl.split('/').pop() || "downloaded-file";
      const contentType = response.headers.get('content-type') || '';
      
      // Convert response to blob
      const blob = await response.blob();
      const file = new File([blob], urlFileName, { type: contentType });
      
      // Set the file and name
      setSelectedFile(file);
      setFileName(urlFileName);
      
      // Prepare file content
      let content = "";
      const fileType = getFileType(contentType);
      
      if (['txt', 'pdf', 'docx'].includes(fileType)) {
        content = await readFileContent(file);
      } else if (fileType === 'image') {
        // For images, convert to data URL
        content = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string || "");
          reader.readAsDataURL(file);
        });
      }
      
      // Create file object
      const fileObject = {
        id: crypto.randomUUID(),
        name: fileName || urlFileName,
        type: fileType as FileType,
        size: blob.size,
        createdAt: new Date(),
        modifiedAt: new Date(),
        tags: sampleTags.filter(tag => selectedTags.includes(tag.id)),
        path: [...currentPath],
        content: content,
        downloadable: false,
      };
      
      // Save to storage
      const success = saveFile(fileObject);
      
      if (success) {
        toast.success(`File "${fileObject.name}" downloaded and saved successfully to /${currentPath.join('/')}`);
        setOpen(false);
        
        // Reset form
        setFileName("");
        setSelectedFile(null);
        setSelectedTags([]);
        setFileUrl("");
        
        // Notify parent component that upload is complete
        if (onUploadComplete) {
          onUploadComplete();
        }
        
        // Force a window reload to see the new file immediately
        window.location.reload();
      } else {
        toast.error("Failed to save downloaded file");
      }
    } catch (error) {
      console.error("Error downloading file:", error);
      toast.error(`Failed to download file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
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
  const getFileType = (mimeType: string): FileType => {
    if (mimeType.includes('pdf')) return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('docx')) return 'docx';
    if (mimeType.includes('text')) return 'txt';
    if (mimeType.includes('image')) return 'image';
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
        
        <Tabs defaultValue="upload" className="pt-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="upload">Upload File</TabsTrigger>
            <TabsTrigger value="url">From URL</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload">
            <form onSubmit={handleSubmit} className="space-y-4">
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
          </TabsContent>
          
          <TabsContent value="url">
            <form onSubmit={handleUrlSubmit} className="space-y-4">
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="fileUrl">File URL</Label>
                <div className="flex w-full items-center space-x-2">
                  <Input
                    id="fileUrl"
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://example.com/file.pdf"
                    required
                  />
                </div>
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="fileNameUrl">File Name (Optional)</Label>
                <Input 
                  id="fileNameUrl" 
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  placeholder="Enter file name (defaults to URL filename)"
                />
              </div>
              
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="locationUrl">Location</Label>
                <Input 
                  id="locationUrl" 
                  value={`/${currentPath.join('/')}`}
                  disabled
                />
              </div>
              
              <Separator />
              
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
              
              <Button type="submit" className="w-full" disabled={!fileUrl || isLoading}>
                <Link className="mr-2 h-4 w-4" />
                {isLoading ? "Downloading..." : "Download and Save"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default FileUploader;
