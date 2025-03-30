import { File, FileType, Folder, Tag } from "@/types";
import { sampleTags, sampleFiles, sampleFolders } from "./data";

// LocalStorage keys
const FILES_STORAGE_KEY = "thespect_files";
const FOLDERS_STORAGE_KEY = "thespect_folders";
const TAGS_STORAGE_KEY = "thespect_tags";

// Initialize storage with sample data if empty
export const initializeStorage = () => {
  if (!localStorage.getItem(FILES_STORAGE_KEY)) {
    localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(sampleFiles));
  }
  
  if (!localStorage.getItem(FOLDERS_STORAGE_KEY)) {
    localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(sampleFolders));
  }
  
  if (!localStorage.getItem(TAGS_STORAGE_KEY)) {
    localStorage.setItem(TAGS_STORAGE_KEY, JSON.stringify(sampleTags));
  }
};

// Get all files from storage
export const getFiles = (): File[] => {
  const filesJson = localStorage.getItem(FILES_STORAGE_KEY);
  if (!filesJson) return [];
  
  try {
    const files = JSON.parse(filesJson);
    // Convert string dates back to Date objects
    return files.map((file: any) => ({
      ...file,
      createdAt: new Date(file.createdAt),
      modifiedAt: new Date(file.modifiedAt)
    }));
  } catch (error) {
    console.error("Error parsing files from storage:", error);
    return [];
  }
};

// Get all folders from storage
export const getFolders = (): Folder[] => {
  const foldersJson = localStorage.getItem(FOLDERS_STORAGE_KEY);
  if (!foldersJson) return [];
  
  try {
    const folders = JSON.parse(foldersJson);
    // Process folders recursively to fix dates
    return processFolders(folders);
  } catch (error) {
    console.error("Error parsing folders from storage:", error);
    return [];
  }
};

// Process folders to convert string dates to Date objects
const processFolders = (folders: any[]): Folder[] => {
  return folders.map(folder => ({
    ...folder,
    createdAt: new Date(folder.createdAt),
    modifiedAt: new Date(folder.modifiedAt),
    files: folder.files.map((file: any) => ({
      ...file,
      createdAt: new Date(file.createdAt),
      modifiedAt: new Date(file.modifiedAt)
    })),
    subFolders: processFolders(folder.subFolders)
  }));
};

// Get all tags from storage
export const getTags = (): Tag[] => {
  const tagsJson = localStorage.getItem(TAGS_STORAGE_KEY);
  if (!tagsJson) return sampleTags;
  
  try {
    return JSON.parse(tagsJson);
  } catch (error) {
    console.error("Error parsing tags from storage:", error);
    return sampleTags;
  }
};

// Save a new file
export const saveFile = (file: File): File => {
  const files = getFiles();
  const newFile = {
    ...file,
    id: `file${Date.now()}` // Generate unique ID
  };
  
  files.push(newFile);
  localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
  
  // Update folder structure if file has a path
  if (file.path.length > 0) {
    addFileToFolder(newFile);
  }
  
  return newFile;
};

// Add file to appropriate folder
const addFileToFolder = (file: File) => {
  const folders = getFolders();
  let updated = false;
  
  const updateFolderRecursive = (folderList: Folder[], pathIndex = 0): Folder[] => {
    return folderList.map(folder => {
      if (folder.path.join('/') === file.path.slice(0, pathIndex + 1).join('/')) {
        if (pathIndex === file.path.length - 1) {
          // This is the target folder, add the file
          updated = true;
          return {
            ...folder,
            files: [...folder.files, file],
            modifiedAt: new Date()
          };
        } else {
          // Continue searching in subfolders
          return {
            ...folder,
            subFolders: updateFolderRecursive(folder.subFolders, pathIndex + 1),
            modifiedAt: folder.modifiedAt
          };
        }
      }
      return folder;
    });
  };
  
  const updatedFolders = updateFolderRecursive(folders);
  localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(updatedFolders));
  
  // If folder doesn't exist yet, create the structure
  if (!updated && file.path.length > 0) {
    createFolderPath(file.path, file);
  }
};

// Create new folders if they don't exist
const createFolderPath = (path: string[], file?: File) => {
  const folders = getFolders();
  
  // Create folder hierarchy
  let currentFolders = folders;
  let currentPath: string[] = [];
  
  for (let i = 0; i < path.length; i++) {
    currentPath.push(path[i]);
    const folderName = path[i];
    
    // Check if folder exists at this level
    let folder = currentFolders.find(f => f.name === folderName);
    
    if (!folder) {
      // Create new folder
      const newFolder: Folder = {
        id: `folder${Date.now()}-${i}`,
        name: folderName,
        files: i === path.length - 1 && file ? [file] : [],
        subFolders: [],
        path: [...currentPath],
        createdAt: new Date(),
        modifiedAt: new Date()
      };
      
      if (i === 0) {
        // Root level folder
        folders.push(newFolder);
      } else {
        // Add to parent folder
        const parentFolder = findFolderByPath(folders, currentPath.slice(0, -1));
        if (parentFolder) {
          parentFolder.subFolders.push(newFolder);
          parentFolder.modifiedAt = new Date();
        }
      }
    } else if (i === path.length - 1 && file) {
      // Add file to existing leaf folder
      folder.files.push(file);
      folder.modifiedAt = new Date();
    }
  }
  
  localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
};

// Find a folder by path
const findFolderByPath = (folders: Folder[], path: string[]): Folder | null => {
  if (path.length === 0) return null;
  
  for (const folder of folders) {
    if (folder.name === path[0]) {
      if (path.length === 1) return folder;
      return findFolderByPath(folder.subFolders, path.slice(1));
    }
  }
  
  return null;
};

// Root files (not in any folder)
export const getRootFiles = (): File[] => {
  return getFiles().filter(file => file.path.length === 0);
};

// Root folders
export const getRootFolders = (): Folder[] => {
  return getFolders();
};

// Search files
export const searchFiles = (query: string): File[] => {
  const lowerQuery = query.toLowerCase();
  return getFiles().filter(file => 
    file.name.toLowerCase().includes(lowerQuery) || 
    file.tags.some(tag => tag.name.toLowerCase().includes(lowerQuery)) ||
    (file.notes && file.notes.toLowerCase().includes(lowerQuery))
  );
};

// Filter files by tag
export const filterFilesByTag = (tagId: string): File[] => {
  return getFiles().filter(file => 
    file.tags.some(tag => tag.id === tagId)
  );
};

// Update file data
export const updateFile = (fileId: string, updates: Partial<File>): File | null => {
  const files = getFiles();
  const fileIndex = files.findIndex(f => f.id === fileId);
  
  if (fileIndex === -1) return null;
  
  const updatedFile = { ...files[fileIndex], ...updates, modifiedAt: new Date() };
  files[fileIndex] = updatedFile;
  
  localStorage.setItem(FILES_STORAGE_KEY, JSON.stringify(files));
  updateFileInFolders(updatedFile);
  
  return updatedFile;
};

// Update file in folder structure
const updateFileInFolders = (updatedFile: File) => {
  const folders = getFolders();
  
  const updateFolderFilesRecursive = (folderList: Folder[]): Folder[] => {
    return folderList.map(folder => {
      // Update files in this folder
      const fileIndex = folder.files.findIndex(f => f.id === updatedFile.id);
      if (fileIndex !== -1) {
        folder.files[fileIndex] = updatedFile;
      }
      
      // Update files in subfolders
      return {
        ...folder,
        files: [...folder.files],
        subFolders: updateFolderFilesRecursive(folder.subFolders)
      };
    });
  };
  
  const updatedFolders = updateFolderFilesRecursive(folders);
  localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(updatedFolders));
};
