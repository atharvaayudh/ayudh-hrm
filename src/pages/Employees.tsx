import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, Plus, Filter } from 'lucide-react';

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const columns = [
    { key: 'image', label: 'Image' },
    { key: 'employee_id', label: 'Emp ID' },
    { key: 'name', label: 'Name' },
    { key: 'mobile_number', label: 'Mobile' },
    { key: 'designation', label: 'Designation' },
    { key: 'department', label: 'Department' },
    { key: 'reporting_manager', label: 'Reporting Manager' }
  ];
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const { data: emps, error } = await supabase.from('employee_master').select('*');
        if (error) throw error;

        const { data: designations } = await supabase.from('designations').select('*');
        const { data: departments } = await supabase.from('departments').select('*');
        
        const employeeMap = emps.reduce((acc, emp) => {
          acc[emp.employee_id] = emp;
          return acc;
        }, {} as Record<string, any>);
        
        const enriched = emps.map(emp => ({
          ...emp,
          designation: designations?.find(d => d.id === emp.designation_id)?.name || '',
          department: departments?.find(d => d.id === emp.department_id)?.name || '',
          reporting_manager: employeeMap[emp.reporting_manager_id]?.name || 'Not assigned',
          reporting_manager_image: employeeMap[emp.reporting_manager_id]?.image || null
        }));
        
        setEmployees(enriched);
      } catch (error) {
        console.error('Error fetching employees:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter(employee => {
    return columns.some(col => {
      const val = employee[col.key];
      return typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase());
    });
  });

  const handleRowClick = (employeeId: string) => {
    navigate(`/employees/view/${employeeId}`);
  };

  if (loading) return <div className="p-4">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Employee Directory</h1>
          <p className="text-muted-foreground">A complete list of all employees in your organization</p>
        </div>
        <Button 
          className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90" 
          onClick={() => navigate('/employees/add')}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[120px]">Image</TableHead>
                <TableHead>Emp ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Mobile</TableHead>
                <TableHead>Designation</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Reporting Manager</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow 
                  key={employee.employee_id} 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                  onClick={() => handleRowClick(employee.employee_id)}
                >
                  <TableCell>
                    <div className="flex items-center">
                      {employee.image ? (
                        <img 
                          src={employee.image} 
                          alt={employee.name} 
                          className="w-14 h-14 rounded-full object-cover border-2 border-gray-200" 
                        />
                      ) : (
                        <Avatar className="w-14 h-14 border-2 border-gray-200">
                          <AvatarFallback className="text-xl">
                            {employee.name?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{employee.employee_id}</TableCell>
                  <TableCell>{employee.name}</TableCell>
                  <TableCell>{employee.mobile_number}</TableCell>
                  <TableCell>{employee.designation}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {employee.reporting_manager_image ? (
                        <img 
                          src={employee.reporting_manager_image} 
                          alt={employee.reporting_manager} 
                          className="w-14 h-14 rounded-full object-cover border-2 border-gray-200" 
                        />
                      ) : employee.reporting_manager !== 'Not assigned' ? (
                        <Avatar className="w-14 h-14 border-2 border-gray-200">
                          <AvatarFallback className="text-xl">
                            {employee.reporting_manager?.[0]?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>
                      ) : null}
                      <span className="font-medium">{employee.reporting_manager}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={async (e) => {
                        e.stopPropagation();
                        await supabase.from('employee_master').delete().eq('employee_id', employee.employee_id);
                        setEmployees(emps => emps.filter(emp => emp.employee_id !== employee.employee_id));
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}