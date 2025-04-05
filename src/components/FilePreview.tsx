
import { useState } from "react";
import { File as FileType } from "@/types";
import { formatFileSize } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { 
  CalendarIcon, 
  Clock, 
  Download, 
  FileText, 
  FilePresentation,
  FileSpreadsheet,
  File,
  ImageIcon, 
  Save, 
  Star, 
  StarOff, 
  XIcon 
} from "lucide-react";
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
  
  // Check if file type is a document that can be displayed as text
  const isTextFile = ['txt', 'docx', 'pdf'].includes(file.type);
  
  // Render appropriate file type icon
  const renderFileTypeIcon = () => {
    switch (file.type) {
      case 'image':
        return <div className="bg-blue-100 text-blue-800 p-2 rounded"><ImageIcon size={24} /></div>;
      case 'pdf':
        return <div className="bg-red-100 text-red-800 p-2 rounded"><FileText size={24} /></div>;
      case 'docx':
        return <div className="bg-blue-100 text-blue-800 p-2 rounded"><FileText size={24} /></div>;
      case 'pptx':
        return <div className="bg-orange-100 text-orange-800 p-2 rounded"><FilePresentation size={24} /></div>;
      case 'xlsx':
        return <div className="bg-green-100 text-green-800 p-2 rounded"><FileSpreadsheet size={24} /></div>;
      default:
        return <div className="bg-indigo-100 text-indigo-800 p-2 rounded"><File size={24} /></div>;
    }
  };
  
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
            {renderFileTypeIcon()}
            <div className="ml-3">
              <h3 className="font-medium">{file.name}</h3>
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
        
        {/* Content preview section */}
        {(isTextFile || file.type === 'pptx' || file.type === 'xlsx') && (
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
                  {content ? (
                    content
                  ) : (
                    <div className="text-muted-foreground italic flex flex-col items-center justify-center h-full">
                      <p>Preview not available for this file type.</p>
                      <p className="mt-2">Download the file to view its contents.</p>
                    </div>
                  )}
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
        <Button className="w-full">
          <Download size={16} className="mr-2" />
          Download
        </Button>
      </div>
    </div>
  );
};

export default FilePreview;
