import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Building2, Home, Users, Clock, DollarSign, TrendingUp, 
  Heart, GraduationCap, UserPlus, Settings, BarChart3,
  User, ChevronDown, LogOut
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

const menuItems = [
  { title: 'Dashboard', url: '/', icon: Home },
  {
    title: 'Employee Management',
    icon: Users,
    submenu: [
      { title: 'View/Edit Employees', url: '/employees' },
      { title: 'Add Employee', url: '/employees/add' },
      { title: 'Departments', url: '/departments' },
      { title: 'Designations', url: '/designations' },
    ]
  },
  {
    title: 'Attendance & Leave',
    icon: Clock,
    submenu: [
      { title: 'View Attendance', url: '/attendance' },
      { title: 'Upload Attendance', url: '/attendance/upload' },
      { title: 'Shift Management', url: '/shifts' },
      { title: 'Monthly Summary', url: '/attendance/summary' },
    ]
  },
  {
    title: 'Payroll & Compensation',
    icon: DollarSign,
    submenu: [
      { title: 'Payroll Dashboard', url: '/payroll' },
      { title: 'Salary Structure', url: '/payroll/structure' },
      { title: 'Generate Payslips', url: '/payroll/payslips' },
      { title: 'Overtime', url: '/payroll/overtime' },
      { title: 'Deductions', url: '/payroll/deductions' },
      { title: 'Reports', url: '/payroll/reports' },
    ]
  },
  {
    title: 'Performance Management',
    icon: TrendingUp,
    submenu: [
      { title: 'KPI/KRA Setup', url: '/performance/kpi' },
      { title: 'Goal Setting', url: '/performance/goals' },
      { title: 'Appraisals', url: '/performance/appraisals' },
      { title: 'Feedbacks', url: '/performance/feedback' },
      { title: 'Performance Report', url: '/performance/reports' },
    ]
  },
  {
    title: 'Employee Engagement',
    icon: Heart,
    submenu: [
      { title: 'Announcements', url: '/engagement/announcements' },
      { title: 'Birthday Board', url: '/engagement/birthdays' },
      { title: 'Polls & Surveys', url: '/engagement/polls' },
      { title: 'Rewards & Recognition', url: '/engagement/rewards' },
    ]
  },
  {
    title: 'Training & Development',
    icon: GraduationCap,
    submenu: [
      { title: 'Training Calendar', url: '/training/calendar' },
      { title: 'Course Library', url: '/training/courses' },
      { title: 'Enrollments', url: '/training/enrollments' },
      { title: 'Training Feedback', url: '/training/feedback' },
    ]
  },
  {
    title: 'Recruitment',
    icon: UserPlus,
    submenu: [
      { title: 'Dashboard', url: '/recruitment' },
      { title: 'Job Openings', url: '/recruitment/jobs' },
      { title: 'Resume Bank', url: '/recruitment/resumes' },
      { title: 'Interview Schedules', url: '/recruitment/interviews' },
      { title: 'Offer Letters', url: '/recruitment/offers' },
    ]
  },
  { title: 'Admin Tools', url: '/admin', icon: Settings },
  { title: 'Reports & Analytics', url: '/reports', icon: BarChart3 },
  {
    title: 'Self Service',
    icon: User,
    submenu: [
      { title: 'My Profile', url: '/self-service/profile' },
      { title: 'My Attendance', url: '/self-service/attendance' },
      { title: 'My Payslips', url: '/self-service/payslips' },
      { title: 'Reimbursements', url: '/self-service/reimbursements' },
      { title: 'Update Documents', url: '/self-service/documents' },
    ]
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [openGroups, setOpenGroups] = useState<string[]>(['Employee Management']);
  
  const collapsed = state === 'collapsed';

  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;
  const isGroupActive = (submenu: any[]) => submenu.some(item => isActive(item.url));

  const toggleGroup = (title: string) => {
    setOpenGroups(prev => 
      prev.includes(title) 
        ? prev.filter(group => group !== title)
        : [...prev, title]
    );
  };

  const getNavClass = (isActive: boolean) =>
    isActive 
      ? 'bg-primary text-primary-foreground font-medium' 
      : 'hover:bg-accent hover:text-accent-foreground';

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <Sidebar
      className={`${collapsed ? 'w-16' : 'w-64'} transition-all duration-300 border-r bg-sidebar`}
      collapsible="icon"
    >
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-primary to-secondary">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                HRM Portal
              </h2>
              <p className="text-xs text-muted-foreground">Enterprise Resource Management</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto">
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                {item.submenu ? (
                  <Collapsible
                    open={openGroups.includes(item.title)}
                    onOpenChange={() => toggleGroup(item.title)}
                  >
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        className={`w-full justify-between ${
                          isGroupActive(item.submenu) ? 'bg-accent' : 'hover:bg-accent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <item.icon className="h-4 w-4" />
                          {!collapsed && <span className="text-sm">{item.title}</span>}
                        </div>
                        {!collapsed && (
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${
                              openGroups.includes(item.title) ? 'rotate-180' : ''
                            }`}
                          />
                        )}
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {!collapsed && (
                      <CollapsibleContent className="ml-6 mt-1">
                        {item.submenu.map((subItem) => (
                          <SidebarMenuButton key={subItem.url} asChild size="sm">
                            <NavLink
                              to={subItem.url}
                              className={`${getNavClass(isActive(subItem.url))} text-xs pl-6 py-2`}
                            >
                              {subItem.title}
                            </NavLink>
                          </SidebarMenuButton>
                        ))}
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                ) : (
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className={`${getNavClass(isActive(item.url))} flex items-center gap-2`}
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span className="text-sm">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-xs">
              {user?.user_metadata?.first_name?.[0] || user?.email?.[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.user_metadata?.first_name || user?.email}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start mt-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}