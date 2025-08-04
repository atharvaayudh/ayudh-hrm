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

interface Employee {
  employee_id: string;
  name: string;
  mobile_number: string;
  designation: string;
  department: string;
  image?: string;
  reporting_manager_id?: string;
  reporting_manager_name?: string;
  reporting_manager_image?: string;
}

export default function Employees() {
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchEmployees() {
      try {
        // First fetch all employees to build complete manager data
        const { data: allEmployees, error: allError } = await supabase
          .from('employee_master')
          .select('employee_id, name, image');
        
        if (allError) throw allError;

        const managerMap = new Map(
          allEmployees.map(emp => [emp.employee_id, emp])
        );

        // Then fetch current employees with their full details
        const { data: emps, error } = await supabase
          .from('employee_master')
          .select(`
            *,
            designations(name),
            departments(name)
          `);
        
        if (error) throw error;

        const enriched = emps.map(emp => {
          const manager = emp.reporting_manager_id ? managerMap.get(emp.reporting_manager_id) : null;
          
          return {
            employee_id: emp.employee_id,
            name: emp.name,
            mobile_number: emp.mobile_number,
            designation: emp.designations?.name || '',
            department: emp.departments?.name || '',
            image: emp.image,
            reporting_manager_id: emp.reporting_manager_id,
            reporting_manager_name: manager?.name || 'Not assigned',
            reporting_manager_image: manager?.image || null
          };
        });

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
    const searchFields = [
      employee.employee_id,
      employee.name,
      employee.mobile_number,
      employee.designation,
      employee.department,
      employee.reporting_manager_name
    ];
    
    return searchFields.some(field => 
      field?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
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
                    {employee.reporting_manager_id ? (
                      <div 
                        className="flex items-center gap-3 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (employee.reporting_manager_id) {
                            navigate(`/employees/view/${employee.reporting_manager_id}`);
                          }
                        }}
                      >
                        {employee.reporting_manager_image ? (
                          <img 
                            src={employee.reporting_manager_image} 
                            alt={employee.reporting_manager_name} 
                            className="w-14 h-14 rounded-full object-cover border-2 border-gray-200" 
                          />
                        ) : (
                          <Avatar className="w-14 h-14 border-2 border-gray-200">
                            <AvatarFallback className="text-xl">
                              {employee.reporting_manager_name?.[0]?.toUpperCase() || 'M'}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <span className="font-medium">{employee.reporting_manager_name}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Not assigned</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={async (e) => {
                        e.stopPropagation();
                        await supabase.from('employee_master').delete().eq('employee_id', employee.employee_id);
                        setEmployees(prev => prev.filter(emp => emp.employee_id !== employee.employee_id));
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