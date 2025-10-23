import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, FileSearch, PillBottle, MessageCircle } from 'lucide-react';

export function QuickActions() {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="h-20 flex flex-col gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700">
            <UserPlus className="h-6 w-6" />
            <span className="text-sm">New Patient</span>
          </Button>
          <Button className="h-20 flex flex-col gap-2 bg-green-50 hover:bg-green-100 text-green-700">
            <FileSearch className="h-6 w-6" />
            <span className="text-sm">Search Records</span>
          </Button>
          <Button className="h-20 flex flex-col gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700">
            <PillBottle className="h-6 w-6" />
            <span className="text-sm">Prescriptions</span>
          </Button>
          <Button className="h-20 flex flex-col gap-2 bg-orange-50 hover:bg-orange-100 text-orange-700">
            <MessageCircle className="h-6 w-6" />
            <span className="text-sm">Messages</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


