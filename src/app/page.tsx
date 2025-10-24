"use client";

import React, { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import SyntheticHero from "@/components/ui/synthetic-hero";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AnimatedButton from "@/components/AnimatedButton";
import { StatsSection, FeaturesSection, CTASection } from "@/components/sections";

const FloatingElement = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => (
  <motion.div
    className="absolute"
    animate={{
      y: [0, -20, 0],
      rotate: [0, 5, -5, 0],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      delay,
      ease: 'easeInOut',
    }}
  >
    {children}
  </motion.div>
);

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="w-screen min-h-screen flex flex-col relative overflow-hidden">

      {/* Mouse Follower */}
      <motion.div
        className="fixed w-96 h-96 bg-gradient-radial from-green-500/5 to-transparent rounded-full pointer-events-none blur-3xl"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <Navbar />

      {/* Hero Section with Extended Background */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <SyntheticHero
          title="Echo the Energy. Experience the Future of Live Events."
          description="Discover, book, and attend concerts and experiences reimagined."
          badgeText="Events.Echo"
          badgeLabel="Experience"
          ctaButtons={[
            { text: "Explore Events", href: "/events", primary: true },
            { text: "Organize an Event", href: "/organizer" }
          ]}
          microDetails={[
            "Immersive event discovery",
            "Interactive seat selection",
            "Secure payments",
          ]}
        />
      </motion.div>

      {/* Stats Section */}
      <div className="relative bg-gradient-to-b from-gray-900 via-gray-900/95 to-gray-900">
        <StatsSection />

        {/* Section Separator */}
        <div className="relative h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent my-8"></div>

        <FeaturesSection />

        {/* Section Separator */}
        <div className="relative h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent my-8"></div>

        <CTASection />
      </div>

      <Footer />
    </div>
  );
}
