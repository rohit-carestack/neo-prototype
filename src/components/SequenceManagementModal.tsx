/**
 * SequenceManagementModal Component
 * 
 * Standardized modal for managing sequences across the product.
 * Shows active sequences and allows starting new ones.
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
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { 
  Workflow, 
  Plus, 
  CheckCircle2, 
  Clock, 
  Pause, 
  XCircle,
  Sparkles,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { sequences, type ActiveSequence, type SequenceConfig } from '../config/sequences';

interface SequenceManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSequence: (sequence: SequenceConfig, contextData?: Record<string, any>) => void;
  activeSequences?: ActiveSequence[];
  patientName?: string;
  entityType?: "patient" | "lead" | "fax";
}

export function SequenceManagementModal({
  isOpen,
  onClose,
  onStartSequence,
  activeSequences = [],
  patientName,
  entityType = "patient"
}: SequenceManagementModalProps) {
  const [view, setView] = useState<"overview" | "select" | "configure">("overview");
  const [selectedSequence, setSelectedSequence] = useState<SequenceConfig | null>(null);
  const [contextData, setContextData] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState("");

  const handleClose = () => {
    setView("overview");
    setSelectedSequence(null);
    setContextData({});
    setSearchTerm("");
    onClose();
  };

  const handleSelectSequence = (sequence: SequenceConfig) => {
    setSelectedSequence(sequence);
    if (sequence.contextFields.length > 0) {
      setView("configure");
    } else {
      // No configuration needed, start immediately
      onStartSequence(sequence);
      handleClose();
    }
  };

  const handleStartSequence = () => {
    if (selectedSequence) {
      onStartSequence(selectedSequence, contextData);
      handleClose();
    }
  };

  const filteredSequences = sequences.filter(seq =>
    seq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seq.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: ActiveSequence['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-300';
      case 'paused':
        return 'bg-amber-50 text-amber-700 border-amber-300';
      case 'completed':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-300';
    }
  };

  const getStatusIcon = (status: ActiveSequence['status']) => {
    switch (status) {
      case 'active':
        return <Clock className="h-3 w-3" />;
      case 'paused':
        return <Pause className="h-3 w-3" />;
      case 'completed':
        return <CheckCircle2 className="h-3 w-3" />;
      case 'failed':
        return <XCircle className="h-3 w-3" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {view === "configure" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 mr-2"
                onClick={() => setView("select")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <Workflow className="h-5 w-5" />
            {view === "overview" && "Sequence Management"}
            {view === "select" && "Start New Sequence"}
            {view === "configure" && `Configure: ${selectedSequence?.name}`}
          </DialogTitle>
          <DialogDescription>
            {view === "overview" && patientName && `Manage sequences for ${patientName}`}
            {view === "select" && "Choose a sequence to start"}
            {view === "configure" && "Provide required information for this sequence"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {/* Overview: Show active sequences + CTA */}
          {view === "overview" && (
            <div className="space-y-4">
              {/* Active Sequences */}
              {activeSequences.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Active Sequences ({activeSequences.length})</h3>
                  </div>
                  <div className="space-y-2">
                    {activeSequences.map((seq) => (
                      <Card key={seq.sequenceId} className="hover:border-primary/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">{seq.sequenceName}</h4>
                                <Badge variant="outline" className={`text-xs ${getStatusColor(seq.status)}`}>
                                  {getStatusIcon(seq.status)}
                                  <span className="ml-1 capitalize">{seq.status}</span>
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Step {seq.currentStep} of {seq.totalSteps}</span>
                                <span>•</span>
                                <span>Started {seq.enrolledDate}</span>
                              </div>
                              {seq.nextAction && (
                                <div className="mt-2 text-xs">
                                  <span className="text-muted-foreground">Next: </span>
                                  <span className="text-foreground font-medium">{seq.nextAction}</span>
                                  {seq.nextActionDate && (
                                    <span className="text-muted-foreground"> on {seq.nextActionDate}</span>
                                  )}
                                </div>
                              )}
                            </div>
                            <Button variant="ghost" size="sm" className="h-8">
                              View
                              <ChevronRight className="h-3 w-3 ml-1" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Card className="border-dashed">
                  <CardContent className="p-6 text-center">
                    <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <h3 className="font-medium mb-1">No Active Sequences</h3>
                    <p className="text-sm text-muted-foreground">
                      This {entityType} is not enrolled in any sequences yet.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* CTA to Start New Sequence */}
              <Button
                className="w-full"
                size="lg"
                onClick={() => setView("select")}
              >
                <Plus className="h-4 w-4 mr-2" />
                Start New Sequence
              </Button>
            </div>
          )}

          {/* Select: Show list of available sequences */}
          {view === "select" && (
            <div className="space-y-4">
              <Input
                placeholder="Search sequences..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {filteredSequences.map((sequence) => {
                    const isActive = activeSequences.some(
                      (active) => active.sequenceId === sequence.id
                    );

                    return (
                      <Card
                        key={sequence.id}
                        className={`cursor-pointer transition-all hover:border-primary ${
                          isActive ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        onClick={() => !isActive && handleSelectSequence(sequence)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium text-sm">{sequence.name}</h4>
                                {sequence.isAI && (
                                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                    <Sparkles className="h-2.5 w-2.5 mr-1" />
                                    AI
                                  </Badge>
                                )}
                                {isActive && (
                                  <Badge variant="outline" className="text-xs">
                                    Already Active
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{sequence.description}</p>
                              {sequence.contextFields.length > 0 && (
                                <div className="mt-2 text-xs text-muted-foreground">
                                  Requires configuration
                                </div>
                              )}
                            </div>
                            {!isActive && (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Configure: Show context fields for selected sequence */}
          {view === "configure" && selectedSequence && (
            <div className="space-y-4">
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Workflow className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <h4 className="font-medium text-sm mb-1">{selectedSequence.name}</h4>
                      <p className="text-xs text-muted-foreground">{selectedSequence.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {selectedSequence.contextFields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                      {field.label}
                      {field.required && <span className="text-destructive ml-1">*</span>}
                    </Label>
                    <Input
                      id={field.name}
                      type={field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
                      placeholder={field.placeholder}
                      value={contextData[field.name] || ""}
                      onChange={(e) =>
                        setContextData((prev) => ({ ...prev, [field.name]: e.target.value }))
                      }
                      required={field.required}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {view === "overview" && (
            <Button variant="outline" onClick={handleClose}>
              Close
            </Button>
          )}
          {view === "select" && (
            <Button variant="outline" onClick={() => setView("overview")}>
              Back
            </Button>
          )}
          {view === "configure" && (
            <>
              <Button variant="outline" onClick={() => setView("select")}>
                Back
              </Button>
              <Button onClick={handleStartSequence}>
                Start Sequence
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
