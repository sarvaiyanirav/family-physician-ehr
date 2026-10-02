import React from 'react';
import { Camera, User } from 'lucide-react';
import { Patient } from '../types/clinical';

interface PatientAvatarProps {
  patient: Patient;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  editable?: boolean;
  onEdit?: () => void;
  showBadge?: boolean;
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-base',
  xl: 'w-20 h-20 text-xl',
  '2xl': 'w-24 h-24 text-2xl',
};

const CAMERA_SIZE = {
  xs: 'w-2 h-2 p-0.5',
  sm: 'w-2.5 h-2.5 p-0.5',
  md: 'w-3 h-3 p-1',
  lg: 'w-3.5 h-3.5 p-1',
  xl: 'w-4 h-4 p-1.5',
  '2xl': 'w-4 h-4 p-1.5',
};

export const PatientAvatar: React.FC<PatientAvatarProps> = ({
  patient,
  size = 'md',
  className = '',
  editable = false,
  onEdit,
  showBadge = true,
}) => {
  const initials = `${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`.toUpperCase() || 'P';

  // Deterministic color palette for initial monogram if no photo
  const colorIndex = (patient.firstName.charCodeAt(0) + patient.lastName.charCodeAt(0)) % 5;
  const bgColors = [
    'bg-red-800 text-white',
    'bg-slate-800 text-white',
    'bg-blue-900 text-white',
    'bg-emerald-900 text-white',
    'bg-indigo-900 text-white',
  ];
  const bgClass = bgColors[colorIndex];

  return (
    <div className={`relative inline-block shrink-0 select-none ${className}`}>
      {patient.photoUrl ? (
        <img
          src={patient.photoUrl}
          alt={`${patient.firstName} ${patient.lastName}`}
          className={`${SIZE_CLASSES[size]} rounded-full object-cover border-2 border-white shadow-2xs`}
        />
      ) : (
        <div
          className={`${SIZE_CLASSES[size]} ${bgClass} rounded-full flex items-center justify-center font-bold tracking-wider border-2 border-white shadow-2xs`}
        >
          {initials}
        </div>
      )}

      {/* Editable Camera Overlay Button */}
      {editable && onEdit && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="absolute -bottom-1 -right-1 bg-red-700 hover:bg-red-800 text-white rounded-full p-1 shadow-md border-2 border-white transition-transform hover:scale-110 cursor-pointer"
          title="Capture webcam photo or set placeholder avatar"
        >
          <Camera className={CAMERA_SIZE[size]} />
        </button>
      )}
    </div>
  );
};
