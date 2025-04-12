
import { useState } from "react";
import { File as FileType } from "@/types";
import { formatFileSize } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, Clock, Download, FileText, ImageIcon, Info, Lock, Save, Star, StarOff, XIcon } from "lucide-react";
import { saveFileContent } from "@/lib/storage";
import { toast } from "sonner";

interface FilePreviewProps {
  file: FileType;
  onClose: () => void;
}

const FilePreview = ({ file, onClose }: FilePreviewProps) => {
  const [starred, setStarred] = useState(file.starred || false);
  const [notes, setNotes] = useState(file.notes || "");
  const [content, setContent] = useState(file.content || "");
  const [isEditing, setIsEditing] = useState(false);
  
  const handleStarToggle = () => {
    // In a real app, this would update the database
    setStarred(!starred);
  };
  
  const handleSaveContent = () => {
    // Save file content to storage
    const success = saveFileContent(file.id, content);
    
    if (success) {
      toast.success("File content saved successfully");
      setIsEditing(false);
    } else {
      toast.error("Failed to save file content");
    }
  };

  const handleDownload = () => {
    // Check if file is downloadable
    if (file.downloadable === false) {
      toast.error("This research document is protected and cannot be downloaded");
      return;
    }
    
    // Create a download for the file based on its type
    try {
      let dataUrl, filename, mimeType;
      
      // Set mime type based on file type
      switch (file.type) {
        case 'pdf':
          mimeType = 'application/pdf';
          break;
        case 'docx':
          mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
          break;
        case 'txt':
          mimeType = 'text/plain';
          break;
        case 'image':
          mimeType = 'image/png'; // Assuming PNG, but could be other formats
          break;
        default:
          mimeType = 'application/octet-stream';
      }
      
      // For images, the content is likely already a data URL
      if (file.type === 'image' && file.content && file.content.startsWith('data:')) {
        dataUrl = file.content;
      } else if (file.content) {
        // For text-based files, convert content to blob
        const blob = new Blob([file.content], { type: mimeType });
        dataUrl = URL.createObjectURL(blob);
      } else {
        // If no content, create an empty file
        const blob = new Blob(['No content available'], { type: 'text/plain' });
        dataUrl = URL.createObjectURL(blob);
      }
      
      // Create download link
      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = file.name;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      // Clean up the object URL to avoid memory leaks
      if (!(file.type === 'image' && file.content?.startsWith('data:'))) {
        URL.revokeObjectURL(dataUrl);
      }
      
      toast.success(`Downloading ${file.name}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };
  
  const isTextFile = ['txt', 'docx', 'pdf'].includes(file.type);
  const isPdfResearch = file.publicationYear && file.type === 'pdf';
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold truncate">{file.name}</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleStarToggle}
          >
            {starred ? <StarOff size={18} /> : <Star size={18} />}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onClose}
            className="md:hidden"
          >
            <XIcon size={18} />
          </Button>
        </div>
      </div>
      
      <div className="p-4 space-y-4 flex-1 overflow-auto">
        <div className="bg-accent/50 p-4 rounded-lg">
          <div className="flex items-center mb-4">
            {file.type === 'image' ? (
              <div className="bg-blue-100 text-blue-800 p-2 rounded">
                <ImageIcon size={24} />
              </div>
            ) : (
              <div className="bg-indigo-100 text-indigo-800 p-2 rounded">
                <FileText size={24} />
              </div>
            )}
            <div className="ml-3">
              <div className="flex items-center gap-2">
                <h3 className="font-medium">{file.name}</h3>
                {file.publicationYear && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
                    <CalendarIcon size={10} />
                    {file.publicationYear}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {file.size && formatFileSize(file.size)}
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <div className="flex items-center mt-1">
                <CalendarIcon size={14} className="mr-1" />
                <p className="text-sm">
                  {new Date(file.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Modified</p>
              <div className="flex items-center mt-1">
                <Clock size={14} className="mr-1" />
                <p className="text-sm">
                  {new Date(file.modifiedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
          
          {file.authors && file.authors.length > 0 && (
            <div className="mt-3">
              <p className="text-sm text-muted-foreground">Authors</p>
              <p className="text-sm mt-1">{file.authors.join(", ")}</p>
            </div>
          )}
        </div>
        
        {file.tags.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {file.tags.map(tag => (
                <Badge key={tag.id} variant="outline" className={
                  tag.color === "blue" ? "bg-blue-100 text-blue-800 hover:bg-blue-200" :
                  tag.color === "green" ? "bg-green-100 text-green-800 hover:bg-green-200" :
                  tag.color === "purple" ? "bg-purple-100 text-purple-800 hover:bg-purple-200" :
                  tag.color === "orange" ? "bg-orange-100 text-orange-800 hover:bg-orange-200" :
                  tag.color === "yellow" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" :
                  tag.color === "red" ? "bg-red-100 text-red-800 hover:bg-red-200" : ""
                }>
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {file.abstract && (
          <div>
            <h3 className="text-sm font-medium mb-1">Abstract</h3>
            <div className="bg-muted p-3 rounded">
              <p className="text-sm">{file.abstract}</p>
            </div>
          </div>
        )}
        
        {isPdfResearch && (
          <div className="border rounded-md p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium">PDF Preview</h3>
              {file.downloadable === false && (
                <div className="flex items-center text-amber-600">
                  <Lock size={14} className="mr-1" />
                  <span className="text-xs">Protected content</span>
                </div>
              )}
            </div>
            <div className="bg-muted p-3 rounded min-h-[300px] flex items-center justify-center">
              {file.content ? (
                <iframe 
                  src={file.content.startsWith('data:') ? file.content : `data:application/pdf;base64,${btoa(file.content)}`}
                  className="w-full h-[400px] border-0"
                  title={`${file.name} preview`}
                ></iframe>
              ) : (
                <div className="text-center text-muted-foreground">
                  <FileText size={36} className="mx-auto mb-2" />
                  <p>PDF preview not available</p>
                </div>
              )}
            </div>
          </div>
        )}
        
        {isTextFile && !isPdfResearch && (
          <>
            <Separator />
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium">Content</h3>
                {isEditing ? (
                  <Button size="sm" onClick={handleSaveContent}>
                    <Save size={14} className="mr-1" />
                    Save
                  </Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                    Edit
                  </Button>
                )}
              </div>
              
              {isEditing ? (
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px]"
                />
              ) : (
                <div className="bg-muted p-3 rounded min-h-[200px] whitespace-pre-wrap">
                  {content || <span className="text-muted-foreground italic">No content</span>}
                </div>
              )}
            </div>
          </>
        )}
        
        {file.type === 'image' && file.content && (
          <div className="border rounded-lg overflow-hidden">
            <img 
              src={file.content} 
              alt={file.name}
              className="w-full h-auto"
            />
          </div>
        )}
        
        <Separator />
        
        <div>
          <h3 className="text-sm font-medium mb-2">Notes</h3>
          <Textarea
            placeholder="Add notes about this file..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <div className="flex justify-end">
          <Button variant="outline" className="mr-2" onClick={() => setNotes(file.notes || "")}>
            Cancel
          </Button>
          <Button>
            Save Notes
          </Button>
        </div>
      </div>
      
      <div className="p-4 border-t">
        <Button 
          className="w-full" 
          onClick={handleDownload}
          disabled={file.downloadable === false}
        >
          {file.downloadable === false ? (
            <>
              <Lock size={16} className="mr-2" />
              Protected Document
            </>
          ) : (
            <>
              <Download size={16} className="mr-2" />
              Download
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default FilePreview;
