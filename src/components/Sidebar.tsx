
import { sampleTags } from "@/lib/data";
import { cn } from "@/lib/utils";
import { File, Filter, Folder, Search, Star, Tag } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={cn(
      "h-screen bg-sidebar border-r border-sidebar-border flex flex-col",
      expanded ? "w-60" : "w-16"
    )}>
      <div className="p-4 flex items-center justify-between border-b border-sidebar-border">
        <h1 className={cn("font-semibold text-sidebar-foreground", 
          expanded ? "text-xl" : "hidden"
        )}>
          TheSpect
        </h1>
        <button 
          onClick={() => setExpanded(!expanded)}
          className="text-sidebar-foreground hover:bg-sidebar-accent rounded p-1.5"
        >
          {expanded ? "←" : "→"}
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto p-2">
        <ul className="space-y-1">
          {[
            { id: "all", name: "All Files", icon: <File size={18} /> },
            { id: "recent", name: "Recent", icon: <Filter size={18} /> },
            { id: "starred", name: "Starred", icon: <Star size={18} /> }
          ].map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center px-3 py-2 rounded text-sm",
                  activeTab === item.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <span className="mr-2">{item.icon}</span>
                {expanded && <span>{item.name}</span>}
              </button>
            </li>
          ))}
        </ul>
        
        {expanded && (
          <div className="mt-6">
            <h3 className="px-3 text-xs font-medium text-sidebar-foreground opacity-60 uppercase tracking-wider">
              Tags
            </h3>
            <ul className="mt-2 space-y-1">
              {sampleTags.map((tag) => (
                <li key={tag.id}>
                  <button
                    onClick={() => onTabChange(`tag-${tag.id}`)}
                    className={cn(
                      "w-full flex items-center px-3 py-2 rounded text-sm",
                      activeTab === `tag-${tag.id}`
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Tag size={16} className="mr-2" />
                    <span>{tag.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
      
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={() => onTabChange("search")}
          className={cn(
            "w-full flex items-center px-3 py-2 rounded text-sm",
            activeTab === "search"
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          )}
        >
          <Search size={18} className="mr-2" />
          {expanded && <span>Search</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
