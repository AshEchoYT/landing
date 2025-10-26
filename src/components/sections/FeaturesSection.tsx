import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Users, Calendar, Star, Sparkles, ArrowRight } from 'lucide-react';

const FeatureCard = ({ title, description, icon: Icon, delay }: { title: string; description: string; icon: any; delay: number }) => (
  <motion.div
    className="bg-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-150 group hover:scale-[1.03] transform will-change-transform"
    initial={{ opacity: 0, x: -50 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.6, delay }}
    viewport={{ once: true }}
    whileHover={{ scale: 1.02, y: -5 }}
  >
    <motion.div
      className="flex items-center mb-4"
      whileHover={{ x: 10 }}
    >
      <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-green-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-100 ease-out will-change-transform">
        <Icon className="w-5 h-5 text-black" />
      </div>
      <h3 className="text-xl font-semibold text-white group-hover:text-cyan-400 transition-colors duration-100 ease-out">{title}</h3>
    </motion.div>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </motion.div>
);

export const FeaturesSection = () => {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gray-900/20">
      <div className="max-w-screen-2xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-white mb-6"
            initial={{ scale: 0.8 }}
            whileInView={{ scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            Why Choose <span className="bg-gradient-to-r from-cyan-400 to-green-500 bg-clip-text text-transparent">Events.Echo</span>?
          </motion.h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={Zap}
            title="Lightning Fast"
            description="Discover and book events in seconds with our optimized platform and real-time updates."
            delay={0}
          />
          <FeatureCard
            icon={Users}
            title="Community Driven"
            description="Connect with fellow event enthusiasts and organizers in our vibrant community."
            delay={0.1}
          />
          <FeatureCard
            icon={Calendar}
            title="Smart Scheduling"
            description="AI-powered recommendations help you find the perfect events for your interests."
            delay={0.2}
          />
          <FeatureCard
            icon={Star}
            title="Premium Experience"
            description="Enjoy top-tier events with professional production and immersive experiences."
            delay={0.3}
          />
          <FeatureCard
            icon={Sparkles}
            title="Innovative Tech"
            description="Cutting-edge features like AR previews and interactive seat selection."
            delay={0.4}
          />
          <FeatureCard
            icon={ArrowRight}
            title="Seamless Integration"
            description="Easy integration with your favorite calendar apps and social platforms."
            delay={0.5}
          />
        </div>
      </div>
    </section>
  );
};