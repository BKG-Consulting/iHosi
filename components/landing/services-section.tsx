"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Stethoscope, Microscope, Pill, Activity, Heart, Brain, 
  Eye, Smile, Baby, AlertTriangle, DollarSign, ArrowRight
} from "lucide-react";

interface Service {
  id: number;
  name: string;
  description: string;
  price: number;
  formattedPrice: string;
  created_at: string;
}

interface CategorizedServices {
  [category: string]: Service[];
}

const categoryIcons: Record<string, any> = {
  Cardiology: Heart,
  Neurology: Brain,
  Laboratory: Microscope,
  Pharmacy: Pill,
  General: Activity,
  Ophthalmology: Eye,
  Dentistry: Smile,
  Pediatrics: Baby,
  Emergency: AlertTriangle
};

const categoryColors: Record<string, string> = {
  Cardiology: "bg-red-100 text-red-800 border-red-200",
  Neurology: "bg-purple-100 text-purple-800 border-purple-200",
  Laboratory: "bg-blue-100 text-blue-800 border-blue-200",
  Pharmacy: "bg-green-100 text-green-800 border-green-200",
  General: "bg-gray-100 text-gray-800 border-gray-200",
  Ophthalmology: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Dentistry: "bg-pink-100 text-pink-800 border-pink-200",
  Pediatrics: "bg-indigo-100 text-indigo-800 border-indigo-200",
  Emergency: "bg-orange-100 text-orange-800 border-orange-200"
};

export const ServicesSection = () => {
  const [services, setServices] = useState<CategorizedServices>({});
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services?limit=20');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setServices(data.services);
        }
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDisplayServices = () => {
    if (selectedCategory === "all") {
      return Object.values(services).flat().slice(0, 12);
    }
    return services[selectedCategory] || [];
  };

  const categories = Object.keys(services);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading services...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Medical Services
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Comprehensive healthcare services delivered with excellence and compassion. 
            From routine checkups to specialized treatments, we're here for you.
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
              className="flex items-center gap-2"
            >
              <Stethoscope className="w-4 h-4" />
              All Services
            </Button>
            {categories.map((category) => {
              const Icon = categoryIcons[category] || Stethoscope;
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex items-center gap-2"
                >
                  <Icon className="w-4 h-4" />
                  {category}
                </Button>
              );
            })}
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getDisplayServices().map((service) => {
            const category = service.name.split(' ')[0];
            const Icon = categoryIcons[category] || Stethoscope;
            const colorClass = categoryColors[category] || "bg-gray-100 text-gray-800 border-gray-200";
            
            return (
              <Card key={service.id} className="hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <Badge className={`${colorClass} border`}>
                      {category}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg group-hover:text-blue-600 transition-colors">
                    {service.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-4 line-clamp-3">
                    {service.description}
                  </CardDescription>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-lg font-semibold text-green-600">
                        {service.formattedPrice}
                      </span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="group-hover:text-blue-600 group-hover:bg-blue-50"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">
                Need a Specific Service?
              </h3>
              <p className="text-blue-100 mb-6">
                Can't find what you're looking for? Contact us to learn about our full range of medical services 
                and how we can help with your healthcare needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="secondary" size="lg">
                  Contact Us
                </Button>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-600">
                  View All Services
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
