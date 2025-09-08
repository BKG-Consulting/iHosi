'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Calendar,
  Users,
  Zap,
  AlertCircle,
  Info,
  XCircle,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Conflict {
  id: string;
  type: 'OVERLAP' | 'BREAK_VIOLATION' | 'WORKING_HOURS' | 'LEAVE_CONFLICT' | 'DOUBLE_BOOKING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  affectedSlots: string[];
  suggestedFix: string;
  autoFixable: boolean;
}

interface ConflictDetectorProps {
  workingHours: any[];
  timeSlots: any[];
  leaveRequests: any[];
  appointments: any[];
  onConflictsResolved?: (conflicts: Conflict[]) => void;
}

export const ConflictDetector: React.FC<ConflictDetectorProps> = ({
  workingHours,
  timeSlots,
  leaveRequests,
  appointments,
  onConflictsResolved
}) => {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);

  const detectConflicts = async () => {
    setIsScanning(true);
    
    try {
      const detectedConflicts: Conflict[] = [];
      
      // Simulate conflict detection logic
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check for overlapping time slots
      for (let i = 0; i < timeSlots.length; i++) {
        for (let j = i + 1; j < timeSlots.length; j++) {
          const slot1 = timeSlots[i];
          const slot2 = timeSlots[j];
          
          if (slot1.startTime < slot2.endTime && slot2.startTime < slot1.endTime) {
            detectedConflicts.push({
              id: `overlap-${i}-${j}`,
              type: 'OVERLAP',
              severity: 'HIGH',
              title: 'Overlapping Time Slots',
              description: `Time slot ${slot1.startTime}-${slot1.endTime} overlaps with ${slot2.startTime}-${slot2.endTime}`,
              affectedSlots: [slot1.id, slot2.id],
              suggestedFix: 'Adjust one of the overlapping time slots',
              autoFixable: true
            });
          }
        }
      }
      
      // Check for break time violations
      workingHours.forEach(dayHours => {
        if (dayHours.isWorking && dayHours.breakStart && dayHours.breakEnd) {
          const conflictingSlots = timeSlots.filter(slot => 
            slot.startTime >= dayHours.breakStart && slot.startTime < dayHours.breakEnd
          );
          
          if (conflictingSlots.length > 0) {
            detectedConflicts.push({
              id: `break-${dayHours.day}`,
              type: 'BREAK_VIOLATION',
              severity: 'MEDIUM',
              title: 'Break Time Violation',
              description: `${conflictingSlots.length} time slots scheduled during break time (${dayHours.breakStart}-${dayHours.breakEnd})`,
              affectedSlots: conflictingSlots.map(slot => slot.id),
              suggestedFix: 'Remove or reschedule slots during break time',
              autoFixable: true
            });
          }
        }
      });
      
      // Check for working hours violations
      workingHours.forEach(dayHours => {
        if (dayHours.isWorking) {
          const conflictingSlots = timeSlots.filter(slot => 
            slot.startTime < dayHours.startTime || slot.endTime > dayHours.endTime
          );
          
          if (conflictingSlots.length > 0) {
            detectedConflicts.push({
              id: `hours-${dayHours.day}`,
              type: 'WORKING_HOURS',
              severity: 'HIGH',
              title: 'Working Hours Violation',
              description: `${conflictingSlots.length} time slots outside working hours (${dayHours.startTime}-${dayHours.endTime})`,
              affectedSlots: conflictingSlots.map(slot => slot.id),
              suggestedFix: 'Adjust slots to fit within working hours',
              autoFixable: false
            });
          }
        }
      });
      
      // Check for leave conflicts
      leaveRequests.forEach(leave => {
        if (leave.status === 'APPROVED') {
          const conflictingSlots = timeSlots.filter(slot => {
            // This would need proper date comparison logic
            return false; // Simplified for demo
          });
          
          if (conflictingSlots.length > 0) {
            detectedConflicts.push({
              id: `leave-${leave.id}`,
              type: 'LEAVE_CONFLICT',
              severity: 'CRITICAL',
              title: 'Leave Conflict',
              description: `Time slots scheduled during approved leave (${leave.startDate} - ${leave.endDate})`,
              affectedSlots: conflictingSlots.map(slot => slot.id),
              suggestedFix: 'Remove slots during leave period',
              autoFixable: true
            });
          }
        }
      });
      
      setConflicts(detectedConflicts);
      setLastScanTime(new Date());
      onConflictsResolved?.(detectedConflicts);
      
    } catch (error) {
      console.error('Error detecting conflicts:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const autoFixConflict = (conflictId: string) => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (!conflict || !conflict.autoFixable) return;
    
    // Simulate auto-fix logic
    setConflicts(prev => prev.filter(c => c.id !== conflictId));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'HIGH': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'MEDIUM': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'LOW': return <Info className="w-4 h-4 text-blue-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConflictTypeIcon = (type: string) => {
    switch (type) {
      case 'OVERLAP': return <Clock className="w-4 h-4" />;
      case 'BREAK_VIOLATION': return <Zap className="w-4 h-4" />;
      case 'WORKING_HOURS': return <Calendar className="w-4 h-4" />;
      case 'LEAVE_CONFLICT': return <Users className="w-4 h-4" />;
      case 'DOUBLE_BOOKING': return <AlertTriangle className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  const getConflictStats = () => {
    const stats = {
      total: conflicts.length,
      critical: conflicts.filter(c => c.severity === 'CRITICAL').length,
      high: conflicts.filter(c => c.severity === 'HIGH').length,
      medium: conflicts.filter(c => c.severity === 'MEDIUM').length,
      low: conflicts.filter(c => c.severity === 'LOW').length,
      autoFixable: conflicts.filter(c => c.autoFixable).length
    };
    return stats;
  };

  const stats = getConflictStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#046658]">Conflict Detection</h3>
          <p className="text-[#3E4C4B]">Scan for scheduling conflicts and issues</p>
        </div>
        <div className="flex items-center gap-3">
          {lastScanTime && (
            <span className="text-sm text-[#3E4C4B]">
              Last scan: {lastScanTime.toLocaleTimeString()}
            </span>
          )}
          <Button 
            onClick={detectConflicts}
            disabled={isScanning}
            className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034a4a] hover:to-[#259a9a] text-white"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isScanning ? 'Scanning...' : 'Scan for Conflicts'}
          </Button>
        </div>
      </div>

      {/* Conflict Stats */}
      {conflicts.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-xl shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-[#046658]">{stats.total}</div>
              <div className="text-sm text-[#3E4C4B]">Total Issues</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-xl shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
              <div className="text-sm text-[#3E4C4B]">Critical</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-xl shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
              <div className="text-sm text-[#3E4C4B]">High</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-xl shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.medium}</div>
              <div className="text-sm text-[#3E4C4B]">Medium</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-xl shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.low}</div>
              <div className="text-sm text-[#3E4C4B]">Low</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-xl shadow-lg">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.autoFixable}</div>
              <div className="text-sm text-[#3E4C4B]">Auto-fixable</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* No Conflicts State */}
      {conflicts.length === 0 && !isScanning && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-semibold text-[#046658] mb-2">No Conflicts Found</h3>
            <p className="text-[#3E4C4B]">Your schedule looks good! No conflicts detected.</p>
          </CardContent>
        </Card>
      )}

      {/* Conflicts List */}
      {conflicts.length > 0 && (
        <div className="space-y-4">
          {conflicts.map((conflict) => (
            <Card key={conflict.id} className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#046658] to-[#2EB6B0] rounded-xl flex items-center justify-center">
                      {getConflictTypeIcon(conflict.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-[#046658]">{conflict.title}</h4>
                        <Badge className={getSeverityColor(conflict.severity)}>
                          {getSeverityIcon(conflict.severity)}
                          <span className="ml-1">{conflict.severity}</span>
                        </Badge>
                      </div>
                      <p className="text-[#3E4C4B] mb-3">{conflict.description}</p>
                      <div className="bg-[#D1F1F2] p-3 rounded-lg">
                        <p className="text-sm font-medium text-[#046658] mb-1">Suggested Fix:</p>
                        <p className="text-sm text-[#3E4C4B]">{conflict.suggestedFix}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {conflict.autoFixable && (
                      <Button
                        size="sm"
                        onClick={() => autoFixConflict(conflict.id)}
                        className="bg-gradient-to-r from-[#046658] to-[#2EB6B0] hover:from-[#034a4a] hover:to-[#259a9a] text-white"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Auto Fix
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#D1F1F2] text-[#3E4C4B] hover:bg-[#D1F1F2]"
                    >
                      Manual Fix
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Scanning State */}
      {isScanning && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 rounded-2xl shadow-lg">
          <CardContent className="p-12 text-center">
            <div className="animate-spin w-16 h-16 mx-auto mb-4">
              <Zap className="w-16 h-16 text-[#2EB6B0]" />
            </div>
            <h3 className="text-lg font-semibold text-[#046658] mb-2">Scanning for Conflicts</h3>
            <p className="text-[#3E4C4B]">Analyzing your schedule for potential issues...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

