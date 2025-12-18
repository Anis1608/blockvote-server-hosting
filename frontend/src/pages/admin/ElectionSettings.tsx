
import { useState , useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/components/ui/use-toast";
import { CalendarIcon, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const ElectionSettings = () => {
  const [electionTitle, setElectionTitle] = useState("Presidential Election 2024");
  const [electionDescription, setElectionDescription] = useState(
    "Official election for the position of President"
  );
  const [registrationStart, setRegistrationStart] = useState<Date | undefined>(
    new Date(2025, 3, 1)
  );
  const [registrationEnd, setRegistrationEnd] = useState<Date | undefined>(
    new Date(2025, 3, 15)
  );
  const [votingStart, setVotingStart] = useState<Date | undefined>(
    new Date(2025, 3, 20)
  );
  const [votingEnd, setVotingEnd] = useState<Date | undefined>(
    new Date(2025, 3, 30)
  );
  const [enableBlockchainVerification, setEnableBlockchainVerification] = useState(true);
  const [enableEmailNotifications, setEnableEmailNotifications] = useState(true);
  const [enableResultsPublishing, setEnableResultsPublishing] = useState(true);


  const navigate = useNavigate();

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");

    if (!adminToken) {
      navigate("/login");
      return;
    }})


  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Settings saved",
      description: "Your election settings have been updated.",
    });
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Election Settings</h2>
        <p className="text-muted-foreground">
          Configure your election parameters and options
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Election Information</CardTitle>
            <CardDescription>
              The basic details about this election
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="election-title">Election Title</Label>
              <Input
                id="election-title"
                value={electionTitle}
                onChange={(e) => setElectionTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="election-description">Description</Label>
              <Textarea
                id="election-description"
                value={electionDescription}
                onChange={(e) => setElectionDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Blockchain Configuration</CardTitle>
            <CardDescription>
              Configure blockchain verification settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="blockchain-verification">
                Enable Blockchain Verification
              </Label>
              <Switch
                id="blockchain-verification"
                checked={enableBlockchainVerification}
                onCheckedChange={setEnableBlockchainVerification}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="email-notifications">
                Send Email Notifications
              </Label>
              <Switch
                id="email-notifications"
                checked={enableEmailNotifications}
                onCheckedChange={setEnableEmailNotifications}
              />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="results-publishing">
                Enable Results Publishing
              </Label>
              <Switch
                id="results-publishing"
                checked={enableResultsPublishing}
                onCheckedChange={setEnableResultsPublishing}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Election Schedule</CardTitle>
            <CardDescription>
              Set the timeline for registration and voting phases
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Registration Period</Label>
                <div className="grid gap-2">
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="registration-start" className="text-xs text-muted-foreground">
                      Start Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="registration-start"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !registrationStart && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {registrationStart ? (
                            format(registrationStart, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={registrationStart}
                          onSelect={setRegistrationStart}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="registration-end" className="text-xs text-muted-foreground">
                      End Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="registration-end"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !registrationEnd && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {registrationEnd ? (
                            format(registrationEnd, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={registrationEnd}
                          onSelect={setRegistrationEnd}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Voting Period</Label>
                <div className="grid gap-2">
                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="voting-start" className="text-xs text-muted-foreground">
                      Start Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="voting-start"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !votingStart && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {votingStart ? (
                            format(votingStart, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={votingStart}
                          onSelect={setVotingStart}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex flex-col space-y-1">
                    <Label htmlFor="voting-end" className="text-xs text-muted-foreground">
                      End Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="voting-end"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !votingEnd && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {votingEnd ? (
                            format(votingEnd, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={votingEnd}
                          onSelect={setVotingEnd}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Advanced Settings</CardTitle>
            <CardDescription>
              Configure advanced options for your election
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="security">
                <AccordionTrigger>Security Settings</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label>Two-Factor Authentication</Label>
                      <p className="text-xs text-muted-foreground">
                        Require 2FA for administrative actions
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label>IP Restriction</Label>
                      <p className="text-xs text-muted-foreground">
                        Limit access to specific IP addresses
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label>Audit Logging</Label>
                      <p className="text-xs text-muted-foreground">
                        Log all administrative actions
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="notifications">
                <AccordionTrigger>Notification Settings</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label>Email Alerts</Label>
                      <p className="text-xs text-muted-foreground">
                        Send email alerts for important events
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label>SMS Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Send SMS for critical updates
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between space-x-2">
                    <div className="space-y-0.5">
                      <Label>Admin Notifications</Label>
                      <p className="text-xs text-muted-foreground">
                        Notify administrators about system events
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="blockchain">
                <AccordionTrigger>Blockchain Settings</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="blockchain-network">Blockchain Network</Label>
                    <Input
                      id="blockchain-network"
                      defaultValue="Ethereum (ETH)"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contract-address">Smart Contract Address</Label>
                    <Input
                      id="contract-address"
                      defaultValue="0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gas-limit">Gas Limit</Label>
                    <Input
                      id="gas-limit"
                      type="number"
                      defaultValue="2000000"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
          <CardFooter>
            <Button
              onClick={handleSaveSettings}
              className="ml-auto"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </CardFooter>
        </Card> */}
      </div>
    </div>
  );
};

export default ElectionSettings;
