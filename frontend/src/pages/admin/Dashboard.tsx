import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart as LucideBarChart,
  CalendarRange,
  UserCheck,
  Users,
  Vote,
} from "lucide-react";
import { ElectionPhaseSelector } from "@/components/admin/ElectionPhaseSelector";
import useAxios from "../../axiosInstance";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface StatItem {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  change?: string;
}

interface VoteData {
  hour: string;
  votes: number;
}

interface LocationVote {
  location: string;
  votes: number;
}

interface ActivityLog {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  action: string;
  description: string;
  ipAddress: string;
  userAgent: string;
  status: string;
  metadata: {
    name?: string;
    transactionHash?: string;
    totalSkipped?: number;
    totalUploaded?: number;
  };
  createdAt: string;
  __v: number;
}

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
};

const Dashboard = () => {
  const [totalVoters, setTotalVoters] = useState<number | null>(null);
  const [totalVotes, setTotalVotes] = useState<number | null>(null);
  const [data, setData] = useState<VoteData[]>([]);
  const [filter, setFilter] = useState<string>("today");
  const [totalCandidates, setTotalCandidates] = useState<number | null>(null);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [displayedLogsCount, setDisplayedLogsCount] = useState<number>(4);
  const [currentPhase, setCurrentPhase] = useState<string>("");


  const axios = useAxios();
  const navigate = useNavigate();

  const hoursLabels = [
    "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM",
    "8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM",
    "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"
  ];
  
  const filterOptions = [
    { label: "Today", value: "today" },
    { label: "Yesterday", value: "yesterday" },
    { label: "Last 7 Days", value: "last7days" },
    { label: "Last 30 Days", value: "last30days" },
  ];
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");

    if (!adminToken) {
      navigate("/login");
      return;
    }

    const headers = {
      headers: {
        Authorization: `Bearer ${adminToken}`,
        "device-id": localStorage.getItem("deviceId"),
      },
    };

    // Fetch data in parallel
    axios
    .get("https://blockvote.site/api/register-votercount", headers)
    .then((res) => setTotalVoters(res.data.totalVoter))
    .catch((err) => handleAuthError(err));

    axios
    .get("https://blockvote.site/api/get-current-phase", headers)
    .then((res) => {
      setCurrentPhase(res.data.currentPhase);
      setIsLoading(false);
    })
    .catch((err) => handleAuthError(err));

  axios
    .get("https://blockvote.site/api/total-votes", headers)
    .then((res) => setTotalVotes(res.data.totalVotes))
    .catch((err) => handleAuthError(err));

  axios
    .get("https://blockvote.site/api/total-candidate", headers)
    .then((res) => setTotalCandidates(res.data.totalCandidates))
    .catch((err) => handleAuthError(err));
}, [navigate, axios]);



  const handleAuthError = (err: any) => {
    console.error("Dashboard API error:", err);
    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("adminToken");
      navigate("/login");
    }
  };

  useEffect(() => {
    axios.get(`https://blockvote.site/api/hourly?filter=${filter}` , {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        "device-id": localStorage.getItem("deviceId"),
      },
    })
      .then((res) => {
        const formatted = res.data.hourlyVotes.map((votes: number, i: number) => ({
          hour: hoursLabels[i],
          votes,
        }));
        setData(formatted);
      })
      .catch((err) => {
        console.error("Error fetching hourly votes", err);
      });
  }, [filter]);

  useEffect(() => {
    axios.get("https://blockvote.site/api/activity-log", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        "device-id": localStorage.getItem("deviceId"),
      },
    })
      .then((res) => {
        const formattedLogs = res.data.map((log: ActivityLog) => ({
          ...log,
          timestamp: formatTimeAgo(log.createdAt),
        }));
        setActivityLogs(formattedLogs);
      })
      .catch((err) => {
        console.error("Error fetching activity logs", err);
      });
  }, []);

  const stats: StatItem[] = [
    {
      title: "Registered Voters",
      value: totalVoters !== null ? totalVoters : "Loading...",
      icon: Users,
      description: "Total registered",
    },
    {
      title: "Votes Cast",
      value: totalVotes !== null ? totalVotes : "Loading...",
      icon: Vote,
      description:
        totalVoters && totalVotes !== null
          ? `${((totalVotes / totalVoters) * 100).toFixed(1)}% turnout`
          : "Calculating...",
    },
    {
      title: "Candidates",
      value: totalCandidates !== null ? totalCandidates : "Loading...",
      icon: UserCheck,
      description: "Presidential election",
    },
    {
      title: "Election Status",
      value: isLoading
        ? "Loading..."
        : currentPhase === "Result"
        ? "End"
        : currentPhase === "Voting" || currentPhase === "Registration"
        ? "Active"
        : "Yet Not Started",
      icon: CalendarRange,
      description: "",
      change: "Voting phase",
    }
    
  ];

  const locationVotes: LocationVote[] = [
    { location: "North District", votes: 450 },
    { location: "South District", votes: 380 },
    { location: "East District", votes: 290 },
    { location: "West District", votes: 320 },
    { location: "Central District", votes: 410 },
  ];


  return (
    <div className="min-h-screen p-4 bg-background">
    <div className="max-w-7xl mx-auto space-y-4">
      {/* Header Section */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
          <div className="flex flex-col xs:flex-row gap-2">
            <Button 
              size="default" 
              onClick={()=> window.location.reload()}
              className="w-full xs:w-auto"
            >
            {"Refresh"}
            </Button>
          </div>
        </div>

        <ElectionPhaseSelector />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <Card 
            key={i} 
            className="animate-in shadow-sm"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">
                {stat.value}
              </div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-4">
        {/* Hourly Votes Card */}
        <Card className="animate-in shadow-sm flex flex-col" style={{ animationDelay: "400ms", height: "500px" }}>
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 pt-4 pb-2 shrink-0">
            <CardTitle className="text-xl font-semibold">Hourly Vote Distribution</CardTitle>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Day" />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent className="px-2 pb-2 flex-1 min-h-0">
            {data.length > 0 ? (
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={data}
                    margin={{
                      top: 20,
                      right: 20,
                      left: 0,
                      bottom: 30,
                    }}
                    barSize={28}
                  >
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis
                      dataKey="hour"
                      tick={{ fontSize: 12 }}
                      interval={window.innerWidth < 768 ? 3 : 1}
                      tickMargin={10}
                      height={40}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      allowDecimals={false}
                      width={40}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#fff',
                        borderRadius: '6px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        fontSize: '14px'
                      }}
                    />
                    <Bar
                      dataKey="votes"
                      fill="#4f46e5"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                    >
                      <LabelList
                        dataKey="votes"
                        position="top"
                        formatter={(value: number) => value > 0 ? value : ''}
                        style={{
                          fill: '#4f46e5',
                          fontSize: 12,
                          fontWeight: 600
                        }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-lg">No vote data available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Location Votes Card */}
        {/* <Card className="animate-in shadow-sm" style={{ animationDelay: "500ms" }}>
          <CardHeader>
            <CardTitle>Votes by Location</CardTitle>
            <CardDescription>Distribution across electoral districts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {locationVotes.map((item, i) => (
              <div key={i} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <p className="truncate max-w-[120px] sm:max-w-none">
                    {item.location}
                  </p>
                  <p className="font-medium">{item.votes}</p>
                </div>
                <Progress value={(item.votes / 500) * 100} />
              </div>
            ))}
          </CardContent>
        </Card> */}
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-in" 
        style={{ animationDelay: "600ms" }}
      >
        {/* Activity Log */}
      {/* Activity Log */}
<Card className="lg:col-span-2 shadow-sm">
  <CardHeader>
    <CardTitle>Activity Log</CardTitle>
    <CardDescription>Recent system activities</CardDescription>
  </CardHeader>
  <CardContent className="space-y-3">
    {activityLogs.length > 0 ? (
      activityLogs.slice(0, displayedLogsCount).map((log) => (
        <div 
          key={log._id} 
          className="flex items-start gap-3 rounded-md bg-muted/50 p-3"
        >
          <div className={`mt-1.5 h-2 w-2 rounded-full flex-shrink-0 ${
            log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <div className="min-w-0">
            <p className="font-medium truncate capitalize">
              {log.action.replace(/_/g, ' ')}
            </p>
            {/* {log.metadata} */}
            <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
              <p className="text-xs text-muted-foreground">
                {formatTimeAgo(log.createdAt)}
              </p>
    
              {log.metadata?.transactionHash && (
            <p className="text-xs text-muted-foreground break-all">
            Transaction Hash: {log.metadata.transactionHash}
          </p>
              )}

              <p className="text-xs truncate">
                {log.metadata?.name || log.description.replace(/_/g, ' ')}  
              </p>
        
              {log.metadata?.totalUploaded >=0 &&  (
                <p className="text-xs text-muted-foreground">
                  Total Voters Successfully Added : {log.metadata.totalUploaded}
                </p>
              )}
          
              {log.metadata?.totalSkipped >=0 && (
                <p className="text-xs text-muted-foreground">
                  Failed to Add Voters : {log.metadata.totalSkipped}
                </p>
              )}
      
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="flex items-center justify-center p-4">
        <p className="text-muted-foreground">
          {isLoading ? "Loading activities..." : "No activities found"}
        </p>
      </div>
    )}
  </CardContent>
  <CardFooter>
    {activityLogs.length > 4 && (
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full"
        onClick={() => {
          if (displayedLogsCount === 4) {
            setDisplayedLogsCount(activityLogs.length);
          } else {
            setDisplayedLogsCount(4);
          }
        }}
      >
        {displayedLogsCount === 4 ? "View All Activities" : "Show Less"}
      </Button>
    )}
  </CardFooter>
</Card>
        {/* Quick Actions */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <UserCheck className="mr-2 h-4 w-4" />
              <Link to="/admin/candidates">
              <span className="truncate">Add Candidate</span>  
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <LucideBarChart className="mr-2 h-4 w-4" />
              <Link to={"/results"}>     
              <span className="truncate">Generate Reports</span>
              </Link>
            </Button>
            {/* <Button variant="outline" className="w-full justify-start">
              <CalendarRange className="mr-2 h-4 w-4" />
              <span className="truncate">Manage Election Schedule</span>
            </Button> */}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);
};

export default Dashboard;
