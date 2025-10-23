'use client';

import { Star, Quote } from 'lucide-react';
import Image from 'next/image';

interface TestimonialCardProps {
  name: string;
  role: string;
  organization: string;
  image: string;
  content: string;
  rating: number;
}

export function TestimonialCard({
  name,
  role,
  organization,
  image,
  content,
  rating
}: TestimonialCardProps) {
  return (
    <div className="group bg-white rounded-3xl p-8 shadow-medium border border-gray-200 hover:shadow-xlarge transition-elegant hover:-translate-y-1">
      {/* Quote Icon */}
      <div className="mb-6">
        <div className="w-12 h-12 bg-gradient-to-br from-brand-cyan-500 to-brand-cyan-600 rounded-2xl flex items-center justify-center shadow-cyan">
          <Quote className="h-6 w-6 text-white" />
        </div>
      </div>

      {/* Rating */}
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-4 w-4 fill-brand-amber-400 text-brand-amber-400" />
        ))}
      </div>

      {/* Content */}
      <p className="text-gray-700 leading-relaxed mb-6 text-base">
        "{content}"
      </p>

      {/* Author */}
      <div className="flex items-center gap-4 pt-6 border-t border-gray-200">
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
          />
        </div>
        <div>
          <div className="font-semibold text-black">{name}</div>
          <div className="text-sm text-gray-600">{role}</div>
          <div className="text-xs text-gray-500">{organization}</div>
        </div>
      </div>
    </div>
  );
}
