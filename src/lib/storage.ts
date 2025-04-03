
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

export const deleteFile = (fileId: string): boolean => {
  try {
    // Get existing files from local storage
    const filesJson = localStorage.getItem("files");
    let files: File[] = filesJson ? JSON.parse(filesJson) : [];
    
    // Filter out the file to delete
    const newFiles = files.filter(f => f.id !== fileId);
    
    // Save back to localStorage
    localStorage.setItem("files", JSON.stringify(newFiles));
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
};

export const getAllFilesFromStorage = (): File[] => {
  try {
    const filesJson = localStorage.getItem("files");
    return filesJson ? JSON.parse(filesJson) : [];
  } catch (error) {
    console.error("Error getting files:", error);
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
