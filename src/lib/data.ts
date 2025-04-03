
import { File, Folder, Tag } from "@/types";
import { getAllFilesFromStorage } from "./storage";

// Sample tags for the application
export const sampleTags: Tag[] = [
  { id: "tag1", name: "Research", color: "blue" },
  { id: "tag2", name: "Literature", color: "green" },
  { id: "tag3", name: "Methodology", color: "purple" },
  { id: "tag4", name: "Results", color: "orange" },
  { id: "tag5", name: "Discussion", color: "yellow" },
  { id: "tag6", name: "Important", color: "red" },
];

// Get all files from storage
export const getAllFiles = (): File[] => {
  return getAllFilesFromStorage();
};

// Get root-level files (those with empty path)
export const getRootFiles = (): File[] => {
  return getAllFiles().filter(file => file.path.length === 0);
};

// Sample folders structure
const sampleFolders: Folder[] = [
  {
    id: "folder1",
    name: "Research Papers",
    files: [],
    subFolders: [
      {
        id: "folder1-1",
        name: "Literature Review",
        files: [],
        subFolders: [],
        path: ["Research Papers"],
        createdAt: new Date("2023-01-15"),
        modifiedAt: new Date("2023-01-15"),
      }
    ],
    path: [],
    createdAt: new Date("2023-01-10"),
    modifiedAt: new Date("2023-02-20"),
  },
  {
    id: "folder2",
    name: "Data Collection",
    files: [],
    subFolders: [],
    path: [],
    createdAt: new Date("2023-01-20"),
    modifiedAt: new Date("2023-02-10"),
  },
  {
    id: "folder3",
    name: "Drafts",
    files: [],
    subFolders: [],
    path: [],
    createdAt: new Date("2023-02-05"),
    modifiedAt: new Date("2023-02-25"),
  },
];

// Get root-level folders
export const getRootFolders = (): Folder[] => {
  return sampleFolders;
};

// Filter files by tag
export const filterFilesByTag = (tagId: string): File[] => {
  return getAllFiles().filter(file => 
    file.tags.some(tag => tag.id === tagId)
  );
};

// Search files by name
export const searchFiles = (query: string): File[] => {
  const lowercaseQuery = query.toLowerCase();
  return getAllFiles().filter(file => 
    file.name.toLowerCase().includes(lowercaseQuery) ||
    file.tags.some(tag => tag.name.toLowerCase().includes(lowercaseQuery))
  );
};

// Format file size for display
export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "0 Bytes";
  
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return Math.round(bytes / Math.pow(1024, i)) + " " + sizes[i];
};

// Get file type icon
export const getFileTypeIcon = (type: string) => {
  // Logic to return the appropriate icon based on file type
  return "file";
};
