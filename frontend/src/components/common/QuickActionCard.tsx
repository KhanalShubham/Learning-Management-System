import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useUIStore } from '@/store';
import { useToast } from '@/hooks/use-toast';
import {
  UserPlus,
  Receipt,
  FileSpreadsheet,
  FileCheck,
  CalendarCheck,
  Mail,
  Wallet,
  CalendarDays,
} from 'lucide-react';

export const QuickActionCard = () => {
  const simulatedRole = useUIStore((state) => state.simulatedRole);
  const { toast } = useToast();

  // Dialog / Modal triggers
  const [studentModalOpen, setStudentModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);

  // Form states
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState('Grade 10');
  const [leaveReason, setLeaveReason] = useState('');
  const [supportMsg, setSupportMsg] = useState('');

  const handleCreateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      toast({ title: 'Error', description: 'Student name is required', variant: 'destructive' });
      return;
    }
    toast({
      title: 'Success',
      description: `Student ${studentName} admitted successfully to ${studentGrade}!`,
      variant: 'success',
    });
    setStudentName('');
    setStudentModalOpen(false);
  };

  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason.trim()) {
      toast({ title: 'Error', description: 'Reason is required', variant: 'destructive' });
      return;
    }
    toast({
      title: 'Request Submitted',
      description: 'Leave application submitted for approval.',
      variant: 'info',
    });
    setLeaveReason('');
    setLeaveModalOpen(false);
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMsg.trim()) return;
    toast({
      title: 'Message Sent',
      description: 'Your inquiry has been sent to campus administration.',
      variant: 'success',
    });
    setSupportMsg('');
    setSupportModalOpen(false);
  };

  const runInvoiceSimulation = () => {
    toast({ title: 'Processing', description: 'Compiling fee sheets, please wait...', variant: 'info' });
    setTimeout(() => {
      toast({ title: 'Success', description: '1,248 student invoices generated!', variant: 'success' });
    }, 1500);
  };

  const actions = {
    admin: [
      {
        name: 'Admit Student',
        description: 'Register a new enrollee',
        icon: UserPlus,
        color: 'bg-blue-500 hover:bg-blue-600',
        onClick: () => setStudentModalOpen(true),
      },
      {
        name: 'Run Invoices',
        description: 'Generate term invoice sheets',
        icon: Receipt,
        color: 'bg-violet-500 hover:bg-violet-600',
        onClick: runInvoiceSimulation,
      },
      {
        name: 'Export Grades',
        description: 'Download report ledger Excel',
        icon: FileSpreadsheet,
        color: 'bg-emerald-500 hover:bg-emerald-600',
        onClick: () => toast({ title: 'Downloading', description: 'Report card ledger CSV initiated...', variant: 'info' }),
      },
    ],
    teacher: [
      {
        name: 'File Attendance',
        description: 'Mark class assembly list',
        icon: CalendarCheck,
        color: 'bg-emerald-500 hover:bg-emerald-600',
        onClick: () => toast({ title: 'Attendance Registry', description: 'Redirecting to attendance log...', variant: 'info' }),
      },
      {
        name: 'Request Leave',
        description: 'Submit leave applications',
        icon: Mail,
        color: 'bg-amber-500 hover:bg-amber-600',
        onClick: () => setLeaveModalOpen(true),
      },
      {
        name: 'Grades Sheets',
        description: 'Input final test marks',
        icon: FileCheck,
        color: 'bg-indigo-500 hover:bg-indigo-600',
        onClick: () => toast({ title: 'Grade Book', description: 'Redirecting to Grade book...', variant: 'info' }),
      },
    ],
    student: [
      {
        name: 'Pay Invoices',
        description: 'Clear semester fee amounts',
        icon: Wallet,
        color: 'bg-blue-500 hover:bg-blue-600',
        onClick: () => toast({ title: 'Payment Desk', description: 'Connecting secure payment gateway...', variant: 'info' }),
      },
      {
        name: 'Submit Absence',
        description: 'Log leave excuses',
        icon: CalendarDays,
        color: 'bg-amber-500 hover:bg-amber-600',
        onClick: () => setLeaveModalOpen(true),
      },
      {
        name: 'Help Desk',
        description: 'Contact campus principal',
        icon: Mail,
        color: 'bg-purple-500 hover:bg-purple-600',
        onClick: () => setSupportModalOpen(true),
      },
    ],
  }[simulatedRole];

  return (
    <Card className="flex flex-col justify-between h-full">
      <CardHeader className="pb-3">
        <CardTitle>Quick Workflows</CardTitle>
        <CardDescription>Shortcut triggers for standard actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {actions.map((act) => (
            <button
              key={act.name}
              onClick={act.onClick}
              className="group p-4 bg-secondary/30 border border-border/60 hover:bg-secondary/70 rounded-xl flex items-center gap-3.5 transition-all text-left cursor-pointer active:scale-98"
            >
              <div className={`p-2.5 rounded-lg text-white shrink-0 ${act.color} group-hover:scale-105 transition-transform`}>
                <act.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h5 className="text-xs font-bold text-foreground truncate">{act.name}</h5>
                <p className="text-[10px] text-muted-foreground mt-0.5 truncate">{act.description}</p>
              </div>
            </button>
          ))}
        </div>
      </CardContent>

      {/* ADMIT STUDENT MODAL */}
      <Modal isOpen={studentModalOpen} onClose={() => setStudentModalOpen(false)} title="Admit Student Portal">
        <form onSubmit={handleCreateStudentSubmit} className="space-y-4 py-2">
          <Input
            label="Full Name"
            placeholder="e.g. Ram Chandra Bahadur"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
          />
          <Select
            label="Enrolling Class Section"
            value={studentGrade}
            onChange={(e) => setStudentGrade(e.target.value)}
            options={[
              { value: 'Grade 9', label: 'Grade 9 - Sec A' },
              { value: 'Grade 10', label: 'Grade 10 - Sec A' },
              { value: 'Grade 11', label: 'Grade 11 - Sec B' },
              { value: 'Grade 12', label: 'Grade 12 - Sec C' },
            ]}
          />
          <div className="flex justify-end gap-3.5 pt-4">
            <Button variant="ghost" onClick={() => setStudentModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="default" type="submit">
              Register Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* REQUEST LEAVE MODAL */}
      <Modal isOpen={leaveModalOpen} onClose={() => setLeaveModalOpen(false)} title="Request Leave Notification">
        <form onSubmit={handleLeaveSubmit} className="space-y-4 py-2">
          <Input
            label="Reason for Absence"
            placeholder="e.g. Medical checkup or family emergency"
            value={leaveReason}
            onChange={(e) => setLeaveReason(e.target.value)}
          />
          <div className="flex justify-end gap-3.5 pt-4">
            <Button variant="ghost" onClick={() => setLeaveModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="default" type="submit">
              Submit Leave Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* HELP DESK SUPPORT MODAL */}
      <Modal isOpen={supportModalOpen} onClose={() => setSupportModalOpen(false)} title="Contact Campus Office">
        <form onSubmit={handleSupportSubmit} className="space-y-4 py-2">
          <Input
            label="Inquiry Message"
            placeholder="Briefly describe your request or issue..."
            value={supportMsg}
            onChange={(e) => setSupportMsg(e.target.value)}
          />
          <div className="flex justify-end gap-3.5 pt-4">
            <Button variant="ghost" onClick={() => setSupportModalOpen(false)} type="button">
              Cancel
            </Button>
            <Button variant="default" type="submit">
              Send Message
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};
export default QuickActionCard;
