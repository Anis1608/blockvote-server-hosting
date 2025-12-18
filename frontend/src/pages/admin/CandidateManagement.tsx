import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const CandidateManagement = () => {
  const [candidates, setCandidates] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    candidateId: "", // We'll auto-generate this
    name: "",
    profilePic: "",
    age: "",
    qualification: "",
    locationCity: "",
    locationState: "",
    party: "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [fileName, setFileName] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("adminToken");
  const { toast } = useToast();

  const generateCandidateId = (): string => {
    const randomNum = Math.floor(Math.random() * 1000000).toString().padStart(4, '0');
    return `CAND${randomNum}`;
  };

  // Generate ID when dialog opens
  useEffect(() => {
    if (open) {
      setForm(prev => ({
        ...prev,
        candidateId: generateCandidateId()
      }));
    }
  }, [open]);

  const fetchCandidates = async () => {
    try {
      const res = await axios.get("https://blockvote.site/api/all-candidate", {
        headers: {
          Authorization: `Bearer ${token}`,
          "device-id": localStorage.getItem("deviceId"),
        },
      });

      setCandidates(res.data.candidates || []);
    } catch (error) {
      console.error("Error fetching candidates", error);
    }
  };

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (!adminToken) {
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    fetchCandidates();
  }, []);

  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "blockvote");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/yg123/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();
      if (data.secure_url) return data.secure_url;
      return null;
    } catch (err) {
      console.error("Error uploading to Cloudinary:", err);
      return null;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsUploading(true);

    try {
      const uploadedUrl = await uploadToCloudinary(file);
      if (uploadedUrl) {
        setForm({ ...form, profilePic: uploadedUrl });
        toast({
          title: "Success",
          description: "Image uploaded successfully",
          duration: 3000,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to upload image",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "An error occurred while uploading the image",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddCandidate = async () => {
    try {
      const payload = {
        candidateId: form.candidateId, // Using our auto-generated ID
        name: form.name,
        profilePic: form.profilePic,
        age: Number(form.age),
        qualification: form.qualification,
        location: {
          city: form.locationCity,
          state: form.locationState,
        },
        party: form.party,
      };

      const res = await axios.post(
        "https://blockvote.site/api/register-candidate",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "device-id": localStorage.getItem("deviceId"),
          },
        }
      );

      if (res.data.message === "Candidate Registration Phase is Closed...") {
        toast({
          title: "Error",
          description: "Candidate Registration Phase is Closed.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }

      if (res.data.success) {
        toast({
          title: "Success!",
          description: "Candidate has been added successfully.",
          variant: "default",
          duration: 3000,
        });
        fetchCandidates();
        setOpen(false);
        setForm({
          candidateId: generateCandidateId(), // Generate new ID for next candidate
          name: "",
          profilePic: "",
          age: "",
          qualification: "",
          locationCity: "",
          locationState: "",
          party: "",
        });
        setFileName("");
      } else {
        toast({
          title: "Error",
          description: res.data.message || "Failed to register candidate",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error registering candidate", error);
      toast({
        title: "Error",
        description: "An error occurred while registering the candidate",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <h2 className="text-xl sm:text-2xl font-semibold">Candidate Management</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">Add New Candidate</Button>
          </DialogTrigger>
          <DialogContent className="w-[95%] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Candidate</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="party">Party</Label>
                <Input
                  id="party"
                  value={form.party}
                  onChange={(e) =>
                    setForm({ ...form, party: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={form.age}
                  onChange={(e) =>
                    setForm({ ...form, age: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="qualification">Qualification</Label>
                <Input
                  id="qualification"
                  value={form.qualification}
                  onChange={(e) =>
                    setForm({ ...form, qualification: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="profilePic">Profile Photo</Label>
                <Input
                  id="profilePic"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
                {fileName && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Selected: {fileName}
                    {isUploading && " (Uploading...)"}
                  </p>
                )}
                {form.profilePic && !isUploading && (
                  <p className="text-sm text-green-600 mt-1">Photo uploaded successfully</p>
                )}
              </div>
              <div>
                <Label htmlFor="locationCity">City</Label>
                <Input
                  id="locationCity"
                  value={form.locationCity}
                  onChange={(e) =>
                    setForm({ ...form, locationCity: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="locationState">State</Label>
                <Input
                  id="locationState"
                  value={form.locationState}
                  onChange={(e) =>
                    setForm({ ...form, locationState: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={handleAddCandidate}>Add Candidate</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {candidates.map((candidate, index) => (
          <div key={index} className="border p-4 rounded-lg shadow-md">
            <img
              src={candidate.profilePic}
              alt={candidate.name}
              className="h-24 w-24 sm:h-32 sm:w-32 object-cover rounded-full mx-auto mb-2"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                const target = e.currentTarget;
                target.onerror = null;
                target.src = "https://via.placeholder.com/150";
              }}
            />
            <h3 className="text-lg font-semibold text-center">
              {candidate.name}
            </h3>
            <p className="text-sm text-center text-muted-foreground">ID: {candidate.candidateId}</p>
            <p className="text-sm text-center">Party: {candidate.party}</p>
            <p className="text-sm text-center">Age: {candidate.age}</p>
            <p className="text-sm text-center">City: {candidate.location.city}</p>
            <p className="text-sm text-center">State: {candidate.location.state}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CandidateManagement;