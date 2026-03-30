import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Certificate, Plus, Trash2 } from 'lucide-react';
import trainingService, { Certification } from '../../services/trainingService';

interface CertificationManagementProps {
  employeeId: string;
}

export const CertificationManagement: React.FC<CertificationManagementProps> = ({ employeeId }) => {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    issuing_organization: '',
    certificate_number: '',
    issue_date: '',
    expiry_date: '',
    certificate_url: '',
  });

  useEffect(() => {
    loadCertifications();
  }, [employeeId]);

  const loadCertifications = async () => {
    try {
      setLoading(true);
      const data = await trainingService.getEmployeeCertifications(employeeId);
      setCertifications(data);
    } catch (error) {
      console.error('Failed to load certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await trainingService.addCertification({
        employee_id: employeeId,
        name: formData.name,
        issuing_organization: formData.issuing_organization,
        certificate_number: formData.certificate_number || undefined,
        issue_date: new Date(formData.issue_date),
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date) : undefined,
        certificate_url: formData.certificate_url || undefined,
      });
      setFormData({
        name: '',
        issuing_organization: '',
        certificate_number: '',
        issue_date: '',
        expiry_date: '',
        certificate_url: '',
      });
      setShowForm(false);
      loadCertifications();
    } catch (error) {
      console.error('Failed to add certification:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this certification?')) {
      try {
        await trainingService.updateCertification(id, { is_active: false });
        loadCertifications();
      } catch (error) {
        console.error('Failed to delete certification:', error);
      }
    }
  };

  const getStatusColor = (cert: Certification) => {
    if (!cert.expiry_date) return 'bg-emerald-100 text-emerald-800';
    const now = new Date();
    const expiryDate = new Date(cert.expiry_date);
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'bg-rose-100 text-rose-800';
    if (daysUntilExpiry < 30) return 'bg-amber-100 text-amber-800';
    return 'bg-emerald-100 text-emerald-800';
  };

  const getStatusText = (cert: Certification) => {
    if (!cert.expiry_date) return 'No Expiry';
    const now = new Date();
    const expiryDate = new Date(cert.expiry_date);
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'Expired';
    if (daysUntilExpiry < 30) return `Expiring Soon (${daysUntilExpiry} days)`;
    return 'Active';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Certificate className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Certifications</h2>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Certification
        </Button>
      </div>

      {showForm && (
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Certification Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="issuing_organization">Issuing Organization</Label>
                <Input
                  id="issuing_organization"
                  value={formData.issuing_organization}
                  onChange={(e) => setFormData({ ...formData, issuing_organization: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="certificate_number">Certificate Number</Label>
                <Input
                  id="certificate_number"
                  value={formData.certificate_number}
                  onChange={(e) => setFormData({ ...formData, certificate_number: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="issue_date">Issue Date</Label>
                <Input
                  id="issue_date"
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input
                  id="expiry_date"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="certificate_url">Certificate URL</Label>
                <Input
                  id="certificate_url"
                  type="url"
                  value={formData.certificate_url}
                  onChange={(e) => setFormData({ ...formData, certificate_url: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Add Certification</Button>
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
          {certifications.map((cert) => (
            <Card key={cert.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{cert.name}</h3>
                  <p className="text-sm text-gray-600">{cert.issuing_organization}</p>
                  {cert.certificate_number && (
                    <p className="text-sm text-gray-600">Certificate #: {cert.certificate_number}</p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <span>Issued: {new Date(cert.issue_date).toLocaleDateString()}</span>
                    {cert.expiry_date && (
                      <span>Expires: {new Date(cert.expiry_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(cert)}>{getStatusText(cert)}</Badge>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(cert.id)}>
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
