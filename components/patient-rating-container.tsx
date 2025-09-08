import db from "@/lib/db";
import React from "react";
import { RatingList } from "./rating-list";
import { Star, MessageSquare } from "lucide-react";

export const PatientRatingContainer = async ({ id }: { id?: string }) => {
  const { getCurrentUserId } = await import('@/lib/auth-helpers');
  const userId = await getCurrentUserId();

  if (!userId) return null;

  const data = await db.rating.findMany({
    take: 10,
    where: { patient_id: id ? id : userId },
    include: { patient: { select: { last_name: true, first_name: true } } },
    orderBy: { created_at: "desc" },
  });

  if (!data || data.length === 0) {
    return (
      <div className="h-full">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-amber-500" />
          <h2 className="text-xl font-semibold text-gray-900">Patient Ratings</h2>
        </div>
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">No ratings yet</p>
          <p className="text-sm">Your service ratings will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-amber-500" />
        <h2 className="text-xl font-semibold text-gray-900">Patient Ratings</h2>
      </div>
      <RatingList data={data} />
    </div>
  );
};
