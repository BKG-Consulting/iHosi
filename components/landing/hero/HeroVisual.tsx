'use client';

import { useState, useEffect } from 'react';
import { Calendar, Users, Bell, Video, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export function HeroVisual() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState([
    { id: 1, message: "New appointment booked", time: "2 min ago", type: "success" },
    { id: 2, message: "Patient check-in", time: "5 min ago", type: "info" },
    { id: 3, message: "Lab results ready", time: "8 min ago", type: "success" }
  ]);

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Simulate new notifications
  useEffect(() => {
    const notificationTimer = setInterval(() => {
      const newNotification = {
        id: Date.now(),
        message: "New patient registered",
        time: "Just now",
        type: "success"
      };
      setNotifications(prev => [newNotification, ...prev.slice(0, 2)]);
    }, 8000);
    return () => clearInterval(notificationTimer);
  }, []);

  const appointments = [
    { time: "8:00 am", patient: "Michael Phillips", type: "Primary examination", available: false },
    { time: "9:00 am", patient: "Noah Parker", type: "Medical check", available: false },
    { time: "10:00 am", patient: "Grace Bennett", type: "Maternal health care", available: false },
    { time: "11:00 am", patient: "Kevin Doe", type: "Medical problem", available: false },
    { time: "12:00 pm", patient: null, type: "Available slot", available: true, count: 2 },
    { time: "1:00 pm", patient: null, type: "Available slot", available: true, count: 5 },
  ];

  return (
    <div className="relative">
      {/* Main Calendar Dashboard */}
      <div className="relative z-10">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Today's Schedule</h3>
                <p className="text-sm text-gray-500">
                  {currentTime.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">First available slot</div>
              <div className="text-sm font-medium text-blue-600">Choose another date</div>
            </div>
          </div>

          {/* Appointment Cards */}
          <div className="space-y-3">
            {appointments.map((appointment, index) => (
              <div
                key={index}
                className={`p-4 rounded-xl border transition-all duration-300 ${
                  appointment.available 
                    ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                    : 'bg-pink-50 border-pink-200 hover:bg-pink-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-900">
                      {appointment.time}
                    </div>
                    {appointment.patient ? (
                      <>
                        <div className="text-sm text-gray-700">
                          {appointment.patient}
                        </div>
                        <div className="text-xs text-gray-500">
                          {appointment.type}
                        </div>
                      </>
                    ) : (
                      <div className="text-sm text-green-700">
                        {appointment.count} available
                      </div>
                    )}
                  </div>
                  {appointment.patient && (
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <Video className="h-3 w-3 text-blue-600" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Notifications Panel */}
      <div className="absolute -top-4 -right-4 z-20">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-lg w-64">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Live Updates</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          </div>
          
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex items-start gap-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <div className="text-xs text-gray-700">{notification.message}</div>
                  <div className="text-xs text-gray-500">{notification.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Messages Panel */}
      <div className="absolute -bottom-4 -left-4 z-20">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-lg w-56">
          <div className="flex items-center gap-2 mb-3">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Messages</span>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-3 w-3 text-green-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-gray-700">Thank you very much April</div>
                <div className="text-xs text-gray-500">Completed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Creation Form */}
      <div className="absolute top-1/2 -right-8 z-20 hidden lg:block">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-lg w-64">
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-900">Tuesday, October 24</div>
            <div className="text-sm text-gray-500">11:00</div>
          </div>
          
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Find patient by name or phone..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Patient name"
              defaultValue="Kevin Doe"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Phone"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Additional information"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className="text-sm text-blue-600 cursor-pointer">+ Follow-ups</div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <button className="flex-1 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors">
              Save
            </button>
            <button className="flex-1 px-3 py-2 text-sm border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Video Call Interface */}
      <div className="absolute top-1/4 -left-8 z-20 hidden xl:block">
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-lg w-48">
          <div className="relative">
            <div className="w-full h-24 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Video className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
              30:45
            </div>
          </div>
          
          <div className="flex justify-center gap-2">
            <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            </button>
            <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <Video className="h-3 w-3 text-gray-600" />
            </button>
            <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
