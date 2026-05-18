import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Applicant } from '../../types/recruitment';
import { FileText, Mail, Phone, Calendar, Download, ArrowLeft } from 'lucide-react';
import { CandidateCommunicationForm } from './CandidateCommunicationForm';
import { CommunicationHistory } from './CommunicationHistory';

interface CandidateDetailProps {
  candidate: Applicant;
  onBack: () => void;
  onStatusChange?: (candidateId: string, newStage: string) => void;
}

const stageColors: Record<string, string> = {
  Applied: 'bg-blue-100 text-blue-800',
  Screening: 'bg-yellow-100 text-yellow-800',
  Interview: 'bg-purple-100 text-purple-800',
  Offer: 'bg-green-100 text-green-800',
  Hired: 'bg-emerald-100 text-emerald-800',
  Rejected: 'bg-red-100 text-red-800',
};

const stages = ['Applied', 'Screening', 'Interview', 'Offer', 'Hired', 'Rejected'];

export const CandidateDetail: React.FC<CandidateDetailProps> = ({
  candidate,
  onBack,
  onStatusChange,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [communicationRefresh, setCommunicationRefresh] = useState(0);

  const handleDownloadResume = async () => {
    setIsDownloading(true);
    try {
      // In a real app, this would trigger a download from the resume_url
      const link = document.createElement('a');
      link.href = candidate.resume_url;
      link.download = `${candidate.name}-resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download resume:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleStageChange = (newStage: string) => {
    if (onStatusChange) {
      onStatusChange(candidate.id, newStage);
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Candidates
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{candidate.name}</CardTitle>
              <CardDescription>Candidate Profile</CardDescription>
            </div>
            <Badge className={stageColors[candidate.current_stage]}>
              {candidate.current_stage}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="resume">Resume</TabsTrigger>
              <TabsTrigger value="communication">Communication</TabsTrigger>
              <TabsTrigger value="status">Status</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${candidate.email}`} className="text-primary hover:underline">
                      {candidate.email}
                    </a>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${candidate.contact_number}`} className="text-primary hover:underline">
                      {candidate.contact_number}
                    </a>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Applied Date</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(candidate.applied_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>{new Date(candidate.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="resume" className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-4">Resume Document</p>
                <Button
                  onClick={handleDownloadResume}
                  disabled={isDownloading}
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  {isDownloading ? 'Downloading...' : 'Download Resume'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="communication" className="space-y-4">
              <CandidateCommunicationForm
                applicantId={candidate.id}
                applicantEmail={candidate.email}
                applicantName={candidate.name}
                onSuccess={() => setCommunicationRefresh((prev) => prev + 1)}
              />
              <CommunicationHistory
                applicantId={candidate.id}
                applicantName={candidate.name}
                refreshTrigger={communicationRefresh}
              />
            </TabsContent>

            <TabsContent value="status" className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-3 block">Move to Stage</label>
                <div className="grid grid-cols-2 gap-2">
                  {stages.map((stage) => (
                    <Button
                      key={stage}
                      variant={candidate.current_stage === stage ? 'default' : 'outline'}
                      onClick={() => handleStageChange(stage)}
                      className="justify-start"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          stageColors[stage].split(' ')[0]
                        }`}
                      />
                      {stage}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">Hiring Pipeline</h4>
                <div className="space-y-2">
                  {stages.map((stage, index) => (
                    <div key={stage} className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          stages.indexOf(candidate.current_stage) >= index
                            ? stageColors[stage].split(' ')[0]
                            : 'bg-muted-foreground/30'
                        }`}
                      />
                      <span
                        className={
                          stages.indexOf(candidate.current_stage) >= index
                            ? 'font-medium'
                            : 'text-muted-foreground'
                        }
                      >
                        {stage}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
