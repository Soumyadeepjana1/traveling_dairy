import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  HiOutlineMap,
  HiOutlineCamera,
  HiOutlineChartBar,
  HiOutlineHeart,
  HiOutlineArrowRight,
  HiOutlineGlobeAlt,
  HiOutlineSparkles,
} from 'react-icons/hi2';

const features = [
  {
    icon: HiOutlineMap,
    title: 'Trip Journaling',
    desc: 'Document every detail of your journeys with rich entries, photos, and memories.',
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    icon: HiOutlineCamera,
    title: 'Photo Galleries',
    desc: 'Upload and organize stunning photos from your travels in beautiful galleries.',
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    icon: HiOutlineChartBar,
    title: 'Expense Tracking',
    desc: 'Keep track of your travel budget with detailed expense breakdowns.',
    gradient: 'from-orange-500 to-red-500',
  },
  {
    icon: HiOutlineHeart,
    title: 'Favorites & Bookmarks',
    desc: 'Save inspiring trips from other travelers and build your bucket list.',
    gradient: 'from-rose-500 to-orange-500',
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function HomePage() {

  return (
    <div className="bg-surface-950">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-primary-500/8 blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500/8 blur-3xl animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/[0.03]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-white/[0.02]" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-3xl relative"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-primary-300 mb-6"
          >
            <HiOutlineSparkles className="w-4 h-4" />
            Your personal travel companion
          </motion.div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            <span className="text-white">Every Journey</span>
            <br />
            <span className="bg-gradient-to-r from-primary-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Tells a Story
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Capture your adventures, track expenses, and relive your favorite moments — all in one beautiful platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/trips"
              className="px-8 py-3.5 rounded-2xl gradient-primary text-white font-semibold text-base hover:shadow-xl hover:shadow-primary-500/30 transition-all flex items-center gap-2"
            >
              <HiOutlineMap className="w-5 h-5" />
              View My Trips
            </Link>
            <Link
              to="/trips/new"
              className="px-8 py-3.5 rounded-2xl glass text-white font-semibold text-base hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <HiOutlineArrowRight className="w-5 h-5" />
              Create New Trip
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need for{' '}
              <span className="bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                travel tracking
              </span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              A complete toolkit to document, organize, and share your travel experiences.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((f) => (
              <motion.div
                key={f.title}
                variants={item}
                className="group glass rounded-2xl p-6 hover:bg-white/[0.08] transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto glass rounded-3xl p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 gradient-primary opacity-10" />
          <div className="relative">
            <HiOutlineGlobeAlt className="w-12 h-12 text-primary-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">Ready to start your adventure?</h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Join thousands of travelers documenting their journeys on TravelDiary.
            </p>
            <Link
              to="/trips/new"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl gradient-primary text-white font-semibold hover:shadow-xl hover:shadow-primary-500/30 transition-all"
            >
              Create Your First Trip
              <HiOutlineArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
