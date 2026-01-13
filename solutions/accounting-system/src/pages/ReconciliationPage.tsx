import React, { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, AlertCircle, Search, Filter, Download, RefreshCw, Scale } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui-components';

interface ReconciliationItem {
  id: string;
  account_id: string;
  account_name: string;
  statement_balance: number;
  book_balance: number;
  difference: number;
  last_reconciled: string;
  status: 'matched' | 'unmatched' | 'partially_matched';
  reconciled_by?: string;
  reconciled_at?: string;
  notes?: string;
}

interface ReconciliationSession {
  id: string;
  session_date: string;
  start_date: string;
  end_date: string;
  total_items: number;
  matched_items: number;
  unmatched_items: number;
  total_difference: number;
  status: 'in_progress' | 'completed' | 'pending_review';
  created_by: string;
  created_at: string;
  completed_at?: string;
}

const ReconciliationPage: React.FC = () => {
  const [reconciliationItems, setReconciliationItems] = useState<ReconciliationItem[]>([]);
  const [sessions, setSessions] = useState<ReconciliationSession[]>([]);
  const [filteredItems, setFilteredItems] = useState<ReconciliationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [isReconcileDialogOpen, setIsReconcileDialogOpen] = useState(false);
  const [isSessionDialogOpen, setIsSessionDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentSession, setCurrentSession] = useState<ReconciliationSession | null>(null);

  const [sessionFormData, setSessionFormData] = useState({
    session_date: new Date().toISOString().split('T')[0],
    start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadReconciliationData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [reconciliationItems, searchTerm, filterStatus, filterAccount]);

  const loadReconciliationData = async () => {
    try {
      // Mock data - replace with actual API calls
      const mockItems: ReconciliationItem[] = [
        {
          id: '1',
          account_id: '1001',
          account_name: 'Checking Account',
          statement_balance: 15000.00,
          book_balance: 14950.00,
          difference: 50.00,
          last_reconciled: '2024-01-31T00:00:00Z',
          status: 'unmatched'
        },
        {
          id: '2',
          account_id: '1002',
          account_name: 'Savings Account',
          statement_balance: 25000.00,
          book_balance: 25000.00,
          difference: 0.00,
          last_reconciled: '2024-01-31T00:00:00Z',
          status: 'matched'
        },
        {
          id: '3',
          account_id: '2001',
          account_name: 'Accounts Receivable',
          statement_balance: 5000.00,
          book_balance: 4800.00,
          difference: -200.00,
          last_reconciled: '2024-01-15T00:00:00Z',
          status: 'partially_matched'
        }
      ];

      const mockSessions: ReconciliationSession[] = [
        {
          id: '1',
          session_date: '2024-01-31T00:00:00Z',
          start_date: '2024-01-01T00:00:00Z',
          end_date: '2024-01-31T00:00:00Z',
          total_items: 15,
          matched_items: 12,
          unmatched_items: 3,
          total_difference: 250.00,
          status: 'completed',
          created_by: 'John Doe',
          created_at: '2024-01-31T10:00:00Z',
          completed_at: '2024-01-31T15:30:00Z'
        }
      ];

      setReconciliationItems(mockItems);
      setSessions(mockSessions);
    } catch (error) {
      console.error('Error loading reconciliation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = reconciliationItems;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.account_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(item => item.status === filterStatus);
    }

    if (filterAccount !== 'all') {
      filtered = filtered.filter(item => item.account_id === filterAccount);
    }

    setFilteredItems(filtered);
  };

  const startReconciliationSession = async () => {
    try {
      console.log('Starting reconciliation session:', sessionFormData);
      
      const newSession: ReconciliationSession = {
        id: Date.now().toString(),
        session_date: sessionFormData.session_date,
        start_date: sessionFormData.start_date,
        end_date: sessionFormData.end_date,
        total_items: reconciliationItems.length,
        matched_items: 0,
        unmatched_items: reconciliationItems.length,
        total_difference: reconciliationItems.reduce((sum, item) => sum + Math.abs(item.difference), 0),
        status: 'in_progress',
        created_by: 'Current User',
        created_at: new Date().toISOString()
      };

      setSessions([newSession, ...sessions]);
      setCurrentSession(newSession);
      setIsSessionDialogOpen(false);
    } catch (error) {
      console.error('Error starting reconciliation session:', error);
    }
  };

  const reconcileItems = async () => {
    if (selectedItems.length === 0) {
      alert('Please select items to reconcile');
      return;
    }

    try {
      console.log('Reconciling items:', selectedItems);
      
      // Update items status
      const updatedItems = reconciliationItems.map(item => 
        selectedItems.includes(item.id) 
          ? { ...item, status: 'matched' as const, reconciled_at: new Date().toISOString() }
          : item
      );
      
      setReconciliationItems(updatedItems);
      setSelectedItems([]);
      
      // Update session if active
      if (currentSession) {
        const matchedCount = updatedItems.filter(item => item.status === 'matched').length;
        const updatedSession = {
          ...currentSession,
          matched_items: matchedCount,
          unmatched_items: updatedItems.length - matchedCount,
          total_difference: updatedItems
            .filter(item => item.status !== 'matched')
            .reduce((sum, item) => sum + Math.abs(item.difference), 0)
        };
        
        setCurrentSession(updatedSession);
        setSessions(sessions.map(s => s.id === currentSession.id ? updatedSession : s));
      }
    } catch (error) {
      console.error('Error reconciling items:', error);
    }
  };

  const completeSession = async (sessionId: string) => {
    try {
      console.log('Completing session:', sessionId);
      
      const updatedSession = sessions.map(s => 
        s.id === sessionId 
          ? { ...s, status: 'completed' as const, completed_at: new Date().toISOString() }
          : s
      );
      
      setSessions(updatedSession);
      if (currentSession && currentSession.id === sessionId) {
        setCurrentSession({ ...currentSession, status: 'completed' as const });
      }
    } catch (error) {
      console.error('Error completing session:', error);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'matched':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'unmatched':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'partially_matched':
        return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      matched: 'bg-green-100 text-green-800',
      unmatched: 'bg-red-100 text-red-800',
      partially_matched: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getSessionStatusColor = (status: string) => {
    const colors = {
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      pending_review: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const exportReconciliationReport = async () => {
    try {
      alert('Reconciliation report would be exported as Excel/PDF');
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading reconciliation data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Bank Reconciliation</h1>
        <div className="flex space-x-2">
          <Dialog open={isSessionDialogOpen} onOpenChange={setIsSessionDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Session
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Start Reconciliation Session</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); startReconciliationSession(); }} className="space-y-4">
                <div>
                  <label htmlFor="session_date" className="block text-sm font-medium mb-1">Session Date</label>
                  <input
                    id="session_date"
                    type="date"
                    value={sessionFormData.session_date}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, session_date: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start_date" className="block text-sm font-medium mb-1">Start Date</label>
                    <input
                      id="start_date"
                      type="date"
                      value={sessionFormData.start_date}
                      onChange={(e) => setSessionFormData({ ...sessionFormData, start_date: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="end_date" className="block text-sm font-medium mb-1">End Date</label>
                    <input
                      id="end_date"
                      type="date"
                      value={sessionFormData.end_date}
                      onChange={(e) => setSessionFormData({ ...sessionFormData, end_date: e.target.value })}
                      className="w-full p-2 border rounded-md"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsSessionDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Start Session
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={exportReconciliationReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Current Session Status */}
      {currentSession && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Scale className="w-5 h-5 mr-2" />
              Current Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium">Session Date</label>
                <p className="font-mono">{new Date(currentSession.session_date).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium">Progress</label>
                <p className="font-mono">
                  {currentSession.matched_items}/{currentSession.total_items} items matched
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium">Difference</label>
                <p className="font-mono text-red-600">
                  {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(currentSession.total_difference)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium">Status</label>
                <Badge className={getSessionStatusColor(currentSession.status)}>
                  {currentSession.status.replace('_', ' ')}
                </Badge>
              </div>
            </div>
            
            {currentSession.status === 'in_progress' && (
              <div className="flex justify-end space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  onClick={() => reconcileItems()}
                  disabled={selectedItems.length === 0}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Reconcile Selected ({selectedItems.length})
                </Button>
                <Button 
                  onClick={() => completeSession(currentSession.id)}
                >
                  Complete Session
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 p-2 border rounded-md"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="matched">Matched</SelectItem>
            <SelectItem value="unmatched">Unmatched</SelectItem>
            <SelectItem value="partially_matched">Partially Matched</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reconciliation Items */}
      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Items ({filteredItems.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(filteredItems.map(item => item.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                      className="mr-2"
                    />
                    Account
                  </th>
                  <th className="text-left p-2">Statement Balance</th>
                  <th className="text-left p-2">Book Balance</th>
                  <th className="text-left p-2">Difference</th>
                  <th className="text-left p-2">Last Reconciled</th>
                  <th className="text-left p-2">Status</th>
                  <th className="text-center p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => toggleItemSelection(item.id)}
                        className="mr-2"
                      />
                      <div>
                        <p className="font-medium">{item.account_name}</p>
                        <p className="text-sm text-gray-500">{item.account_id}</p>
                      </div>
                    </td>
                    <td className="p-2 text-right font-mono">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.statement_balance)}
                    </td>
                    <td className="p-2 text-right font-mono">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.book_balance)}
                    </td>
                    <td className="p-2 text-right font-mono">
                      <span className={item.difference !== 0 ? 'text-red-600 font-bold' : ''}>
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.difference)}
                      </span>
                    </td>
                    <td className="p-2 text-sm">
                      {item.last_reconciled ? new Date(item.last_reconciled).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="p-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(item.status)}
                        <Badge className={getStatusColor(item.status)}>
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </td>
                    <td className="p-2">
                      <div className="flex justify-center space-x-1">
                        {item.status !== 'matched' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleItemSelection(item.id)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredItems.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No reconciliation items found matching your criteria.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Sessions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">
                      {new Date(session.session_date).toLocaleDateString()} - {new Date(session.end_date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {session.matched_items}/{session.total_items} items • 
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(session.total_difference)} difference
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getSessionStatusColor(session.status)}>
                    {session.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReconciliationPage;
