import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, User, Phone, Mail, Calendar, AlertCircle, CheckCircle2 } from "lucide-react";
import { Patient, PatientMatchResult } from "@/types/patient";

interface PatientSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPatient: (patient: Patient) => void;
  onCreateNew: () => void;
  searchCriteria?: {
    name?: string;
    phone?: string;
    email?: string;
    dateOfBirth?: string;
  };
}

// Mock function to search for patients - replace with actual API call
const searchPatients = async (criteria: {
  name?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
}): Promise<PatientMatchResult[]> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock results
  const mockResults: PatientMatchResult[] = [];
  
  if (criteria.phone?.includes("123-4567")) {
    mockResults.push({
      patient: {
        id: "1",
        firstName: "John",
        lastName: "Smith",
        dateOfBirth: "1985-03-15",
        gender: "male",
        primaryPhone: "(555) 123-4567",
        email: "john.smith@email.com",
        primaryInsurance: {
          company: "Blue Cross Blue Shield",
          memberId: "ABC123456",
        },
        hipaaConsentSigned: true,
        treatmentConsentSigned: true,
        communicationConsent: {
          phone: true,
          email: true,
          text: true,
        },
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "system",
        updatedBy: "system",
      },
      matchScore: 95,
      matchReasons: ["Exact phone match", "Similar name"],
    });
  }
  
  if (criteria.name?.toLowerCase().includes("sarah")) {
    mockResults.push({
      patient: {
        id: "2",
        firstName: "Sarah",
        lastName: "Johnson",
        dateOfBirth: "1990-07-22",
        gender: "female",
        primaryPhone: "(555) 234-5678",
        email: "sarah.j@email.com",
        primaryInsurance: {
          company: "Aetna",
          memberId: "AET987654",
        },
        hipaaConsentSigned: true,
        treatmentConsentSigned: true,
        communicationConsent: {
          phone: true,
          email: true,
          text: true,
        },
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: "system",
        updatedBy: "system",
      },
      matchScore: 75,
      matchReasons: ["Name similarity"],
    });
  }
  
  return mockResults;
};

export function PatientSearchModal({
  isOpen,
  onClose,
  onSelectPatient,
  onCreateNew,
  searchCriteria,
}: PatientSearchModalProps) {
  const [searchName, setSearchName] = useState(searchCriteria?.name || "");
  const [searchPhone, setSearchPhone] = useState(searchCriteria?.phone || "");
  const [searchDOB, setSearchDOB] = useState(searchCriteria?.dateOfBirth || "");
  const [searchResults, setSearchResults] = useState<PatientMatchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    
    try {
      const results = await searchPatients({
        name: searchName,
        phone: searchPhone,
        dateOfBirth: searchDOB,
      });
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching patients:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectPatient = (patient: Patient) => {
    onSelectPatient(patient);
    onClose();
  };

  const handleCreateNew = () => {
    onCreateNew();
    onClose();
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "bg-success text-success-foreground";
    if (score >= 70) return "bg-warning text-warning-foreground";
    return "bg-secondary text-secondary-foreground";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search for Existing Patient
          </DialogTitle>
          <DialogDescription>
            Before creating a new patient, let's check if they already exist in the system.
            This helps prevent duplicate records.
          </DialogDescription>
        </DialogHeader>

        {/* Search Form */}
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="searchName">Name</Label>
              <Input
                id="searchName"
                placeholder="First or Last Name"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="searchPhone">Phone Number</Label>
              <Input
                id="searchPhone"
                placeholder="(555) 123-4567"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="searchDOB">Date of Birth</Label>
              <Input
                id="searchDOB"
                type="date"
                value={searchDOB}
                onChange={(e) => setSearchDOB(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          </div>

          <Button 
            onClick={handleSearch} 
            disabled={isSearching || (!searchName && !searchPhone && !searchDOB)}
            className="w-full"
          >
            <Search className="h-4 w-4 mr-2" />
            {isSearching ? "Searching..." : "Search Patients"}
          </Button>
        </div>

        {/* Search Results */}
        {hasSearched && (
          <div className="space-y-4">
            {searchResults.length === 0 ? (
              <Card className="bg-muted/50">
                <CardContent className="p-6 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-success" />
                  <h3 className="font-semibold mb-2">No Matches Found</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    No existing patients match your search criteria. You can proceed to create a new patient record.
                  </p>
                  <Button onClick={handleCreateNew}>
                    Create New Patient
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    Found {searchResults.length} Potential Match{searchResults.length > 1 ? "es" : ""}
                  </h3>
                </div>

                <div className="space-y-3">
                  {searchResults.map((result) => (
                    <Card 
                      key={result.patient.id} 
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleSelectPatient(result.patient)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-full">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-lg">
                                {result.patient.firstName} {result.patient.lastName}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge 
                                  variant="outline" 
                                  className={getMatchScoreColor(result.matchScore)}
                                >
                                  {result.matchScore}% Match
                                </Badge>
                                <Badge variant="outline">
                                  {result.patient.status}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>DOB: {new Date(result.patient.dateOfBirth).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{result.patient.primaryPhone}</span>
                          </div>
                          {result.patient.email && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="h-4 w-4" />
                              <span>{result.patient.email}</span>
                            </div>
                          )}
                          {result.patient.primaryInsurance && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <span className="font-medium">Insurance:</span>
                              <span>{result.patient.primaryInsurance.company}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs text-muted-foreground">Match reasons:</span>
                          {result.matchReasons.map((reason, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {reason}
                            </Badge>
                          ))}
                        </div>

                        <Button 
                          className="w-full mt-4" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectPatient(result.patient);
                          }}
                        >
                          This is the Patient
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-3">
                    None of these patients match? You can create a new patient record.
                  </p>
                  <Button variant="outline" onClick={handleCreateNew} className="w-full">
                    Not a Match - Create New Patient
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

