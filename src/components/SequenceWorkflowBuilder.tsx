import { useCallback, useState } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  NodeTypes,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Mail, MessageSquare, Phone, Clock, Sparkles, GitBranch, CheckCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';

function EmailNode({ data }: { data: any }) {
  return (
    <Card className="p-3 min-w-[200px] border-2 hover:border-primary transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="h-4 w-4 text-blue-500" />
        <div className="font-semibold text-sm">Email</div>
      </div>
      <div className="text-xs text-muted-foreground">{data.label}</div>
    </Card>
  );
}

function SmsNode({ data }: { data: any }) {
  return (
    <Card className="p-3 min-w-[200px] border-2 hover:border-primary transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <MessageSquare className="h-4 w-4 text-green-500" />
        <div className="font-semibold text-sm">SMS</div>
      </div>
      <div className="text-xs text-muted-foreground">{data.label}</div>
    </Card>
  );
}

function CallNode({ data }: { data: any }) {
  return (
    <Card className="p-3 min-w-[200px] border-2 hover:border-primary transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <Phone className="h-4 w-4 text-purple-500" />
        <div className="font-semibold text-sm">Call</div>
      </div>
      <div className="text-xs text-muted-foreground">{data.label}</div>
    </Card>
  );
}

function DelayNode({ data }: { data: any }) {
  return (
    <Card className="p-3 min-w-[200px] border-2 hover:border-primary transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <Clock className="h-4 w-4 text-orange-500" />
        <div className="font-semibold text-sm">Delay</div>
      </div>
      <div className="text-xs text-muted-foreground">{data.label}</div>
    </Card>
  );
}

function LlmNode({ data }: { data: any }) {
  return (
    <Card className="p-3 min-w-[200px] border-2 border-primary hover:border-primary/80 transition-colors bg-primary/5">
      <div className="flex items-center gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <div className="font-semibold text-sm">AI Action</div>
      </div>
      <div className="text-xs text-muted-foreground">{data.label}</div>
    </Card>
  );
}

function ConditionNode({ data }: { data: any }) {
  return (
    <Card className="p-3 min-w-[200px] border-2 hover:border-primary transition-colors bg-yellow-500/10">
      <div className="flex items-center gap-2 mb-2">
        <GitBranch className="h-4 w-4 text-yellow-600" />
        <div className="font-semibold text-sm">Condition</div>
      </div>
      <div className="text-xs text-muted-foreground">{data.label}</div>
    </Card>
  );
}

function ActionNode({ data }: { data: any }) {
  return (
    <Card className="p-3 min-w-[200px] border-2 hover:border-primary transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <div className="font-semibold text-sm">Action</div>
      </div>
      <div className="text-xs text-muted-foreground">{data.label}</div>
    </Card>
  );
}

const nodeTypes: NodeTypes = {
  email: EmailNode,
  sms: SmsNode,
  call: CallNode,
  delay: DelayNode,
  llm: LlmNode,
  condition: ConditionNode,
  action: ActionNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'email',
    position: { x: 250, y: 50 },
    data: { label: 'Welcome Email' },
  },
  {
    id: '2',
    type: 'delay',
    position: { x: 250, y: 150 },
    data: { label: 'Wait 2 days' },
  },
  {
    id: '3',
    type: 'llm',
    position: { x: 250, y: 250 },
    data: { label: 'AI: Analyze engagement' },
  },
  {
    id: '4',
    type: 'condition',
    position: { x: 250, y: 350 },
    data: { label: 'Opened email?' },
  },
  {
    id: '5',
    type: 'sms',
    position: { x: 100, y: 450 },
    data: { label: 'Follow-up SMS' },
  },
  {
    id: '6',
    type: 'call',
    position: { x: 400, y: 450 },
    data: { label: 'Schedule call' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
  { id: 'e3-4', source: '3', target: '4', animated: true },
  { id: 'e4-5', source: '4', target: '5', label: 'No', animated: true },
  { id: 'e4-6', source: '4', target: '6', label: 'Yes', animated: true },
];

export function SequenceWorkflowBuilder() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = (type: string) => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type,
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: { label: `New ${type} node` },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div className="h-[600px] border rounded-lg overflow-hidden">
      <div className="flex gap-2 p-2 bg-muted border-b">
        <Button size="sm" variant="outline" onClick={() => addNode('email')}>
          <Mail className="h-3 w-3 mr-1" />
          Email
        </Button>
        <Button size="sm" variant="outline" onClick={() => addNode('sms')}>
          <MessageSquare className="h-3 w-3 mr-1" />
          SMS
        </Button>
        <Button size="sm" variant="outline" onClick={() => addNode('call')}>
          <Phone className="h-3 w-3 mr-1" />
          Call
        </Button>
        <Button size="sm" variant="outline" onClick={() => addNode('delay')}>
          <Clock className="h-3 w-3 mr-1" />
          Delay
        </Button>
        <Button size="sm" variant="outline" onClick={() => addNode('llm')}>
          <Sparkles className="h-3 w-3 mr-1" />
          AI Action
        </Button>
        <Button size="sm" variant="outline" onClick={() => addNode('condition')}>
          <GitBranch className="h-3 w-3 mr-1" />
          Condition
        </Button>
        <Button size="sm" variant="outline" onClick={() => addNode('action')}>
          <CheckCircle className="h-3 w-3 mr-1" />
          Action
        </Button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Controls />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
