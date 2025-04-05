
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Shield } from "lucide-react";
import { formatFileSize } from "@/lib/data";
import { File } from "@/types";
import { getAllFilesFromStorage } from "@/lib/storage";

const PublicSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<File[]>([]);
  const [allFiles, setAllFiles] = useState<File[]>([]);
  const navigate = useNavigate();

  // Load all files from localStorage on component mount
  useEffect(() => {
    const files = getAllFilesFromStorage();
    setAllFiles(files);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Search through the files that were loaded from localStorage
      const foundFiles = allFiles.filter(file => 
        file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.tags.some(tag => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setResults(foundFiles);
    } else {
      setResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FileText className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">TheSpect File Browser</h1>
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

      <main className="flex-1 p-6 container mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">Public File Search</h2>
          <p className="text-muted-foreground">
            Search for files in our repository. Login required to view or modify content.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search files by name or tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10"
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
          </div>

          {results.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium">{results.length} results found</h3>
              <div className="divide-y">
                {results.map((file) => (
                  <div key={file.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-muted-foreground mr-3" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {file.tags.map(tag => tag.name).join(", ")}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {file.modifiedAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              {searchQuery ? (
                <p className="text-muted-foreground">No files found matching your search.</p>
              ) : (
                <p className="text-muted-foreground">Enter search terms to find files.</p>
              )}
            </div>
          )}
        </div>
      </main>

      <footer className="bg-white py-4 text-center text-sm text-muted-foreground border-t">
        <p>© 2025 TheSpect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PublicSearch;
