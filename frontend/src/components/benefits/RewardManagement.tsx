import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { DatePicker } from '../ui/date-picker';
import { benefitsService } from '../../services/benefitsService';
import { EmployeeSearch } from '../performance/EmployeeSearch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, X, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';

interface Reward {
  id: string;
  employee_id: string;
  category: string;
  title: string;
  description?: string;
  awarded_by?: string;
  awarded_date: string;
  is_public: boolean;
}

interface RewardManagementProps {
  employeeId?: string;
  isAdmin?: boolean;
}

export const RewardManagement: React.FC<RewardManagementProps> = ({
  employeeId,
  isAdmin = false,
}) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Reward | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedEmployeeLabel, setSelectedEmployeeLabel] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];
  const [formData, setFormData] = useState({
    employee_id: employeeId || '',
    category: '',
    title: '',
    description: '',
    awarded_date: new Date().toISOString().split('T')[0] ?? '',
    is_public: true,
  });

  const categories = ['performance', 'attendance', 'innovation', 'teamwork'];

  useEffect(() => {
    fetchRewards();
  }, [employeeId]);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      let response;
      if (isAdmin) {
        response = await benefitsService.getAllRewards();
      } else if (employeeId) {
        response = await benefitsService.getEmployeeRewards(employeeId);
      } else {
        response = await benefitsService.getPublicRewards();
      }
      setRewards(response.data || []);
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
      setMessage({ type: 'error', text: 'Failed to load rewards' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.category || !formData.title || !formData.employee_id) {
      setMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    try {
      if (editingId) {
        await benefitsService.updateReward(editingId, formData);
        setMessage({ type: 'success', text: 'Reward updated successfully' });
      } else {
        await benefitsService.awardReward(formData);
        setMessage({ type: 'success', text: 'Reward awarded successfully' });
      }

      setFormData({
        employee_id: employeeId || '',
        category: '',
        title: '',
        description: '',
        awarded_date: new Date().toISOString().split('T')[0] ?? '',
        is_public: true,
      });
      setSelectedEmployeeLabel('');
      setShowForm(false);
      setEditingId(null);
      fetchRewards();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to save reward',
      });
    }
  };

  const handleEdit = (reward: Reward) => {
    setFormData({
      employee_id: reward.employee_id,
      category: reward.category,
      title: reward.title,
      description: reward.description || '',
      awarded_date: reward.awarded_date?.split('T')[0] ?? new Date().toISOString().split('T')[0] ?? '',
      is_public: reward.is_public,
    });
    setSelectedEmployeeLabel(reward.employee_id);
    setEditingId(reward.id);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await benefitsService.deleteReward(deleteTarget.id);
      setMessage({ type: 'success', text: 'Reward deleted successfully' });
      setDeleteTarget(null);
      fetchRewards();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.response?.data?.message || 'Failed to delete reward',
      });
    } finally {
      setDeleting(false);
    }
  };

  const closeModal = () => {
    setShowForm(false);
    setEditingId(null);
    setSelectedEmployeeLabel('');
    setFormData({
      employee_id: employeeId || '',
      category: '',
      title: '',
      description: '',
      awarded_date: new Date().toISOString().split('T')[0] ?? '',
      is_public: true,
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      performance: 'bg-yellow-100 text-yellow-800',
      attendance: 'bg-green-100 text-green-800',
      innovation: 'bg-blue-100 text-blue-800',
      teamwork: 'bg-purple-100 text-purple-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const totalPages = Math.max(1, Math.ceil(rewards.length / pageSize));
  const paginated  = rewards.slice((page - 1) * pageSize, page * pageSize);

  if (loading) {
    return <div className="text-center py-8">Loading rewards...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Rewards & Recognition</h2>
        {isAdmin && (
          <Button onClick={() => { setEditingId(null); setSelectedEmployeeLabel(''); setShowForm(true); }} className="gap-2">
            <Plus className="w-4 h-4" />
            Award Reward
          </Button>
        )}
      </div>

      {message && (
        <Card className={message.type === 'success' ? 'border-success' : 'border-destructive'}>
          <CardContent className="pt-6 flex gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
            )}
            <p>{message.text}</p>
          </CardContent>
        </Card>
      )}

      {showForm && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={closeModal} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-xl">
              <div>
                <h2 className="text-xl font-bold">{editingId ? 'Edit Reward' : 'Award Reward'}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {editingId ? 'Update the reward details' : 'Recognise an employee\'s achievement'}
                </p>
              </div>
              <button onClick={closeModal} className="text-muted-foreground hover:text-foreground transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Employee */}
              <div>
                <EmployeeSearch
                  label="Employee *"
                  placeholder="Search by name or employee ID..."
                  onChange={(id, emp) => {
                    setFormData({ ...formData, employee_id: id });
                    setSelectedEmployeeLabel(emp ? `${emp.first_name} ${emp.last_name} (${emp.employee_id})` : '');
                  }}
                />
                {!formData.employee_id && (
                  <p className="text-xs text-muted-foreground mt-1">Start typing to search for an employee</p>
                )}
                {selectedEmployeeLabel && (
                  <p className="text-xs text-green-700 mt-1">Selected: {selectedEmployeeLabel}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <Label htmlFor="category">Category *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v: string) => setFormData({ ...formData, category: v })}
                  required
                >
                  <SelectTrigger id="category" className="mt-1">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Reward title"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the reward reason"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                  rows={3}
                />
              </div>

              {/* Award Date */}
              <div>
                <Label htmlFor="awarded_date">Award Date *</Label>
                <DatePicker
                  id="awarded_date"
                  value={formData.awarded_date}
                  onChange={(v) => setFormData({ ...formData, awarded_date: v })}
                  required
                />
              </div>

              {/* Public toggle */}
              <div className="flex items-center gap-2">
                <input
                  id="is_public"
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_public" className="mb-0 cursor-pointer">
                  Display on notice board
                </Label>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={closeModal}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingId ? 'Save Changes' : 'Award Reward'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rows per page + count */}
      {rewards.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v: string) => { setPageSize(Number(v)); setPage(1); }}
          >
            <SelectTrigger className="h-8 w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((n) => (
                <SelectItem key={n} value={String(n)}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>{rewards.length} reward{rewards.length !== 1 ? 's' : ''} total</span>
        </div>
      )}

      {rewards.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No rewards yet
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {paginated.map((reward) => (
              <Card key={reward.id}>
                <CardContent className="pt-6">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{reward.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(reward.awarded_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getCategoryColor(reward.category)}>
                        {reward.category.charAt(0).toUpperCase() + reward.category.slice(1)}
                      </Badge>
                    </div>
                    {reward.description && (
                      <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                    )}
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(reward)} className="gap-2">
                          <Edit2 className="w-4 h-4" /> Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(reward)} className="gap-2">
                          <Trash2 className="w-4 h-4" /> Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const n = totalPages <= 7 ? i + 1
                : page <= 4 ? i + 1
                : page >= totalPages - 3 ? totalPages - 6 + i
                : page - 3 + i;
              return (
                <Button key={n} variant={n === page ? 'default' : 'outline'} size="sm"
                  onClick={() => setPage(n)} className="w-8 h-8 p-0">
                  {n}
                </Button>
              );
            })}
            <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </>
      )}

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !deleting && setDeleteTarget(null)} />
          <div className="relative z-10 w-full max-w-md mx-4 bg-white rounded-xl shadow-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-red-100">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900">Delete Reward</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to delete <span className="font-medium text-gray-700">"{deleteTarget.title}"</span>? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                Cancel
              </Button>
              <Button onClick={confirmDelete} disabled={deleting} className="bg-red-600 hover:bg-red-700 text-white">
                {deleting ? 'Deleting…' : 'Delete Reward'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
