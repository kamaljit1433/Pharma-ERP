import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Progress } from '../ui/progress';
import { BarChart3, Download } from 'lucide-react';
import trainingService, { SkillGapReport } from '../../services/trainingService';

export const SkillGapReport: React.FC = () => {
  const [departmentId, setDepartmentId] = useState('');
  const [report, setReport] = useState<SkillGapReport | null>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const data = await trainingService.generateSkillGapReport(departmentId);
      setReport(data);
    } catch (error) {
      console.error('Failed to generate report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!report) return;

    const csv = [
      ['Skill Gap Report'],
      ['Department ID', report.department_id],
      ['Generated At', new Date(report.generated_at).toLocaleString()],
      ['Team Coverage %', report.team_coverage_percentage],
      [],
      ['Skill Name', 'Required Proficiency', 'Employees with Skill', 'Total Employees', 'Coverage %'],
      ...report.required_skills.map((skill) => [
        skill.skill_name,
        skill.required_proficiency,
        skill.employees_with_skill,
        skill.total_employees,
        skill.coverage_percentage,
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `skill-gap-report-${departmentId}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <BarChart3 className="w-6 h-6" />
        <h2 className="text-2xl font-bold">Skill Gap Report</h2>
      </div>

      <Card className="p-6">
        <form onSubmit={handleGenerateReport} className="space-y-4">
          <div>
            <Label htmlFor="department">Department ID</Label>
            <Input
              id="department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              placeholder="Enter department ID"
              required
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Report'}
          </Button>
        </form>
      </Card>

      {report && (
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-600">Team Coverage</h3>
                <div className="mt-2 flex items-center gap-4">
                  <Progress value={report.team_coverage_percentage} className="flex-1" />
                  <span className="text-2xl font-bold">{report.team_coverage_percentage}%</span>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                Generated: {new Date(report.generated_at).toLocaleString()}
              </p>
            </div>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleExport} className="gap-2">
              <Download className="w-4 h-4" />
              Export as CSV
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Skill Coverage by Role</h3>
            {report.required_skills.map((skill) => (
              <Card key={skill.skill_id} className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{skill.skill_name}</h4>
                      <p className="text-sm text-gray-600">
                        Required: {skill.required_proficiency} | {skill.employees_with_skill} of{' '}
                        {skill.total_employees} employees
                      </p>
                    </div>
                    <span className="text-lg font-bold">{skill.coverage_percentage}%</span>
                  </div>
                  <Progress value={skill.coverage_percentage} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
