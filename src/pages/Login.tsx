
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AuthForm from "@/components/AuthForm";
import useAuth from "@/hooks/useAuth";

const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Admin Login</h1>
          <p className="text-muted-foreground mt-2">
            Sign in to access and manage files
          </p>
        </div>
        <AuthForm type="login" />
        
        <div className="pt-4 text-center">
          <Link to="/">
            <Button variant="ghost" className="gap-2" size="sm">
              <ArrowLeft size={16} />
              Back to Public Search
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
