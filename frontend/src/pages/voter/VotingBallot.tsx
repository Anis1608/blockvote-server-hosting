import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, FileCheck } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface Candidate {
  _id: string;
  candidateId: string; // This is the field you want to use for voting
  name: string;
  party: string;
  profilePic: string;
}

const VotingBallot = () => {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await fetch("https://blockvote.site/api/all-candidate", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            "device-id": localStorage.getItem("deviceId"),
          },
        });
        const data = await response.json();
        if (data.success) {
          setCandidates(data.candidates); // ✅ Corrected
        }
      } catch (error) {
        console.error("Error fetching candidates:", error);
      }
    };
  
    fetchCandidates();
  }, []);
  

  const handleContinue = () => {
    if (selectedCandidate) {
      const selected = candidates.find(c => c.candidateId === selectedCandidate);
      if (selected) {
        navigate("/voter/confirm", {
          state: { candidate: selected },
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="flex flex-col gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Official Ballot</h1>
          <p className="text-muted-foreground">Presidential Election 2024</p>
        </div>

        <Alert variant="default" className="bg-muted border-muted-foreground/20">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important Instructions</AlertTitle>
          <AlertDescription>
            Select one candidate by clicking on their card. Review your choice before submitting your vote. Once submitted, your vote cannot be changed.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-secondary" />
            Presidential Candidates
          </h2>

          <RadioGroup value={selectedCandidate || ""} onValueChange={setSelectedCandidate}>
            <div className="grid gap-4 md:grid-cols-2">
              {candidates.map((candidate) => (
                <div key={candidate.candidateId} className="relative">
                  <RadioGroupItem
                    value={candidate.candidateId}
                    id={`candidate-${candidate.candidateId}`}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={`candidate-${candidate.candidateId}`}
                    className="flex flex-col h-full rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 overflow-hidden rounded-full bg-muted">
                        <img
                          src={candidate.profilePic}
                          alt={candidate.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{candidate.name}</div>
                        <div className="text-sm text-muted-foreground">{candidate.party}</div>
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        <div className="flex justify-end space-x-4 pt-4 mt-6">
          <Button variant="outline" onClick={() => navigate("/voter/login")}>
            Back
          </Button>
          <Button onClick={handleContinue} disabled={!selectedCandidate}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VotingBallot;
