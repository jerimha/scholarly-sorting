
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FolderIcon, MoveIcon } from "lucide-react";
import { File, Folder } from "@/types";
import { saveFile } from "@/lib/storage";
import { getRootFolders } from "@/lib/data";

interface FileMoverProps {
  file: File | null;
  isOpen: boolean;
  onClose: () => void;
  onMoved: () => void;
}

const FileMover = ({ file, isOpen, onClose, onMoved }: FileMoverProps) => {
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [isMoving, setIsMoving] = useState(false);
  
  const folders = getRootFolders();
  const allFolderPaths = [
    { value: "", label: "Root Folder" },
    ...folders.map(folder => ({ value: folder.name, label: folder.name })),
    ...folders.flatMap(folder => 
      folder.subFolders.map(subFolder => ({
        value: `${folder.name}/${subFolder.name}`,
        label: `${folder.name} / ${subFolder.name}`
      }))
    )
  ];

  const handleMove = async () => {
    if (!file) return;
    
    setIsMoving(true);
    
    try {
      const newPath = selectedFolder ? selectedFolder.split('/') : [];
      const updatedFile = {
        ...file,
        path: newPath,
        modifiedAt: new Date()
      };
      
      const success = saveFile(updatedFile);
      
      if (success) {
        onMoved();
        onClose();
        setSelectedFolder("");
      }
    } catch (error) {
      console.error("Error moving file:", error);
    } finally {
      setIsMoving(false);
    }
  };

  const currentPath = file?.path.length ? file.path.join(' / ') : 'Root Folder';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MoveIcon size={20} />
            Move File
          </DialogTitle>
        </DialogHeader>
        
        {file && (
          <div className="space-y-4">
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                Current location: {currentPath}
              </p>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Move to folder:</label>
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger>
                  <div className="flex items-center">
                    <FolderIcon className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Select destination folder" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {allFolderPaths.map(folder => (
                    <SelectItem key={folder.value} value={folder.value}>
                      {folder.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleMove} 
                disabled={isMoving}
                className="flex-1"
              >
                {isMoving ? "Moving..." : "Move File"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default FileMover;
