
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TrashButton = () => {
  const navigate = useNavigate();
  
  return (
    <Button 
      onClick={() => navigate("/trash")} 
      variant="outline" 
      className="flex items-center gap-2"
    >
      <Trash2 className="h-4 w-4 text-muted-foreground" />
      Trash
    </Button>
  );
};

export default TrashButton;
