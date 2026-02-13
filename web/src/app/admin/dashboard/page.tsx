"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Coffee, Lock, Mail, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import AuthService from '@/lib/api/auth';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {

  return (
    <div className="dashboard-container">

        <h1>
            Dashboard
        </h1>
    </div>
  );
}
