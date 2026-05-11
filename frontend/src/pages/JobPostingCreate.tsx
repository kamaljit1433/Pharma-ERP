import React from 'react';
import { useNavigate } from 'react-router-dom';
import { JobPostingForm } from '@/components/recruitment/JobPostingForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const JobPostingCreate: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/recruitment')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Recruitment
        </Button>
      </div>
      <JobPostingForm onSuccess={() => navigate('/recruitment')} />
    </div>
  );
};

export default JobPostingCreate;
