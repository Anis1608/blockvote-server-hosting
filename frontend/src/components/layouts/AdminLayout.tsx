import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "../admin/AdminSidebar";
import { ThemeToggle } from "../theme-toggle";
import { Bell, Menu, User } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import axios from "axios";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Sheet, SheetContent, SheetOverlay } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AdminLayout = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeviceDialogOpen, setIsDeviceDialogOpen] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [devices, setDevices] = useState([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [logoutDeviceId, setLogoutDeviceId] = useState(null);
  const [otp, setOtp] = useState("");
  const [showOtpDialog, setShowOtpDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false); // New state for OTP sending
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const currentDeviceId = localStorage.getItem("deviceId");
  const { toast } = useToast();

  useEffect(() => {
    if (isProfileOpen) {
      const token = localStorage.getItem("adminToken");
      axios.get("https://blockvote.site/api/get-details", {
        headers: {
          Authorization: `Bearer ${token}`,
          "device-id": currentDeviceId,
        },
      }).then(res => {
        if (res.data.Success) setAdmin(res.data.adminDetails[0]);
      }).catch(err => console.error("Profile fetch error:", err));
    }
  }, [isProfileOpen, currentDeviceId]);

  useEffect(() => {
    if (isDeviceDialogOpen) {
      const token = localStorage.getItem("adminToken");
      axios.get("https://blockvote.site/api/get-active-devices", {
        headers: {
          Authorization: `Bearer ${token}`,
          "device-id": currentDeviceId,
        },
      }).then(res => {
        if (res.data.success) setDevices(res.data.devices);
      }).catch(err => console.error("Device fetch error:", err));
    }
  }, [isDeviceDialogOpen, currentDeviceId]);

  const handleLogoutDevice = async (deviceId, token) => {
    setLogoutDeviceId(deviceId);
    setIsSendingOtp(true);
    
    try {
      const res = await axios.post(
        "https://blockvote.site/api/request-device-logout",
        { deviceId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            "device-id": currentDeviceId,
          },
        }
      );

      if (res.data.success) {
        setShowOtpDialog(true);
        toast({
          title: "OTP Sent",
          description: "Please check your email for the verification code",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to initiate logout",
        variant: "destructive",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtpAndLogout = async () => {
    if (!logoutDeviceId || !otp) return;
    
    setIsProcessing(true);
    try {
      const res = await axios.post(
        "https://blockvote.site/api/verify-logout-otp",
        { deviceId: logoutDeviceId, otp },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            "device-id": currentDeviceId,
          },
        }
      );

      if (res.data.success) {
        toast({
          title: "Success",
          description: "Device logged out successfully",
        });
        setDevices(devices.filter((d) => d.deviceId !== logoutDeviceId));
        setShowOtpDialog(false);
        setOtp("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to verify OTP",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Desktop Sidebar - Fixed position */}
        {isDesktop && (
          <div className="hidden lg:block w-64 border-r bg-background fixed h-screen overflow-y-auto z-40">
            <AdminSidebar />
          </div>
        )}
        
        {/* Mobile Sidebar - Sheet component */}
        {!isDesktop && (
          <Sheet open={mobileSidebarOpen} onOpenChange={setMobileSidebarOpen}>
            <SheetOverlay className="bg-black/80" />
            <SheetContent 
              side="left" 
              className="w-[280px] p-0 z-50"
            >
              <AdminSidebar onNavigate={() => setMobileSidebarOpen(false)} />
            </SheetContent>
          </Sheet>
        )}

        {/* Main Content Area - Offset for fixed sidebar */}
        <div className={`flex-1 flex flex-col ${isDesktop ? 'lg:ml-64' : ''}`}>
          <header className="border-b bg-background sticky top-0 z-30">
            <div className="container flex h-16 items-center justify-between px-4 sm:px-6">
              <div className="flex items-center gap-4">
                {!isDesktop && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setMobileSidebarOpen(true)}
                    className="lg:hidden"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
                <h1 className="text-lg font-semibold">Admin Dashboard</h1>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                <Button size="icon" variant="ghost" className="hidden sm:inline-flex">
                  <Bell className="h-4 w-4" />
                </Button>
                <ThemeToggle />
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsDeviceDialogOpen(true)}>
                      Logged in Devices
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => {
                      localStorage.removeItem("adminToken");
                      localStorage.removeItem("deviceId");
                      window.location.href = "/login";
                    }}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          <main className="flex-1 container py-4 sm:py-6 px-4 sm:px-6 overflow-auto">
            <Outlet />
          </main>
        </div>

        {/* Profile Dialog */}
        <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
  <DialogContent className="sm:max-w-[425px] max-w-[90vw] rounded-lg">
    <DialogHeader>
      <DialogTitle className="text-xl font-bold text-gray-800">Admin Profile</DialogTitle>
    </DialogHeader>
    {admin ? (
      <div className="space-y-6 py-2">
        {/* Profile Photo and Basic Info */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img 
              src={admin.profile} 
              alt="Profile Photo" 
              className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
            />
            <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{admin.name}</h2>
            <p className="text-sm text-gray-500">ID: {admin.id_no}</p>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-4">
          {/* Email */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Email</label>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <p className="text-sm text-gray-700">{admin.email}</p>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Wallet Address</label>
            <div className="flex items-start p-3 bg-gray-50 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <p className="text-sm text-gray-700 break-all font-mono">{admin.walletAddress}</p>
            </div>
          </div>
        </div>
      </div>
    ) : (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )}
  </DialogContent>
</Dialog>

        {/* Device Dialog */}
        <Dialog open={isDeviceDialogOpen} onOpenChange={setIsDeviceDialogOpen}>
          <DialogContent className="sm:max-w-[600px] max-w-[90vw]">
            <DialogHeader>
              <DialogTitle>Logged In Devices</DialogTitle>
            </DialogHeader>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {devices.length > 0 ? (
                devices.map((d, idx) => (
                  <div key={idx} className="border p-2 rounded-md">
                    <p><strong>Device ID:</strong> {d.deviceId}</p>
                    <p><strong>OS:</strong> {d.deviceInfo?.os || "N/A"}</p>
                    <p><strong>Browser:</strong> {d.deviceInfo?.browser || "N/A"}</p>
                    {d.deviceId !== currentDeviceId && (
                      <Button
                        size="sm"
                        variant="destructive"
                        className="mt-2"
                        onClick={() => handleLogoutDevice(d.deviceId, d.token)}
                        disabled={isSendingOtp && logoutDeviceId === d.deviceId}
                      >
                        {isSendingOtp && logoutDeviceId === d.deviceId ? "Sending OTP..." : "Logout this device"}
                      </Button>
                    )}
                    {d.deviceId === currentDeviceId && (
                      <p className="text-sm text-green-600 mt-2">Current Device</p>
                    )}
                  </div>
                ))
              ) : (
                <p>No devices logged in.</p>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* OTP Verification Dialog */}
        <AlertDialog open={showOtpDialog} onOpenChange={setShowOtpDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Verify Logout</AlertDialogTitle>
              <AlertDialogDescription>
                Please enter the OTP sent to your email to confirm logging out this device.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={() => {
                  setOtp("");
                  setShowOtpDialog(false);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={verifyOtpAndLogout}
                disabled={!otp || otp.length !== 6 || isProcessing}
              >
                {isProcessing ? "Verifying..." : "Confirm Logout"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;