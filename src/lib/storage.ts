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
    },
    
    {
      id: "it-research-1",
      name: "Evolution of Cloud Computing Architectures.pdf",
      type: "pdf" as FileType,
      size: 2540000,
      createdAt: new Date("2023-06-12"),
      modifiedAt: new Date("2023-06-12"),
      path: ["IT Research"],
      tags: [
        { id: "tag-cloud", name: "Cloud Computing", color: "blue" },
        { id: "tag-architecture", name: "Architecture", color: "purple" }
      ],
      content: "Comprehensive analysis of cloud computing architectures and their evolution.",
      publicationYear: 2023,
      authors: ["Dr. Sarah Chen", "Dr. Robert Miller"],
      abstract: "This paper examines the evolution of cloud computing architectures from 2000 to 2023, analyzing key technological shifts and emerging paradigms. We review the transition from traditional virtualization to containerization and serverless computing, evaluating performance implications and future directions.",
      downloadable: false
    },
    {
      id: "it-research-2",
      name: "Quantum Computing Applications in Cryptography.pdf",
      type: "pdf" as FileType,
      size: 3150000,
      createdAt: new Date("2022-11-05"),
      modifiedAt: new Date("2022-11-05"),
      path: ["IT Research"],
      tags: [
        { id: "tag-quantum", name: "Quantum Computing", color: "purple" },
        { id: "tag-security", name: "Security", color: "red" }
      ],
      content: "Analysis of quantum computing's impact on modern cryptographic systems.",
      publicationYear: 2022,
      authors: ["Prof. James Wilson", "Dr. Elena Nakamoto"],
      abstract: "This research explores the implications of quantum computing advancements on contemporary cryptographic systems. We assess the vulnerability of widely used encryption algorithms to quantum attacks and propose quantum-resistant alternatives based on lattice-based cryptography and multivariate polynomial systems.",
      downloadable: false
    },
    {
      id: "it-research-3",
      name: "Machine Learning for Network Intrusion Detection.pdf",
      type: "pdf" as FileType,
      size: 2870000,
      createdAt: new Date("2021-08-22"),
      modifiedAt: new Date("2021-08-22"),
      path: ["IT Research"],
      tags: [
        { id: "tag-ml", name: "Machine Learning", color: "green" },
        { id: "tag-security", name: "Security", color: "red" }
      ],
      content: "Evaluation of machine learning techniques for network security.",
      publicationYear: 2021,
      authors: ["Dr. Michael Thompson", "Dr. Lisa Zhang", "Prof. Karen Davis"],
      abstract: "This study evaluates the effectiveness of various machine learning algorithms for network intrusion detection. We compare traditional signature-based methods with supervised and unsupervised learning approaches, testing against contemporary attack vectors and zero-day exploits. Our results demonstrate significant improvements in detection rates while reducing false positives.",
      downloadable: false
    },
    {
      id: "it-research-4",
      name: "Blockchain Technology for Supply Chain Management.pdf",
      type: "pdf" as FileType,
      size: 2450000,
      createdAt: new Date("2020-05-17"),
      modifiedAt: new Date("2020-05-17"),
      path: ["IT Research"],
      tags: [
        { id: "tag-blockchain", name: "Blockchain", color: "orange" },
        { id: "tag-logistics", name: "Logistics", color: "blue" }
      ],
      content: "Implementation strategies for blockchain in supply chain systems.",
      publicationYear: 2020,
      authors: ["Prof. Andrew Kim", "Dr. Rachel Johnson"],
      abstract: "This paper presents a comprehensive framework for implementing blockchain technology in supply chain management systems. We analyze the challenges of existing supply chain information systems and demonstrate how distributed ledger technology addresses issues of transparency, traceability, and trust. Case studies from multiple industries validate our proposed implementation methodology.",
      downloadable: false
    },
    {
      id: "it-research-5",
      name: "Internet of Things Security Challenges.pdf",
      type: "pdf" as FileType,
      size: 2180000,
      createdAt: new Date("2019-03-08"),
      modifiedAt: new Date("2019-03-08"),
      path: ["IT Research"],
      tags: [
        { id: "tag-iot", name: "Internet of Things", color: "green" },
        { id: "tag-security", name: "Security", color: "red" }
      ],
      content: "Analysis of security vulnerabilities in IoT ecosystems.",
      publicationYear: 2019,
      authors: ["Dr. Thomas Rivera", "Prof. Samantha Lee"],
      abstract: "This research identifies and categorizes security vulnerabilities in IoT ecosystems across consumer, industrial, and healthcare domains. We propose a multi-layered security framework addressing device-level, communication-level, and cloud-level vulnerabilities. Our experimental results validate the framework's effectiveness against common attack vectors targeting IoT deployments.",
      downloadable: false
    },
    {
      id: "it-research-6",
      name: "Big Data Analytics in Healthcare.pdf",
      type: "pdf" as FileType,
      size: 3050000,
      createdAt: new Date("2018-09-12"),
      modifiedAt: new Date("2018-09-12"),
      path: ["IT Research"],
      tags: [
        { id: "tag-bigdata", name: "Big Data", color: "blue" },
        { id: "tag-healthcare", name: "Healthcare", color: "green" }
      ],
      content: "Applications of big data analytics in improving healthcare outcomes.",
      publicationYear: 2018,
      authors: ["Dr. Emily Rodriguez", "Prof. David Chan", "Dr. Sarah Park"],
      abstract: "This study explores the applications of big data analytics in healthcare systems, focusing on predictive diagnostics, personalized treatment recommendations, and resource optimization. We demonstrate how machine learning algorithms applied to electronic health records can identify patterns and correlations that improve patient outcomes while reducing costs.",
      downloadable: false
    },
    {
      id: "it-research-7",
      name: "Virtualization Technologies: A Comparative Analysis.pdf",
      type: "pdf" as FileType,
      size: 1980000,
      createdAt: new Date("2015-11-27"),
      modifiedAt: new Date("2015-11-27"),
      path: ["IT Research"],
      tags: [
        { id: "tag-virtualization", name: "Virtualization", color: "purple" },
        { id: "tag-performance", name: "Performance", color: "orange" }
      ],
      content: "Comparison of hypervisor-based and container-based virtualization technologies.",
      publicationYear: 2015,
      authors: ["Prof. Richard Brown", "Dr. Jennifer Martinez"],
      abstract: "This paper provides a comparative analysis of hypervisor-based and container-based virtualization technologies, evaluating them across dimensions of performance, security isolation, resource efficiency, and management complexity. We present benchmark results from extensive testing across various workloads and provide recommendations for enterprise deployment scenarios.",
      downloadable: false
    },
    {
      id: "it-research-8",
      name: "Software Defined Networking: Principles and Applications.pdf",
      type: "pdf" as FileType,
      size: 2340000,
      createdAt: new Date("2013-07-19"),
      modifiedAt: new Date("2013-07-19"),
      path: ["IT Research"],
      tags: [
        { id: "tag-networking", name: "Networking", color: "blue" },
        { id: "tag-sdn", name: "SDN", color: "yellow" }
      ],
      content: "Overview of software defined networking architecture and use cases.",
      publicationYear: 2013,
      authors: ["Dr. William Taylor", "Prof. Grace Wong"],
      abstract: "This research presents the architectural principles of Software Defined Networking (SDN) and examines its transformative impact on network infrastructure. We analyze the separation of control and data planes, centralized network intelligence, and programmable network management. Case studies from data centers, telecommunications, and enterprise networks demonstrate SDN's benefits for agility, security, and operational efficiency.",
      downloadable: false
    },
    {
      id: "it-research-9",
      name: "Cloud Computing Security: Threats and Mitigations.pdf",
      type: "pdf" as FileType,
      size: 2560000,
      createdAt: new Date("2010-04-30"),
      modifiedAt: new Date("2010-04-30"),
      path: ["IT Research"],
      tags: [
        { id: "tag-cloud", name: "Cloud Computing", color: "blue" },
        { id: "tag-security", name: "Security", color: "red" }
      ],
      content: "Analysis of security challenges in cloud computing environments.",
      publicationYear: 2010,
      authors: ["Prof. Daniel Smith", "Dr. Nancy Chen"],
      abstract: "This study identifies and categorizes security threats specific to cloud computing environments, including data breaches, account hijacking, insecure APIs, and shared technology vulnerabilities. We propose a comprehensive security framework for cloud deployments, encompassing identity management, encryption, virtualization security, and compliance monitoring across IaaS, PaaS, and SaaS models.",
      downloadable: false
    },
    {
      id: "it-research-10",
      name: "Mobile Computing: Challenges and Opportunities.pdf",
      type: "pdf" as FileType,
      size: 1870000,
      createdAt: new Date("2008-10-15"),
      modifiedAt: new Date("2008-10-15"),
      path: ["IT Research"],
      tags: [
        { id: "tag-mobile", name: "Mobile Computing", color: "green" },
        { id: "tag-wireless", name: "Wireless", color: "yellow" }
      ],
      content: "Review of mobile computing technologies and future directions.",
      publicationYear: 2008,
      authors: ["Dr. Robert Johnson", "Prof. Maria Garcia"],
      abstract: "This paper examines the evolution of mobile computing technologies and their impact on business processes and consumer behaviors. We analyze challenges related to power consumption, connectivity, security, and user experience in mobile environments. The research also identifies emerging opportunities in location-based services, augmented reality, and wearable computing.",
      downloadable: false
    },
    {
      id: "it-research-11",
      name: "Web Services Architecture and Standards.pdf",
      type: "pdf" as FileType,
      size: 1680000,
      createdAt: new Date("2005-06-22"),
      modifiedAt: new Date("2005-06-22"),
      path: ["IT Research"],
      tags: [
        { id: "tag-webservices", name: "Web Services", color: "blue" },
        { id: "tag-soa", name: "SOA", color: "purple" }
      ],
      content: "Overview of web services technologies and implementation standards.",
      publicationYear: 2005,
      authors: ["Prof. Christopher Wilson", "Dr. Elizabeth Taylor"],
      abstract: "This research provides a comprehensive analysis of web services architectures and standards, including SOAP, REST, WSDL, and UDDI. We compare document-centric and RPC-style web services, evaluating their suitability for various integration scenarios. The paper also addresses interoperability challenges and best practices for enterprise service-oriented architecture implementations.",
      downloadable: false
    },
    {
      id: "it-research-12",
      name: "Network Security: Intrusion Detection Systems.pdf",
      type: "pdf" as FileType,
      size: 1920000,
      createdAt: new Date("2003-03-18"),
      modifiedAt: new Date("2003-03-18"),
      path: ["IT Research"],
      tags: [
        { id: "tag-security", name: "Security", color: "red" },
        { id: "tag-networking", name: "Networking", color: "blue" }
      ],
      content: "Evaluation of intrusion detection technologies for enterprise networks.",
      publicationYear: 2003,
      authors: ["Dr. Michael Adams", "Prof. Susan Roberts"],
      abstract: "This study evaluates different approaches to network intrusion detection, including signature-based, anomaly-based, and hybrid systems. We analyze the effectiveness of these approaches against various attack vectors such as DoS attacks, buffer overflows, port scans, and malware. The research includes a framework for IDS deployment and tuning to minimize false positives while maximizing detection capabilities.",
      downloadable: false
    },
    {
      id: "it-research-13",
      name: "Database Systems: OLAP and Data Mining Applications.pdf",
      type: "pdf" as FileType,
      size: 2150000,
      createdAt: new Date("2000-09-28"),
      modifiedAt: new Date("2000-09-28"),
      path: ["IT Research"],
      tags: [
        { id: "tag-database", name: "Database", color: "orange" },
        { id: "tag-datamining", name: "Data Mining", color: "green" }
      ],
      content: "Analysis of online analytical processing and data mining techniques.",
      publicationYear: 2000,
      authors: ["Prof. Jonathan Turner", "Dr. Patricia White"],
      abstract: "This research examines the integration of Online Analytical Processing (OLAP) with data mining techniques to enhance business intelligence capabilities. We analyze multidimensional data modeling, ETL processes, and various data mining algorithms including clustering, association rule mining, and predictive analytics. Case studies demonstrate how these technologies enable enhanced decision support across multiple industries.",
      downloadable: false
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

/**
 * Remove the content of all files in localStorage.
 */
export const removeAllFileContents = (): void => {
  try {
    const filesJson = localStorage.getItem("files");
    let files: File[] = filesJson ? JSON.parse(filesJson) : [];
    // Remove 'content' from all files
    files = files.map((file) => ({
      ...file,
      content: undefined,
    }));
    localStorage.setItem("files", JSON.stringify(files));
    console.log("All file contents removed.");
  } catch (error) {
    console.error("Error removing file contents:", error);
  }
};

export const removeAllResearchFiles = (): void => {
  try {
    const filesJson = localStorage.getItem("files");
    let files: File[] = filesJson ? JSON.parse(filesJson) : [];

    // Remove files if:
    // - Their 'path' includes "IT Research"
    // - OR their tags include 'Research'
    files = files.filter(file => {
      // Check if file is in IT Research folder
      const inITResearch = file.path && file.path.includes("IT Research");
      // Check if file is tagged with "Research"
      const hasResearchTag = file.tags && file.tags.some(tag => tag.name === "Research");
      return !(inITResearch || hasResearchTag);
    });

    localStorage.setItem("files", JSON.stringify(files));
    console.log("All research files removed.");
  } catch (error) {
    console.error("Error removing research files:", error);
  }
};
