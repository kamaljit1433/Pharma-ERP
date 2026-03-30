import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useLeaveStore } from '../../store/leaveStore';
import { CalendarDays } from 'lucide-react';

interface LeaveApplicationProps {
  employeeId: string;
  onSuccess?: () => void;
}

export const LeaveApplication: React.FC<LeaveApplicationProps> = ({
  employeeId,
  onSuccess,
}) => {
  const { leaveTypes, fetchLeaveTypes, applyLeave, error } = useLeaveStore();
  const form = useForm({
    defaultValues: {
      employee_id: employeeId,
      leave_type_id: '',
      from_date: '',
      to_date: '',
      reason: '',
    },
  });

  useEffect(() => {
    fetchLeaveTypes();
  }, [fetchLeaveTypes]);

  const onSubmit = async (data: any) => {
    await applyLeave(data);
    if (!error) {
      form.reset();
      onSuccess?.();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Apply for Leave
        </CardTitle>
        <CardDescription>Submit a leave request for approval</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="leave_type_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="from_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="to_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>To Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter reason for leave" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <div className="text-sm text-destructive">{error}</div>}

            <Button type="submit" className="w-full">
              Submit Leave Request
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
