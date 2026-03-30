import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Lightbulb, Plus, Trash2 } from 'lucide-react';
import trainingService, { EmployeeSkill, Skill } from '../../services/trainingService';

interface SkillMatrixProps {
  employeeId: string;
}

export const SkillMatrix: React.FC<SkillMatrixProps> = ({ employeeId }) => {
  const [employeeSkills, setEmployeeSkills] = useState<EmployeeSkill[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    skill_id: '',
    proficiency_level: 'beginner' as const,
    years_of_experience: 0,
  });

  useEffect(() => {
    loadData();
  }, [employeeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [skills, allSkills] = await Promise.all([
        trainingService.getEmployeeSkills(employeeId),
        trainingService.getAllSkills(),
      ]);
      setEmployeeSkills(skills);
      setAvailableSkills(allSkills);
    } catch (error) {
      console.error('Failed to load skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await trainingService.addEmployeeSkill({
        employee_id: employeeId,
        skill_id: formData.skill_id,
        proficiency_level: formData.proficiency_level,
        years_of_experience: formData.years_of_experience || undefined,
      });
      setFormData({
        skill_id: '',
        proficiency_level: 'beginner',
        years_of_experience: 0,
      });
      setShowForm(false);
      loadData();
    } catch (error) {
      console.error('Failed to add skill:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this skill?')) {
      try {
        await trainingService.deleteEmployeeSkill(id);
        loadData();
      } catch (error) {
        console.error('Failed to delete skill:', error);
      }
    }
  };

  const getProficiencyColor = (level: string) => {
    switch (level) {
      case 'expert':
        return 'bg-emerald-100 text-emerald-800';
      case 'advanced':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-amber-100 text-amber-800';
      case 'beginner':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUnusedSkills = () => {
    const usedSkillIds = new Set(employeeSkills.map((es) => es.skill_id));
    return availableSkills.filter((s) => !usedSkillIds.has(s.id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Skill Matrix</h2>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Skill
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="skill">Select Skill</Label>
                <select
                  id="skill"
                  value={formData.skill_id}
                  onChange={(e) => setFormData({ ...formData, skill_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Choose a skill...</option>
                  {getUnusedSkills().map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name} ({skill.category})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="proficiency">Proficiency Level</Label>
                <select
                  id="proficiency"
                  value={formData.proficiency_level}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      proficiency_level: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>
              <div>
                <Label htmlFor="years">Years of Experience</Label>
                <Input
                  id="years"
                  type="number"
                  value={formData.years_of_experience}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      years_of_experience: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Add Skill</Button>
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
          {employeeSkills.length === 0 ? (
            <Card className="p-6 text-center text-gray-600">No skills added yet</Card>
          ) : (
            employeeSkills.map((skill) => {
              const skillDetails = availableSkills.find((s) => s.id === skill.skill_id);
              return (
                <Card key={skill.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{skillDetails?.name}</h3>
                      <p className="text-sm text-gray-600">{skillDetails?.category}</p>
                      {skill.years_of_experience && (
                        <p className="text-sm text-gray-600">
                          Experience: {skill.years_of_experience} years
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getProficiencyColor(skill.proficiency_level)}>
                        {skill.proficiency_level}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => handleDelete(skill.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
