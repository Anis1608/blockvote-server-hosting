import { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

// Mock data generator
function generateMockTransactions(count) {
  const ops = ['payment', 'create_account', 'manage_data', 'change_trust'];
  return Array.from({ length: count }, (_, i) => ({
    id: `tx${Math.random().toString(36).substring(2, 10)}`,
    time: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    source: `G${Math.random().toString(36).substring(2, 10)}`,
    ops: Math.floor(Math.random() * 3) + 1,
    fee: (0.00001 * (Math.random() * 10)).toFixed(5),
    type: ops[Math.floor(Math.random() * ops.length)]
  }));
}

export function StellarDemo() {
  const [timeFilter, setTimeFilter] = useState('1hour');
  const [transactions, setTransactions] = useState([]);
  const [isLive, setIsLive] = useState(true);

  // Generate initial data
  useEffect(() => {
    setTransactions(generateMockTransactions(50));
  }, []);

  // Simulate live updates
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      setTransactions(prev => [
        {
          id: `tx${Math.random().toString(36).substring(2, 10)}`,
          time: new Date().toISOString(),
          source: `G${Math.random().toString(36).substring(2, 10)}`,
          ops: Math.floor(Math.random() * 3) + 1,
          fee: (0.00001 * (Math.random() * 10)).toFixed(5),
          type: ['payment', 'create_account', 'manage_data'][Math.floor(Math.random() * 3)]
        },
        ...prev.slice(0, 49)
      ]);
    }, 3000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Filter data based on time selection
  const filteredTxns = transactions.filter(tx => {
    const txTime = new Date(tx.time).getTime();
    const now = Date.now();
    const cutoff = now - {
      '5mins': 5 * 60 * 1000,
      '1hour': 60 * 60 * 1000,
      'today': 24 * 60 * 60 * 1000,
      '7days': 7 * 24 * 60 * 60 * 1000
    }[timeFilter];
    
    return txTime >= cutoff;
  });

  // Generate chart data
  const chartData = Array.from({ length: 12 }, (_, i) => {
    const time = new Date(Date.now() - (11 - i) * 5 * 60 * 1000);
    return {
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      count: Math.floor(Math.random() * 50) + 10
    };
  });

  return (
    <div className="space-y-4 p-4 bg-background">
      {/* Controls */}
      <div className="flex gap-4">
        <Select value={timeFilter} onValueChange={setTimeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5mins">Last 5 minutes</SelectItem>
            <SelectItem value="1hour">Last hour</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="7days">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
        
        <button 
          onClick={() => setIsLive(!isLive)}
          className={`px-4 py-2 rounded-md ${isLive ? 'bg-green-500' : 'bg-gray-500'}`}
        >
          {isLive ? 'Live ✅' : 'Paused ⏸️'}
        </button>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction Volume</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <Area 
                dataKey="count" 
                fill="#8884d8" 
                stroke="#8b5cf6"
                animationDuration={500}
              />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Live Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            Live Transactions ({filteredTxns.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-y-auto">
            {filteredTxns.map((tx) => (
              <div 
                key={tx.id} 
                className="border-b p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="font-mono text-sm flex-1">
                    {tx.id.slice(0, 8)}...{tx.id.slice(-4)}
                  </div>
                  
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {tx.type}
                    </Badge>
                    <Badge variant="outline">
                      {tx.ops} op{tx.ops !== 1 ? 's' : ''}
                    </Badge>
                    <Badge variant="outline">
                      {tx.fee} XLM
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {new Date(tx.time).toLocaleTimeString()}
                  </div>
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  From: {tx.source}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}