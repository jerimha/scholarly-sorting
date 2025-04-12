
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Shield, ChevronDown, BookOpen } from "lucide-react";
import { File } from "@/types";
import { getAllResearchPapers } from "@/lib/storage";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ResearchPapers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [results, setResults] = useState<File[]>([]);
  const [allPapers, setAllPapers] = useState<File[]>([]);
  const [selectedPaper, setSelectedPaper] = useState<File | null>(null);
  const navigate = useNavigate();
  const years = ["all", ...Array.from({length: 21}, (_, i) => (2000 + i).toString())];

  // Load all research papers from localStorage on component mount
  useEffect(() => {
    const papers = getAllResearchPapers();
    setAllPapers(papers);
    setResults(papers);
  }, []);

  useEffect(() => {
    filterPapers();
  }, [selectedYear, searchQuery, allPapers]);

  const filterPapers = () => {
    let filtered = [...allPapers];
    
    // Filter by year if not "all"
    if (selectedYear !== "all") {
      filtered = filtered.filter(paper => paper.publicationYear === selectedYear);
    }
    
    // Filter by search query if provided
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(paper => 
        paper.name.toLowerCase().includes(query) || 
        (paper.authors && paper.authors.toLowerCase().includes(query)) ||
        (paper.abstract && paper.abstract.toLowerCase().includes(query)) ||
        paper.tags.some(tag => tag.name.toLowerCase().includes(query))
      );
    }
    
    setResults(filtered);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold">IT Research Archive</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={() => navigate("/")} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Public Search
          </Button>
          <Button 
            onClick={() => navigate("/login")} 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Admin Access
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 container mx-auto max-w-5xl">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-2">IT Research Papers (2000-2020)</h2>
          <p className="text-muted-foreground">
            Browse through our collection of IT research papers spanning two decades.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search papers by title, author or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-full md:w-40">
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year === "all" ? "All Years" : year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {results.length > 0 ? (
            <div className="space-y-4">
              <h3 className="font-medium">{results.length} papers found</h3>
              <div className="divide-y">
                {results.map((paper) => (
                  <div 
                    key={paper.id} 
                    className="py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 rounded"
                    onClick={() => setSelectedPaper(paper)}
                  >
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-muted-foreground mr-3" />
                      <div>
                        <p className="font-medium">{paper.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {paper.authors} • {paper.publicationYear}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex flex-wrap justify-end gap-1">
                        {paper.tags.slice(0, 2).map(tag => (
                          <span 
                            key={tag.id}
                            className={`px-2 py-1 rounded-full text-xs ${
                              tag.color === "blue" ? "bg-blue-100 text-blue-800" :
                              tag.color === "green" ? "bg-green-100 text-green-800" :
                              tag.color === "purple" ? "bg-purple-100 text-purple-800" :
                              tag.color === "orange" ? "bg-orange-100 text-orange-800" :
                              tag.color === "yellow" ? "bg-yellow-100 text-yellow-800" :
                              tag.color === "red" ? "bg-red-100 text-red-800" : ""
                            }`}
                          >
                            {tag.name}
                          </span>
                        ))}
                        {paper.tags.length > 2 && (
                          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                            +{paper.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              {selectedYear !== "all" || searchQuery ? (
                <p className="text-muted-foreground">No papers found matching your search criteria.</p>
              ) : (
                <p className="text-muted-foreground">No research papers available.</p>
              )}
            </div>
          )}
        </div>
      </main>

      <Dialog open={!!selectedPaper} onOpenChange={(open) => !open && setSelectedPaper(null)}>
        <DialogContent className="max-w-3xl h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">{selectedPaper?.name}</DialogTitle>
          </DialogHeader>
          <div className="mt-2 text-sm text-muted-foreground">
            {selectedPaper?.authors} • {selectedPaper?.publicationYear}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedPaper?.tags.map(tag => (
              <span 
                key={tag.id}
                className={`px-2 py-1 rounded-full text-xs ${
                  tag.color === "blue" ? "bg-blue-100 text-blue-800" :
                  tag.color === "green" ? "bg-green-100 text-green-800" :
                  tag.color === "purple" ? "bg-purple-100 text-purple-800" :
                  tag.color === "orange" ? "bg-orange-100 text-orange-800" :
                  tag.color === "yellow" ? "bg-yellow-100 text-yellow-800" :
                  tag.color === "red" ? "bg-red-100 text-red-800" : ""
                }`}
              >
                {tag.name}
              </span>
            ))}
          </div>
          <div className="mt-4 mb-2 border-t pt-2">
            <h3 className="text-sm font-medium mb-1">Abstract</h3>
            <p className="text-sm">{selectedPaper?.abstract}</p>
          </div>
          <div className="flex-1 overflow-auto border rounded-md mt-4">
            {selectedPaper?.content ? (
              <div className="h-full p-4 bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                  <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="mb-2 font-medium">PDF Preview Available</p>
                  <p className="text-sm text-muted-foreground">
                    This document can only be viewed as a PDF in protected mode
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground italic">No content available</p>
              </div>
            )}
          </div>
          <div className="mt-4 flex justify-between">
            <Button variant="outline" onClick={() => setSelectedPaper(null)}>Close</Button>
            <Button onClick={() => navigate("/login")}>
              <Shield className="h-4 w-4 mr-2" />
              Log in for full access
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <footer className="bg-white py-4 text-center text-sm text-muted-foreground border-t">
        <p>© 2025 TheSpect IT Research Archive. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default ResearchPapers;
