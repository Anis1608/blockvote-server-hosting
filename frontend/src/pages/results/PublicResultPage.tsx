"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  ResponsiveContainer,
} from "recharts";
import { Medal } from "lucide-react";

interface CandidateResult {
  _id: string;
  name: string;
  party: string;
  votes: number;
}

interface Admin {
  _id: string;
  name: string;
  walletAddress: string;
  currentPhase: 'Registration' | 'Voting' | 'Result' | 'Selection Pending';
}

export default function PublicResultPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [candidates, setCandidates] = useState<CandidateResult[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateResult[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [phaseMessage, setPhaseMessage] = useState<{text: string, type: 'registration' | 'voting' | null} | null>(null);

  useEffect(() => {
    axios
      .get("https://blockvote.site/api/admins")
      .then((res) => setAdmins(res.data.admins))
      .catch(console.error);
  }, []);
  
  useEffect(() => {
    if (!selectedAdmin) return;
    setCandidates([]);
    setFilteredCandidates([]);
    setLoading(true);
    setPhaseMessage(null);

    axios
      .get(`https://blockvote.site/api/public-result?adminId=${selectedAdmin._id}`)
      .then((res) => {
        if (res.data.success === false && res.data.message) {
          if (res.data.message.includes("Registration Phase is in Progress...")) {
            setPhaseMessage({
              text: "Registration phase is currently in progress. Results will be available after voting ends.",
              type: "registration",
            });
          } else if (res.data.message.includes("Voting is Ongoing...")) {
            setPhaseMessage({
              text: "Voting is currently in progress. Results will be available after voting ends.",
              type: "voting",
            });
          }
          return;
        }

        if (res.data.allCandidates) {
          const allCandidates: CandidateResult[] = res.data.allCandidates.map(
            (c: any) => ({
              _id: c.candidateId,
              name: c.name,
              party: c.party,
              votes: c.voteCount,
            })
          );
          setCandidates(allCandidates);
          setFilteredCandidates(allCandidates);
        }
      })
      .catch((err) => {
        console.error("Error fetching results:", err);
        setPhaseMessage({
          text: "No results available for the selected Admin OR Admin has not conducted Election.",
          type: null,
        });
      })
      .finally(() => setLoading(false));
  }, [selectedAdmin]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCandidates(candidates);
    } else {
      const filtered = candidates.filter((candidate) =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.party.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCandidates(filtered);
    }
  }, [searchTerm, candidates]);

  const topCandidates = [...candidates].sort((a, b) => b.votes - a.votes).slice(0, 5);

  const COLORS = [
    "#6366f1", // indigo
    "#f59e0b", // amber
    "#10b981", // emerald
    "#ef4444", // red
    "#3b82f6", // blue
    "#a855f7", // violet
    "#14b8a6", // teal
    "#f43f5e", // rose
  ];

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Election Results</h1>
          <p className="text-muted-foreground text-sm">View candidate performance and voting statistics</p>
        </div>

        <Select
          value={selectedAdmin?._id || ""}
          onValueChange={(value) => {
            const admin = admins.find((a) => a._id === value);
            setSelectedAdmin(admin || null);
          }}
        >
          <SelectTrigger className="w-full md:w-[250px]">
            <SelectValue placeholder="Select Admin" />
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

      {!selectedAdmin && (
        <Card>
          <CardContent className="text-center text-muted-foreground py-6">
            Please select an admin to view election results.
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="text-center text-muted-foreground py-6">Loading results...</CardContent>
        </Card>
      )}
   
      {phaseMessage && (
        <div
          className={`mb-6 p-4 rounded-lg border ${
            phaseMessage.type === "registration"
              ? "bg-purple-100 dark:bg-purple-900 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-200"
              : phaseMessage.type === "voting"
              ? "bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700 text-blue-800 dark:text-blue-200"
              : "bg-red-100 dark:bg-red-900 border-red-300 dark:border-red-700 text-red-800 dark:text-red-200"
          }`}
        >
          <div className="flex items-center justify-center">
            <div className="text-center font-medium">{phaseMessage.text}</div>
          </div>
        </div>
      )}

      {selectedAdmin && !loading && !phaseMessage && (
        <>
          {candidates.length === 0 ? (
            <Card>
              <CardContent className="text-center text-muted-foreground py-6">
                No voting data found for the selected admin.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Medal className="h-5 w-5 text-amber-500" />
                      Top Candidates
                    </CardTitle>
                    <CardDescription>Leading by vote count</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topCandidates.map((candidate, index) => (
                      <div
                        key={candidate._id}
                        className="flex items-center gap-3 p-3 hover:bg-accent rounded-lg transition"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0
                              ? "bg-amber-200 dark:bg-amber-600 text-amber-800 dark:text-amber-100"
                              : index === 1
                              ? "bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100"
                              : index === 2
                              ? "bg-yellow-100 dark:bg-yellow-600 text-yellow-700 dark:text-yellow-100"
                              : "bg-gray-200 dark:bg-gray-500 text-gray-600 dark:text-gray-100"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-grow min-w-0">
                          <p className="font-medium truncate">{candidate.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{candidate.party}</p>
                        </div>
                        <div className="font-semibold">
                          {candidate.votes.toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>All Candidates</CardTitle>
                    <CardDescription>Search and filter candidates</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Input
                      placeholder="Search by name or party..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="mb-4"
                    />
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {filteredCandidates.length > 0 ? (
                        filteredCandidates.map((candidate) => (
                          <div
                            key={candidate._id}
                            className="flex justify-between items-center p-3 border rounded-lg hover:bg-accent"
                          >
                            <div>
                              <p className="font-medium truncate">{candidate.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{candidate.party}</p>
                            </div>
                            <div className="font-semibold">
                              {candidate.votes.toLocaleString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          {searchTerm.trim() ? "No matching candidates" : "No candidates available"}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Charts */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Vote Distribution</CardTitle>
                    <CardDescription>Percentage of total votes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] md:h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={filteredCandidates.slice(0, 6).map((c) => ({
                              name: c.name,
                              value: c.votes,
                              party: c.party,
                            }))}
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            innerRadius={40}
                            paddingAngle={3}
                            label={({ name, percent }) =>
                              `${name.split(" ")[0]} (${(percent * 100).toFixed(0)}%)`
                            }
                            labelLine={false}
                            dataKey="value"
                          >
                            {filteredCandidates.slice(0, 6).map((entry, index) => (
                              <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Vote Comparison</CardTitle>
                    <CardDescription>Total votes per candidate</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px] md:h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={filteredCandidates.slice(0, 10).map((c) => ({
                            name:
                              c.name.length > 15
                                ? `${c.name.substring(0, 12)}...`
                                : c.name,
                            votes: c.votes,
                            party: c.party,
                          }))}
                          layout="vertical"
                        >
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={90} />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="votes"
                            name="Votes"
                            fill="#6366f1"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}