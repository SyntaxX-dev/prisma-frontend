"use client";

import { useState } from "react";
import { Navbar } from "../../../components/Navbar";
import { Sidebar } from "../../../components/Sidebar";
import { LearningDashboard } from "../../../components/LearningDashboard";

export default function DashboardPage() {
	const [isDark, setIsDark] = useState(true);
  
	const toggleTheme = () => {
	  setIsDark(!isDark);
	};
  
	return (
	  <div className={`min-h-screen ${isDark ? 'dark' : ''}`}>
		{/* Background */}
		<div 
		  className={`fixed inset-0 transition-all duration-300 ${
			isDark 
			  ? 'bg-gray-950' /* Quase preto no modo escuro */
			  : 'bg-gray-500' /* Gray médio no modo claro */
		  }`}
		  style={{
			backgroundImage: isDark
			  ? `
				radial-gradient(circle at 25% 25%, rgba(179, 226, 64, 0.08) 0%, transparent 50%),
				radial-gradient(circle at 75% 75%, rgba(179, 226, 64, 0.04) 0%, transparent 50%)
			  `
			  : `
				radial-gradient(circle at 25% 25%, rgba(179, 226, 64, 0.1) 0%, transparent 50%),
				radial-gradient(circle at 75% 75%, rgba(179, 226, 64, 0.05) 0%, transparent 50%)
			  `
		  }}
		/>
		
		{/* Glass overlay */}
		<div 
		  className={`fixed inset-0 backdrop-blur-sm transition-all duration-300 ${
			isDark ? 'bg-black/30' : 'bg-black/10'
		  }`} 
		/>
		
		{/* Content */}
		<div className="relative z-10">
		  <Navbar isDark={isDark} toggleTheme={toggleTheme} />
		  <Sidebar isDark={isDark} toggleTheme={toggleTheme} />
		  <LearningDashboard />
		</div>
	  </div>
	);
  }

