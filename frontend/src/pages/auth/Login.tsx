import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { v4 as uuidv4 } from "uuid";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/components/ui/use-toast";

const Login = () => {
  const [email, setEmail] = useState("");
  const [idNo, setIdNo] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("adminToken");
    const device = localStorage.getItem("deviceId");
    if (token && device) {
      navigate("/admin/dashboard");
    }
  }
  , [navigate]);

  const deviceId = localStorage.getItem("deviceId") || uuidv4();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("https://blockvote.site/api/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "User-Agent": navigator.userAgent,
        },
        body: JSON.stringify({ email, id_no: idNo, password }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Login failed");

      toast({
        title: "OTP Sent",
        description: data.message || "Please enter the OTP sent to your email",
      });

      // Save email temporarily for OTP verification
      setOtpSent(true);
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials or server error.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast({ title: "Please enter the OTP", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("https://blockvote.site/api/verify-login-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "User-Agent": navigator.userAgent,
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "OTP verification failed");

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("deviceId", data.deviceId);
      localStorage.setItem("walletAddress", data.walletAddress);

      toast({
        title: "Login successful",
        description: "Welcome back to the BlockVote Admin Panel.",
      });

      navigate("/admin/dashboard");
    } catch (error: any) {
      toast({
        title: "OTP verification failed",
        description: error.message || "Invalid or expired OTP.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <a href="/" className="inline-block">
            <h2 className="font-bold text-2xl flex items-center justify-center">
              <span className="text-primary">Block</span>
              <span className="text-secondary">Vote</span>
            </h2>
          </a>
        </div>

        <Card className="animate-scale-in">
          <CardHeader>
            <CardTitle>Admin Login</CardTitle>
            <CardDescription>
              {otpSent
                ? "Enter the OTP sent to your email to continue"
                : "Enter your credentials to access the admin dashboard"}
            </CardDescription>
          </CardHeader>

          {!otpSent ? (
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNo">ID Number</Label>
                  <Input
                    id="idNo"
                    placeholder="Enter your ID number"
                    value={idNo}
                    onChange={(e) => setIdNo(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      to="/forgotpassword"
                      className="text-xs text-secondary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending OTP..." : "Login"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    to="/admin/register"
                    className="text-secondary hover:underline"
                  >
                    Sign up
                  </Link>
                </div>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  placeholder="Enter OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
              <Button
                className="w-full"
                onClick={handleVerifyOTP}
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify OTP & Login"}
              </Button>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Login;