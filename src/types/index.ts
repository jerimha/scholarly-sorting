
export type FileType = 'pdf' | 'docx' | 'txt' | 'image' | 'pptx' | 'xlsx' | 'folder' | 'other';

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface File {
  id: string;
  name: string;
  type: FileType;
  size?: number;
  createdAt: Date;
  modifiedAt: Date;
  tags: Tag[];
  path: string[];
  content?: string;
  notes?: string;
  starred?: boolean;
  deletedAt?: Date; // Added for trash functionality
  publicationYear?: number; // Added for research document year filtering
  authors?: string[]; // Added for research document authors
  abstract?: string; // Added for research paper abstract
  downloadable?: boolean; // Added to control if file can be downloaded
}

export interface Folder {
  id: string;
  name: string;
  files: File[];
  subFolders: Folder[];
  path: string[];
  createdAt: Date;
  modifiedAt: Date;
}
