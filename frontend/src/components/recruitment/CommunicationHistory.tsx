import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Mail, Calendar, User, Loader2 } from 'lucide-react';
import { CandidateCommunication } from '../../types/recruitment';
import { recruitmentService } from '../../services/recruitmentService';

interface CommunicationHistoryProps {
  applicantId: string;
  applicantName: string;
  refreshTrigger?: number;
}

export const CommunicationHistory: React.FC<CommunicationHistoryProps> = ({
  applicantId,
  applicantName,
  refreshTrigger,
}) => {
  const [communications, setCommunications] = useState<CandidateCommunication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunications = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await recruitmentService.getCommunicationHistory(applicantId);
        setCommunications(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load communication history';
        setError(errorMessage);
        setCommunications([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCommunications();
  }, [applicantId, refreshTrigger]);

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="w-5 h-5" />
          Communication History
        </CardTitle>
        <CardDescription>
          All emails sent to {applicantName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading communications...</span>
          </div>
        ) : error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        ) : communications.length === 0 ? (
          <div className="text-center py-8">
            <Mail className="w-12 h-12 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-muted-foreground">No communications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {communications.map((comm) => (
              <div
                key={comm.id}
                className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{comm.sender_name}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(comm.sent_at)}
                      </p>
                    </div>
                  </div>
                  {comm.read_at && (
                    <Badge variant="outline" className="text-xs">
                      Read
                    </Badge>
                  )}
                </div>

                <div className="ml-10">
                  <h4 className="font-medium text-sm mb-1">{comm.subject}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {comm.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
