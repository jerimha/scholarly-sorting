
import { formatFileSize } from "@/lib/data";
import { File as FileData } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { useState } from "react";

interface FilePreviewProps {
  file: FileData | null;
  onClose: () => void;
}

const FilePreview = ({ file, onClose }: FilePreviewProps) => {
  const [notes, setNotes] = useState(file?.notes || "");
  
  if (!file) return null;
  
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(date));
  };
  
  return (
    <Card className="w-full h-full flex flex-col overflow-hidden animate-fade-in">
      <CardHeader className="px-4 py-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">{file.name}</CardTitle>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X size={18} />
        </Button>
      </CardHeader>
      
      <Separator />
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-2">File Information</h4>
          <dl className="grid grid-cols-2 gap-2 text-sm">
            <dt className="text-muted-foreground">Type</dt>
            <dd>{file.type.toUpperCase()}</dd>
            
            <dt className="text-muted-foreground">Size</dt>
            <dd>{formatFileSize(file.size)}</dd>
            
            <dt className="text-muted-foreground">Created</dt>
            <dd>{formatDate(file.createdAt)}</dd>
            
            <dt className="text-muted-foreground">Modified</dt>
            <dd>{formatDate(file.modifiedAt)}</dd>
            
            <dt className="text-muted-foreground">Location</dt>
            <dd>/{file.path.join('/')}</dd>
          </dl>
        </div>
        
        {file.tags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Tags</h4>
            <div className="flex flex-wrap gap-1">
              {file.tags.map(tag => (
                <span 
                  key={tag.id}
                  className={`tag
                    ${tag.color === "blue" ? "bg-blue-100 text-blue-800" : ""}
                    ${tag.color === "green" ? "bg-green-100 text-green-800" : ""}
                    ${tag.color === "purple" ? "bg-purple-100 text-purple-800" : ""}
                    ${tag.color === "orange" ? "bg-orange-100 text-orange-800" : ""}
                    ${tag.color === "yellow" ? "bg-yellow-100 text-yellow-800" : ""}
                    ${tag.color === "red" ? "bg-red-100 text-red-800" : ""}
                  `}
                >
                  {tag.name}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {file.content && (
          <div>
            <h4 className="text-sm font-medium mb-2">Content Preview</h4>
            <pre className="p-4 bg-muted rounded-md text-xs overflow-x-auto">
              {file.content}
            </pre>
          </div>
        )}
        
        <div>
          <h4 className="text-sm font-medium mb-2">Notes</h4>
          <Textarea 
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add notes about this file..."
            className="min-h-[100px]"
          />
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-4">
        <Button className="w-full">Download File</Button>
      </CardFooter>
    </Card>
  );
};

export default FilePreview;
