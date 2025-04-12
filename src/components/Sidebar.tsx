
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import LogoutButton from "./LogoutButton";
import { sampleTags } from "@/lib/data";
import { File, Clock, Star, Tag, Trash2, BookOpen, FileText } from "lucide-react";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar = ({ activeTab, onTabChange }: SidebarProps) => {
  return (
    <div className="w-64 bg-muted border-r h-full flex flex-col">
      <div className="p-4 border-b">
        <h1 className="text-lg font-bold">TheSpect</h1>
        <p className="text-sm text-muted-foreground">Document Manager</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-3">
          <Button
            variant={activeTab === "all" ? "default" : "ghost"}
            className="w-full justify-start mb-1"
            onClick={() => onTabChange("all")}
          >
            <File className="mr-2 h-4 w-4" />
            All Files
          </Button>
          
          <Link to="/research" className="block mb-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
            >
              <BookOpen className="mr-2 h-4 w-4" />
              IT Research Papers
            </Button>
          </Link>
          
          <Button
            variant={activeTab === "recent" ? "default" : "ghost"}
            className="w-full justify-start mb-1"
            onClick={() => onTabChange("recent")}
          >
            <Clock className="mr-2 h-4 w-4" />
            Recent
          </Button>
          
          <Button
            variant={activeTab === "starred" ? "default" : "ghost"}
            className="w-full justify-start mb-6"
            onClick={() => onTabChange("starred")}
          >
            <Star className="mr-2 h-4 w-4" />
            Starred
          </Button>
          
          <div className="mb-2">
            <h3 className="text-sm font-medium mb-2 px-2">Tags</h3>
            
            {sampleTags.map((tag) => (
              <Button
                key={tag.id}
                variant={activeTab === `tag-${tag.id}` ? "default" : "ghost"}
                className="w-full justify-start mb-1"
                onClick={() => onTabChange(`tag-${tag.id}`)}
              >
                <Tag className={`mr-2 h-4 w-4 ${
                  tag.color === "blue" ? "text-blue-500" :
                  tag.color === "green" ? "text-green-500" :
                  tag.color === "purple" ? "text-purple-500" :
                  tag.color === "orange" ? "text-orange-500" :
                  tag.color === "yellow" ? "text-yellow-500" :
                  tag.color === "red" ? "text-red-500" : ""
                }`} />
                {tag.name}
              </Button>
            ))}
          </div>
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t">
        <Link to="/trash" className="block">
          <Button variant="ghost" className="w-full justify-start mb-2">
            <Trash2 className="mr-2 h-4 w-4" />
            Trash
          </Button>
        </Link>
        <LogoutButton />
      </div>
    </div>
  );
};

export default Sidebar;
