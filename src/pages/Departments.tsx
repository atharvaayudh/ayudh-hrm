import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Users, Building } from 'lucide-react';
import { toast } from 'sonner';

interface Department {
  id: string;
  name: string;
  description?: string;
  head_user_id?: string;
  head_name?: string;
  head_image?: string;
  head_employee_id?: string;
  employee_count: number;
  growth: number;
}

interface Employee {
  id: string;
  name: string;
  image?: string;
  employee_id: string;
}

function DepartmentCard({ dept, onView, onEdit }: { 
  dept: Department; 
  onView: (dept: Department) => void; 
  onEdit: (dept: Department) => void 
}) {
  return (
    <Card className="p-6 flex flex-col gap-4 shadow-md border border-orange-200 bg-[#fff8f3] hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-center">
        <div className="font-bold text-lg">{dept.name}</div>
        <span className="bg-orange-500 text-white text-xs px-3 py-1 rounded-full">Active</span>
      </div>
      <div className="text-sm text-gray-600 mb-2">{dept.description || 'No description available'}</div>
      
      <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-orange-100">
        <Avatar className="h-12 w-12 border-2 border-orange-200">
          <AvatarImage src={dept.head_image} alt={dept.head_name} />
          <AvatarFallback className="bg-orange-100 text-orange-700">
            {dept.head_name ? dept.head_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'NA'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="font-medium text-sm text-gray-900">
            {dept.head_name || 'Not assigned'}
          </div>
          <div className="text-xs text-gray-500">Department Head</div>
        </div>
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500" />
          <div>
            <div className="font-bold text-xl">{dept.employee_count}</div>
            <div className="text-xs text-gray-500">Employees</div>
          </div>
        </div>
        <div className="text-green-600 font-semibold text-sm">
          +{dept.growth}%<span className="text-xs ml-1">Growth</span>
        </div>
      </div>
      
      <div className="flex gap-2 mt-4">
        <Button variant="outline" className="flex-1" onClick={() => onView(dept)}>
          View Details
        </Button>
        <Button 
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" 
          onClick={() => onEdit(dept)}
        >
          Manage
        </Button>
      </div>
    </Card>
  );
}

export default function DepartmentsPage() {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Partial<Department>>({});
  const [manageDept, setManageDept] = useState<Department | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch employees for department head selection
      const { data: emps, error: empError } = await supabase
        .from('employee_master')
        .select('id, name, image, employee_id');
      
      if (empError) throw empError;
      setEmployees(emps || []);

      // Fetch departments with head information
      const { data: depts, error: deptError } = await supabase
        .from('departments')
        .select(`
          id, 
          name, 
          description, 
          head_user_id,
          employee_master:head_user_id (id, name, image, employee_id)
        `);
      
      if (deptError) throw deptError;

      // Fetch employee counts per department
      const { data: empData, error: countError } = await supabase
        .from('employee_master')
        .select('department_id');
      
      if (countError) throw countError;

      const empCounts = (empData || []).reduce((acc: Record<string, number>, e: any) => {
        if (e.department_id) acc[e.department_id] = (acc[e.department_id] || 0) + 1;
        return acc;
      }, {});

      const departmentsWithStats = (depts || []).map((d: any) => ({
        ...d,
        head_name: d.employee_master?.name || '',
        head_image: d.employee_master?.image || '',
        head_employee_id: d.employee_master?.employee_id || '',
        employee_count: empCounts[d.id] || 0,
        growth: Math.floor(Math.random() * 20) // Random growth for demo
      }));

      setDepartments(departmentsWithStats);
    } catch (error) {
      toast.error('Error fetching data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!form.name) {
      toast.error('Department name is required');
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase.from('departments').insert({
        name: form.name,
        description: form.description,
        head_user_id: form.head_user_id || null
      });
      
      if (error) throw error;
      
      toast.success('Department created successfully');
      setShowForm(false);
      setForm({});
      await fetchData();
    } catch (error) {
      toast.error('Failed to create department');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleManageSave() {
    if (!manageDept) return;
    
    setLoading(true);
    
    try {
      // Verify the employee exists if head_user_id is set
      if (manageDept.head_user_id) {
        const { data: employee, error } = await supabase
          .from('employee_master')
          .select('id')
          .eq('id', manageDept.head_user_id)
          .single();
        
        if (error || !employee) {
          throw new Error('Selected department head not found');
        }
      }

      const { error } = await supabase.from('departments')
        .update({
          name: manageDept.name,
          description: manageDept.description,
          head_user_id: manageDept.head_user_id || null
        })
        .eq('id', manageDept.id);
      
      if (error) throw error;
      
      toast.success('Department updated successfully');
      setManageDept(null);
      await fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update department');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleViewDepartment = (dept: Department) => {
    navigate(`/departments/${dept.id}`);
  };

  return (
    <div className="p-8 bg-[#fff8f3] min-h-screen">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg">Loading...</div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="text-3xl font-bold">Departments</div>
          <div className="text-gray-600">Organize and manage your company departments</div>
        </div>
        <Button 
          className="bg-orange-400 hover:bg-orange-500 text-white font-semibold px-6 py-2 rounded flex items-center gap-2" 
          onClick={() => setShowForm(true)}
          disabled={loading}
        >
          <Plus className="h-4 w-4" /> Add Department
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <Building className="h-8 w-8 text-blue-600" />
            <div>
              <div className="text-xs text-gray-500 mb-1">Total Departments</div>
              <div className="text-3xl font-bold">{departments.length}</div>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-green-600" />
            <div>
              <div className="text-xs text-gray-500 mb-1">Total Employees</div>
              <div className="text-3xl font-bold">
                {departments.reduce((a, d) => a + d.employee_count, 0)}
              </div>
            </div>
          </div>
        </Card>
        <Card className="p-6 bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
              %
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Average Growth</div>
              <div className="text-3xl font-bold">
                +{departments.length ? (departments.reduce((a, d) => a + d.growth, 0) / departments.length).toFixed(1) : 0}%
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Department cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {departments.map(dept => (
          <DepartmentCard 
            key={dept.id} 
            dept={dept} 
            onView={handleViewDepartment} 
            onEdit={setManageDept} 
          />
        ))}
      </div>

      {/* Add Department Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <Card className="p-8 w-full max-w-md">
            <div className="text-xl font-bold mb-4">Add Department</div>
            <Input 
              className="mb-3" 
              placeholder="Department Name" 
              value={form.name || ''} 
              onChange={e => setForm({ ...form, name: e.target.value })} 
            />
            <Input 
              className="mb-3" 
              placeholder="Description" 
              value={form.description || ''} 
              onChange={e => setForm({ ...form, description: e.target.value })} 
            />
            <Select 
              value={form.head_user_id || ''} 
              onValueChange={val => setForm({ ...form, head_user_id: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department Head" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not assigned</SelectItem>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={emp.image} alt={emp.name} />
                        <AvatarFallback className="text-xs">
                          {emp.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{emp.name} ({emp.employee_id})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" 
                onClick={handleAdd}
                disabled={loading}
              >
                Add
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Manage Department Modal */}
      {manageDept && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <Card className="p-8 w-full max-w-md">
            <div className="text-xl font-bold mb-4">Manage Department</div>
            <Input 
              className="mb-3" 
              placeholder="Department Name" 
              value={manageDept.name} 
              onChange={e => setManageDept({ ...manageDept, name: e.target.value })} 
            />
            <Input 
              className="mb-3" 
              placeholder="Description" 
              value={manageDept.description || ''} 
              onChange={e => setManageDept({ ...manageDept, description: e.target.value })} 
            />
            <Select 
              value={manageDept.head_user_id || ''} 
              onValueChange={val => setManageDept({ ...manageDept, head_user_id: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Department Head" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Not assigned</SelectItem>
                {employees.map(emp => (
                  <SelectItem key={emp.id} value={emp.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={emp.image} alt={emp.name} />
                        <AvatarFallback className="text-xs">
                          {emp.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span>{emp.name} ({emp.employee_id})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => setManageDept(null)}>
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white" 
                onClick={handleManageSave}
                disabled={loading}
              >
                Save
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}