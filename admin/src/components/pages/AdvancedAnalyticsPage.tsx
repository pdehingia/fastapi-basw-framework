import React from 'react';
import { AdvancedAnalyticsManagement } from '../../../components/organisms';
import { motion } from 'framer-motion';

/**
 * Advanced Analytics & Reporting Page
 * 
 * Features:
 * - Comprehensive analytics overview
 * - Custom report builder with drag-and-drop
 * - Interactive dashboard designer
 * - Data visualization engine
 * - Export management system
 * - Real-time data monitoring
 * - Scheduled report automation
 * - Advanced filtering and segmentation
 */
const AdvancedAnalyticsPage: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gray-50"
    >
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <AdvancedAnalyticsManagement />
      </div>
    </motion.div>
  );
};

export default AdvancedAnalyticsPage;