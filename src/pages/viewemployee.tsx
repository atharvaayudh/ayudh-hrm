import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ViewEmployee() {
  const { id } = useParams();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmployee() {
      try {
        const { data, error } = await supabase
          .from('employee_master')
          .select('*')
          .eq('employee_id', id)
          .single();
        
        if (error) throw error;
        setEmployee(data);
      } catch (error) {
        console.error('Error fetching employee:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEmployee();
  }, [id]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (!employee) return <div className="p-4">Employee not found</div>;

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Employee Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center gap-6">
            {employee.image ? (
              <img 
                src={employee.image} 
                alt={employee.name} 
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-200" 
              />
            ) : (
              <Avatar className="w-32 h-32 border-4 border-gray-200">
                <AvatarFallback className="text-4xl">
                  {employee.name?.[0]?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <h1 className="text-3xl font-bold">{employee.name}</h1>
              <p className="text-xl text-muted-foreground">{employee.designation}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium">Employee ID</h3>
              <p>{employee.employee_id}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Mobile Number</h3>
              <p>{employee.mobile_number}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Department</h3>
              <p>{employee.department}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Reporting Manager</h3>
              {employee.reporting_manager && employee.reporting_manager !== 'Not assigned' ? (
                <div className="flex items-center gap-3">
                  {employee.reporting_manager_image ? (
                    <img 
                      src={employee.reporting_manager_image} 
                      alt={employee.reporting_manager} 
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200" 
                    />
                  ) : (
                    <Avatar className="w-12 h-12 border-2 border-gray-200">
                      <AvatarFallback>
                        {employee.reporting_manager?.[0]?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <span>{employee.reporting_manager}</span>
                </div>
              ) : (
                <p>Not assigned</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}