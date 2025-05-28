import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Shield, Calendar, Lock, Filter, Info, X } from "lucide-react";
import { formatFileSize } from "@/lib/data";
import { File } from "@/types";
import { getAllFilesFromStorage, addSampleFiles } from "@/lib/storage";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const PublicSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<File[]>([]);
  const [allFiles, setAllFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<File | null>(null);
  const navigate = useNavigate();
  
  const availableYears = Array.from(
    { length: 2025 - 2000 + 1 }, 
    (_, i) => (2025 - i).toString()
  );

  // Load all files from localStorage on component mount
  useEffect(() => {
    console.log("Loading files from storage...");
    
    // Ensure sample files are added
    addSampleFiles();
    
    const files = getAllFilesFromStorage();
    console.log("All files from storage:", files);
    
    // Include ALL files - remove the restrictive filtering
    // Show all files that have content or are documents
    const searchableFiles = files.filter(file => {
      // Include all files - PDFs, documents, text files, and any file with content
      const hasContent = file.content && file.content.length > 0;
      const isDocument = ['pdf', 'docx', 'txt'].includes(file.type);
      const hasMetadata = file.publicationYear || file.authors || file.abstract || file.notes;
      
      // Include file if it's a document type, has content, or has metadata
      const shouldInclude = isDocument || hasContent || hasMetadata;
      
      console.log(`File ${file.name}: type=${file.type}, hasContent=${hasContent}, hasMetadata=${hasMetadata}, shouldInclude=${shouldInclude}`);
      return shouldInclude;
    });
    
    console.log("Filtered searchable files:", searchableFiles);
    setAllFiles(searchableFiles);
    
    // Show all searchable files initially
    setResults(searchableFiles);
  }, []);

  const handleSearch = () => {
    console.log("Searching with query:", searchQuery, "and year filter:", yearFilter);
    let filteredFiles = [...allFiles];
    
    // Apply search query filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filteredFiles = filteredFiles.filter(file => {
        const matchesName = file.name.toLowerCase().includes(query);
        const matchesTags = file.tags.some(tag => tag.name.toLowerCase().includes(query));
        const matchesAbstract = file.abstract && file.abstract.toLowerCase().includes(query);
        const matchesAuthors = file.authors && file.authors.some(author => author.toLowerCase().includes(query));
        const matchesNotes = file.notes && file.notes.toLowerCase().includes(query);
        const matchesContent = file.content && file.content.toLowerCase().includes(query);
        
        return matchesName || matchesTags || matchesAbstract || matchesAuthors || matchesNotes || matchesContent;
      });
    }
    
    // Apply year filter
    if (yearFilter !== "all") {
      const year = parseInt(yearFilter);
      filteredFiles = filteredFiles.filter(file => file.publicationYear === year);
    }
    
    console.log("Search results:", filteredFiles);
    setResults(filteredFiles);
    // Automatically show preview of first result if needed (optional)
    // setSelectedFile(filteredFiles.length > 0 ? filteredFiles[0] : null);
  };
  
  useEffect(() => {
    handleSearch();
  }, [yearFilter, allFiles]);

  // Auto-search when query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300); // Debounce search
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Re-load files when component becomes visible (to catch new uploads)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Page became visible, reloading files...");
        const files = getAllFilesFromStorage();
        const searchableFiles = files.filter(file => {
          const hasContent = file.content && file.content.length > 0;
          const isDocument = ['pdf', 'docx', 'txt'].includes(file.type);
          const hasMetadata = file.publicationYear || file.authors || file.abstract || file.notes;
          return isDocument || hasContent || hasMetadata;
        });
        setAllFiles(searchableFiles);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Inline preview rendering (instead of dialog)
  const renderFileContent = (file: File) => {
    if (!file.content) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-muted">
          <div className="text-center">
            <FileText size={48} className="mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">Content not available</p>
            <p className="text-muted-foreground text-sm mt-1">Login for full access</p>
          </div>
        </div>
      );
    }

    if (file.type === 'txt' || file.type === 'docx') {
      return (
        <div className="w-full h-full p-4 bg-white overflow-auto">
          <div className="whitespace-pre-wrap text-sm">
            {file.content}
          </div>
        </div>
      );
    }

    if (file.type === 'pdf') {
      try {
        if (file.content.startsWith('data:')) {
          return (
            <iframe 
              src={file.content}
              className="w-full h-full border-0 min-h-[400px]"
              title={`${file.name} preview`}
            />
          );
        }
        const dataUrl = `data:application/pdf;base64,${file.content}`;
        return (
          <iframe 
            src={dataUrl}
            className="w-full h-full border-0 min-h-[400px]"
            title={`${file.name} preview`}
          />
        );
      } catch (error) {
        return (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium">PDF preview unavailable</p>
              <p className="text-muted-foreground text-sm mt-1">Login for full access</p>
            </div>
          </div>
        );
      }
    }

    if (file.type === 'image') {
      return (
        <img 
          src={file.content} 
          alt={file.name}
          className="w-full h-full object-contain"
        />
      );
    }

    return (
      <div className="w-full h-full flex items-center justify-center bg-muted">
        <div className="text-center">
          <FileText size={48} className="mx-auto mb-3 text-muted-foreground" />
          <p className="font-medium">Preview not available</p>
          <p className="text-muted-foreground text-sm mt-1">Login for full access</p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">TheSpect Research Repository</h1>
        </div>
        <Button 
          onClick={() => navigate("/login")} 
          variant="outline" 
          className="flex items-center gap-2"
        >
          <Shield className="h-4 w-4" />
          Admin Access
        </Button>
      </header>

      <main className="flex-1 p-6 container mx-auto max-w-5xl flex flex-col md:flex-row gap-8">
        <section className={`flex-1 ${selectedFile ? "md:w-2/3" : "w-full"}`}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Document Repository 2000-2025</h2>
            <p className="text-muted-foreground">
              Browse our collection of documents and research papers. Login required to download content.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Found {allFiles.length} searchable documents
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search by title, author, keywords, content, or notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by year" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>

            {results.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-medium">{results.length} documents found</h3>
                <div className="divide-y">
                  {results.map((file) => (
                    <div 
                      key={file.id} 
                      className={`py-4 flex items-start justify-between cursor-pointer hover:bg-gray-50 px-3 rounded ${selectedFile && selectedFile.id === file.id ? "bg-gray-100" : ""}`}
                      onClick={() => setSelectedFile(file)}
                    >
                      <div className="flex items-start">
                        <FileText className="h-5 w-5 text-muted-foreground mr-3 mt-1" />
                        <div>
                          <div className="flex items-center">
                            <p className="font-medium">{file.name}</p>
                            {file.downloadable === false && (
                              <Badge variant="outline" className="ml-2 bg-amber-50 text-amber-700 border-amber-200">
                                <Lock size={10} className="mr-1" />
                                Protected
                              </Badge>
                            )}
                          </div>
                          {file.authors && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Authors: {file.authors.join(", ")}
                            </p>
                          )}
                          {file.abstract && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {file.abstract}
                            </p>
                          )}
                          {file.notes && !file.abstract && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {file.notes}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            {file.publicationYear && (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
                                <Calendar size={10} />
                                {file.publicationYear}
                              </Badge>
                            )}
                            {file.tags.map(tag => (
                              <Badge key={tag.id} variant="outline" className={`text-xs ${
                                tag.color === "blue" ? "bg-blue-50 text-blue-700" :
                                tag.color === "green" ? "bg-green-50 text-green-700" :
                                tag.color === "purple" ? "bg-purple-50 text-purple-700" :
                                tag.color === "orange" ? "bg-orange-50 text-orange-700" :
                                tag.color === "yellow" ? "bg-yellow-50 text-yellow-700" :
                                tag.color === "red" ? "bg-red-50 text-red-700" : ""
                              }`}>
                                {tag.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                {(searchQuery || yearFilter !== "all") ? (
                  <div>
                    <Info className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-lg font-medium">No documents found</p>
                    <p className="text-muted-foreground mt-1">Try adjusting your search criteria or year filter</p>
                  </div>
                ) : (
                  <div>
                    <Filter className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-lg font-medium">Browse Documents</p>
                    <p className="text-muted-foreground mt-1">Use the search or filter by year to find documents</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Inline file preview section (side-by-side on desktop, inside list on mobile) */}
        {selectedFile && (
          <aside className="md:w-1/2 max-w-xl w-full bg-white p-6 rounded shadow-lg flex flex-col relative">
            <button 
              className="absolute right-4 top-4 p-1 rounded hover:bg-accent border bg-muted" 
              aria-label="Close preview"
              onClick={() => setSelectedFile(null)}
            >
              <X size={20} />
            </button>
            <h2 className="font-semibold text-lg mb-4">{selectedFile.name}</h2>
            <div className="mb-4">
              {selectedFile.authors && (
                <div className="text-sm text-muted-foreground mb-1">
                  Authors: {selectedFile.authors.join(", ")}
                </div>
              )}
              {selectedFile.publicationYear && (
                <div className="mb-1">
                  <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                    <Calendar size={10} className="mr-1" />
                    {selectedFile.publicationYear}
                  </Badge>
                </div>
              )}
              {selectedFile.abstract && (
                <div className="mb-2">
                  <span className="text-xs font-medium">Abstract: </span>
                  <span className="text-xs text-muted-foreground">{selectedFile.abstract}</span>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-1 mb-2">
                {selectedFile.tags.map(tag => (
                  <Badge 
                    key={tag.id}
                    variant="outline"
                    className={`${
                      tag.color === "blue" ? "bg-blue-50 text-blue-700" :
                      tag.color === "green" ? "bg-green-50 text-green-700" :
                      tag.color === "purple" ? "bg-purple-50 text-purple-700" :
                      tag.color === "orange" ? "bg-orange-50 text-orange-700" :
                      tag.color === "yellow" ? "bg-yellow-50 text-yellow-700" :
                      tag.color === "red" ? "bg-red-50 text-red-700" : ""
                    }`}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex-1 min-h-[200px] mt-2 border rounded bg-muted p-2 overflow-auto">
              {renderFileContent(selectedFile)}
            </div>
            <div className="mt-4 flex justify-between">
              <span className="text-muted-foreground text-xs">Size: {formatFileSize(selectedFile.size)}</span>
              <Button onClick={() => navigate("/login")} className="flex items-center gap-2" size="sm">
                <Shield className="h-4 w-4" />
                Login for full access
              </Button>
            </div>
          </aside>
        )}
      </main>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{fileToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              // Handle file deletion here
              setShowDeleteDialog(false);
              setFileToDelete(null);
            }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <footer className="bg-white py-4 text-center text-sm text-muted-foreground border-t">
        <p>© 2025 TheSpect Research Repository. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PublicSearch;
