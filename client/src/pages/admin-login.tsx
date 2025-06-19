import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function AdminLogin() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const { login, isLoginPending, loginError } = useAuth();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(credentials, {
      onError: (error: any) => {
        toast({
          title: "Login Failed",
          description: error?.message || "Invalid credentials",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 texture-overlay">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="font-baron text-4xl tracking-wider mb-4">ADMIN ACCESS</h1>
          <div className="w-16 h-1 bg-sollo-red mx-auto"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="w-full p-4 border border-gray-200 focus:border-sollo-red focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full p-4 border border-gray-200 focus:border-sollo-red focus:outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoginPending}
            className="w-full bg-sollo-red text-white py-4 font-medium hover:bg-sollo-red/90 transition-colors disabled:opacity-50"
          >
            {isLoginPending ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            This is the admin area for managing your portfolio content.
          </p>
        </div>
      </div>
    </div>
  );
}