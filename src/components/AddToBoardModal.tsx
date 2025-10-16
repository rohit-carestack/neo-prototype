/**
 * AddToBoardModal Component
 * 
 * Modal to add a fax/lead to either Opportunities Board or Tasks & To-Do Board.
 * Shows a preview of the card and allows editing before adding.
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Building2, CheckSquare, FileText, User, Shield, Users, Clock, Phone, Eye } from 'lucide-react';

const agents = [
  "Sarah Wilson",
  "Michael Chen", 
  "Lisa Johnson",
  "Amanda Rodriguez",
  "James Thompson"
];

export interface AddToBoardData {
  board: "opportunity" | "todo";
  assignedAgent: string;
  notes: string;
  priority: "low" | "medium" | "high" | "urgent";
  dueDate?: string;
  // Editable card data
  patientName: string;
  condition?: string;
  phone?: string;
  insurance?: string;
  referrer?: string;
}

export interface AddToBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: AddToBoardData) => void;
  patientName?: string;
  condition?: string;
  phone?: string;
  insurance?: string;
  referrer?: string;
  sourceDocument?: {
    type: 'fax' | 'web' | 'call';
    id: string;
    name?: string;
  };
}

/**
 * Preview of how the card will look on the Opportunities Board
 */
function OpportunityCardPreview({ data, agent }: { data: AddToBoardData; agent: string }) {
  return (
    <Card className="w-full border-2 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
              FAX
            </Badge>
          </div>
        </div>

        <h4 className="font-semibold text-foreground text-base mb-1">
          {data.patientName || "Patient Name"}
        </h4>
        {data.condition && (
          <p className="text-sm text-muted-foreground mb-3">{data.condition}</p>
        )}
        
        <div className="space-y-2 mb-3">
          {data.referrer && (
            <div className="flex items-center text-xs text-muted-foreground">
              <User className="h-3 w-3 mr-1.5 flex-shrink-0" />
              <span>{data.referrer}</span>
            </div>
          )}
          {data.phone && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Phone className="h-3 w-3 mr-1.5 flex-shrink-0" />
              <span>{data.phone}</span>
            </div>
          )}
          {data.insurance && (
            <div className="flex items-center text-xs text-muted-foreground">
              <Shield className="h-3 w-3 mr-1.5 flex-shrink-0" />
              <span>{data.insurance}</span>
            </div>
          )}
        </div>

        {agent && (
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 mb-2">
            <Users className="h-3 w-3 mr-1" />
            {agent}
          </Badge>
        )}

        <div className="text-xs text-muted-foreground pt-2 border-t">
          <Clock className="h-3 w-3 inline mr-1" />
          Added just now
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Preview of how the card will look on the Tasks & To-Do Board
 */
function TodoCardPreview({ data, agent }: { data: AddToBoardData; agent: string }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'low': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  const getPriorityBorderColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500';
      case 'high': return 'border-l-orange-500';
      case 'medium': return 'border-l-blue-500';
      case 'low': return 'border-l-gray-400';
      default: return 'border-l-blue-500';
    }
  };

  return (
    <Card className={`w-full border-2 shadow-sm hover:shadow-md transition-shadow border-l-4 ${getPriorityBorderColor(data.priority)}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-amber-600" />
            <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
              Fax Processing
            </Badge>
          </div>
          <Badge variant="outline" className={`text-xs ${getPriorityColor(data.priority)}`}>
            {data.priority.charAt(0).toUpperCase() + data.priority.slice(1)}
          </Badge>
        </div>

        <h4 className="font-semibold text-foreground text-base mb-2">
          Process Fax: {data.patientName || "New Fax"}
        </h4>
        
        {data.notes && (
          <p className="text-sm text-muted-foreground mb-3 p-2 bg-muted/30 rounded border-l-2 border-amber-400">
            {data.notes}
          </p>
        )}

        {data.condition && (
          <p className="text-xs text-muted-foreground mb-2">
            <strong className="text-foreground">Condition:</strong> {data.condition}
          </p>
        )}

        {agent && (
          <Badge variant="outline" className="text-xs bg-primary/10 text-primary border-primary/20 mb-2">
            <User className="h-3 w-3 mr-1" />
            {agent}
          </Badge>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Added just now
          </div>
          {data.dueDate && (
            <div className="flex items-center text-amber-700">
              <Clock className="h-3 w-3 mr-1" />
              Due {new Date(data.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AddToBoardModal({
  isOpen,
  onClose,
  onConfirm,
  patientName: initialPatientName,
  condition: initialCondition,
  phone: initialPhone,
  insurance: initialInsurance,
  referrer: initialReferrer,
  sourceDocument,
}: AddToBoardModalProps) {
  const [selectedBoard, setSelectedBoard] = useState<"opportunity" | "todo" | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [dueDate, setDueDate] = useState<string>("");
  
  // Editable card data
  const [patientName, setPatientName] = useState(initialPatientName || "");
  const [condition, setCondition] = useState(initialCondition || "");
  const [phone, setPhone] = useState(initialPhone || "");
  const [insurance, setInsurance] = useState(initialInsurance || "");
  const [referrer, setReferrer] = useState(initialReferrer || "");

  const handleConfirm = () => {
    if (!selectedBoard || !selectedAgent || !patientName) {
      return;
    }
    
    onConfirm({
      board: selectedBoard,
      assignedAgent: selectedAgent,
      notes,
      priority,
      dueDate,
      patientName,
      condition,
      phone,
      insurance,
      referrer,
    });
    
    // Reset form
    handleReset();
  };

  const handleReset = () => {
    setSelectedBoard(null);
    setSelectedAgent("");
    setNotes("");
    setPriority("medium");
    setDueDate("");
    setPatientName(initialPatientName || "");
    setCondition(initialCondition || "");
    setPhone(initialPhone || "");
    setInsurance(initialInsurance || "");
    setReferrer(initialReferrer || "");
  };

  const handleCancel = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add to Board</DialogTitle>
          <DialogDescription>
            Choose a board, edit the card details, and assign to an agent.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-1">
          <div className="grid grid-cols-2 gap-6">
            {/* Left side - Form */}
            <div className="space-y-4 px-1">
              {/* Board Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Board *</Label>
                <div className="grid grid-cols-2 gap-3 p-0.5">
                  <Button
                    variant={selectedBoard === "opportunity" ? "default" : "outline"}
                    className="w-full h-24 flex flex-col gap-2 hover:border-primary transition-colors"
                    onClick={() => setSelectedBoard("opportunity")}
                  >
                    <Building2 className="h-6 w-6" />
                    <div className="text-center">
                      <div className="text-sm font-semibold">Opportunities</div>
                      <div className="text-xs text-muted-foreground">Patient leads</div>
                    </div>
                  </Button>
                  <Button
                    variant={selectedBoard === "todo" ? "default" : "outline"}
                    className="w-full h-24 flex flex-col gap-2 hover:border-primary transition-colors"
                    onClick={() => setSelectedBoard("todo")}
                  >
                    <CheckSquare className="h-6 w-6" />
                    <div className="text-center">
                      <div className="text-sm font-semibold">Tasks & To-Do</div>
                      <div className="text-xs text-muted-foreground">Action items</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* Helpful message when no board selected */}
              {!selectedBoard && (
                <div className="border-2 border-dashed rounded-lg p-6 text-center space-y-3">
                  <div className="flex justify-center gap-3">
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                    <CheckSquare className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Choose a Board</h4>
                    <p className="text-sm text-muted-foreground">
                      Select Opportunities for patient leads or Tasks & To-Do for action items
                    </p>
                  </div>
                </div>
              )}

              {/* Editable Card Fields */}
              {selectedBoard && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="patientName">Patient Name *</Label>
                    <Input
                      id="patientName"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter patient name..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="condition">Condition/Diagnosis</Label>
                    <Input
                      id="condition"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value)}
                      placeholder="E.g., Lower back pain, Post-surgical rehab..."
                    />
                  </div>

                  {/* Priority - show for all boards */}
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Due Date - primarily for To-Do board */}
                  {selectedBoard === "todo" && (
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date (Optional)</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                      />
                    </div>
                  )}

                  {selectedBoard === "opportunity" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="referrer">Referring Provider</Label>
                        <Input
                          id="referrer"
                          value={referrer}
                          onChange={(e) => setReferrer(e.target.value)}
                          placeholder="E.g., Dr. Smith, Orthopedic Center..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="(555) 123-4567"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="insurance">Insurance</Label>
                        <Input
                          id="insurance"
                          value={insurance}
                          onChange={(e) => setInsurance(e.target.value)}
                          placeholder="E.g., Blue Cross, Medicare..."
                        />
                      </div>
                    </>
                  )}

                  {/* Agent Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="agent">Assign to Agent *</Label>
                    <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                      <SelectTrigger id="agent">
                        <SelectValue placeholder="Choose an agent..." />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent} value={agent}>
                            {agent}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any notes about this case..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>

            {/* Right side - Card Preview */}
            <div className="border-l pl-6">
              <Label className="text-sm font-medium mb-3 block flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Card Preview
              </Label>
              {selectedBoard ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-3">
                    This is how your card will appear on the board:
                  </p>
                  {selectedBoard === "opportunity" ? (
                    <OpportunityCardPreview 
                      data={{
                        board: selectedBoard,
                        assignedAgent: selectedAgent,
                        notes,
                        priority,
                        dueDate,
                        patientName,
                        condition,
                        phone,
                        insurance,
                        referrer,
                      }} 
                      agent={selectedAgent}
                    />
                  ) : (
                    <TodoCardPreview 
                      data={{
                        board: selectedBoard,
                        assignedAgent: selectedAgent,
                        notes,
                        priority,
                        dueDate,
                        patientName,
                        condition,
                        phone,
                        insurance,
                        referrer,
                      }} 
                      agent={selectedAgent}
                    />
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-8 space-y-4 bg-muted/20">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Eye className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">Preview Your Card</h4>
                    <p className="text-sm text-muted-foreground">
                      Select a board to see how your card<br/>will look on the board
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedBoard || !selectedAgent || !patientName}
          >
            Add to {selectedBoard === "opportunity" ? "Opportunities" : "Tasks & To-Do"} Board
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Legacy function for backwards compatibility
 * Just extracts basic info from fax data
 */
export function createOpportunityFromFax(faxData: any): any {
  return {
    patientName: faxData.patientName || '',
    source: 'fax',
  };
}
