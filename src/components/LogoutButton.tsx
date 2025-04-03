
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { toast } from "sonner";

const LogoutButton = () => {
  const { logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };
  
  return (
    <Button 
      variant="ghost" 
      onClick={handleLogout}
      className="flex items-center gap-2"
    >
      <LogOut size={16} />
      <span className="hidden md:inline">Logout</span>
    </Button>
  );
};

export default LogoutButton;
