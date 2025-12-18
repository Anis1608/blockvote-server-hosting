"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useEffect, useState } from "react";

interface Candidate {
  _id: string;
  name: string;
  age: number;
  qualification: string;
  party: string;
  profile: string;
  votes?: number;
}

interface Admin {
  _id: string;
  name: string;
  walletAddress: string;
  currentPhase: 'Registration' | 'Voting' | 'Result' | 'Selection Pending';
}

const PublicCandidate = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Fetch all admins
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await axios.get("https://blockvote.site/api/admins");
        setAdmins(response.data.admins);
      } catch (error) {
        console.error("Error fetching admins:", error);
      }
    };
    fetchAdmins();
  }, []);

  // Fetch candidates when admin is selected
  useEffect(() => {
    if (!selectedAdmin) return;
    setShowResults(false);
    
    const fetchCandidates = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `https://blockvote.site/api/candidates?adminId=${selectedAdmin._id}`
        );
        setCandidates(response.data.candidates);
        setFilteredCandidates(response.data.candidates);
      } catch (error) {
        console.error("Error fetching candidates:", error);
      } finally {
        setLoading(false);
      }
    };

    if (selectedAdmin.currentPhase !== 'Selection Pending') {
      fetchCandidates();
    }
  }, [selectedAdmin]);

  // Filter candidates based on search term
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCandidates(candidates);
    } else {
      const filtered = candidates.filter((candidate) =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.party.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.qualification.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCandidates(filtered);
    }
  }, [searchTerm, candidates]);

  // Phase-specific banner configuration
  const phaseConfig = {
    'Registration': {
      text: "REGISTRATION PHASE IS ONGOING - VOTING HAS NOT STARTED YET",
      bgColor: "bg-red-500",
      borderColor: "border-red-600",
      textColor: "text-white",
    },
    'Voting': {
      text: "VOTING PHASE IS ONGOING - CAST YOUR VOTE NOW",
      bgColor: "bg-yellow-500",
      borderColor: "border-yellow-600",
      textColor: "text-white",
    },
    'Result': {
      text: "RESULTS ARE OUT - VIEW THE ELECTION RESULTS",
      bgColor: "bg-green-500",
      borderColor: "border-green-600",
      textColor: "text-white",
    },
    'Selection Pending': {
      text: "NO ELECTION ONGOING FOR THIS ADMIN",
      bgColor: "bg-gray-500",
      borderColor: "border-gray-600",
      textColor: "text-white",
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Admin Selection */}
      <div className="mb-4">
        <Select
          value={selectedAdmin?._id || ""}
          onValueChange={(value) => {
            const admin = admins.find((a) => a._id === value);
            setSelectedAdmin(admin || null);
          }}
        >
          <SelectTrigger className="w-full max-w-md">
            <SelectValue placeholder="Select Election Admin" />
          </SelectTrigger>
          <SelectContent>
            {admins.map((admin) => (
              <SelectItem key={admin._id} value={admin._id}>
                <div className="flex items-center gap-2">
                  <span>{admin.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    admin.currentPhase === 'Registration' 
                      ? 'bg-red-100 text-red-800' 
                      : admin.currentPhase === 'Voting' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : admin.currentPhase === 'Result'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                  }`}>
                    {admin.currentPhase.toUpperCase()}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Phase Status Banner */}
      {selectedAdmin && (
        <div className={`mb-6 p-4 rounded-lg border ${phaseConfig[selectedAdmin.currentPhase].bgColor} ${phaseConfig[selectedAdmin.currentPhase].borderColor} ${phaseConfig[selectedAdmin.currentPhase].textColor} animate-pulse`}>
          <div className="font-bold text-center">
            {phaseConfig[selectedAdmin.currentPhase].text}
          </div>
        </div>
      )}

      {/* View Results Button (only in results phase) */}
      {selectedAdmin?.currentPhase === 'Result' && (
        <div className="mb-6 flex justify-center">
          <Button variant="destructive" className="w-full max-w-md">
            <a href={`/public/result`} className="w-full">
              View Results
            </a>
          </Button>
        </div>
      )}

      {/* Search Bar - Only show if not Selection Pending */}
      {selectedAdmin && selectedAdmin.currentPhase !== 'Selection Pending' && (
        <div className="mb-6">
          <Input
            placeholder="Search candidates by name, party, or qualification..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md"
          />
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4">Loading candidates...</p>
        </div>
      )}

      {/* Content */}
      {!selectedAdmin && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">
              Please select an election admin to view candidates
            </p>
          </CardContent>
        </Card>
      )}

      {selectedAdmin?.currentPhase === 'Selection Pending' && (
        <Card className="text-center py-12">
          <CardContent>
            <p className="text-muted-foreground">
              No election is currently ongoing for this admin
            </p>
          </CardContent>
        </Card>
      )}

      {selectedAdmin && selectedAdmin.currentPhase !== 'Selection Pending' && (
        <Card>
          <CardHeader>
            <CardTitle>Election Candidates</CardTitle>
            <CardDescription>
              {filteredCandidates.length} candidates found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredCandidates.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCandidates.map((candidate) => (
                  <Card key={candidate._id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="relative h-16 w-16 rounded-full overflow-hidden">
                          <img
                            src={candidate.profile}
                            alt={candidate.name}
                            className="object-cover h-full w-full"
                          />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg">{candidate.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {candidate.party}
                          </p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm">
                              <span className="font-medium">Age:</span> {candidate.age}
                            </p>
                            <p className="text-sm">
                              <span className="font-medium">Qualification:</span> {candidate.qualification}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {searchTerm
                  ? "No matching candidates found"
                  : "No candidates available for this election"}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PublicCandidate;