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

export const getAllResearchPapers = (): File[] => {
  try {
    const filesJson = localStorage.getItem("files");
    let files = filesJson ? JSON.parse(filesJson) : [];
    
    // Filter research papers
    files = files.filter((file: any) => file.isResearchPaper);
    
    // Convert date strings back to Date objects
    return files.map((file: any) => ({
      ...file,
      createdAt: new Date(file.createdAt),
      modifiedAt: new Date(file.modifiedAt)
    }));
  } catch (error) {
    console.error("Error getting research papers:", error);
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
  // Original sample files
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
  
  // Research Papers (one per year from 2000-2020)
  const researchPapers = [
    {
      id: "research-2000",
      name: "The Evolution of Computer Networks: A 21st Century Perspective.pdf",
      type: "pdf" as FileType,
      size: 4250000,
      createdAt: new Date("2000-05-15"),
      modifiedAt: new Date("2000-05-15"),
      path: ["IT Research"],
      tags: [
        { id: "tag-networks", name: "Networks", color: "blue" },
        { id: "tag-infrastructure", name: "Infrastructure", color: "green" }
      ],
      content: "Sample PDF content for network evolution research paper.",
      authors: "Michael T. Johnson, Sarah Chen",
      abstract: "This paper examines the fundamental changes in computer networking architecture at the dawn of the 21st century. The research tracks the evolution from basic LAN structures to emerging WAN technologies, predicting future developments in network infrastructure and protocols.",
      publicationYear: "2000",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2001",
      name: "Security Protocols in Distributed Systems.pdf",
      type: "pdf" as FileType,
      size: 3780000,
      createdAt: new Date("2001-03-22"),
      modifiedAt: new Date("2001-03-22"),
      path: ["IT Research"],
      tags: [
        { id: "tag-security", name: "Security", color: "red" },
        { id: "tag-distributed", name: "Distributed Systems", color: "purple" }
      ],
      content: "Sample PDF content for security protocols research paper.",
      authors: "David R. Williams, Anna Rodriguez",
      abstract: "This research evaluates early 21st century approaches to security in distributed computing environments. The paper analyzes encryption methods, authentication protocols, and emerging threats in networked systems, proposing a framework for robust security implementations.",
      publicationYear: "2001",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2002",
      name: "XML-Based Data Exchange Standards in Enterprise Systems.pdf",
      type: "pdf" as FileType,
      size: 2950000,
      createdAt: new Date("2002-07-10"),
      modifiedAt: new Date("2002-07-10"),
      path: ["IT Research"],
      tags: [
        { id: "tag-xml", name: "XML", color: "yellow" },
        { id: "tag-enterprise", name: "Enterprise Systems", color: "blue" }
      ],
      content: "Sample PDF content for XML standards research paper.",
      authors: "Robert Chang, Elizabeth Norton",
      abstract: "This paper investigates the standardization of XML-based data exchange formats in enterprise systems. The research highlights the importance of structured data formats for business process integration and presents case studies of early XML implementation successes.",
      publicationYear: "2002",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2003",
      name: "Web Services Architecture: Principles and Applications.pdf",
      type: "pdf" as FileType,
      size: 4120000,
      createdAt: new Date("2003-09-05"),
      modifiedAt: new Date("2003-09-05"),
      path: ["IT Research"],
      tags: [
        { id: "tag-webservices", name: "Web Services", color: "green" },
        { id: "tag-soa", name: "SOA", color: "purple" }
      ],
      content: "Sample PDF content for web services architecture research paper.",
      authors: "Thomas Lee, Jennifer Hoffman",
      abstract: "This research examines the emergence of web services as a paradigm for distributed application development. The paper outlines architectural principles, implementation patterns, and early adoption challenges in service-oriented architectures.",
      publicationYear: "2003",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2004",
      name: "Mobile Computing: Challenges in Enterprise Integration.pdf",
      type: "pdf" as FileType,
      size: 3560000,
      createdAt: new Date("2004-04-18"),
      modifiedAt: new Date("2004-04-18"),
      path: ["IT Research"],
      tags: [
        { id: "tag-mobile", name: "Mobile Computing", color: "orange" },
        { id: "tag-enterprise", name: "Enterprise Systems", color: "blue" }
      ],
      content: "Sample PDF content for mobile computing research paper.",
      authors: "Catherine Martinez, Paul Thompson",
      abstract: "This paper investigates the technical and organizational challenges of integrating mobile computing solutions within enterprise IT environments. The research addresses synchronization issues, security concerns, and platform fragmentation in early smartphone adoption scenarios.",
      publicationYear: "2004",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2005",
      name: "Open Source Development Models in Enterprise Software.pdf",
      type: "pdf" as FileType,
      size: 3980000,
      createdAt: new Date("2005-11-30"),
      modifiedAt: new Date("2005-11-30"),
      path: ["IT Research"],
      tags: [
        { id: "tag-opensource", name: "Open Source", color: "red" },
        { id: "tag-enterprise", name: "Enterprise Software", color: "blue" }
      ],
      content: "Sample PDF content for open source research paper.",
      authors: "James Wilson, Samantha Kumar",
      abstract: "This research examines how open source development methodologies are being adapted for enterprise software projects. The paper presents case studies of large organizations implementing open source practices while maintaining corporate governance requirements.",
      publicationYear: "2005",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2006",
      name: "Virtualization Technologies: Performance Analysis and Use Cases.pdf",
      type: "pdf" as FileType,
      size: 4890000,
      createdAt: new Date("2006-08-12"),
      modifiedAt: new Date("2006-08-12"),
      path: ["IT Research"],
      tags: [
        { id: "tag-virtualization", name: "Virtualization", color: "green" },
        { id: "tag-infrastructure", name: "Infrastructure", color: "purple" }
      ],
      content: "Sample PDF content for virtualization technologies research paper.",
      authors: "Daniel Brown, Lisa Zhang",
      abstract: "This paper evaluates the performance implications of early server virtualization technologies. The research compares different virtualization approaches, measures overhead costs, and identifies optimal usage patterns for enterprise deployments.",
      publicationYear: "2006",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2007",
      name: "Service-Oriented Architecture in Financial Systems.pdf",
      type: "pdf" as FileType,
      size: 3240000,
      createdAt: new Date("2007-02-27"),
      modifiedAt: new Date("2007-02-27"),
      path: ["IT Research"],
      tags: [
        { id: "tag-soa", name: "SOA", color: "yellow" },
        { id: "tag-finance", name: "Financial Systems", color: "blue" }
      ],
      content: "Sample PDF content for SOA in finance research paper.",
      authors: "Laura Garcia, Mark Stevenson",
      abstract: "This research investigates how service-oriented architecture principles are being applied to financial information systems. The paper examines integration challenges, compliance requirements, and performance considerations unique to banking and financial services implementations.",
      publicationYear: "2007",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2008",
      name: "Cloud Computing Models for Enterprise Applications.pdf",
      type: "pdf" as FileType,
      size: 4560000,
      createdAt: new Date("2008-10-15"),
      modifiedAt: new Date("2008-10-15"),
      path: ["IT Research"],
      tags: [
        { id: "tag-cloud", name: "Cloud Computing", color: "blue" },
        { id: "tag-enterprise", name: "Enterprise Applications", color: "green" }
      ],
      content: "Sample PDF content for cloud computing research paper.",
      authors: "Richard Taylor, Emily Washington",
      abstract: "This paper examines early cloud computing service models and their applicability to enterprise application scenarios. The research evaluates SaaS, PaaS, and IaaS approaches, identifying technical and organizational factors influencing successful adoption.",
      publicationYear: "2008",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2009",
      name: "NoSQL Database Systems: Architecture and Performance.pdf",
      type: "pdf" as FileType,
      size: 3670000,
      createdAt: new Date("2009-06-23"),
      modifiedAt: new Date("2009-06-23"),
      path: ["IT Research"],
      tags: [
        { id: "tag-nosql", name: "NoSQL", color: "purple" },
        { id: "tag-database", name: "Databases", color: "orange" }
      ],
      content: "Sample PDF content for NoSQL database research paper.",
      authors: "Kevin Anderson, Michelle Park",
      abstract: "This research analyzes the architectural features of emerging NoSQL database systems. The paper compares different approaches to non-relational data storage, evaluates performance characteristics, and identifies appropriate use cases for document, column, and graph databases.",
      publicationYear: "2009",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2010",
      name: "Mobile Application Development Frameworks: Analysis and Comparison.pdf",
      type: "pdf" as FileType,
      size: 3890000,
      createdAt: new Date("2010-05-08"),
      modifiedAt: new Date("2010-05-08"),
      path: ["IT Research"],
      tags: [
        { id: "tag-mobile", name: "Mobile Development", color: "red" },
        { id: "tag-frameworks", name: "Frameworks", color: "yellow" }
      ],
      content: "Sample PDF content for mobile frameworks research paper.",
      authors: "Steven Harris, Natalie Chen",
      abstract: "This paper evaluates development frameworks for mobile application creation as smartphones gain mainstream adoption. The research compares native, web-based, and hybrid approaches, measuring performance, feature accessibility, and developer productivity across platforms.",
      publicationYear: "2010",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2011",
      name: "Big Data Processing Techniques: MapReduce and Alternatives.pdf",
      type: "pdf" as FileType,
      size: 4750000,
      createdAt: new Date("2011-09-12"),
      modifiedAt: new Date("2011-09-12"),
      path: ["IT Research"],
      tags: [
        { id: "tag-bigdata", name: "Big Data", color: "blue" },
        { id: "tag-mapreduce", name: "MapReduce", color: "green" }
      ],
      content: "Sample PDF content for big data processing research paper.",
      authors: "Jonathan Miller, Amanda Wong",
      abstract: "This research examines distributed processing frameworks for large-scale data analysis. The paper evaluates MapReduce implementations, emerging stream processing alternatives, and specialized graph processing frameworks for handling petabyte-scale datasets.",
      publicationYear: "2011",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2012",
      name: "DevOps Practices: Integration of Development and Operations.pdf",
      type: "pdf" as FileType,
      size: 3450000,
      createdAt: new Date("2012-03-25"),
      modifiedAt: new Date("2012-03-25"),
      path: ["IT Research"],
      tags: [
        { id: "tag-devops", name: "DevOps", color: "purple" },
        { id: "tag-cicd", name: "CI/CD", color: "orange" }
      ],
      content: "Sample PDF content for DevOps practices research paper.",
      authors: "Brian Thompson, Rebecca Liu",
      abstract: "This paper investigates the emerging DevOps methodology for software delivery. The research examines how continuous integration, automated testing, and infrastructure-as-code practices can reduce deployment cycles while maintaining system reliability and security.",
      publicationYear: "2012",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2013",
      name: "Software-Defined Networking: Architecture and Applications.pdf",
      type: "pdf" as FileType,
      size: 4230000,
      createdAt: new Date("2013-07-17"),
      modifiedAt: new Date("2013-07-17"),
      path: ["IT Research"],
      tags: [
        { id: "tag-sdn", name: "SDN", color: "yellow" },
        { id: "tag-networks", name: "Networks", color: "blue" }
      ],
      content: "Sample PDF content for SDN research paper.",
      authors: "Michael Roberts, Julia Kim",
      abstract: "This research examines software-defined networking architectures and their impact on network management. The paper analyzes control plane separation, programmability advantages, and implementation challenges in enterprise and data center environments.",
      publicationYear: "2013",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2014",
      name: "Internet of Things: Protocols and Security Considerations.pdf",
      type: "pdf" as FileType,
      size: 3980000,
      createdAt: new Date("2014-11-03"),
      modifiedAt: new Date("2014-11-03"),
      path: ["IT Research"],
      tags: [
        { id: "tag-iot", name: "IoT", color: "green" },
        { id: "tag-security", name: "Security", color: "red" }
      ],
      content: "Sample PDF content for IoT research paper.",
      authors: "Christopher Davis, Sophia Martinez",
      abstract: "This paper evaluates communication protocols and security challenges in Internet of Things deployments. The research compares lightweight networking protocols, analyzes attack vectors specific to constrained devices, and proposes security frameworks for IoT ecosystems.",
      publicationYear: "2014",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2015",
      name: "Container Orchestration Systems: Analysis and Performance.pdf",
      type: "pdf" as FileType,
      size: 4120000,
      createdAt: new Date("2015-08-21"),
      modifiedAt: new Date("2015-08-21"),
      path: ["IT Research"],
      tags: [
        { id: "tag-containers", name: "Containers", color: "blue" },
        { id: "tag-orchestration", name: "Orchestration", color: "purple" }
      ],
      content: "Sample PDF content for container orchestration research paper.",
      authors: "David Wilson, Jessica Lee",
      abstract: "This research examines container orchestration platforms for microservice deployment and management. The paper compares scheduling algorithms, service discovery mechanisms, and network models across leading container orchestration systems.",
      publicationYear: "2015",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2016",
      name: "Blockchain Technology: Beyond Cryptocurrencies.pdf",
      type: "pdf" as FileType,
      size: 3870000,
      createdAt: new Date("2016-04-09"),
      modifiedAt: new Date("2016-04-09"),
      path: ["IT Research"],
      tags: [
        { id: "tag-blockchain", name: "Blockchain", color: "orange" },
        { id: "tag-distributed", name: "Distributed Systems", color: "yellow" }
      ],
      content: "Sample PDF content for blockchain technology research paper.",
      authors: "Andrew Jackson, Olivia Chen",
      abstract: "This paper investigates applications of blockchain technology beyond cryptocurrency implementations. The research evaluates consensus mechanisms, smart contract platforms, and enterprise blockchain frameworks for supply chain, identity, and record management use cases.",
      publicationYear: "2016",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2017",
      name: "Machine Learning for Network Intrusion Detection.pdf",
      type: "pdf" as FileType,
      size: 4560000,
      createdAt: new Date("2017-09-30"),
      modifiedAt: new Date("2017-09-30"),
      path: ["IT Research"],
      tags: [
        { id: "tag-ml", name: "Machine Learning", color: "green" },
        { id: "tag-security", name: "Security", color: "red" }
      ],
      content: "Sample PDF content for machine learning security research paper.",
      authors: "Robert Chen, Elizabeth Parker",
      abstract: "This research examines the application of machine learning techniques to network intrusion detection systems. The paper evaluates supervised and unsupervised approaches for anomaly detection, comparing their effectiveness against signature-based methods for identifying novel attack patterns.",
      publicationYear: "2017",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2018",
      name: "Serverless Computing: Architecture and Performance Analysis.pdf",
      type: "pdf" as FileType,
      size: 3980000,
      createdAt: new Date("2018-05-14"),
      modifiedAt: new Date("2018-05-14"),
      path: ["IT Research"],
      tags: [
        { id: "tag-serverless", name: "Serverless", color: "blue" },
        { id: "tag-cloud", name: "Cloud Computing", color: "purple" }
      ],
      content: "Sample PDF content for serverless computing research paper.",
      authors: "Thomas Wright, Sophia Johnson",
      abstract: "This paper analyzes serverless computing platforms and their performance characteristics. The research measures cold start latencies, throughput limitations, and cost models across major cloud providers, identifying optimal workloads for function-as-a-service deployments.",
      publicationYear: "2018",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2019",
      name: "Edge Computing for IoT: Architectures and Implementations.pdf",
      type: "pdf" as FileType,
      size: 4230000,
      createdAt: new Date("2019-10-22"),
      modifiedAt: new Date("2019-10-22"),
      path: ["IT Research"],
      tags: [
        { id: "tag-edge", name: "Edge Computing", color: "yellow" },
        { id: "tag-iot", name: "IoT", color: "orange" }
      ],
      content: "Sample PDF content for edge computing research paper.",
      authors: "Jennifer Adams, Michael Chang",
      abstract: "This research explores edge computing architectures for Internet of Things applications. The paper evaluates latency reduction, bandwidth conservation, and privacy advantages of processing data closer to IoT devices while maintaining cloud integration for analytics and storage.",
      publicationYear: "2019",
      isResearchPaper: true,
      isDownloadable: false
    },
    {
      id: "research-2020",
      name: "Quantum Computing Applications in Cryptography.pdf",
      type: "pdf" as FileType,
      size: 4780000,
      createdAt: new Date("2020-07-15"),
      modifiedAt: new Date("2020-07-15"),
      path: ["IT Research"],
      tags: [
        { id: "tag-quantum", name: "Quantum Computing", color: "purple" },
        { id: "tag-cryptography", name: "Cryptography", color: "red" }
      ],
      content: "Sample PDF content for quantum computing research paper.",
      authors: "Daniel Roberts, Sarah Thompson",
      abstract: "This paper investigates the implications of quantum computing advances for modern cryptographic systems. The research evaluates quantum algorithms that threaten current encryption methods and analyzes post-quantum cryptographic approaches designed to withstand quantum attacks.",
      publicationYear: "2020",
      isResearchPaper: true,
      isDownloadable: false
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
    
    // Add research papers
    researchPapers.forEach(paper => saveFile(paper));
  }
};
