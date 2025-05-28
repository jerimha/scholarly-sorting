import React, { useEffect, useState } from "react";
import { getAllFilesFromStorage, deleteFile } from "@/lib/storage";
import FileItem from "./FileItem";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { File, Folder } from "@/types";
import { Plus, Upload, FileText, FolderPlus, RefreshCcw, Star, StarOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import FileUploader from "./FileUploader";
import { toast } from "sonner";
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getAllFolders, saveFolder } from "@/lib/folders";
import { cn } from "@/lib/utils";
import FileMover from "./FileMover";

const Dashboard = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);
  const [isFolderDialogOpen, setIsFolderDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadFiles();
    loadFolders();
  }, []);

  const loadFiles = () => {
    setFiles(getAllFilesFromStorage());
  };

  const loadFolders = () => {
    setFolders(getAllFolders());
  };

  const handleUploadComplete = () => {
    loadFiles();
    toast.success("Upload complete!");
  };

  const handleCreateFolder = async () => {
    if (newFolderName.trim() === "") {
      toast.error("Folder name cannot be empty");
      return;
    }

    const newFolder: Folder = {
      id: crypto.randomUUID(),
      name: newFolderName,
      path: [],
      createdAt: new Date(),
      modifiedAt: new Date()
    };

    const success = saveFolder(newFolder);
    if (success) {
      loadFolders();
      setIsFolderDialogOpen(false);
      setNewFolderName("");
      toast.success("Folder created successfully");
    } else {
      toast.error("Failed to create folder");
    }
  };

  const handleSelectFile = (file: File) => {
    setSelectedFile(file);
  };

  const handleCloseFilePreview = () => {
    setSelectedFile(null);
  };

  const handleDeleteFile = (file: File) => {
    const success = deleteFile(file.id);
    if (success) {
      setFiles(prev => prev.filter(f => f.id !== file.id));
    } else {
      alert("Failed to delete file");
    }
  };

  const handleToggleStar = (file: File) => {
    const updatedFile = { ...file, starred: !file.starred };
    //saveFile(updatedFile); // Assuming saveFile exists and updates the file
    loadFiles(); // Refresh files to reflect the change
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">TheSpect File Browser</h1>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate("/public")} variant="outline">
            Public Search
          </Button>
          <Button onClick={() => navigate("/trash")} variant="outline">
            View Trash
          </Button>
          <Button onClick={() => navigate("/login")} variant="outline">
            Admin Access
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 container mx-auto max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">My Files</h2>
          <div className="flex gap-2">
            <Button onClick={() => setIsUploaderOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload File
            </Button>
            <Button variant="outline" onClick={() => setIsFolderDialogOpen(true)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Create Folder
            </Button>
            <Button
              onClick={loadFiles}
              variant="outline"
              size="icon"
            >
              <RefreshCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <section className="mb-8">
          <h3 className="text-lg font-medium mb-4">Folders</h3>
          <div className="grid grid-cols-5 gap-4">
            {folders.map(folder => (
              <div key={folder.id} className="col-span-1">
                <Card className="bg-white shadow-md rounded-md hover:bg-gray-50 cursor-pointer">
                  <CardContent className="p-3 flex flex-col items-center justify-center">
                    <FileText className="h-6 w-6 text-blue-500 mb-1" />
                    <p className="text-sm font-medium text-gray-800">{folder.name}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-lg font-medium mb-4">Files</h3>
          {files.length > 0 ? (
            <div className="grid grid-cols-5 gap-4">
              {files.map(file => (
                <FileItem
                  key={file.id}
                  file={file}
                  onSelect={handleSelectFile}
                  onDelete={handleDeleteFile}
                  onToggleStar={handleToggleStar}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg bg-white">
              <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No files found</h3>
              <p className="text-muted-foreground">Upload files to start building your repository</p>
            </div>
          )}
        </section>
      </main>

      <FileUploader open={isUploaderOpen} onClose={() => setIsUploaderOpen(false)} onUploadComplete={handleUploadComplete} />

      <Dialog open={isFolderDialogOpen} onOpenChange={() => setIsFolderDialogOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsFolderDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!selectedFile} onOpenChange={handleCloseFilePreview}>
        <DialogContent className="max-w-3xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>{selectedFile?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 flex flex-col h-full overflow-hidden">
            <div className="flex-1 min-h-0 border rounded-md overflow-hidden">
              {selectedFile?.content ? (
                <iframe
                  src={selectedFile.content.startsWith('data:') ? selectedFile.content : `data:application/pdf;base64,${btoa(selectedFile.content || '')}`}
                  className="w-full h-full border-0"
                  title={`${selectedFile?.name} preview`}
                ></iframe>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <div className="text-center">
                    <FileText size={48} className="mx-auto mb-3 text-muted-foreground" />
                    <p className="font-medium">No preview available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
