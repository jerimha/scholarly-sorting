
export type FileType = 'pdf' | 'docx' | 'txt' | 'image' | 'folder' | 'other';

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
