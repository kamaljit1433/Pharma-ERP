import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { GraduationCap, Plus, Edit2, Trash2, Users, Search, X, Check, AlertTriangle } from 'lucide-react';
import trainingService, { TrainingProgram } from '../../services/trainingService';
import employeeService, { Employee } from '../../services/employeeService';

// ─── FormData type ────────────────────────────────────────────────────────────

interface FormData {
  name: string;
  description: string;
  provider: string;
  start_date: string;
  end_date: string;
  duration_hours: number;
  max_participants: number;
}

// ─── TrainingFormBody (top-level so it never remounts on parent re-render) ───

interface TrainingFormBodyProps {
  isEdit: boolean;
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
  employeeSearch: string;
  setEmployeeSearch: (v: string) => void;
  selectedEmployeeIds: Set<string>;
  filteredEmployees: Employee[];
  allFilteredSelected: boolean;
  hasLimit: boolean;
  maxParticipants: number;
  loadingEmployees: boolean;
  enrollmentError: string | null;
  submitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  toggleEmployee: (id: string) => void;
  toggleSelectAll: () => void;
  onCancel: () => void;
}

const TrainingFormBody: React.FC<TrainingFormBodyProps> = ({
  isEdit, formData, setFormData,
  employeeSearch, setEmployeeSearch,
  selectedEmployeeIds, filteredEmployees,
  allFilteredSelected, hasLimit, maxParticipants,
  loadingEmployees, enrollmentError, submitting,
  onSubmit, toggleEmployee, toggleSelectAll, onCancel,
}) => (
  <form onSubmit={onSubmit} className="space-y-6">
    {/* Program details */}
    <div>
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Program Details</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Program Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="provider">Provider</Label>
          <Input
            id="provider"
            value={formData.provider}
            onChange={(e) => setFormData((p) => ({ ...p, provider: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData((p) => ({ ...p, start_date: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="end_date">End Date</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData((p) => ({ ...p, end_date: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="duration_hours">Duration (hours)</Label>
          <Input
            id="duration_hours"
            type="number"
            value={formData.duration_hours}
            onChange={(e) => setFormData((p) => ({ ...p, duration_hours: parseInt(e.target.value) || 0 }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="max_participants">Max Participants</Label>
          <Input
            id="max_participants"
            type="number"
            value={formData.max_participants}
            onChange={(e) => setFormData((p) => ({ ...p, max_participants: parseInt(e.target.value) || 0 }))}
          />
        </div>
      </div>
      <div className="mt-4">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          rows={3}
        />
      </div>
    </div>

    {/* Employee enrollment */}
    <div className="border-t pt-5">
      <div className="flex items-center gap-2 mb-3">
        <Users className="w-4 h-4 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
          {isEdit ? 'Manage Enrolled Employees' : 'Enroll Employees'}
        </h3>
        {!isEdit && <span className="text-xs text-gray-400">(optional)</span>}
        <div className="ml-auto flex items-center gap-2">
          {hasLimit && <span className="text-xs text-gray-400">Limit: {maxParticipants}</span>}
          {selectedEmployeeIds.size > 0 && (
            <Badge className={hasLimit && selectedEmployeeIds.size >= maxParticipants ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}>
              {selectedEmployeeIds.size}{hasLimit ? ` / ${maxParticipants}` : ''} selected
            </Badge>
          )}
        </div>
      </div>

      {loadingEmployees ? (
        <div className="text-sm text-gray-400 py-6 text-center">Loading employees…</div>
      ) : (
        <>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, ID, or email…"
              value={employeeSearch}
              onChange={(e) => setEmployeeSearch(e.target.value)}
              className="pl-9"
            />
            {employeeSearch && (
              <button
                type="button"
                onClick={() => setEmployeeSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {filteredEmployees.length > 0 && (
            <div className="border rounded-md overflow-hidden">
              <div
                className="flex items-center gap-3 px-3 py-2 bg-gray-50 border-b cursor-pointer hover:bg-gray-100 select-none"
                onClick={toggleSelectAll}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${allFilteredSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-400'}`}>
                  {allFilteredSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {allFilteredSelected ? 'Deselect all' : `Select all (${filteredEmployees.length})`}
                </span>
              </div>

              <div className="max-h-48 overflow-y-auto divide-y">
                {filteredEmployees.map((emp) => {
                  const isSelected = selectedEmployeeIds.has(emp.id);
                  const atLimit = hasLimit && selectedEmployeeIds.size >= maxParticipants && !isSelected;
                  return (
                    <div
                      key={emp.id}
                      title={atLimit ? `Maximum ${maxParticipants} participants reached` : undefined}
                      className={`flex items-center gap-3 px-3 py-2 select-none ${atLimit ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-gray-50'} ${isSelected ? 'bg-blue-50' : ''}`}
                      onClick={() => !atLimit && toggleEmployee(emp.id)}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600' : atLimit ? 'border-gray-300' : 'border-gray-400'}`}>
                        {isSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{emp.first_name} {emp.last_name}</p>
                        <p className="text-xs text-gray-500 truncate">{emp.employee_id} &middot; {emp.email}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasLimit && selectedEmployeeIds.size >= maxParticipants && (
                <div className="px-3 py-2 bg-amber-50 border-t text-xs text-amber-700 font-medium">
                  Maximum of {maxParticipants} participant{maxParticipants > 1 ? 's' : ''} reached. Deselect someone to add another.
                </div>
              )}
            </div>
          )}

          {filteredEmployees.length === 0 && employeeSearch && (
            <p className="text-sm text-gray-400 text-center py-4">No employees match "{employeeSearch}"</p>
          )}
          {filteredEmployees.length === 0 && !employeeSearch && (
            <p className="text-sm text-gray-400 text-center py-4">No active employees found</p>
          )}
        </>
      )}

      {enrollmentError && <p className="mt-2 text-sm text-amber-600">{enrollmentError}</p>}
    </div>

    {/* Actions */}
    <div className="flex gap-2 pt-1">
      <Button type="submit" disabled={submitting}>
        {submitting
          ? 'Saving…'
          : isEdit
          ? selectedEmployeeIds.size > 0 ? 'Save Changes & Update Enrollments' : 'Save Changes'
          : selectedEmployeeIds.size > 0
          ? `Save & Enroll ${selectedEmployeeIds.size} Employee${selectedEmployeeIds.size > 1 ? 's' : ''}`
          : 'Save Program'}
      </Button>
      <Button type="button" variant="outline" disabled={submitting} onClick={onCancel}>
        Cancel
      </Button>
    </div>
  </form>
);

// ─── Main component ───────────────────────────────────────────────────────────

export const TrainingProgramManagement: React.FC = () => {
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [loading, setLoading] = useState(false);

  const [showNewForm, setShowNewForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<TrainingProgram | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TrainingProgram | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '', description: '', provider: '',
    start_date: '', end_date: '',
    duration_hours: 0, max_participants: 0,
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<Set<string>>(new Set());
  const [enrollmentMap, setEnrollmentMap] = useState<Record<string, string>>({});
  const [originalEnrolledIds, setOriginalEnrolledIds] = useState<Set<string>>(new Set());
  const [employeeSearch, setEmployeeSearch] = useState('');
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [enrollmentError, setEnrollmentError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { loadPrograms(); }, []);

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

  const loadEmployees = async (programId?: string) => {
    try {
      setLoadingEmployees(true);
      const result = await employeeService.getAll({ status: 'active', limit: 500 });
      setEmployees(result.data);

      if (programId) {
        const enrollments = await trainingService.getProgramEnrollments(programId);
        const map: Record<string, string> = {};
        enrollments.forEach((e) => { map[e.employee_id] = e.id; });
        setEnrollmentMap(map);
        const ids = new Set(Object.keys(map));
        setOriginalEnrolledIds(ids);
        setSelectedEmployeeIds(new Set(ids));
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const filteredEmployees = useMemo(() => {
    const q = employeeSearch.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) =>
      `${e.first_name} ${e.last_name}`.toLowerCase().includes(q) ||
      e.employee_id.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q)
    );
  }, [employees, employeeSearch]);

  const maxParticipants = formData.max_participants;
  const hasLimit = maxParticipants > 0;

  const toggleEmployee = (id: string) => {
    setSelectedEmployeeIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        if (hasLimit && next.size >= maxParticipants) return prev;
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedEmployeeIds.size > 0 && filteredEmployees.every((e) => selectedEmployeeIds.has(e.id))) {
      setSelectedEmployeeIds(new Set());
    } else {
      const toAdd = filteredEmployees.map((e) => e.id);
      if (hasLimit) {
        const combined = new Set([...selectedEmployeeIds, ...toAdd]);
        setSelectedEmployeeIds(new Set(Array.from(combined).slice(0, maxParticipants)));
      } else {
        setSelectedEmployeeIds(new Set(toAdd));
      }
    }
  };

  const resetFormState = () => {
    setFormData({ name: '', description: '', provider: '', start_date: '', end_date: '', duration_hours: 0, max_participants: 0 });
    setSelectedEmployeeIds(new Set());
    setOriginalEnrolledIds(new Set());
    setEnrollmentMap({});
    setEmployeeSearch('');
    setEnrollmentError(null);
  };

  const openNewForm = () => {
    resetFormState();
    setEmployees([]);
    loadEmployees();
    setShowNewForm(true);
  };

  const openEditModal = (program: TrainingProgram) => {
    resetFormState();
    setFormData({
      name: program.name,
      description: program.description || '',
      provider: program.provider || '',
      start_date: program.start_date?.toString().split('T')[0] ?? '',
      end_date: program.end_date?.toString().split('T')[0] ?? '',
      duration_hours: program.duration_hours,
      max_participants: program.max_participants || 0,
    });
    setEmployees([]);
    loadEmployees(program.id);
    setEditingProgram(program);
  };

  const handleSubmit = async (e: React.FormEvent, isEdit: boolean) => {
    e.preventDefault();
    setEnrollmentError(null);
    setSubmitting(true);
    try {
      if (isEdit && editingProgram) {
        await trainingService.updateTrainingProgram(editingProgram.id, {
          ...formData,
          start_date: new Date(formData.start_date),
          end_date: new Date(formData.end_date),
          status: selectedEmployeeIds.size > 0 ? 'active' : 'draft',
        } as any);

        const toEnroll = Array.from(selectedEmployeeIds).filter((id) => !originalEnrolledIds.has(id));
        const toRemove = Array.from(originalEnrolledIds).filter((id) => !selectedEmployeeIds.has(id));

        if (toEnroll.length > 0) await trainingService.bulkEnrollEmployees(toEnroll, editingProgram.id);
        for (const empId of toRemove) {
          const enrollmentId = enrollmentMap[empId];
          if (enrollmentId) await trainingService.deleteEnrollment(enrollmentId);
        }

        setEditingProgram(null);
      } else {
        const status = selectedEmployeeIds.size > 0 ? 'active' : 'draft';
        const created = await trainingService.createTrainingProgram({
          ...formData,
          start_date: new Date(formData.start_date),
          end_date: new Date(formData.end_date),
          status,
        } as any);

        if (selectedEmployeeIds.size > 0) {
          try {
            await trainingService.bulkEnrollEmployees(Array.from(selectedEmployeeIds), created.id);
          } catch {
            setEnrollmentError('Program created, but some enrollments failed. Please enroll employees manually.');
            loadPrograms();
            return;
          }
        }
        setShowNewForm(false);
      }

      resetFormState();
      loadPrograms();
    } catch (error) {
      console.error('Failed to save training program:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await trainingService.deleteTrainingProgram(deleteTarget.id);
      setDeleteTarget(null);
      loadPrograms();
    } catch (error: any) {
      setDeleteError(error?.response?.data?.error || error?.message || 'Failed to delete training program');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':    return 'bg-emerald-100 text-emerald-800';
      case 'draft':     return 'bg-gray-100 text-gray-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-rose-100 text-rose-800';
      default:          return 'bg-gray-100 text-gray-800';
    }
  };

  const allFilteredSelected =
    filteredEmployees.length > 0 &&
    filteredEmployees.every((e) => selectedEmployeeIds.has(e.id));

  const sharedFormProps = {
    formData, setFormData,
    employeeSearch, setEmployeeSearch,
    selectedEmployeeIds, filteredEmployees,
    allFilteredSelected, hasLimit, maxParticipants,
    loadingEmployees, enrollmentError, submitting,
    toggleEmployee, toggleSelectAll,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Training Programs</h2>
        </div>
        <Button onClick={openNewForm} className="gap-2">
          <Plus className="w-4 h-4" />
          New Program
        </Button>
      </div>

      {/* Inline create form */}
      {showNewForm && (
        <Card className="p-6">
          <TrainingFormBody
            {...sharedFormProps}
            isEdit={false}
            onSubmit={(e) => handleSubmit(e, false)}
            onCancel={() => { resetFormState(); setShowNewForm(false); }}
          />
        </Card>
      )}

      {/* Program list */}
      {loading ? (
        <div className="text-center py-8">Loading…</div>
      ) : programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <GraduationCap className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No training programs yet</h3>
          <p className="text-sm text-gray-400 mt-1">Click "New Program" to add your first training program.</p>
        </div>
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
                  <Button size="sm" variant="outline" onClick={() => openEditModal(program)}>
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setDeleteError(null); setDeleteTarget(program); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Edit modal ── */}
      {editingProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { if (!submitting) { resetFormState(); setEditingProgram(null); } }}
          />
          <div className="relative z-10 w-full max-w-2xl mx-4 bg-white rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-semibold text-gray-900">Edit Training Program</h2>
              </div>
              <button
                type="button"
                onClick={() => { if (!submitting) { resetFormState(); setEditingProgram(null); } }}
                className="text-gray-400 hover:text-gray-600 rounded-md p-1 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-5 flex-1">
              <TrainingFormBody
                {...sharedFormProps}
                isEdit={true}
                onSubmit={(e) => handleSubmit(e, true)}
                onCancel={() => { resetFormState(); setEditingProgram(null); }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Delete confirmation modal ── */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !deleting && setDeleteTarget(null)} />
          <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl p-6 mx-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-full bg-rose-100">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-900">Delete Training Program</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Are you sure you want to delete{' '}
                  <span className="font-medium text-gray-700">"{deleteTarget.name}"</span>?
                  All enrollments — including active ones — will be permanently removed.
                </p>
                <p className="mt-2 text-xs text-rose-600 font-medium">This action cannot be undone.</p>
              </div>
            </div>

            {deleteError && (
              <div className="mt-4 rounded-md bg-rose-50 border border-rose-200 px-3 py-2 text-sm text-rose-700">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setDeleteTarget(null); setDeleteError(null); }} disabled={deleting}>
                Cancel
              </Button>
              <Button onClick={confirmDelete} disabled={deleting} className="bg-rose-600 hover:bg-rose-700 text-white">
                {deleting ? 'Deleting…' : 'Delete Program'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
