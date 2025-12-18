import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const AdminRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [idNo, setIdNo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [profilePhotoUrl, setProfilePhotoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "blockvote"); // replace

    try {
      const res = await fetch("https://api.cloudinary.com/v1_1/yg123/image/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.secure_url) return data.secure_url;
      return null;
    } catch (err) {
      return null;
    }
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }

    if (!profilePhotoUrl) {
      toast({ title: "No Photo Uploaded", variant: "destructive" });
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("https://blockvote.site/api/admin-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          id_no: idNo,
          password,
          profile: profilePhotoUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      toast({
        title: "OTP Sent",
        description: data.message || "Check your email for the OTP.",
      });

      setShowOtpInput(true);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp) {
      toast({ title: "OTP Missing", description: "Please enter the OTP.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("https://blockvote.site/api/verify-register-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      toast({ title: "Registration Successful", description: data.message });
      navigate("/login");
    } catch (error: any) {
      toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
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
            <CardTitle>{showOtpInput ? "Verify OTP" : "Create Admin Account"}</CardTitle>
            <CardDescription>
              {showOtpInput
                ? "Enter the OTP sent to your email."
                : "Register as an election administrator"}
            </CardDescription>
          </CardHeader>

          {!showOtpInput ? (
            <form onSubmit={handleInitialSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="admin@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="idNo">ID Number</Label>
                  <Input id="idNo" placeholder="Enter your ID number" value={idNo} onChange={(e) => setIdNo(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profilePhoto">Profile Photo</Label>
                  <Input
                    id="profilePhoto"
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setFileName(file.name);
                        setIsLoading(true);
                        const uploadedUrl = await uploadToCloudinary(file);
                        if (uploadedUrl) {
                          setProfilePhotoUrl(uploadedUrl);
                          toast({ title: "Upload Successful", description: "Profile photo uploaded to Cloudinary." });
                        } else {
                          toast({ title: "Upload Failed", description: "Could not upload image.", variant: "destructive" });
                        }
                        setIsLoading(false);
                      }
                    }}
                    required
                  />
                  {fileName && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected File: <span className="font-medium">{fileName}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              </CardContent>

              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending OTP..." : "Create account"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account? <a href="/login" className="text-secondary hover:underline">Sign in</a>
                </p>
              </CardFooter>
            </form>
          ) : (
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter OTP</Label>
                <Input id="otp" placeholder="123456" value={otp} onChange={(e) => setOtp(e.target.value)} required />
              </div>
              <CardFooter>
                <Button className="w-full" onClick={handleVerifyOTP} disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify & Complete Registration"}
                </Button>
              </CardFooter>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminRegister;
