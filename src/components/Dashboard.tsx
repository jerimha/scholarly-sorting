
import React, { useEffect, useState } from "react";
import { File, Folder, Tag } from "@/types";
import { formatFileSize } from "@/lib/data";
import { filterFilesByTag, getRootFiles, getRootFolders, searchFiles, initializeStorage, getFiles, updateFile } from "@/lib/storage";
import Sidebar from "./Sidebar";
import FileItem from "./FileItem";
import FolderItem from "./FolderItem";
import FilePreview from "./FilePreview";
import SearchBar from "./SearchBar";
import FileUploader from "./FileUploader";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { ChevronRight, Home, PlusCircle } from "lucide-react";
import { getTags } from "@/lib/storage";

const Dashboard = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [displayedFiles, setDisplayedFiles] = useState<File[]>([]);
  const [displayedFolders, setDisplayedFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Initialize storage with sample data on first load
  useEffect(() => {
    initializeStorage();
    setTags(getTags());
  }, []);
  
  // Handle file updates (like notes)
  const handleFileUpdate = (fileId: string, updates: Partial<File>) => {
    const updated = updateFile(fileId, updates);
    if (updated) {
      // If the currently selected file was updated, refresh it
      if (selectedFile && selectedFile.id === fileId) {
        setSelectedFile(updated);
      }
      // Trigger a refresh of displayed files
      setRefreshTrigger(prev => prev + 1);
    }
  };
  
  // Update displayed files and folders when tab or path changes
  useEffect(() => {
    // Reset search when changing tabs
    setSearchQuery("");
    
    if (activeTab === "search") {
      // Don't do anything when switching to search tab - wait for search input
      return;
    }
    
    if (activeTab.startsWith("tag-")) {
      const tagId = activeTab.replace("tag-", "");
      setDisplayedFiles(filterFilesByTag(tagId));
      setDisplayedFolders([]);
      return;
    }
    
    if (activeTab === "starred") {
      setDisplayedFiles(getFiles().filter(file => file.starred));
      setDisplayedFolders([]);
      return;
    }
    
    if (activeTab === "recent") {
      // Sort by modified date, most recent first
      const recentFiles = [...getFiles()].sort(
        (a, b) => new Date(b.modifiedAt).getTime() - new Date(a.modifiedAt).getTime()
      ).slice(0, 10); // Get 10 most recent
      
      setDisplayedFiles(recentFiles);
      setDisplayedFolders([]);
      return;
    }
    
    // Default view - show files and folders at current path
    const allFolders = getRootFolders();
    let currentFolders: Folder[] = allFolders;
    let currentFiles: File[] = getRootFiles();
    
    // Navigate to the current path
    if (currentPath.length > 0) {
      let parent: Folder | undefined;
      
      // Find the current folder based on the path
      for (let i = 0; i < currentPath.length; i++) {
        const folderName = currentPath[i];
        
        if (i === 0) {
          parent = allFolders.find(f => f.name === folderName);
        } else if (parent) {
          parent = parent.subFolders.find(f => f.name === folderName);
        }
        
        if (!parent) break;
      }
      
      if (parent) {
        currentFolders = parent.subFolders;
        currentFiles = parent.files;
      }
    }
    
    setDisplayedFolders(currentFolders);
    setDisplayedFiles(currentFiles);
  }, [activeTab, currentPath, refreshTrigger]);
  
  // Handle search
  useEffect(() => {
    if (activeTab === "search" && searchQuery) {
      setDisplayedFiles(searchFiles(searchQuery));
      setDisplayedFolders([]);
    }
  }, [searchQuery, activeTab]);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPath([]);
    setSelectedFile(null);
  };
  
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    if (activeTab !== "search") {
      setActiveTab("search");
    }
  };
  
  const handleFolderSelect = (folder: Folder) => {
    setCurrentPath([...folder.path]);
    setActiveTab("all");
  };
  
  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };
  
  const handlePathClick = (index: number) => {
    setCurrentPath(currentPath.slice(0, index + 1));
  };
  
  const handleHomeClick = () => {
    setCurrentPath([]);
  };
  
  const handleFileUploaded = () => {
    // Refresh the file list after a new file has been uploaded
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="flex h-screen">
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />
      
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <header className="p-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">
              {activeTab === "all" && "Files"}
              {activeTab === "recent" && "Recent Files"}
              {activeTab === "starred" && "Starred Files"}
              {activeTab === "search" && "Search Results"}
              {activeTab.startsWith("tag-") && (() => {
                const tagId = activeTab.replace("tag-", "");
                const tag = tags.find(t => t.id === tagId);
                return tag ? `Tag: ${tag.name}` : "Tagged Files";
              })()}
            </h1>
            
            <div className="flex items-center gap-3">
              {user && (
                <div className="flex items-center gap-2 mr-2">
                  <span className="text-sm font-medium">{user.name}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={logout} 
                    className="flex items-center gap-1"
                  >
                    <LogOut size={16} />
                    Logout
                  </Button>
                </div>
              )}
              <SearchBar value={searchQuery} onChange={handleSearchChange} />
              {activeTab === "all" && <FileUploader onFileUploaded={handleFileUploaded} />}
            </div>
          </div>
          
          {activeTab === "all" && (
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink onClick={handleHomeClick}>
                    <Home size={16} className="mr-1" />
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                
                {currentPath.map((folder, index) => (
                  <React.Fragment key={`breadcrumb-${index}`}>
                    <BreadcrumbSeparator>
                      <ChevronRight size={16} />
                    </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <BreadcrumbLink onClick={() => handlePathClick(index)}>
                        {folder}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          )}
        </header>
        
        <main className="flex flex-1 overflow-hidden">
          <div className={`flex-1 p-6 overflow-y-auto ${selectedFile ? 'hidden md:block' : 'block'}`}>
            {displayedFolders.length > 0 && (
              <>
                <h2 className="text-lg font-medium mb-3">Folders</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {displayedFolders.map(folder => (
                    <FolderItem 
                      key={folder.id} 
                      folder={folder}
                      onSelect={handleFolderSelect}
                    />
                  ))}
                </div>
                
                {displayedFiles.length > 0 && <Separator className="my-6" />}
              </>
            )}
            
            {displayedFiles.length > 0 ? (
              <>
                <h2 className="text-lg font-medium mb-3">Files</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {displayedFiles.map(file => (
                    <FileItem 
                      key={file.id} 
                      file={file}
                      onSelect={handleFileSelect}
                    />
                  ))}
                </div>
              </>
            ) : (
              displayedFolders.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                    <PlusCircle size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium">No files found</h3>
                  <p className="text-muted-foreground mt-1 mb-4 max-w-md">
                    {activeTab === "search" 
                      ? "Try a different search term or browse through your folders." 
                      : "Upload files or create folders to organize your thesis."}
                  </p>
                  {activeTab === "all" && <FileUploader onFileUploaded={handleFileUploaded} />}
                </div>
              )
            )}
          </div>
          
          {selectedFile && (
            <div className="w-full md:w-1/3 lg:w-1/4 border-l">
              <FilePreview 
                file={selectedFile}
                onClose={() => setSelectedFile(null)}
                onUpdate={handleFileUpdate}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
