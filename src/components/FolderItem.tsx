
import { cn } from "@/lib/utils";
import { Folder } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, Folder as FolderIcon } from "lucide-react";

interface FolderItemProps {
  folder: Folder;
  onSelect: (folder: Folder) => void;
  className?: string;
}

const FolderItem = ({ folder, onSelect, className }: FolderItemProps) => {
  const totalFiles = folder.files.length + 
    folder.subFolders.reduce((acc, subFolder) => acc + subFolder.files.length, 0);
  
  return (
    <Card 
      className={cn("file-card cursor-pointer", className)}
      onClick={() => onSelect(folder)}
    >
      <CardContent className="p-4 flex items-center">
        <div className="w-12 h-12 flex items-center justify-center bg-primary/10 rounded-lg mr-4">
          <FolderIcon size={32} className="text-primary" />
        </div>
        
        <div className="flex-1">
          <p className="text-sm font-medium">{folder.name}</p>
          <p className="text-xs text-muted-foreground">
            {totalFiles} {totalFiles === 1 ? 'file' : 'files'}
          </p>
        </div>
        
        <ChevronRight size={18} className="text-muted-foreground" />
      </CardContent>
    </Card>
  );
};

export default FolderItem;
