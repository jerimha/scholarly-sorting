
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getTrashFromStorage, restoreFromTrash, permanentlyDeleteFile, cleanupExpiredTrash } from "@/lib/storage";
import { File } from "@/types";
import { formatFileSize } from "@/lib/data";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, FileText, RefreshCcw, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";

const Trash = () => {
  const [trashFiles, setTrashFiles] = useState<File[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Clean up expired trash items on component mount
    cleanupExpiredTrash();
    // Load trash files
    loadTrashFiles();
  }, []);
  
  const loadTrashFiles = () => {
    const files = getTrashFromStorage();
    setTrashFiles(files);
  };
  
  const handleRestore = (fileId: string) => {
    const success = restoreFromTrash(fileId);
    if (success) {
      toast.success("File restored successfully");
      loadTrashFiles();
    } else {
      toast.error("Failed to restore file");
    }
  };
  
  const handlePermanentDelete = (fileId: string) => {
    const success = permanentlyDeleteFile(fileId);
    if (success) {
      toast.success("File permanently deleted");
      loadTrashFiles();
    } else {
      toast.error("Failed to delete file");
    }
  };
  
  const calculateDaysLeft = (deletedAt: Date): number => {
    const deleteDate = new Date(deletedAt);
    const now = new Date();
    const thirtyDaysLater = new Date(deleteDate);
    thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);
    
    const daysLeft = Math.ceil((thirtyDaysLater.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">TheSpect File Browser</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => navigate("/dashboard")}
            variant="outline" 
          >
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 container mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Trash</h2>
            <p className="text-muted-foreground">Files in trash will be permanently deleted after 30 days</p>
          </div>
          <Button 
            onClick={loadTrashFiles} 
            variant="outline" 
            size="icon"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
        
        {trashFiles.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {trashFiles.map(file => (
              <Card key={file.id} className="p-4">
                <CardContent className="p-0 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 flex items-center justify-center bg-primary/10 rounded">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <span>•</span>
                        <span>
                          {calculateDaysLeft(file.deletedAt as Date)} days left
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRestore(file.id)}
                    >
                      Restore
                    </Button>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Delete</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Permanently delete file</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to permanently delete "{file.name}"? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handlePermanentDelete(file.id)}>
                            Delete permanently
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-lg bg-white">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Trash is empty</h3>
            <p className="text-muted-foreground">Deleted files will appear here for 30 days</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Trash;
