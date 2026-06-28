import { motion } from 'framer-motion';
import { Users, GraduationCap, DollarSign, Activity, Calendar, ArrowUpRight } from 'lucide-react';

export default function Dashboard() {
  const stats = [
    { name: 'Total Students', value: '1,248', change: '+4.3%', icon: GraduationCap, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400' },
    { name: 'Total Teachers', value: '86', change: '+2.1%', icon: Users, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400' },
    { name: 'Monthly Collections', value: '$24,500', change: '+12.4%', icon: DollarSign, color: 'text-violet-600 bg-violet-50 dark:bg-violet-950/30 dark:text-violet-400' },
    { name: 'Attendance Rate', value: '94.2%', change: '+0.8%', icon: Activity, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400' },
  ];

  const recentActivities = [
    { id: 1, message: 'New student Ram Bahadur enrolled in Grade 10', time: '10 minutes ago', type: 'enrollment' },
    { id: 2, message: 'Fee payment received from Sita Kumari - Roll #42', time: '1 hour ago', type: 'payment' },
    { id: 3, message: 'Exam schedule published for Grade 12 Terminal Exams', time: '3 hours ago', type: 'exam' },
    { id: 4, message: 'Teacher Hari Prasad marked present for assembly duty', time: '5 hours ago', type: 'attendance' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">Welcome Back, Admin</h1>
        <p className="text-muted-foreground mt-1">Here is a snapshot of Deukhuri Digital Campus today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4 }}
            className="p-6 bg-card border border-border rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between animate-in fade-in duration-500"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">{stat.name}</span>
              <div className={`p-2.5 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-2xl font-bold text-foreground">{stat.value}</span>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">{stat.change}</span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left/Middle column (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Academic Overview</h2>
              <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1 cursor-pointer hover:text-foreground">
                View detailed report <ArrowUpRight className="h-3 w-3" />
              </span>
            </div>
            <div className="h-64 flex items-center justify-center border border-dashed border-border rounded-lg bg-secondary/20">
              <div className="text-center p-6">
                <Calendar className="h-10 w-10 text-muted-foreground/60 mx-auto mb-2" />
                <h3 className="font-semibold text-sm">Dashboard Chart Placeholder</h3>
                <p className="text-xs text-muted-foreground mt-1">Analytics visualization will load here.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right column (1/3 width) */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col h-full">
            <h2 className="text-lg font-bold mb-4">Recent System Log</h2>
            <div className="flex-1 space-y-4">
              {recentActivities.map((act) => (
                <div key={act.id} className="flex gap-3 text-sm pb-4 border-b border-border/60 last:border-b-0 last:pb-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-foreground/90 leading-tight">{act.message}</p>
                    <span className="text-xs text-muted-foreground block mt-1">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
