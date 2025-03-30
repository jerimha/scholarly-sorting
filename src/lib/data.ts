import { File, FileType, Folder, Tag } from "@/types";

// Sample tags
export const sampleTags: Tag[] = [
  { id: "tag1", name: "Literature Review", color: "blue" },
  { id: "tag2", name: "Methodology", color: "green" },
  { id: "tag3", name: "Data Analysis", color: "purple" },
  { id: "tag4", name: "References", color: "orange" },
  { id: "tag5", name: "Draft", color: "yellow" },
  { id: "tag6", name: "Final", color: "red" }
];

// Sample files
export const sampleFiles: File[] = [
  {
    id: "file1",
    name: "Thesis Introduction.pdf",
    type: "pdf",
    size: 1024 * 1024 * 2.3, // 2.3MB
    createdAt: new Date("2023-11-15"),
    modifiedAt: new Date("2023-12-01"),
    tags: [sampleTags[0], sampleTags[4]],
    path: ["Research"],
    notes: "First draft of the introduction chapter. Need to expand the research questions section."
  },
  {
    id: "file2",
    name: "Literature Review.docx",
    type: "docx",
    size: 1024 * 1024 * 3.7, // 3.7MB
    createdAt: new Date("2023-11-20"),
    modifiedAt: new Date("2023-12-05"),
    tags: [sampleTags[0]],
    path: ["Research"],
    notes: "Contains reviews of 25 papers. Still need to incorporate Smith's 2022 study."
  },
  {
    id: "file3",
    name: "Methodology Draft.docx",
    type: "docx",
    size: 1024 * 1024 * 1.5, // 1.5MB
    createdAt: new Date("2023-11-25"),
    modifiedAt: new Date("2023-12-07"),
    tags: [sampleTags[1], sampleTags[4]],
    path: ["Research", "Methods"],
    notes: "First outline of methodology. Need feedback from advisor."
  },
  {
    id: "file4",
    name: "Survey Results.pdf",
    type: "pdf",
    size: 1024 * 1024 * 5.2, // 5.2MB
    createdAt: new Date("2023-12-01"),
    modifiedAt: new Date("2023-12-10"),
    tags: [sampleTags[2]],
    path: ["Research", "Data"],
    starred: true,
    notes: "Raw survey results from 150 participants. Need to create visualizations."
  },
  {
    id: "file5",
    name: "Data Analysis Script.txt",
    type: "txt",
    size: 1024 * 512, // 512KB
    createdAt: new Date("2023-12-05"),
    modifiedAt: new Date("2023-12-12"),
    tags: [sampleTags[2]],
    path: ["Research", "Data"],
    content: "# R Script for Data Analysis\n\nlibrary(tidyverse)\nlibrary(ggplot2)\n\n# Load data\ndata <- read.csv('survey_results.csv')\n\n# Basic statistics\nsummary(data)",
    notes: "R script for analyzing survey data. Works but needs optimization."
  },
  {
    id: "file6",
    name: "References.docx",
    type: "docx",
    size: 1024 * 1024 * 0.8, // 0.8MB
    createdAt: new Date("2023-12-07"),
    modifiedAt: new Date("2023-12-15"),
    tags: [sampleTags[3]],
    path: ["Resources"],
    notes: "Bibliography in APA format. Currently has 78 references."
  },
  {
    id: "file7",
    name: "Thesis Outline.docx",
    type: "docx",
    size: 1024 * 1024 * 0.5, // 0.5MB
    createdAt: new Date("2023-11-10"),
    modifiedAt: new Date("2023-12-08"),
    tags: [sampleTags[4]],
    path: [],
    starred: true,
    notes: "Master outline of the entire thesis. Updated after advisor meeting on Dec 8."
  },
  {
    id: "file8",
    name: "Research Paper 1.pdf",
    type: "pdf",
    size: 1024 * 1024 * 1.2, // 1.2MB
    createdAt: new Date("2023-10-15"),
    modifiedAt: new Date("2023-10-15"),
    tags: [sampleTags[0]],
    path: ["Resources", "Papers"],
    notes: "Important paper by Johnson et al. (2020) on theoretical framework."
  },
  {
    id: "file9",
    name: "Presentation Slides.pdf",
    type: "pdf",
    size: 1024 * 1024 * 3.1, // 3.1MB
    createdAt: new Date("2023-12-10"),
    modifiedAt: new Date("2023-12-16"),
    tags: [sampleTags[5]],
    path: ["Presentations"],
    notes: "Slides for the department presentation on December 20."
  }
];

// Sample folders structure
export const sampleFolders: Folder[] = [
  {
    id: "folder1",
    name: "Research",
    files: sampleFiles.filter(file => file.path[0] === "Research" && file.path.length === 1),
    subFolders: [
      {
        id: "folder2",
        name: "Methods",
        files: sampleFiles.filter(file => file.path[0] === "Research" && file.path[1] === "Methods"),
        subFolders: [],
        path: ["Research", "Methods"],
        createdAt: new Date("2023-11-15"),
        modifiedAt: new Date("2023-12-07")
      },
      {
        id: "folder3",
        name: "Data",
        files: sampleFiles.filter(file => file.path[0] === "Research" && file.path[1] === "Data"),
        subFolders: [],
        path: ["Research", "Data"],
        createdAt: new Date("2023-11-20"),
        modifiedAt: new Date("2023-12-12")
      }
    ],
    path: ["Research"],
    createdAt: new Date("2023-11-10"),
    modifiedAt: new Date("2023-12-12")
  },
  {
    id: "folder4",
    name: "Resources",
    files: sampleFiles.filter(file => file.path[0] === "Resources" && file.path.length === 1),
    subFolders: [
      {
        id: "folder5",
        name: "Papers",
        files: sampleFiles.filter(file => file.path[0] === "Resources" && file.path[1] === "Papers"),
        subFolders: [],
        path: ["Resources", "Papers"],
        createdAt: new Date("2023-10-15"),
        modifiedAt: new Date("2023-10-15")
      }
    ],
    path: ["Resources"],
    createdAt: new Date("2023-10-10"),
    modifiedAt: new Date("2023-12-15")
  },
  {
    id: "folder6",
    name: "Presentations",
    files: sampleFiles.filter(file => file.path[0] === "Presentations"),
    subFolders: [],
    path: ["Presentations"],
    createdAt: new Date("2023-12-01"),
    modifiedAt: new Date("2023-12-16")
  }
];

// Get all files (including those in root)
export const getAllFiles = (): File[] => {
  return sampleFiles;
};

// Get root files (files not in any folder)
export const getRootFiles = (): File[] => {
  return sampleFiles.filter(file => file.path.length === 0);
};

// Get root folders
export const getRootFolders = (): Folder[] => {
  return sampleFolders;
};

// Format file size
export const formatFileSize = (bytes?: number): string => {
  if (!bytes) return "Unknown size";
  
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${kb.toFixed(1)} KB`;
  }
  
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

// Get icon for file type
export const getFileTypeIcon = (type: FileType): string => {
  switch (type) {
    case 'pdf':
      return 'file';
    case 'docx':
      return 'file';
    case 'txt':
      return 'file';
    case 'image':
      return 'file';
    case 'folder':
      return 'folder';
    default:
      return 'file';
  }
};

// Search files
export const searchFiles = (query: string): File[] => {
  const lowerQuery = query.toLowerCase();
  return sampleFiles.filter(file => 
    file.name.toLowerCase().includes(lowerQuery) || 
    file.tags.some(tag => tag.name.toLowerCase().includes(lowerQuery)) ||
    (file.notes && file.notes.toLowerCase().includes(lowerQuery))
  );
};

// Filter files by tag
export const filterFilesByTag = (tagId: string): File[] => {
  return sampleFiles.filter(file => 
    file.tags.some(tag => tag.id === tagId)
  );
};
