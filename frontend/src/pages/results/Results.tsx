"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Search, Medal } from "lucide-react";
import axios from "axios";
import Link, { NavLink } from "react-router-dom";
import { Input } from "@/components/ui/input";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

interface CandidateResult {
  candidateId: string;
  name: string;
  party: string;
  voteCount: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function AdminResults() {
  const [topCandidates, setTopCandidates] = useState<CandidateResult[]>([]);
  const [allCandidates, setAllCandidates] = useState<CandidateResult[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [phaseMessage, setPhaseMessage] = useState("");
  const [currentPhase, setCurrentPhase] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [flash, setFlash] = useState(false);
  const walletAddress = typeof window !== 'undefined' ? localStorage.getItem("walletAddress") : "";

  const fetchCurrentPhase = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("adminToken") : "";
      const deviceId = typeof window !== 'undefined' ? localStorage.getItem("deviceId") : "";
      
      const response = await axios.get(
        "https://blockvote.site/api/get-current-phase",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "device-id": deviceId,
          },
        }
      );

      if (response.data.Success) {
        console.log("Current phase:", response.data.currentPhase);
        setCurrentPhase(response.data.currentPhase);
      }
    } catch (error) {
      console.error("Failed to fetch current phase:", error);
    }
  };

  const fetchResults = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("adminToken") : "";
      const deviceId = typeof window !== 'undefined' ? localStorage.getItem("deviceId") : "";
      
      const response = await axios.get(
        "https://blockvote.site/api/admin-result",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "device-id": deviceId,
          },
        }
      );

      if (response.data.success === false) {
        setPhaseMessage(response.data.message);
        return;
      }

      setTopCandidates(response.data.top5Candidates || []);
      const allCands = response.data.allCandidates || [];
      setAllCandidates(allCands);
      setFilteredCandidates(allCands);
    } catch (error) {
      console.error("Failed to fetch results:", error);
      setPhaseMessage("Error fetching results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentPhase();
    fetchResults();

    let intervalId: NodeJS.Timeout;
    if (currentPhase === "Voting") {
      intervalId = setInterval(fetchResults, 60000); // Update every 60 seconds
      
      const flashInterval = setInterval(() => {
        setFlash(prev => !prev);
      }, 1000);
      
      return () => {
        clearInterval(intervalId);
        clearInterval(flashInterval);
      };
    }
  }, [currentPhase]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCandidates(allCandidates);
    } else {
      const filtered = allCandidates.filter((candidate) =>
        candidate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        candidate.party.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCandidates(filtered);
    }
  }, [searchTerm, allCandidates]);

  // Filter out candidates with zero votes for pie chart to prevent label overlap
  const getPieChartData = () => {
    return topCandidates
      .filter(candidate => candidate.voteCount > 0)
      .map((c) => ({
        name: c.name,
        value: c.voteCount,
        party: c.party,
      }));
  };

  const handleDownloadCSV = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("adminToken") : "";
      const deviceId = typeof window !== 'undefined' ? localStorage.getItem("deviceId") : "";
      
      const response = await fetch("https://blockvote.site/api/downloadStellar", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "device-id": deviceId,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download CSV");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "BlockChain_transactions.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error downloading file:", error.message);
    }
  };

  const shareResults = () => {
    const shareText = `🏆 Election Results\nTop Candidate: ${topCandidates[0]?.name} (${topCandidates[0]?.party}) with ${topCandidates[0]?.voteCount} votes.\nView on Blockchain: https://stellar.expert/explorer/testnet/search?term=${walletAddress}`;

    if (navigator.share) {
      navigator
        .share({
          title: "Blockchain Election Results",
          text: shareText,
          url: window.location.href,
        })
        .then(() => console.log("Shared successfully"))
        .catch((err) => console.error("Error sharing:", err));
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        alert("Results copied to clipboard. Share it anywhere!");
      });
    }
  };

  if (currentPhase === "Registration") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Registration In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Live Results will be available after Voting Begins.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 animate-in">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
            Election Results
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Blockchain Election • {currentPhase === "Voting" ? "Live Voting Data" : "Final Results"}
          </p>
        </div>
        {currentPhase !== "Registration" && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={shareResults}
              className="flex-1 sm:flex-none"
            >
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadCSV}
              className="flex-1 sm:flex-none"
            >
              Download Report
            </Button>
          </div>
        )}
      </div>

      {currentPhase === "Voting" && (
        <div 
          className={`mb-6 p-4 rounded-lg border-2 ${flash ? 'bg-red-400' : 'bg-red-600'} text-white font-bold text-center transition-colors duration-1000`}
        >
          VOTING IS LIVE - UPDATING EVERY 1 MINUTE
        </div>
      )}

      {phaseMessage && !loading && (
        <Card>
          <CardContent className="text-center text-gray-500 py-6">
            {phaseMessage}
          </CardContent>
        </Card>
      )}

      {loading && (
        <Card>
          <CardContent className="text-center text-gray-500 py-6">
            Loading results...
          </CardContent>
        </Card>
      )}

      {!loading && !phaseMessage && topCandidates.length > 0 && (
        <>
          {/* Leading Candidates Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Medal className="h-5 w-5 text-amber-500" />
                Leading Candidates
              </CardTitle>
              <CardDescription>
                {currentPhase === "Voting" ? "Current standings" : "Final results"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {topCandidates.map((candidate, index) => (
                <div
                  key={candidate.candidateId}
                  className="flex items-center gap-3 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0
                        ? "bg-amber-200 text-amber-800"
                        : index === 1
                        ? "bg-gray-300 text-gray-800"
                        : index === 2
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-medium truncate">{candidate.name}</p>
                    <p className="text-xs text-gray-500 truncate">{candidate.party}</p>
                  </div>
                  <div className="font-semibold">
                    {candidate.voteCount.toLocaleString()} votes
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Vote Distribution</CardTitle>
                <CardDescription>Percentage of total votes (candidates with 0 votes not shown)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getPieChartData()}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        innerRadius={60}
                        paddingAngle={2}
                        label={({ name, percent }) => 
                          `${name.split(" ")[0]}\n${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                        dataKey="value"
                      >
                        {getPieChartData().map((entry, index) => (
                          <Cell key={index} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} votes`,
                          `${props.payload.name} (${props.payload.party})`
                        ]}
                      />
                      <Legend 
                        layout="vertical" 
                        verticalAlign="bottom"
                        align="center"
                        formatter={(value, entry, index) => (
                          <span className="text-xs">
                            {getPieChartData()[index].name}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Bar Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Vote Comparison</CardTitle>
                <CardDescription>Total votes per candidate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={topCandidates.map((c) => ({
                        name: c.name.length > 10 ? `${c.name.substring(0, 8)}...` : c.name,
                        votes: c.voteCount,
                        party: c.party,
                      }))}
                      layout="vertical"
                    >
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={80} />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} votes`,
                          `${props.payload.party}`
                        ]}
                        labelFormatter={(label) => `Candidate: ${label}`}
                      />
                      <Legend />
                      <Bar
                        dataKey="votes"
                        name="Votes"
                        fill="#8884d8"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Candidates */}
          <Card>
            <CardHeader>
              <CardTitle>Search Candidates</CardTitle>
              <CardDescription>
                {currentPhase === "Voting"
                  ? "Current candidate votes (live)"
                  : "All candidate votes"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search candidates by name or party..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="mt-4 space-y-4 max-h-[500px] overflow-y-auto">
                {filteredCandidates.length > 0 ? (
                  filteredCandidates.map((candidate) => (
                    <div
                      key={candidate.candidateId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{candidate.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {candidate.party}
                        </p>
                      </div>
                      <div className="font-semibold">
                        {candidate.voteCount.toLocaleString()} votes
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">
                    No candidates found matching your search
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Blockchain Verification Section - Only show if not in registration */}
      {currentPhase !== "Registration" && currentPhase !== "" && (
        <Card>
          <CardHeader>
            <CardTitle>Blockchain Verification</CardTitle>
            <CardDescription>
              Verify the integrity of the election results on the blockchain
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md bg-muted p-3 sm:p-4">
              <h4 className="font-medium text-sm sm:text-base mb-2">
                Election Smart Contract Address
              </h4>
              <p className="font-mono text-xs break-all">{walletAddress}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <NavLink
                className="flex-1"
                to={`https://stellar.expert/explorer/testnet/search?term=${walletAddress}`}
                target="_blank"
              >
                <Button className="w-full">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span className="truncate">Verify on Blockchain Explorer</span>
                </Button>
              </NavLink>
              <Button
                onClick={handleDownloadCSV}
                className="flex-1"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                <span className="truncate">Download Verification Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}