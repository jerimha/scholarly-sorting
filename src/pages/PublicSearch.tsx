
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { File } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Shield, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { searchFiles, initializeStorage } from "@/lib/storage";
import { formatFileSize } from "@/lib/data";
import { useToast } from "@/hooks/use-toast";

const PublicSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<File[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Initialize storage with sample data
  useEffect(() => {
    initializeStorage();
  }, []);
  
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    const results = searchFiles(searchQuery);
    setSearchResults(results);
  };
  
  const handleAdminLogin = () => {
    navigate("/login");
  };
  
  const handleFileClick = () => {
    toast({
      title: "Login Required",
      description: "Please login to access file details",
      variant: "default",
    });
  };
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">TheSpect Public Files</h1>
          <Button 
            onClick={handleAdminLogin} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <Shield size={16} />
            Admin
          </Button>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-6 py-8">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Search Research Files</CardTitle>
            <CardDescription>
              Search our database of research files. Login is required to access full content.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-9"
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>
          </CardContent>
        </Card>
        
        {searchResults.length > 0 ? (
          <div>
            <h2 className="text-lg font-medium mb-4">Search Results ({searchResults.length})</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {searchResults.map((file) => (
                <Card key={file.id} className="overflow-hidden">
                  <CardHeader className="p-4 pb-2">
                    <CardTitle className="text-base truncate">{file.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {formatFileSize(file.size)} • {file.type}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 pt-2">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {file.notes || "No description available"}
                    </p>
                    
                    {file.tags && file.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {file.tags.slice(0, 3).map((tag) => (
                          <span 
                            key={tag.id} 
                            className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded-full"
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center gap-2" 
                      size="sm"
                      onClick={handleFileClick}
                    >
                      <Lock size={14} />
                      Login to Access
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ) : searchQuery ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No results found</h3>
            <p className="text-muted-foreground mt-1">Try a different search term</p>
          </div>
        ) : null}
      </main>
      
      <footer className="border-t py-4 px-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} TheSpect. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PublicSearch;
