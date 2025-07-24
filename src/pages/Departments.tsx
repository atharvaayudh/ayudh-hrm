import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Building2, Users, TrendingUp, Plus } from 'lucide-react';

const departmentsData = [
  {
    id: 1,
    name: 'Engineering',
    description: 'Software development and technical operations',
    head: 'Alice Johnson',
    headAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    employeeCount: 12,
    growth: '+15%',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Marketing',
    description: 'Brand promotion and customer acquisition',
    head: 'Bob Smith',
    headAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
    employeeCount: 8,
    growth: '+8%',
    status: 'Active'
  },
  {
    id: 3,
    name: 'Human Resources',
    description: 'Employee relations and organizational development',
    head: 'Carol Wilson',
    headAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carol',
    employeeCount: 5,
    growth: '+5%',
    status: 'Active'
  },
  {
    id: 4,
    name: 'Finance',
    description: 'Financial planning and budget management',
    head: 'David Brown',
    headAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    employeeCount: 6,
    growth: '+3%',
    status: 'Active'
  },
  {
    id: 5,
    name: 'Sales',
    description: 'Revenue generation and client relationships',
    head: 'Emma Davis',
    headAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    employeeCount: 10,
    growth: '+12%',
    status: 'Active'
  }
];

export default function Departments() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Departments</h1>
          <p className="text-muted-foreground">Organize and manage your company departments</p>
        </div>
        <Button className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Departments</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 dark:text-blue-200">{departmentsData.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 dark:text-green-200">
              {departmentsData.reduce((sum, dept) => sum + dept.employeeCount, 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Average Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-800 dark:text-purple-200">+8.6%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departmentsData.map((department) => (
          <Card key={department.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{department.name}</CardTitle>
                <Badge variant={department.status === 'Active' ? 'default' : 'secondary'}>
                  {department.status}
                </Badge>
              </div>
              <CardDescription>{department.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={department.headAvatar} />
                  <AvatarFallback>{department.head.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{department.head}</p>
                  <p className="text-sm text-muted-foreground">Department Head</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-2xl font-bold">{department.employeeCount}</p>
                  <p className="text-sm text-muted-foreground">Employees</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">{department.growth}</p>
                  <p className="text-sm text-muted-foreground">Growth</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">View Details</Button>
                <Button size="sm" className="flex-1">Manage</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}