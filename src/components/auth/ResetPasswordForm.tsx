
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Save, RefreshCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

const ResetPasswordForm = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (password.length < 8) {
        toast.error("Password too short", {
          description: "Your password must be at least 8 characters long."
        });
        setIsLoading(false);
        return;
      }
      
      if (password !== confirmPassword) {
        toast.error("Passwords don't match", {
          description: "Please make sure both passwords match."
        });
        setIsLoading(false);
        return;
      }
      
      console.log("Attempting to update password");
      
      // Direct update through supabase
      const { data, error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        console.error("Password update error from Supabase:", error);
        toast.error("Failed to update password", {
          description: error.message || "Please try again or request a new reset link."
        });
        setIsLoading(false);
        return;
      }
      
      console.log("Password updated successfully:", data ? "User data updated" : "No data returned");
      
      // Success!
      toast.success("Password updated successfully", {
        description: "You can now log in with your new password."
      });
      
      // Clean up
      localStorage.removeItem('passwordResetEmail');
      localStorage.removeItem('passwordResetRequestedAt');
      localStorage.removeItem('resetPasswordError');
      
      // Redirect to login after success
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error) {
      console.error("Password update error:", error);
      toast.error("Password update failed", {
        description: "Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          New Password
        </label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="w-full pr-10"
            placeholder="Enter new password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Password must be at least 8 characters long
        </p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Password
        </label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="w-full pr-10"
            placeholder="Confirm new password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-palm-purple hover:bg-palm-purple/90"
      >
        {isLoading ? (
          <span className="flex items-center">
            <RefreshCcw size={18} className="mr-2 animate-spin" />
            Updating...
          </span>
        ) : (
          <>
            <Save size={18} className="mr-2" />
            <span>Update Password</span>
          </>
        )}
      </Button>
    </form>
  );
};

export default ResetPasswordForm;
