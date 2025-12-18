import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const VoteConfirmation = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const { candidate } = location.state || {};

  if (!candidate) {
    return (
      <div className="text-center mt-10 text-red-500">
        No candidate selected. Please go back and choose a candidate.
      </div>
    );
  }

  const handleSubmit = async () => {
    const voterId = localStorage.getItem("voterId");

    if (!voterId) {
      toast({
        title: "Voter ID Missing",
        description: "Please login again to vote.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("https://blockvote.site/api/cast-vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "device-id": localStorage.getItem("deviceId") ,
        },
        body: JSON.stringify({
          voterId,
          candidateId: candidate.candidateId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.Success && data.hash) {
        toast({
          title: "Vote submitted successfully",
          description: "Your vote has been recorded on the blockchain.",
        });

        // ✅ Navigate and pass the hash as state
        navigate("/voter/success", { state: { hash: data.hash } });
      } else {
        throw new Error(data?.message || "Unknown error occurred");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Card className="border-2 border-primary/20">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldAlert className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">Confirm Your Vote</CardTitle>
          <CardDescription>
            Please review your selection before submitting your final vote
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-card p-6">
            <h3 className="text-lg font-semibold mb-4">Selected Candidate</h3>
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 overflow-hidden rounded-full bg-muted">
                <img
                  src={candidate.profilePic || "/placeholder.svg"}
                  alt={candidate.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <div className="text-xl font-medium">{candidate.name}</div>
                <div className="text-muted-foreground">{candidate.party}</div>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-md bg-muted">
            <AlertCircle className="h-5 w-5 text-secondary mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">Important Notice</p>
              <p className="text-sm text-muted-foreground">
                By clicking "Submit Vote" below, your vote will be permanently recorded on the blockchain.
                This action cannot be undone or changed.
              </p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="flex flex-col xs:flex-row gap-4 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/voter/ballot")}
              disabled={isSubmitting}
            >
              Change Selection
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="animate-pulse">Processing...</span>
              ) : (
                "Submit Vote"
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VoteConfirmation;
