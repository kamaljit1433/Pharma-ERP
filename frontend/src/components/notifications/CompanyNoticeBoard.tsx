import React, { useEffect, useState } from 'react';
import { Cake, Gift, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface BirthdayWish {
  id: string;
  employeeId: string;
  employeeName: string;
  date: Date;
  department?: string;
}

interface AnniversaryWish {
  id: string;
  employeeId: string;
  employeeName: string;
  date: Date;
  yearsOfService: number;
  department?: string;
}

interface CompanyNoticeBoardProps {
  className?: string;
}

export const CompanyNoticeBoard: React.FC<CompanyNoticeBoardProps> = ({ className = '' }) => {
  const [birthdays, setBirthdays] = useState<BirthdayWish[]>([]);
  const [anniversaries, setAnniversaries] = useState<AnniversaryWish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchNoticeData();
  }, []);

  const fetchNoticeData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Mock data - in production, this would fetch from the API
      // For now, we'll show the component structure
      setBirthdays([]);
      setAnniversaries([]);
    } catch (err) {
      setError('Failed to load notice board data');
      console.error('Error fetching notice data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getMonthName = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'long' });
  };

  return (
    <div className={`w-full max-w-4xl ${className}`}>
      <Card className="border-border">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground">Company Notice Board</CardTitle>
          <CardDescription className="text-muted-foreground">
            Celebrate your team's special moments
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          {error && (
            <div className="p-4 bg-destructive/10 border-b border-border text-destructive text-sm flex gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Tabs defaultValue="birthdays" className="w-full">
              <TabsList className="w-full justify-start border-b border-border rounded-none bg-transparent p-0">
                <TabsTrigger
                  value="birthdays"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-4 py-3"
                >
                  <Cake className="w-4 h-4 mr-2" />
                  Birthdays ({birthdays.length})
                </TabsTrigger>
                <TabsTrigger
                  value="anniversaries"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent px-4 py-3"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  Work Anniversaries ({anniversaries.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="birthdays" className="p-0">
                {birthdays.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Cake className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No birthdays this month</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {birthdays.map(birthday => (
                      <div
                        key={birthday.id}
                        className="p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex-shrink-0 w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center">
                              <Cake className="w-6 h-6 text-warning" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">{birthday.employeeName}</p>
                              {birthday.department && (
                                <p className="text-sm text-muted-foreground">{birthday.department}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <Badge className="bg-warning text-warning-foreground">
                              {formatDate(birthday.date)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="anniversaries" className="p-0">
                {anniversaries.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Gift className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No work anniversaries this month</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {anniversaries.map(anniversary => (
                      <div
                        key={anniversary.id}
                        className="p-4 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex-shrink-0 w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                              <Gift className="w-6 h-6 text-success" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">{anniversary.employeeName}</p>
                              <p className="text-sm text-muted-foreground">
                                {anniversary.yearsOfService} year{anniversary.yearsOfService !== 1 ? 's' : ''} of service
                              </p>
                              {anniversary.department && (
                                <p className="text-sm text-muted-foreground">{anniversary.department}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <Badge className="bg-success text-success-foreground">
                              {formatDate(anniversary.date)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
