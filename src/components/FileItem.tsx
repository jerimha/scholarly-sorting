
import { formatFileSize, getFileTypeIcon } from "@/lib/data";
import { cn } from "@/lib/utils";
import { File as FileType } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { File, Star } from "lucide-react";
import { useState } from "react";

interface FileItemProps {
  file: FileType;
  onSelect: (file: FileType) => void;
  className?: string;
}

const FileItem = ({ file, onSelect, className }: FileItemProps) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Get file extension for the icon
  const getFileExtension = (fileName: string) => {
    return fileName.split('.').pop() || '';
  };
  
  const extension = getFileExtension(file.name).toUpperCase();
  
  return (
    <Card 
      className={cn("file-card cursor-pointer", className)}
      onClick={() => onSelect(file)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className="p-4 flex flex-col items-center">
        <div className="relative">
          <div className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded-lg mb-2">
            <File size={32} className="text-primary" />
            <span className="absolute -right-2 -bottom-1 bg-secondary text-xs font-medium px-1 rounded">
              {extension}
            </span>
          </div>
          {file.starred && (
            <Star 
              size={16} 
              className="absolute -top-1 -right-1 fill-yellow-400 text-yellow-400" 
            />
          )}
        </div>
        
        <div className="w-full text-center mt-1">
          <p className="text-sm font-medium truncate w-full">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
          
          {file.tags.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mt-2">
              {file.tags.slice(0, 2).map((tag) => (
                <span 
                  key={tag.id}
                  className={cn(
                    "tag",
                    tag.color === "blue" && "bg-blue-100 text-blue-800",
                    tag.color === "green" && "bg-green-100 text-green-800",
                    tag.color === "purple" && "bg-purple-100 text-purple-800",
                    tag.color === "orange" && "bg-orange-100 text-orange-800",
                    tag.color === "yellow" && "bg-yellow-100 text-yellow-800",
                    tag.color === "red" && "bg-red-100 text-red-800"
                  )}
                >
                  {tag.name}
                </span>
              ))}
              {file.tags.length > 2 && (
                <span className="tag bg-gray-100 text-gray-800">
                  +{file.tags.length - 2}
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileItem;
