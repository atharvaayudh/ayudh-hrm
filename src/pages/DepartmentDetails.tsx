import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Users, Building, Edit, Mail, Phone, User } from 'lucide-react';

export default function DepartmentDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [department, setDepartment] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartmentDetails();
  }, [id]);

  async function fetchDepartmentDetails() {
    try {
      // Fetch department with head information
      const { data: dept, error: deptError } = await supabase
        .from('departments')
        .select(`
          id,
          name,
          description,
          head_user_id,
          created_at,
          employee_master:head_user_id (
            id,
            name,
            image,
            employee_id,
            mobile_number,
            official_mail_id,
            designations (name)
          )
        `)
        .eq('id', id)
        .single();

      if (deptError) throw deptError;

      // Fetch all employees in this department
      const { data: emps, error: empError } = await supabase
        .from('employee_master')
        .select(`
          id,
          name,
          image,
          employee_id,
          mobile_number,
          official_mail_id,
          date_of_joining,
          designations (name),
          employee_type (name)
        `)
        .eq('department_id', id);

      if (empError) throw empError;

      setDepartment(dept);
      setEmployees(emps || []);
    } catch (error) {
      console.error('Error fetching department details:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading department details...</p>
        </div>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold mb-4">Department not found</h1>
        <Button onClick={() => navigate('/departments')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Departments
        </Button>
      </div>
    );
  }

  const departmentHead = department.employee_master;

  return (
    <div className="p-8 bg-[#fff8f3] min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate('/departments')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Departments
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">
            <Edit className="h-4 w-4 mr-2" />
            Edit Department
          </Button>
        </div>

        {/* Department Header Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-orange-400 to-orange-600 h-32"></div>
          <CardContent className="relative pt-0 pb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16">
              {/* Department Icon */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                  <Building className="h-16 w-16 text-orange-600" />
                </div>
              </div>

              {/* Department Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold text-foreground mb-2">{department.name}</h1>
                <p className="text-muted-foreground mb-4">{department.description || 'No description available'}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  <Badge variant="default" className="text-sm">
                    {employees.length} Employees
                  </Badge>
                  <Badge variant="secondary" className="text-sm">
                    Active Department
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Department Head and Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Head */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Department Head
              </CardTitle>
            </CardHeader>
            <CardContent>
              {departmentHead ? (
                <div 
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => navigate(`/employees/view/${departmentHead.id}`)}
                >
                  <Avatar className="w-16 h-16 border-2 border-orange-200">
                    <AvatarImage src={departmentHead.image} alt={departmentHead.name} />
                    <AvatarFallback className="bg-orange-100 text-orange-700 text-xl">
                      {departmentHead.name ? departmentHead.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'DH'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{departmentHead.name}</h3>
                    <p className="text-sm text-muted-foreground">ID: {departmentHead.employee_id}</p>
                    <p className="text-sm text-muted-foreground">{departmentHead.designations?.name || 'No designation'}</p>
                    <div className="flex items-center gap-4 mt-2">
                      {departmentHead.mobile_number && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {departmentHead.mobile_number}
                        </div>
                      )}
                      {departmentHead.official_mail_id && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {departmentHead.official_mail_id}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No department head assigned</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total Employees</span>
                <span className="font-semibold text-lg">{employees.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Department Head</span>
                <span className="font-semibold">{departmentHead ? 'Assigned' : 'Not Assigned'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="font-semibold">
                  {new Date(department.created_at).toLocaleDateString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Employee List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Department Employees ({employees.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {employees.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Joining Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow 
                      key={employee.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/employees/view/${employee.id}`)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={employee.image} alt={employee.name} />
                            <AvatarFallback>
                              {employee.name ? employee.name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : '?'}
                            </AvatarFallback>
                          </Avatar>
                          <span>{employee.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{employee.employee_id}</TableCell>
                      <TableCell>{employee.designations?.name || 'Not assigned'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {employee.employee_type?.name || 'Standard'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {employee.mobile_number && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {employee.mobile_number}
                            </div>
                          )}
                          {employee.official_mail_id && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {employee.official_mail_id}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {employee.date_of_joining ? 
                          new Date(employee.date_of_joining).toLocaleDateString() : 
                          'Not specified'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/employees/view/${employee.id}`);
                          }}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No employees assigned to this department</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}