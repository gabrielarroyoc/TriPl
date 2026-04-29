import { useAuth } from '../store/AuthContext';
import { motion } from 'motion/react';
import { User, Mail, LogOut, Calendar, MapPin } from 'lucide-react';
import { LowCortisolIcon } from '../components/Icons';
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl shadow-sm border border-outline-variant p-8 mb-8 text-on-surface"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center border border-outline-variant">
            <User className="w-10 h-10 text-neutral-400" />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">My Account</h1>
            <div className="flex items-center justify-center md:justify-start gap-2 text-neutral-500 mb-6">
              <Mail className="w-4 h-4" />
              <span>{user?.email}</span>
            </div>
            
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors mx-auto md:mx-0"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Badges Section */}
        <div className="mt-8 pt-8 border-t border-outline-variant">
          <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4 px-1">My Badges</h3>
          <div className="flex flex-wrap gap-4">
             {/* This would fetch from profiles in a real scenario, adding a placeholder for now or assuming the state is handled */}
             <div className="flex flex-col items-center gap-2">
                <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 transition-all hover:bg-primary/10">
                   <LowCortisolIcon className="w-8 h-8 text-primary" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-tighter text-neutral-500">Low Cortisol</span>
             </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface p-6 rounded-xl border border-outline-variant text-on-surface"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">Saved Destinations</h3>
          </div>
          <p className="text-neutral-500 text-sm mb-4">You haven't saved any destinations yet.</p>
          <button className="text-sm font-semibold uppercase tracking-wider hover:text-neutral-600">
            Explore Destinations &rarr;
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-surface p-6 rounded-xl border border-outline-variant text-on-surface"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold">My Trips</h3>
          </div>
          <p className="text-neutral-500 text-sm mb-4">You don't have any upcoming trips planned.</p>
          <button className="text-sm font-semibold uppercase tracking-wider hover:text-neutral-600">
            Go to Planner &rarr;
          </button>
        </motion.div>
      </div>
    </div>
  );
}
