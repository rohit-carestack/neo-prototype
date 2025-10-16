import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Delete, PhoneCall, Mic, MicOff, Volume2, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface DialPadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DialPadModal({ open, onOpenChange }: DialPadModalProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digit characters
    const cleaned = value.replace(/\D/g, "");
    
    // Format as (XXX) XXX-XXXX
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handleNumberClick = (digit: string) => {
    if (!isCallActive && phoneNumber.replace(/\D/g, "").length < 10) {
      const newNumber = phoneNumber.replace(/\D/g, "") + digit;
      setPhoneNumber(formatPhoneNumber(newNumber));
    }
  };

  const handleDelete = () => {
    const cleaned = phoneNumber.replace(/\D/g, "");
    const newNumber = cleaned.slice(0, -1);
    setPhoneNumber(formatPhoneNumber(newNumber));
  };

  const handleCall = () => {
    if (phoneNumber.replace(/\D/g, "").length === 10) {
      setIsCallActive(true);
    }
  };

  const handleHangup = () => {
    setIsCallActive(false);
    setCallDuration(0);
    setPhoneNumber("");
    setIsMuted(false);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const dialPadButtons = [
    { digit: "1", letters: "" },
    { digit: "2", letters: "ABC" },
    { digit: "3", letters: "DEF" },
    { digit: "4", letters: "GHI" },
    { digit: "5", letters: "JKL" },
    { digit: "6", letters: "MNO" },
    { digit: "7", letters: "PQRS" },
    { digit: "8", letters: "TUV" },
    { digit: "9", letters: "WXYZ" },
    { digit: "*", letters: "" },
    { digit: "0", letters: "+" },
    { digit: "#", letters: "" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold">Dialpad</span>
            </div>
            {isCallActive && (
              <Badge className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 font-mono text-sm">
                {formatDuration(callDuration)}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-5">
          {/* Phone Number Display */}
          <div className="space-y-3">
            <div className="relative bg-muted/50 rounded-xl border p-4 min-h-[60px] flex items-center">
              <input
                value={phoneNumber}
                readOnly
                placeholder="Enter number"
                className="w-full text-center text-2xl font-semibold tracking-wide bg-transparent border-0 outline-none placeholder:text-muted-foreground/40"
              />
              {phoneNumber && !isCallActive && (
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-7 w-7 rounded-lg hover:bg-background flex items-center justify-center transition-colors"
                  onClick={handleDelete}
                >
                  <Delete className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
            
            {isCallActive && (
              <div className="flex items-center justify-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-200 dark:border-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400">Call Active</span>
                </div>
              </div>
            )}
          </div>

          {/* Dial Pad */}
          {!isCallActive && (
            <div className="grid grid-cols-3 gap-3 py-2">
              {dialPadButtons.map(({ digit, letters }) => (
                <button
                  key={digit}
                  className={cn(
                    "relative h-[68px] rounded-lg",
                    "bg-card border",
                    "hover:bg-muted/50 hover:border-primary/20",
                    "active:scale-[0.97]",
                    "transition-all duration-100",
                    "flex flex-col items-center justify-center gap-0.5"
                  )}
                  onClick={() => handleNumberClick(digit)}
                >
                  <span className="text-2xl font-semibold">
                    {digit}
                  </span>
                  {letters && (
                    <span className="text-[9px] font-medium text-muted-foreground tracking-widest">
                      {letters}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-4 py-2">
            {isCallActive ? (
              <>
                <button
                  className={cn(
                    "h-14 w-14 rounded-full border-2",
                    "hover:bg-muted",
                    "transition-all duration-100",
                    "active:scale-95",
                    isMuted ? "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-800" : "bg-card"
                  )}
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? (
                    <MicOff className="h-5 w-5 text-red-600 dark:text-red-400 mx-auto" />
                  ) : (
                    <Mic className="h-5 w-5 mx-auto" />
                  )}
                </button>
                
                <button className="h-14 w-14 rounded-full border-2 bg-card hover:bg-muted transition-all duration-100 active:scale-95">
                  <Volume2 className="h-5 w-5 mx-auto" />
                </button>

                <button
                  className="h-16 w-16 rounded-full bg-red-600 hover:bg-red-700 transition-all duration-100 active:scale-95 shadow-lg"
                  onClick={handleHangup}
                >
                  <PhoneCall className="h-6 w-6 text-white rotate-135 mx-auto" />
                </button>
              </>
            ) : (
              <button
                className={cn(
                  "h-16 w-16 rounded-full",
                  "bg-green-600 hover:bg-green-700",
                  "shadow-md",
                  "transition-all duration-100",
                  "active:scale-95",
                  "disabled:opacity-40 disabled:cursor-not-allowed"
                )}
                onClick={handleCall}
                disabled={phoneNumber.replace(/\D/g, "").length !== 10}
              >
                <Phone className="h-6 w-6 text-white mx-auto" />
              </button>
            )}
          </div>

          {/* Quick Dial Suggestions (Mock) */}
          {!isCallActive && (
            <div className="space-y-2 pt-2 border-t">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Recent</p>
              <div className="space-y-1">
                {[
                  { name: "John Smith", number: "(555) 123-4567" },
                  { name: "Sarah Johnson", number: "(555) 234-5678" },
                  { name: "Insurance Dept", number: "(555) 999-0000" },
                ].map((contact) => (
                  <button
                    key={contact.number}
                    className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted transition-colors"
                    onClick={() => setPhoneNumber(contact.number)}
                  >
                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium">{contact.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{contact.number}</p>
                    </div>
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

