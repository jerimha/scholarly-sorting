
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tag } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { saveFile } from "@/lib/storage";
import { getTags } from "@/lib/storage";

const FileUploader = ({ onFileUploaded }: { onFileUploaded: () => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Get available tags from storage
  const availableTags = getTags();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const toggleTag = (tag: Tag) => {
    if (selectedTags.some(t => t.id === tag.id)) {
      setSelectedTags(selectedTags.filter(t => t.id !== tag.id));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      // Determine file type
      let fileType: string;
      if (file.name.endsWith('.pdf')) {
        fileType = 'pdf';
      } else if (file.name.endsWith('.docx')) {
        fileType = 'docx';
      } else if (file.name.endsWith('.txt')) {
        fileType = 'txt';
      } else if (/\.(jpe?g|png|gif)$/i.test(file.name)) {
        fileType = 'image';
      } else {
        fileType = 'other';
      }

      // Get file content if it's a text file
      let content = "";
      if (fileType === 'txt') {
        content = await file.text();
      }

      // Save file to storage
      saveFile({
        name: file.name,
        type: fileType,
        size: file.size,
        createdAt: new Date(),
        modifiedAt: new Date(),
        tags: selectedTags,
        path: [], // Root folder by default
        notes: notes,
        content
      });

      toast({
        title: "Success",
        description: "File uploaded successfully",
      });

      // Reset form
      setFile(null);
      setNotes("");
      setSelectedTags([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      
      // Notify parent component
      onFileUploaded();
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "Error",
        description: "Failed to upload file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload File</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="file">Select File</Label>
          <Input 
            id="file" 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange} 
          />
          {file && (
            <p className="text-sm text-muted-foreground">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <div
                key={tag.id}
                className={`tag ${
                  selectedTags.some(t => t.id === tag.id)
                    ? `bg-${tag.color}-100 text-${tag.color}-800 border-${tag.color}-300`
                    : "bg-gray-100 text-gray-800 border-gray-300"
                } border cursor-pointer`}
                onClick={() => toggleTag(tag)}
              >
                {tag.name}
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px]"
            placeholder="Add notes about this file..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleUpload}
          disabled={!file || isUploading}
        >
          {isUploading ? (
            <>
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent"></span>
              Uploading...
            </>
          ) : (
            "Upload File"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FileUploader;
