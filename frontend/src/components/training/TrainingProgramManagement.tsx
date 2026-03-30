import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { GraduationCap, Plus, Edit2, Trash2 } from 'lucide-react';
import trainingService, { TrainingProgram } from '../../services/trainingService';

export const TrainingProgramManagement: React.FC = () => {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    provider: '',
    start_date: '',
    end_date: '',
    duration_hours: 0,
    max_participants: 0,
  });

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      setLoading(true);
      const data = await trainingService.getAllTrainingPrograms();
      setPrograms(data);
    } catch (error) {
      console.error('Failed to load training programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await trainingService.updateTrainingProgram(editingId, {
          ...formData,
          start_date: new Date(formData.start_date),
          end_date: new Date(formData.end_date),
        } as any);
      } else {
        await trainingService.createTrainingProgram({
          ...formData,
          start_date: new Date(formData.start_date),
          end_date: new Date(formData.end_date),
          status: 'draft',
        } as any);
      }
      setFormData({
        name: '',
        description: '',
        provider: '',
        start_date: '',
        end_date: '',
        duration_hours: 0,
        max_participants: 0,
      });
      setEditingId(null);
      setShowForm(false);
      loadPrograms();
    } catch (error) {
      console.error('Failed to save training program:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this training program?')) {
      try {
        await trainingService.deleteTrainingProgram(id);
        loadPrograms();
      } catch (error) {
        console.error('Failed to delete training program:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-emerald-100 text-emerald-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Training Programs</h2>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Program
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Program Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="provider">Provider</Label>
                <Input
                  id="provider"
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="duration_hours">Duration (hours)</Label>
                <Input
                  id="duration_hours"
                  type="number"
                  value={formData.duration_hours}
                  onChange={(e) => setFormData({ ...formData, duration_hours: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="max_participants">Max Participants</Label>
                <Input
                  id="max_participants"
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) => setFormData({ ...formData, max_participants: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save Program</Button>
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid gap-4">
          {programs.map((program) => (
            <Card key={program.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{program.name}</h3>
                  <p className="text-sm text-gray-600">{program.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span>Provider: {program.provider || 'N/A'}</span>
                    <span>Duration: {program.duration_hours} hours</span>
                    <Badge className={getStatusColor(program.status)}>{program.status}</Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(program.id);
                      setFormData({
                        name: program.name,
                        description: program.description || '',
                        provider: program.provider || '',
                        start_date: program.start_date.toString().split('T')[0],
                        end_date: program.end_date.toString().split('T')[0],
                        duration_hours: program.duration_hours,
                        max_participants: program.max_participants || 0,
                      });
                      setShowForm(true);
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(program.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
