import { useAuth } from '../store/AuthContext';
import { motion } from 'motion/react';
import { User, Mail, LogOut, Calendar, MapPin } from 'lucide-react';
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
        className="bg-white rounded-2xl shadow-sm border border-outline-variant p-8 mb-8"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center border border-outline-variant">
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
              className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors mx-auto md:mx-0"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl border border-outline-variant"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
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
          className="bg-white p-6 rounded-xl border border-outline-variant"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
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
