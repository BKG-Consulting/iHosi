"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2,
  User,
  Clock
} from "lucide-react";

interface PatientNote {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  type: 'general' | 'diagnosis' | 'treatment' | 'observation';
}

interface PatientNotesProps {
  readonly patientId: string;
}

export function PatientNotes({ patientId }: PatientNotesProps) {
  // Mock data - in a real implementation, this would come from props or API
  const notes: PatientNote[] = [
    {
      id: '1',
      content: 'Patient presented with chest pain and shortness of breath. Vital signs stable. Ordered EKG and chest X-ray.',
      author: 'Dr. Smith',
      createdAt: '2024-01-15T10:30:00Z',
      type: 'observation'
    },
    {
      id: '2',
      content: 'EKG shows normal sinus rhythm. Chest X-ray clear. Patient responding well to treatment.',
      author: 'Dr. Smith',
      createdAt: '2024-01-15T11:15:00Z',
      type: 'diagnosis'
    },
    {
      id: '3',
      content: 'Prescribed nitroglycerin and advised rest. Follow-up in 1 week.',
      author: 'Dr. Smith',
      createdAt: '2024-01-15T11:30:00Z',
      type: 'treatment'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'diagnosis':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'treatment':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'observation':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'general':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (notes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Clinical Notes
          </CardTitle>
          <CardDescription>
            Patient clinical notes and observations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Clinical Notes</h3>
            <p className="text-gray-600 mb-4">
              No clinical notes have been recorded for this patient.
            </p>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Note
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Clinical Notes
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {notes.length} notes
            </Badge>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          </div>
        </div>
        <CardDescription>
          Clinical notes, observations, and treatment records
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getTypeColor(note.type)}>
                      {note.type}
                    </Badge>
                    <span className="text-sm text-gray-600">
                      {formatDate(note.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-900 mb-2">{note.content}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-3 w-3" />
                    <span>{note.author}</span>
                    <Clock className="h-3 w-3 ml-2" />
                    <span>{formatDate(note.createdAt)}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 ml-4">
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
