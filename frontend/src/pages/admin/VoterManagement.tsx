import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import { CheckCircle, Filter, Plus, Search, UploadCloud } from "lucide-react";
import useAxios from "@/axiosInstance";
import { useIsMobile } from "@/hooks/use-mobile";

interface Voter {
  _id: string;
  voterId: string;
  name: string;
  dob: string;
  location: {
    city: string;
    state: string;
  };
  voteCast: boolean;
}

const VoterManagement = () => {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isloading, setIsLoading] = useState(false);
  const [isuploadbuttonloading, setIsUploadButtonLoading] = useState(false);
  const [isfetchingDataloading, setisfetchingDataloading] = useState(false);
  const [newVoter, setNewVoter] = useState({
    name: "",
    email: "",
    dob: "",
    city: "",
    state: "",
  });
  const [sendEmails, setSendEmails] = useState<'yes' | 'no'>('yes');

  const axios = useAxios();
  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) navigate("/login");
  }, [navigate]);

  const fetchVoters = async () => {
    setisfetchingDataloading(true);
    try {
      const res = await axios.get("https://blockvote.site/api/allvoter", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "device-id": localStorage.getItem("deviceId") || "",
        },
      });

      const data = res.data;
      if (data.Success) setVoters(data.getDetails);
      else toast({ title: "Error", description: data.message });
    } catch (err) {
      console.error(err);
      toast({ title: "Server Error", description: "Failed to fetch voters." });
    } finally {
      setisfetchingDataloading(false);
    }
  };

  useEffect(() => {
    fetchVoters();
  }, []);

  const handleRegisterVoter = async () => {
    const voterId = `VOTER${Math.floor(1000 + Math.random() * 9000)}`;
  
    const payload = {
      voterId,
      email: newVoter.email,
      name: newVoter.name,
      dob: new Date(newVoter.dob).toISOString(),
      location: {
        city: newVoter.city,
        state: newVoter.state,
      },
    };
  
    setIsLoading(true);
  
    try {
      const token = localStorage.getItem("adminToken");
      const deviceId = localStorage.getItem("deviceId") || "";
  
      const response = await fetch("https://blockvote.site/api/register-voter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "device-id": deviceId,
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      if (data.Success) {
        toast({
          title: "Voter registered",
          description: `Voter ID will be sent to ${newVoter.email} shortly.`,
          variant: "default",
          duration: 3000,
        });
      }
      else {
        toast({
          title: "Registration failed",
          description: data.message,
          variant: "destructive",
        });
        return;
      }

      setNewVoter({ name: "", email: "", dob: "", city: "", state: "" });
      setIsDialogOpen(false);
      fetchVoters();
  
    } catch (err) {
      console.error(err);
      toast({
        title: "Error",
        description: "Failed to register voter.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  

  const handleFileUpload = async () => {
    if (!file) {
      toast({ title: "Error", description: "No file selected" });
      return;
    }
  
    setIsUploadButtonLoading(true);
  
    const formData = new FormData();
    formData.append("file", file);
    formData.append("sendEmails", sendEmails);
  
    try {
      const token = localStorage.getItem("adminToken");
      const deviceId = localStorage.getItem("deviceId") || "";
  
      const response = await fetch("https://blockvote.site/api/bulk-register", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "device-id": deviceId
        },
        body: formData,
      });
  
      const data = await response.json();
  
      if (data.Success) {
        toast({
          title: "Upload Success",
          description: sendEmails === 'yes' 
            ? `Uploaded ${data.stats.registered} voters. Emails will be sent shortly.` 
            : `Uploaded ${data.stats.registered} voters. No emails sent.`,
          variant: "default",
          duration: 5000,
        });
        setFile(null);
        setIsDialogOpen(false);
        fetchVoters();
      } 
      else {
        toast({ title: "Upload Failed", description: data.message });
        return;
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Error", description: "Upload failed" });
    } finally {
      setIsUploadButtonLoading(false);
    }
  };
  

  const filteredVoters = voters.filter((voter) => {
    const q = searchQuery.toLowerCase();
    return (
      voter.name.toLowerCase().includes(q) ||
      voter.voterId.toLowerCase().includes(q) ||
      voter.location.city.toLowerCase().includes(q) ||
      voter.location.state.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 p-4 animate-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Voter Management</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Register and manage voters</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" /> Register Voter
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-[95vw] sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Register New Voter</DialogTitle>
              <DialogDescription>Choose a method below</DialogDescription>
            </DialogHeader>

            <Tabs defaultValue="manual">
              <TabsList className="w-full mb-4 grid grid-cols-2">
                <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                <TabsTrigger value="upload">Upload File</TabsTrigger>
              </TabsList>

              {/* MANUAL ENTRY */}
              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    placeholder="Full name"
                    value={newVoter.name}
                    onChange={(e) => setNewVoter({ ...newVoter, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    placeholder="Email address"
                    value={newVoter.email}
                    onChange={(e) => setNewVoter({ ...newVoter, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={newVoter.dob}
                    onChange={(e) => setNewVoter({ ...newVoter, dob: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    placeholder="City"
                    value={newVoter.city}
                    onChange={(e) => setNewVoter({ ...newVoter, city: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>State</Label>
                  <Input
                    placeholder="State"
                    value={newVoter.state}
                    onChange={(e) => setNewVoter({ ...newVoter, state: e.target.value })}
                  />
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRegisterVoter}
                    disabled={!newVoter.name || !newVoter.dob || !newVoter.city || !newVoter.state || !newVoter.email}
                    className="w-full sm:w-auto"
                  >
                    {isloading ? "Registering..." : "Register Voter"}
                  </Button>
                </DialogFooter>
              </TabsContent>

              {/* FILE UPLOAD */}
              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-2">
                  <Label>Upload .xlsx or .csv File</Label>
                  <Input
                    type="file"
                    accept=".csv,.xlsx"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Send confirmation emails to voters?</Label>
                  <select
                    value={sendEmails}
                    onChange={(e) => setSendEmails(e.target.value as 'yes' | 'no')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="yes">Yes, send confirmation emails</option>
                    <option value="no">No, just register voters</option>
                  </select>
                </div>
                
                <div className="text-xs text-muted-foreground">
                  File must include: voterId, name, email, dob, city, state.
                </div>
                <DialogFooter className="flex flex-col sm:flex-row gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleFileUpload} 
                    disabled={!file || isuploadbuttonloading}
                    className="w-full sm:w-auto"
                  >
                    <UploadCloud className="mr-2 h-4 w-4" />
                    {isuploadbuttonloading ? "Uploading..." : " Upload & Register"}
                  </Button>
                </DialogFooter>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg sm:text-xl">Registered Voters</CardTitle>
            <div className="flex gap-2 items-center w-full sm:w-auto">
              <div className="flex items-center rounded-md border px-3 py-1 text-sm w-full sm:w-auto">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Total: {voters.length}
              </div>
              <Button variant="outline" size="icon" className="shrink-0">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="flex mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search voters..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {useIsMobile ? (
            <div className="space-y-2">
              {filteredVoters.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">{isfetchingDataloading ? "Loading Please Wait..." : "No Voter Data Found"}</p>
              ) : (
                filteredVoters.map((voter) => (
                  <Card key={voter._id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{voter.name}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          voter.voteCast 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {voter.voteCast ? "Voted" : "Not Voted"}
                        </span>
                      </div>
                      <p className="text-sm">ID: {voter.voterId}</p>
                      <p className="text-sm">
                        {voter.location.city}, {voter.location.state}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        DOB: {new Date(voter.dob).toLocaleDateString()}
                      </p>
                    </div>
                  </Card>
                ))
              )}
            </div>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Voter ID</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Date of Birth</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVoters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                        {isfetchingDataloading ? "Loading..." : "No voters found"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVoters.map((voter) => (
                      <TableRow key={voter._id}>
                        <TableCell className="py-2">{voter.name}</TableCell>
                        <TableCell className="py-2">{voter.voterId}</TableCell>
                        <TableCell className="py-2">{voter.location.city}</TableCell>
                        <TableCell className="py-2">{voter.location.state}</TableCell>
                        <TableCell className="py-2">
                          {new Date(voter.dob).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            voter.voteCast 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {voter.voteCast ? "Voted" : "Not Voted"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="justify-between">
          <div className="text-xs text-muted-foreground">
            Showing {filteredVoters.length} of {voters.length} voters
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default VoterManagement;