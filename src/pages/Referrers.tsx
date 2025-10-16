import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Search, Phone, Mail, Building2, MapPin, Calendar, TrendingUp, FileText, CheckCircle2 } from "lucide-react";

interface Activity {
  id: string;
  type: "referral" | "call" | "meeting" | "email";
  title: string;
  description: string;
  timestamp: string;
  patientName?: string;
}

interface Referrer {
  id: string;
  name: string;
  specialty: string;
  practice: string;
  phone: string;
  email: string;
  address: string;
  totalReferrals: number;
  activeReferrals: number;
  lastReferral: string;
  status: "active" | "inactive" | "new";
  preferredInsurance: string[];
}

const mockReferrers: Referrer[] = [
  {
    id: "1",
    name: "Dr. James Anderson",
    specialty: "Primary Care",
    practice: "Anderson Family Medicine",
    phone: "(555) 100-2000",
    email: "j.anderson@afm.com",
    address: "123 Medical Plaza, Suite 100",
    totalReferrals: 42,
    activeReferrals: 8,
    lastReferral: "2 days ago",
    status: "active",
    preferredInsurance: ["Blue Cross Blue Shield", "Aetna", "UnitedHealthcare"]
  },
  {
    id: "2",
    name: "Dr. Lisa Chen",
    specialty: "Orthopedic Surgery",
    practice: "Ortho Specialists Group",
    phone: "(555) 200-3000",
    email: "l.chen@osg.com",
    address: "456 Health Center Dr, Suite 200",
    totalReferrals: 38,
    activeReferrals: 12,
    lastReferral: "5 hours ago",
    status: "active",
    preferredInsurance: ["Medicare", "Cigna", "Blue Cross Blue Shield"]
  },
  {
    id: "3",
    name: "Dr. Michael Rodriguez",
    specialty: "Sports Medicine",
    practice: "Sports Health Institute",
    phone: "(555) 300-4000",
    email: "m.rodriguez@shi.com",
    address: "789 Wellness Blvd, Floor 3",
    totalReferrals: 31,
    activeReferrals: 6,
    lastReferral: "1 week ago",
    status: "active",
    preferredInsurance: ["Aetna", "UnitedHealthcare", "Humana"]
  },
  {
    id: "4",
    name: "Dr. Emily Thompson",
    specialty: "Neurology",
    practice: "Neuroscience Medical Center",
    phone: "(555) 400-5000",
    email: "e.thompson@nmc.com",
    address: "321 Medical Pkwy, Building B",
    totalReferrals: 15,
    activeReferrals: 3,
    lastReferral: "3 weeks ago",
    status: "new",
    preferredInsurance: ["Blue Cross Blue Shield", "Medicare"]
  },
  {
    id: "5",
    name: "Dr. Robert Kim",
    specialty: "Pain Management",
    practice: "Advanced Pain Solutions",
    phone: "(555) 500-6000",
    email: "r.kim@aps.com",
    address: "654 Care Center Ln",
    totalReferrals: 8,
    activeReferrals: 0,
    lastReferral: "2 months ago",
    status: "inactive",
    preferredInsurance: ["Workers Comp", "Cigna"]
  }
];

const mockActivities: Record<string, Activity[]> = {
  "1": [
    {
      id: "a1",
      type: "referral",
      title: "New Patient Referral",
      description: "Referred patient with lower back pain",
      timestamp: "2 days ago",
      patientName: "Michael Davis"
    },
    {
      id: "a2",
      type: "call",
      title: "Follow-up Call",
      description: "Discussed treatment progress for recent referrals",
      timestamp: "1 week ago"
    },
    {
      id: "a3",
      type: "referral",
      title: "New Patient Referral",
      description: "Post-surgical rehabilitation case",
      timestamp: "1 week ago",
      patientName: "Jennifer Lee"
    },
    {
      id: "a4",
      type: "email",
      title: "Treatment Update Sent",
      description: "Sent progress report for 3 active patients",
      timestamp: "2 weeks ago"
    },
    {
      id: "a5",
      type: "meeting",
      title: "In-Person Meeting",
      description: "Quarterly partnership review meeting",
      timestamp: "3 weeks ago"
    },
    {
      id: "a6",
      type: "referral",
      title: "New Patient Referral",
      description: "Chronic pain management case",
      timestamp: "1 month ago",
      patientName: "Robert Martinez"
    }
  ]
};

const activityIcons = {
  referral: TrendingUp,
  call: Phone,
  meeting: Calendar,
  email: Mail
};

const activityColors = {
  referral: "bg-success",
  call: "bg-primary",
  meeting: "bg-accent",
  email: "bg-info"
};

export default function Referrers() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReferrer, setSelectedReferrer] = useState<Referrer | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Auto-open referrer profile if ID is in URL
  useEffect(() => {
    const referrerId = searchParams.get('id');
    if (referrerId) {
      const referrer = mockReferrers.find(r => r.id === referrerId);
      if (referrer) {
        setSelectedReferrer(referrer);
        setSheetOpen(true);
      }
    }
  }, [searchParams]);

  const filteredReferrers = mockReferrers.filter(referrer =>
    referrer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    referrer.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
    referrer.practice.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReferrerClick = (referrer: Referrer) => {
    setSelectedReferrer(referrer);
    setSheetOpen(true);
  };

  return (
    <Layout>
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-foreground">Referrer Directory</h2>
          <p className="text-muted-foreground mt-1">Manage referring physicians and partners</p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search referrers by name, specialty, or practice..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Referrer List */}
        <div className="grid gap-4">
          {filteredReferrers.map((referrer) => (
            <Card 
              key={referrer.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleReferrerClick(referrer)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">{referrer.name}</h3>
                      <Badge variant={referrer.status === "active" ? "default" : referrer.status === "new" ? "secondary" : "outline"}>
                        {referrer.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Specialty</p>
                        <p className="font-medium">{referrer.specialty}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Practice</p>
                        <p className="font-medium">{referrer.practice}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Referrals</p>
                        <p className="font-medium">{referrer.totalReferrals}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Active Referrals</p>
                        <p className="font-medium">{referrer.activeReferrals}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        Last Referral: <span className="text-foreground font-medium">{referrer.lastReferral}</span>
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Referrer Profile Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent className="w-full sm:max-w-2xl">
            {selectedReferrer && (
              <>
                <SheetHeader>
                  <SheetTitle className="text-2xl">{selectedReferrer.name}</SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Referrer Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Provider Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Specialty</p>
                          <p className="font-medium">{selectedReferrer.specialty}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <Badge variant={selectedReferrer.status === "active" ? "default" : "outline"}>
                            {selectedReferrer.status}
                          </Badge>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Practice</p>
                          <p className="font-medium">{selectedReferrer.practice}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm text-muted-foreground">Address</p>
                          <p className="font-medium">{selectedReferrer.address}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Phone</p>
                          <p className="font-medium">{selectedReferrer.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium text-sm">{selectedReferrer.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Referral Stats */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Referral Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold text-foreground">{selectedReferrer.totalReferrals}</p>
                          <p className="text-sm text-muted-foreground">Total Referrals</p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold text-foreground">{selectedReferrer.activeReferrals}</p>
                          <p className="text-sm text-muted-foreground">Active Cases</p>
                        </div>
                        <div className="text-center p-4 bg-muted/50 rounded-lg">
                          <p className="text-2xl font-bold text-foreground">
                            {selectedReferrer.totalReferrals > 0 
                              ? Math.round((selectedReferrer.activeReferrals / selectedReferrer.totalReferrals) * 100) 
                              : 0}%
                          </p>
                          <p className="text-sm text-muted-foreground">Conversion</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Preferred Insurance</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedReferrer.preferredInsurance.map((ins, idx) => (
                            <Badge key={idx} variant="outline">{ins}</Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Activity Timeline */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Activity Timeline</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px] pr-4">
                        <div className="space-y-4">
                          {mockActivities[selectedReferrer.id]?.map((activity) => {
                            const Icon = activityIcons[activity.type];
                            
                            return (
                              <div key={activity.id} className="flex gap-4">
                                <div className="relative">
                                  <div className={`rounded-full p-2 ${activityColors[activity.type]} text-white`}>
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  {activity.id !== mockActivities[selectedReferrer.id][mockActivities[selectedReferrer.id].length - 1].id && (
                                    <div className="absolute left-1/2 top-10 bottom-0 w-0.5 bg-border -translate-x-1/2" />
                                  )}
                                </div>
                                
                                <div className="flex-1 pb-8">
                                  <div className="flex items-start justify-between mb-1">
                                    <div>
                                      <p className="font-semibold text-foreground">{activity.title}</p>
                                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                                      {activity.patientName && (
                                        <p className="text-sm text-muted-foreground mt-1">
                                          Patient: <span className="font-medium">{activity.patientName}</span>
                                        </p>
                                      )}
                                    </div>
                                    <Badge variant="outline" className="ml-2 capitalize">
                                      {activity.type}
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
}