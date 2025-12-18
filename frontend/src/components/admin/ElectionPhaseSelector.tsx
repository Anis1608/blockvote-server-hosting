import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ClipboardList, Vote, BarChart3, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import useAxios from "@/axiosInstance";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Phase = "Registration" | "Voting" | "Result" | "Selection Phase";

interface PhaseOption {
  id: Phase;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const phases: PhaseOption[] = [
  {
    id: "Registration",
    name: "Registration",
    icon: ClipboardList,
    description: "Allow voters and candidates to register for the election",
  },
  {
    id: "Voting",
    name: "Voting",
    icon: Vote,
    description: "Open the election for voting by registered voters",
  },
  {
    id: "Result",
    name: "Results",
    icon: BarChart3,
    description: "Close voting and publish the election results",
  },
];

export function ElectionPhaseSelector() {
  const [phase, setPhase] = useState<Phase>("Selection Phase");
  const [showDialog, setShowDialog] = useState(false);
  const [pendingPhase, setPendingPhase] = useState<Phase | null>(null);
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const { toast } = useToast();
  const axios = useAxios();

  // Fetch current phase from backend
  useEffect(() => {
    const fetchPhase = async () => {
      try {
        const res = await axios.get("https://blockvote.site/api/get-current-phase", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            "device-id": localStorage.getItem("deviceId"),
          },
        });
        setPhase(res.data.currentPhase);
      } catch (err) {
        console.error("Failed to fetch current phase", err);
        toast({
          title: "Error",
          description: "Failed to fetch current election phase",
          variant: "destructive",
        });
      }
    };
    fetchPhase();
  }, []);

  const handlePhaseSelect = (selected: Phase) => {
    if (selected === phase) return;
    setPendingPhase(selected);
    setShowDialog(true);
    setOtp("");
    setIsOtpSent(false);
  };

  const sendOtp = async () => {
    if (!pendingPhase) return;
    
    try {
      setIsSendingOtp(true);
      const response = await axios.post(
        "https://blockvote.site/api/changephase",
        { currentPhase: pendingPhase },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            "device-id": localStorage.getItem("deviceId"),
          },
        }
      );

      toast({
        title: "OTP Sent",
        description: response.data.message || "OTP has been sent to your email",
        duration: 5000,
      });
      setIsOtpSent(true);
    } catch (error) {
      toast({
        title: "Failed to send OTP",
        description: error.response?.data?.message || "Something went wrong while sending OTP",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const verifyOtpAndChangePhase = async () => {
    if (!pendingPhase || !otp) return;

    try {
      setIsVerifyingOtp(true);
      const response = await axios.post(
        "https://blockvote.site/api/changephase/verify",
        { otp },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            "device-id": localStorage.getItem("deviceId"),
          },
        }
      );
      setPhase(pendingPhase);
      toast({
        title: "Success",
        description: response.data.message || "Election phase updated successfully",
        duration: 5000,
      });
      setShowDialog(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Invalid OTP or something went wrong",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-2">
            <h3 className="font-semibold">Election Phase</h3>
            <p className="text-sm text-muted-foreground">
              Control the current phase of the election process
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {phases.map((option) => {
              const Icon = option.icon;
              const isActive = phase === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  className={cn(
                    "relative flex cursor-pointer flex-col items-center rounded-lg border bg-background p-4 text-center",
                    isActive
                      ? "border-primary ring-2 ring-primary ring-offset-2"
                      : "border-muted hover:border-primary"
                  )}
                  onClick={() => handlePhaseSelect(option.id)}
                >
                  <Icon
                    className={cn(
                      "h-6 w-6 mb-2",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <h3 className="font-medium">{option.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {option.description}
                  </p>
                  {isActive && (
                    <div className="absolute -right-1 -top-1 rounded-full bg-primary text-primary-foreground p-1">
                      <div className="h-2 w-2 rounded-full bg-current" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Confirm Phase Change
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to change the election phase to{" "}
              <span className="font-medium">
                {pendingPhase && phases.find(p => p.id === pendingPhase)?.name}
              </span>
              ? This action will affect the availability of voting and registration features.
            </DialogDescription>
          </DialogHeader>

          {pendingPhase === "Result" && (
            <div className="rounded-md bg-warning/10 border-warning/20 border p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-medium text-warning">Warning</h4>
                  <p className="text-sm text-muted-foreground">
                    Moving to the Results phase will permanently close voting. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {!isOtpSent ? (
              <Button 
                onClick={sendOtp} 
                disabled={isSendingOtp}
                className="w-full"
              >
                {isSendingOtp ? "Sending OTP..." : "Send OTP"}
              </Button>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <Input
                    id="otp"
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                  />
                  <p className="text-sm text-muted-foreground">
                    Check your email for the verification OTP
                  </p>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDialog(false);
                setOtp("");
                setIsOtpSent(false);
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={verifyOtpAndChangePhase} 
              disabled={!isOtpSent || !otp || otp.length !== 6 || isVerifyingOtp}
            >
              {isVerifyingOtp ? "Verifying..." : "Confirm Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}