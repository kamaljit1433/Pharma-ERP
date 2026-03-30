import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { benefitsService } from '../../services/benefitsService';
import { Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Star } from 'lucide-react';

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
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    employee_id: employeeId || '',
    category: '',
    title: '',
    description: '',
    awarded_date: new Date().toISOString().split('T')[0],
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
      if (employeeId) {
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
        awarded_date: new Date().toISOString().split('T')[0],
        is_public: true,
      });
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
      awarded_date: reward.awarded_date,
      is_public: reward.is_public,
    });
    setEditingId(reward.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this reward?')) {
      try {
        await benefitsService.deleteReward(id);
        setMessage({ type: 'success', text: 'Reward deleted successfully' });
        fetchRewards();
      } catch (error: any) {
        setMessage({
          type: 'error',
          text: error.response?.data?.message || 'Failed to delete reward',
        });
      }
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, React.ReactNode> = {
      performance: '🏆',
      attendance: '✅',
      innovation: '💡',
      teamwork: '🤝',
    };
    return icons[category] || '⭐';
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

  if (loading) {
    return <div className="text-center py-8">Loading rewards...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Rewards & Recognition</h2>
        {isAdmin && (
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
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
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Reward' : 'Award Reward'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="employee_id">Employee ID *</Label>
                <Input
                  id="employee_id"
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  placeholder="Enter employee ID"
                  required
                />
              </div>

              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

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

              <div>
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the reward reason"
                  className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="awarded_date">Award Date *</Label>
                <Input
                  id="awarded_date"
                  type="date"
                  value={formData.awarded_date}
                  onChange={(e) => setFormData({ ...formData, awarded_date: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="is_public"
                  type="checkbox"
                  checked={formData.is_public}
                  onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_public" className="mb-0">
                  Display on notice board
                </Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">Save Reward</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({
                      employee_id: employeeId || '',
                      category: '',
                      title: '',
                      description: '',
                      awarded_date: new Date().toISOString().split('T')[0],
                      is_public: true,
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {rewards.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground">
            No rewards yet
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {rewards.map((reward) => (
            <Card key={reward.id}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className={`text-3xl p-3 rounded-lg ${getCategoryColor(reward.category)}`}>
                    {getCategoryIcon(reward.category)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{reward.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(reward.awarded_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-success">{reward.category}</Badge>
                    </div>
                    {reward.description && (
                      <p className="text-sm text-muted-foreground mb-3">{reward.description}</p>
                    )}
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(reward)}
                          className="gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(reward.id)}
                          className="gap-2"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
