import { File, Folder, FileType } from "@/types";

// Utility functions for file handling
export const saveFile = (file: File): boolean => {
  try {
    // Get existing files from local storage
    const filesJson = localStorage.getItem("files");
    let files: File[] = filesJson ? JSON.parse(filesJson) : [];
    
    // Check if file already exists
    const existingFileIndex = files.findIndex(f => f.id === file.id);
    
    if (existingFileIndex >= 0) {
      // Update existing file
      files[existingFileIndex] = {
        ...file,
        modifiedAt: new Date()
      };
    } else {
      // Add new file
      files.push({
        ...file,
        id: file.id || crypto.randomUUID(),
        createdAt: new Date(),
        modifiedAt: new Date()
      });
    }
    
    // Save back to localStorage
    localStorage.setItem("files", JSON.stringify(files));
    return true;
  } catch (error) {
    console.error("Error saving file:", error);
    return false;
  }
};

export const saveFileContent = (fileId: string, content: string): boolean => {
  try {
    // Get existing files from local storage
    const filesJson = localStorage.getItem("files");
    let files: File[] = filesJson ? JSON.parse(filesJson) : [];
    
    // Find the file
    const fileIndex = files.findIndex(f => f.id === fileId);
    
    if (fileIndex >= 0) {
      // Update file content
      files[fileIndex] = {
        ...files[fileIndex],
        content,
        modifiedAt: new Date()
      };
      
      // Save back to localStorage
      localStorage.setItem("files", JSON.stringify(files));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error saving file content:", error);
    return false;
  }
};

export const moveFileToTrash = (fileId: string): boolean => {
  try {
    // Get existing files and trash
    const filesJson = localStorage.getItem("files");
    const trashJson = localStorage.getItem("trash");
    
    let files: File[] = filesJson ? JSON.parse(filesJson) : [];
    let trash: File[] = trashJson ? JSON.parse(trashJson) : [];
    
    // Find the file to move to trash
    const fileIndex = files.findIndex(f => f.id === fileId);
    
    if (fileIndex >= 0) {
      // Get the file
      const fileToTrash = {
        ...files[fileIndex],
        deletedAt: new Date()
      };
      
      // Remove from files and add to trash
      files.splice(fileIndex, 1);
      trash.push(fileToTrash);
      
      // Save back to localStorage
      localStorage.setItem("files", JSON.stringify(files));
      localStorage.setItem("trash", JSON.stringify(trash));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error moving file to trash:", error);
    return false;
  }
};

export const restoreFromTrash = (fileId: string): boolean => {
  try {
    // Get existing files and trash
    const filesJson = localStorage.getItem("files");
    const trashJson = localStorage.getItem("trash");
    
    let files: File[] = filesJson ? JSON.parse(filesJson) : [];
    let trash: File[] = trashJson ? JSON.parse(trashJson) : [];
    
    // Find the file to restore
    const trashIndex = trash.findIndex(f => f.id === fileId);
    
    if (trashIndex >= 0) {
      // Get file from trash
      const { deletedAt, ...fileToRestore } = trash[trashIndex];
      
      // Remove from trash and add back to files
      trash.splice(trashIndex, 1);
      files.push({
        ...fileToRestore,
        modifiedAt: new Date()
      });
      
      // Save back to localStorage
      localStorage.setItem("files", JSON.stringify(files));
      localStorage.setItem("trash", JSON.stringify(trash));
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error restoring file from trash:", error);
    return false;
  }
};

export const permanentlyDeleteFile = (fileId: string): boolean => {
  try {
    // Get existing trash
    const trashJson = localStorage.getItem("trash");
    let trash: File[] = trashJson ? JSON.parse(trashJson) : [];
    
    // Filter out the file to delete
    const newTrash = trash.filter(f => f.id !== fileId);
    
    // Save back to localStorage
    localStorage.setItem("trash", JSON.stringify(newTrash));
    return true;
  } catch (error) {
    console.error("Error permanently deleting file:", error);
    return false;
  }
};

export const deleteFile = (fileId: string): boolean => {
  return moveFileToTrash(fileId);
};

export const cleanupExpiredTrash = (): void => {
  try {
    // Get existing trash
    const trashJson = localStorage.getItem("trash");
    let trash: File[] = trashJson ? JSON.parse(trashJson) : [];
    
    // Calculate date 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Filter out expired files
    const newTrash = trash.filter(f => {
      const deletedAt = new Date(f.deletedAt as unknown as string);
      return deletedAt > thirtyDaysAgo;
    });
    
    // Save back to localStorage
    localStorage.setItem("trash", JSON.stringify(newTrash));
  } catch (error) {
    console.error("Error cleaning up expired trash:", error);
  }
};

export const getAllFilesFromStorage = (): File[] => {
  try {
    const filesJson = localStorage.getItem("files");
    const files = filesJson ? JSON.parse(filesJson) : [];
    
    // Convert date strings back to Date objects
    return files.map((file: any) => ({
      ...file,
      createdAt: new Date(file.createdAt),
      modifiedAt: new Date(file.modifiedAt)
    }));
  } catch (error) {
    console.error("Error getting files:", error);
    return [];
  }
};

export const getTrashFromStorage = (): File[] => {
  try {
    const trashJson = localStorage.getItem("trash");
    const trash = trashJson ? JSON.parse(trashJson) : [];
    
    // Convert date strings back to Date objects
    return trash.map((file: any) => ({
      ...file,
      createdAt: new Date(file.createdAt),
      modifiedAt: new Date(file.modifiedAt),
      deletedAt: new Date(file.deletedAt)
    }));
  } catch (error) {
    console.error("Error getting trash:", error);
    return [];
  }
};

export const getFileById = (fileId: string): File | null => {
  try {
    const filesJson = localStorage.getItem("files");
    const files: File[] = filesJson ? JSON.parse(filesJson) : [];
    return files.find(f => f.id === fileId) || null;
  } catch (error) {
    console.error("Error getting file:", error);
    return null;
  }
};

// Add sample files to the storage
export const addSampleFiles = (): void => {
  const sampleFiles = [
    {
      id: "sample-1",
      name: "Research Proposal.docx",
      type: "docx" as FileType,
      size: 256000,
      createdAt: new Date("2023-12-10"),
      modifiedAt: new Date("2024-01-15"),
      path: [],
      tags: [
        { id: "tag1", name: "Research", color: "blue" }
      ],
      content: "This is a sample research proposal document."
    },
    {
      id: "sample-2",
      name: "Research Methods.pdf",
      type: "pdf" as FileType,
      size: 1456000,
      createdAt: new Date("2023-10-05"),
      modifiedAt: new Date("2024-02-18"),
      path: ["Research Papers"],
      tags: [
        { id: "tag1", name: "Research", color: "blue" }
      ],
      content: "Comprehensive research methodology overview."
    },
    
    {
      id: "sample-3",
      name: "Literature Review.pdf",
      type: "pdf" as FileType,
      size: 1024000,
      createdAt: new Date("2023-11-05"),
      modifiedAt: new Date("2024-02-20"),
      path: ["Research Papers"],
      tags: [
        { id: "tag2", name: "Literature", color: "green" }
      ],
      content: "Sample literature review content."
    },
    {
      id: "sample-4",
      name: "Key Literary Sources.docx",
      type: "docx" as FileType,
      size: 358000,
      createdAt: new Date("2023-09-12"),
      modifiedAt: new Date("2024-01-30"),
      path: ["Research Papers", "Literature Review"],
      tags: [
        { id: "tag2", name: "Literature", color: "green" }
      ],
      content: "Compilation of important literary sources and references."
    },
    
    {
      id: "sample-5",
      name: "Research Methodology.txt",
      type: "txt" as FileType,
      size: 165000,
      createdAt: new Date("2023-12-22"),
      modifiedAt: new Date("2024-02-05"),
      path: [],
      tags: [
        { id: "tag3", name: "Methodology", color: "purple" }
      ],
      content: "Detailed explanation of research methodology."
    },
    {
      id: "sample-6",
      name: "Survey Questions.docx",
      type: "docx" as FileType,
      size: 198000,
      createdAt: new Date("2024-01-08"),
      modifiedAt: new Date("2024-02-28"),
      path: ["Data Collection"],
      tags: [
        { id: "tag3", name: "Methodology", color: "purple" }
      ],
      content: "List of survey questions for the research study."
    },
    
    {
      id: "sample-7",
      name: "Data Analysis.txt",
      type: "txt" as FileType,
      size: 128000,
      createdAt: new Date("2024-01-25"),
      modifiedAt: new Date("2024-03-10"),
      path: ["Data Collection"],
      tags: [
        { id: "tag4", name: "Results", color: "orange" }
      ],
      content: "Sample data analysis notes and findings."
    },
    {
      id: "sample-8",
      name: "Statistical Output.pdf",
      type: "pdf" as FileType,
      size: 762000,
      createdAt: new Date("2024-02-15"),
      modifiedAt: new Date("2024-03-05"),
      path: ["Data Collection"],
      tags: [
        { id: "tag4", name: "Results", color: "orange" }
      ],
      content: "Statistical analysis results from the research study."
    },
    
    {
      id: "sample-9",
      name: "Project Timeline.pdf",
      type: "pdf" as FileType,
      size: 512000,
      createdAt: new Date("2023-10-12"),
      modifiedAt: new Date("2024-02-05"),
      path: [],
      tags: [
        { id: "tag5", name: "Discussion", color: "yellow" }
      ],
      content: "Project timeline and milestone tracking document."
    },
    {
      id: "sample-10",
      name: "Research Implications.docx",
      type: "docx" as FileType,
      size: 489000,
      createdAt: new Date("2023-11-18"),
      modifiedAt: new Date("2024-03-01"),
      path: ["Drafts"],
      tags: [
        { id: "tag5", name: "Discussion", color: "yellow" }
      ],
      content: "Discussion of research implications and significance."
    },
    
    {
      id: "sample-11",
      name: "Critical Findings.pdf",
      type: "pdf" as FileType,
      size: 675000,
      createdAt: new Date("2024-01-05"),
      modifiedAt: new Date("2024-03-12"),
      path: [],
      tags: [
        { id: "tag6", name: "Important", color: "red" }
      ],
      content: "Essential research findings and key takeaways."
    },
    {
      id: "sample-12",
      name: "Research Images.image",
      type: "image" as FileType,
      size: 2048000,
      createdAt: new Date("2024-02-01"),
      modifiedAt: new Date("2024-03-01"),
      path: ["Research Papers", "Literature Review"],
      tags: [
        { id: "tag6", name: "Important", color: "red" }
      ]
    },
    
    {
      id: "sample-13",
      name: "Combined Research Notes.txt",
      type: "txt" as FileType,
      size: 352000,
      createdAt: new Date("2024-01-12"),
      modifiedAt: new Date("2024-03-08"),
      path: [],
      tags: [
        { id: "tag1", name: "Research", color: "blue" },
        { id: "tag3", name: "Methodology", color: "purple" },
        { id: "tag6", name: "Important", color: "red" }
      ],
      content: "Comprehensive research notes covering multiple aspects of the study."
    },
    {
      id: "sample-14",
      name: "Final Analysis.pdf",
      type: "pdf" as FileType,
      size: 892000,
      createdAt: new Date("2024-02-20"),
      modifiedAt: new Date("2024-03-15"),
      path: ["Data Collection"],
      tags: [
        { id: "tag4", name: "Results", color: "orange" },
        { id: "tag5", name: "Discussion", color: "yellow" },
        { id: "tag6", name: "Important", color: "red" }
      ],
      content: "Complete analysis and discussion of research findings."
    }
  ];
  
  // Get existing files
  const filesJson = localStorage.getItem("files");
  let files = filesJson ? JSON.parse(filesJson) : [];
  
  // Only add sample files if there are fewer than 10 files
  // This prevents adding duplicate samples on every load
  if (files.length < 10) {
    // Clear any existing files to ensure a clean start
    localStorage.setItem("files", JSON.stringify([]));
    
    // Add sample files to storage
    sampleFiles.forEach(file => saveFile(file));
  }
};
