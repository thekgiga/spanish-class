import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface StudentSelectorProps {
  value?: string;
  onChange: (studentId: string) => void;
  disabled?: boolean;
}

// T017: StudentSelector component
export function StudentSelector({ value, onChange, disabled }: StudentSelectorProps) {
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/professor/students`, {
        params: { page: 1, limit: 100 },
        withCredentials: true,
      });
      return response.data.data as Student[];
    },
  });

  const filteredStudents = data?.filter((student) => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const searchLower = search.toLowerCase();
    return (
      fullName.includes(searchLower) ||
      student.email.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Select Student
      </label>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        disabled={disabled}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      />
      <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Loading students...</div>
        ) : filteredStudents && filteredStudents.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <button
                key={student.id}
                type="button"
                onClick={() => onChange(student.id)}
                disabled={disabled}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  value === student.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="font-medium text-gray-900">
                  {student.firstName} {student.lastName}
                </div>
                <div className="text-sm text-gray-500">{student.email}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            {search ? 'No students found' : 'No students available'}
          </div>
        )}
      </div>
      {value && (
        <p className="text-sm text-gray-600">
          Selected: {data?.find((s) => s.id === value)?.firstName}{' '}
          {data?.find((s) => s.id === value)?.lastName}
        </p>
      )}
    </div>
  );
}
