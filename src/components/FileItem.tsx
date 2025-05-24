
import { useState } from "react";
import { cn } from "@/lib/utils";
import { File } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Image, FileType, Star, StarOff, MoreVertical, MoveIcon, Trash2 } from "lucide-react";
import { formatFileSize } from "@/lib/data";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import FileMover from "./FileMover";

interface FileItemProps {
  file: File;
  onSelect: (file: File) => void;
  onToggleStar?: (file: File) => void;
  onDelete?: (file: File) => void;
  onMove?: () => void;
  className?: string;
}

const FileItem = ({ file, onSelect, onToggleStar, onDelete, onMove, className }: FileItemProps) => {
  const [showMover, setShowMover] = useState(false);
  
  const getFileIcon = () => {
    switch (file.type) {
      case 'pdf':
        return <FileText size={32} className="text-red-600" />;
      case 'image':
        return <Image size={32} className="text-green-600" />;
      case 'docx':
        return <FileType size={32} className="text-blue-600" />;
      default:
        return <FileText size={32} className="text-gray-600" />;
    }
  };

  const handleMove = () => {
    setShowMover(false);
    if (onMove) onMove();
  };

  return (
    <>
      <Card className={cn("file-card", className)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg">
              {getFileIcon()}
            </div>
            
            <div className="flex items-center gap-1">
              {onToggleStar && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStar(file);
                  }}
                  className="h-8 w-8 p-0"
                >
                  {file.starred ? (
                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff size={16} className="text-muted-foreground" />
                  )}
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-8 p-0"
                  >
                    <MoreVertical size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    setShowMover(true);
                  }}>
                    <MoveIcon size={16} className="mr-2" />
                    Move to folder
                  </DropdownMenuItem>
                  {onDelete && (
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(file);
                      }}
                      className="text-red-600"
                    >
                      <Trash2 size={16} className="mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          <div 
            className="cursor-pointer"
            onClick={() => onSelect(file)}
          >
            <p className="text-sm font-medium mb-1 line-clamp-2">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.size)}
            </p>
          </div>
        </CardContent>
      </Card>
      
      <FileMover
        file={file}
        isOpen={showMover}
        onClose={() => setShowMover(false)}
        onMoved={handleMove}
      />
    </>
  );
};

export default FileItem;
