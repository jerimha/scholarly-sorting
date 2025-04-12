
import { sampleTags } from "@/lib/data";
import { cn } from "@/lib/utils";
import { AlignJustify, BookOpen, ChevronDown, Clock, FileText, FolderOpen, Home, Search, Settings, Star, Tag, X } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import LogoutButton from "./LogoutButton";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [tagsExpanded, setTagsExpanded] = useState(true);
  const navigate = useNavigate();
  
  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };
  
  return (
    <div className={cn(
      "bg-muted border-r transition-all duration-300 h-full flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      <div className="flex items-center justify-between px-4 h-16 border-b">
        {!collapsed && (
          <h2 className="font-semibold text-lg">TheSpect</h2>
        )}
        <Button variant="ghost" size="icon" onClick={toggleSidebar}>
          {collapsed ? <AlignJustify size={20} /> : <X size={20} />}
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-2">
          <SidebarItem 
            icon={<Home size={20} />}
            label="All Files"
            active={activeTab === "all"}
            collapsed={collapsed}
            onClick={() => onTabChange("all")}
          />
          
          <SidebarItem 
            icon={<Clock size={20} />}
            label="Recent"
            active={activeTab === "recent"}
            collapsed={collapsed}
            onClick={() => onTabChange("recent")}
          />
          
          <SidebarItem 
            icon={<Star size={20} />}
            label="Starred"
            active={activeTab === "starred"}
            collapsed={collapsed}
            onClick={() => onTabChange("starred")}
          />
          
          <SidebarItem 
            icon={<Search size={20} />}
            label="Search"
            active={activeTab === "search"}
            collapsed={collapsed}
            onClick={() => onTabChange("search")}
          />
          
          <SidebarItem 
            icon={<BookOpen size={20} />}
            label="Research Papers"
            active={activeTab === "research"}
            collapsed={collapsed}
            onClick={() => navigate("/research")}
          />
          
          <div className="py-2">
            <div
              className={cn(
                "flex items-center py-2 px-3 rounded-md hover:bg-accent cursor-pointer",
                collapsed ? "justify-center" : "justify-between"
              )}
              onClick={() => !collapsed && setTagsExpanded(!tagsExpanded)}
            >
              <div className="flex items-center">
                <Tag size={20} className="mr-2" />
                {!collapsed && <span>Tags</span>}
              </div>
              {!collapsed && (
                <ChevronDown size={16} className={`transition-transform ${tagsExpanded ? "rotate-180" : ""}`} />
              )}
            </div>
            
            {!collapsed && tagsExpanded && (
              <div className="ml-8 mt-1 space-y-1">
                {sampleTags.map(tag => (
                  <div
                    key={tag.id}
                    className={cn(
                      "flex items-center py-1.5 px-3 rounded-md cursor-pointer text-sm",
                      activeTab === `tag-${tag.id}` ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                    )}
                    onClick={() => onTabChange(`tag-${tag.id}`)}
                  >
                    <div className={cn(
                      "w-2 h-2 rounded-full mr-2",
                      tag.color === "blue" ? "bg-blue-500" :
                      tag.color === "green" ? "bg-green-500" :
                      tag.color === "purple" ? "bg-purple-500" :
                      tag.color === "orange" ? "bg-orange-500" :
                      tag.color === "yellow" ? "bg-yellow-500" :
                      tag.color === "red" ? "bg-red-500" : ""
                    )} />
                    <span>{tag.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </nav>
      </div>
      
      <div className="p-4 border-t">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <Button variant="ghost" size="sm" className="w-full flex justify-start" onClick={() => onTabChange("settings")}>
              <Settings size={18} className="mr-2" />
              Settings
            </Button>
          )}
          
          {collapsed ? (
            <Button variant="ghost" size="icon" onClick={() => onTabChange("settings")}>
              <Settings size={20} />
            </Button>
          ) : (
            <LogoutButton />
          )}
        </div>
      </div>
    </div>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}

const SidebarItem = ({ icon, label, active, collapsed, onClick }: SidebarItemProps) => {
  return (
    <div
      className={cn(
        "flex items-center py-2 px-3 rounded-md cursor-pointer",
        active ? "bg-accent text-accent-foreground" : "hover:bg-accent/50",
        collapsed && "justify-center"
      )}
      onClick={onClick}
    >
      <span className={collapsed ? "" : "mr-2"}>{icon}</span>
      {!collapsed && <span>{label}</span>}
    </div>
  );
};

export default Sidebar;
