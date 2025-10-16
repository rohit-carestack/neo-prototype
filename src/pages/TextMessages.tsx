import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/contexts/UserRoleContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageCircle,
  Search,
  Send,
  Phone,
  User,
  Clock,
  CheckCheck,
  Check,
  Plus,
  Filter,
  MoreVertical,
  Archive,
  Star,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  direction: "inbound" | "outbound";
  status: "sent" | "delivered" | "read" | "failed";
  sender?: string;
}

interface Conversation {
  id: string;
  patientName: string;
  phoneNumber: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  status: "active" | "archived";
  starred: boolean;
  messages: Message[];
}

// Mock data
const mockConversations: Conversation[] = [
  {
    id: "1",
    patientName: "Sarah Johnson",
    phoneNumber: "(555) 123-4567",
    lastMessage: "Thank you! I'll be there at 2 PM.",
    lastMessageTime: "2024-03-15T14:30:00",
    unreadCount: 0,
    status: "active",
    starred: true,
    messages: [
      {
        id: "1",
        text: "Hi Sarah, this is PT Clinic. Your appointment is scheduled for tomorrow at 2 PM. Please reply to confirm.",
        timestamp: "2024-03-15T14:15:00",
        direction: "outbound",
        status: "read"
      },
      {
        id: "2",
        text: "Thank you! I'll be there at 2 PM.",
        timestamp: "2024-03-15T14:30:00",
        direction: "inbound",
        status: "delivered"
      }
    ]
  },
  {
    id: "2",
    patientName: "Michael Chen",
    phoneNumber: "(555) 234-5678",
    lastMessage: "Do I need to bring anything?",
    lastMessageTime: "2024-03-15T13:45:00",
    unreadCount: 2,
    status: "active",
    starred: false,
    messages: [
      {
        id: "1",
        text: "Hi Michael, your evaluation is scheduled for next Monday at 10 AM.",
        timestamp: "2024-03-15T13:30:00",
        direction: "outbound",
        status: "delivered"
      },
      {
        id: "2",
        text: "Great, thanks!",
        timestamp: "2024-03-15T13:40:00",
        direction: "inbound",
        status: "delivered"
      },
      {
        id: "3",
        text: "Do I need to bring anything?",
        timestamp: "2024-03-15T13:45:00",
        direction: "inbound",
        status: "delivered"
      }
    ]
  },
  {
    id: "3",
    patientName: "Emily Rodriguez",
    phoneNumber: "(555) 345-6789",
    lastMessage: "Appointment reminder for Emily Rodriguez",
    lastMessageTime: "2024-03-15T12:00:00",
    unreadCount: 0,
    status: "active",
    starred: false,
    messages: [
      {
        id: "1",
        text: "Appointment reminder for Emily Rodriguez",
        timestamp: "2024-03-15T12:00:00",
        direction: "outbound",
        status: "delivered"
      }
    ]
  },
  {
    id: "4",
    patientName: "David Thompson",
    phoneNumber: "(555) 456-7890",
    lastMessage: "Can I reschedule to next week?",
    lastMessageTime: "2024-03-15T11:30:00",
    unreadCount: 1,
    status: "active",
    starred: false,
    messages: [
      {
        id: "1",
        text: "Hi David, your PT session is tomorrow at 3 PM.",
        timestamp: "2024-03-15T11:00:00",
        direction: "outbound",
        status: "read"
      },
      {
        id: "2",
        text: "Can I reschedule to next week?",
        timestamp: "2024-03-15T11:30:00",
        direction: "inbound",
        status: "delivered"
      }
    ]
  },
  {
    id: "5",
    patientName: "Lisa Anderson",
    phoneNumber: "(555) 567-8901",
    lastMessage: "Thank you for the reminder!",
    lastMessageTime: "2024-03-15T10:15:00",
    unreadCount: 0,
    status: "active",
    starred: true,
    messages: [
      {
        id: "1",
        text: "Hi Lisa, reminder: your follow-up is on Friday at 1 PM.",
        timestamp: "2024-03-15T10:00:00",
        direction: "outbound",
        status: "read"
      },
      {
        id: "2",
        text: "Thank you for the reminder!",
        timestamp: "2024-03-15T10:15:00",
        direction: "inbound",
        status: "delivered"
      }
    ]
  }
];

export default function TextMessages() {
  const { toast } = useToast();
  const { userRole } = useUserRole();
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [messageText, setMessageText] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "unread" | "starred">("all");

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      timestamp: new Date().toISOString(),
      direction: "outbound",
      status: "sent"
    };

    setConversations(prev => prev.map(conv => {
      if (conv.id === selectedConversation.id) {
        return {
          ...conv,
          messages: [...conv.messages, newMessage],
          lastMessage: messageText,
          lastMessageTime: newMessage.timestamp
        };
      }
      return conv;
    }));

    setSelectedConversation(prev => prev ? {
      ...prev,
      messages: [...prev.messages, newMessage],
      lastMessage: messageText,
      lastMessageTime: newMessage.timestamp
    } : null);

    setMessageText("");

    toast({
      title: "Message sent",
      description: `Message sent to ${selectedConversation.patientName}`
    });
  };

  const handleMarkAsRead = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
    ));
  };

  const handleToggleStar = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, starred: !conv.starred } : conv
    ));
  };

  const handleArchive = (conversationId: string) => {
    setConversations(prev => prev.map(conv => 
      conv.id === conversationId ? { ...conv, status: "archived" } : conv
    ));
    
    toast({
      title: "Conversation archived",
      description: "The conversation has been archived"
    });

    if (selectedConversation?.id === conversationId) {
      setSelectedConversation(null);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    // Filter by status
    if (filterStatus === "unread" && conv.unreadCount === 0) return false;
    if (filterStatus === "starred" && !conv.starred) return false;
    if (conv.status === "archived") return false;

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        conv.patientName.toLowerCase().includes(query) ||
        conv.phoneNumber.includes(query) ||
        conv.lastMessage.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getMessageStatusIcon = (status: Message['status']) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3" />;
      case "delivered":
      case "read":
        return <CheckCheck className="h-3 w-3" />;
      case "failed":
        return <AlertCircle className="h-3 w-3 text-destructive" />;
    }
  };

  return (
    <Layout>
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Conversations List */}
        <div className="w-96 border-r bg-muted/30 flex flex-col">
          <div className="p-4 space-y-4 border-b bg-background">
            <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
                <MessageCircle className="h-6 w-6 text-primary" />
                <h1 className="text-xl font-bold">Messages</h1>
              </div>
              <Button size="sm" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="flex gap-2">
              <Button
                size="sm"
                variant={filterStatus === "all" ? "default" : "outline"}
                onClick={() => setFilterStatus("all")}
                className="flex-1"
              >
                All
              </Button>
              <Button
                size="sm"
                variant={filterStatus === "unread" ? "default" : "outline"}
                onClick={() => setFilterStatus("unread")}
                className="flex-1"
              >
                Unread
              </Button>
              <Button
                size="sm"
                variant={filterStatus === "starred" ? "default" : "outline"}
                onClick={() => setFilterStatus("starred")}
                className="flex-1"
              >
                <Star className="h-3 w-3 mr-1" />
                Starred
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="divide-y">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv);
                    handleMarkAsRead(conv.id);
                  }}
                  className={`p-4 cursor-pointer transition-colors hover:bg-accent ${
                    selectedConversation?.id === conv.id ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {conv.patientName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sm truncate">
                            {conv.patientName}
                          </h3>
                          {conv.starred && (
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(conv.lastMessageTime)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastMessage}
                      </p>
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {conv.phoneNumber}
                        </span>
                        {conv.unreadCount > 0 && (
                          <Badge variant="default" className="ml-auto h-5 min-w-5 rounded-full px-1.5">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {filteredConversations.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No conversations found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Messages View */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Conversation Header */}
              <div className="p-4 border-b bg-background flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {selectedConversation.patientName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="font-semibold">{selectedConversation.patientName}</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {selectedConversation.phoneNumber}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleStar(selectedConversation.id)}
                  >
                    <Star className={`h-4 w-4 ${selectedConversation.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  </Button>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="ghost">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleArchive(selectedConversation.id)}>
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversation.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === "outbound" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.direction === "outbound"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                        <div className={`flex items-center gap-1 mt-1 text-xs ${
                          message.direction === "outbound" 
                            ? "text-primary-foreground/70" 
                            : "text-muted-foreground"
                        }`}>
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(message.timestamp)}</span>
                          {message.direction === "outbound" && (
                            <span className="ml-1">
                              {getMessageStatusIcon(message.status)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t bg-background">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="min-h-[60px] resize-none"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageText.trim()}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
