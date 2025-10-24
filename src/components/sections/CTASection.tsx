import React from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';
import AnimatedButton from "@/components/AnimatedButton";

export const CTASection = () => {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-4xl mx-auto text-center"
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
          Ready to <span className="bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent">Experience</span> the Future?
        </motion.h2>
        <motion.p
          className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Join thousands of users who have already discovered their next unforgettable event.
        </motion.p>
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <AnimatedButton variant="glow" size="lg">
            <Zap className="w-5 h-5 mr-2" />
            Start Exploring
          </AnimatedButton>
          <AnimatedButton variant="outline" size="lg">
            Learn More
            <ArrowRight className="w-5 h-5 ml-2" />
          </AnimatedButton>
        </motion.div>
      </motion.div>
    </section>
  );
};