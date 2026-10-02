import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  X,
  Upload,
  User,
  RotateCcw,
  Check,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Trash2,
  Smile,
  Shield,
  Stethoscope,
} from 'lucide-react';
import { Patient } from '../types/clinical';

interface PatientAvatarModalProps {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSaveAvatar: (photoUrl: string | undefined, avatarType?: 'webcam' | 'preset' | 'upload' | 'initials') => void;
}

// Preset clinical avatars defined as parameterized SVGs
const PRESET_STYLES = [
  { id: 'adult_female', label: 'Adult Female', gender: 'F', icon: 'woman' },
  { id: 'adult_male', label: 'Adult Male', gender: 'M', icon: 'man' },
  { id: 'senior_female', label: 'Senior Female', gender: 'F', icon: 'senior_w' },
  { id: 'senior_male', label: 'Senior Male', gender: 'M', icon: 'senior_m' },
  { id: 'young_female', label: 'Young Female', gender: 'F', icon: 'young_w' },
  { id: 'young_male', label: 'Young Male', gender: 'M', icon: 'young_m' },
  { id: 'pediatric_girl', label: 'Pediatric Girl', gender: 'F', icon: 'child_g' },
  { id: 'pediatric_boy', label: 'Pediatric Boy', gender: 'M', icon: 'child_b' },
  { id: 'clinical_cross', label: 'Clinical Cross', gender: 'U', icon: 'cross' },
  { id: 'stethoscope', label: 'Stethoscope Icon', gender: 'U', icon: 'steth' },
  { id: 'initials_monogram', label: 'Patient Monogram', gender: 'U', icon: 'monogram' },
  { id: 'shield_id', label: 'Health ID Shield', gender: 'U', icon: 'shield' },
];

const PRESET_COLORS = [
  { label: 'Crimson', bg: '#b91c1c', light: '#fef2f2' },
  { label: 'Clinical Blue', bg: '#1d4ed8', light: '#eff6ff' },
  { label: 'Deep Slate', bg: '#334155', light: '#f8fafc' },
  { label: 'Forest Green', bg: '#047857', light: '#ecfdf5' },
  { label: 'Royal Purple', bg: '#6d28d9', light: '#f5f3ff' },
  { label: 'Warm Amber', bg: '#b45309', light: '#fffbeb' },
];

export const PatientAvatarModal: React.FC<PatientAvatarModalProps> = ({
  patient,
  isOpen,
  onClose,
  onSaveAvatar,
}) => {
  const [activeTab, setActiveTab] = useState<'webcam' | 'preset' | 'upload'>('webcam');
  const [selectedPresetId, setSelectedPresetId] = useState<string>('adult_female');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | undefined>(patient.photoUrl);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stop camera media tracks cleanly
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Start webcam video feed
  const startCamera = async () => {
    stopCamera();
    setCameraError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Webcam access is not supported by your browser environment.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      console.warn('Webcam access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser settings, or select a preset avatar.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No webcam device detected. Please connect a camera or choose a preset avatar.');
      } else {
        setCameraError('Could not start webcam stream. You can choose a preset avatar or upload a photo.');
      }
      setCameraActive(false);
    }
  };

  // Switch tabs & manage camera lifecycle
  useEffect(() => {
    if (isOpen && activeTab === 'webcam') {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, activeTab]);

  // Synchronize initial preview
  useEffect(() => {
    if (isOpen) {
      setPreviewPhotoUrl(patient.photoUrl);
      // Auto-select preset based on patient sex and age
      if (patient.sex === 'male') {
        setSelectedPresetId('adult_male');
      } else {
        setSelectedPresetId('adult_female');
      }
    }
  }, [isOpen, patient]);

  // Capture frame from webcam
  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const size = 400;

    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate center square crop from video
    const minDim = Math.min(video.videoWidth, video.videoHeight);
    const startX = (video.videoWidth - minDim) / 2;
    const startY = (video.videoHeight - minDim) / 2;

    // Mirror image for natural selfie webcam orientation
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, startX, startY, minDim, minDim, 0, 0, size, size);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setPreviewPhotoUrl(dataUrl);
    stopCamera();
  };

  // Start 3-second countdown snapshot
  const handleCountdownCapture = () => {
    setCountdown(3);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(timer);
          handleCaptureSnapshot();
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Generate SVG Data URL for clinical avatar preset
  const generatePresetDataUrl = (presetId: string, color: typeof PRESET_COLORS[0]) => {
    const initials = `${patient.firstName?.[0] || ''}${patient.lastName?.[0] || ''}`.toUpperCase();

    let iconPath = '';
    if (presetId === 'clinical_cross') {
      iconPath = `<path d="M40 25 h20 v15 h15 v20 h-15 v15 h-20 v-15 h-15 v-20 h15 z" fill="#ffffff" />`;
    } else if (presetId === 'stethoscope') {
      iconPath = `<path d="M35 25 v20 c0 8 7 15 15 15 s15 -7 15 -15 v-20 h-6 v20 c0 5 -4 9 -9 9 s-9 -4 -9 -9 v-20 z M50 60 v12 c0 4 4 8 8 8 h4 M62 80 a4 4 0 1 0 8 0 a4 4 0 1 0 -8 0" stroke="#ffffff" stroke-width="4" stroke-linecap="round" fill="none" />`;
    } else if (presetId === 'shield_id') {
      iconPath = `<path d="M50 20 L25 32 v22 c0 18 11 30 25 36 c14 -6 25 -18 25 -36 V32 Z" fill="none" stroke="#ffffff" stroke-width="4" /><circle cx="50" cy="45" r="9" fill="#ffffff" /><path d="M35 70 c0 -8 7 -14 15 -14 s15 6 15 14" fill="#ffffff" />`;
    } else if (presetId === 'initials_monogram') {
      iconPath = `<text x="50" y="58" font-family="system-ui, sans-serif" font-size="28" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text>`;
    } else {
      // Human stylized silhouette
      const isSenior = presetId.includes('senior');
      const isChild = presetId.includes('pediatric');
      const headRadius = isChild ? 16 : 14;
      const headY = isChild ? 42 : 38;

      iconPath = `
        <circle cx="50" cy="${headY}" r="${headRadius}" fill="#ffffff" />
        <path d="M22 84 c0 -16 12 -28 28 -28 s28 12 28 28 Z" fill="#ffffff" />
        ${isSenior ? '<path d="M34 32 Q50 22 66 32" stroke="#ffffff" stroke-width="3" fill="none" />' : ''}
      `;
    }

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="200" height="200">
        <rect width="100" height="100" rx="50" fill="${color.bg}" />
        ${iconPath}
      </svg>
    `.trim();

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    const dataUrl = generatePresetDataUrl(presetId, selectedColor);
    setPreviewPhotoUrl(dataUrl);
  };

  const handleChangeColor = (color: typeof PRESET_COLORS[0]) => {
    setSelectedColor(color);
    const dataUrl = generatePresetDataUrl(selectedPresetId, color);
    setPreviewPhotoUrl(dataUrl);
  };

  // Handle image file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 300;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Draw cropped center square
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPreviewPhotoUrl(resizedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = () => {
    stopCamera();
    const avatarType =
      activeTab === 'webcam' ? 'webcam' : activeTab === 'preset' ? 'preset' : 'upload';
    onSaveAvatar(previewPhotoUrl, avatarType);
    onClose();
  };

  const handleRemoveAvatar = () => {
    stopCamera();
    onSaveAvatar(undefined, 'initials');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden animate-fade-in flex flex-col">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">
                Patient Profile Avatar & Photo
              </h2>
              <p className="text-xs text-gray-500">
                {patient.lastName}, {patient.firstName} · MRN: {patient.mrn}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-md cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 bg-white px-5 pt-3 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('webcam')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'webcam'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Webcam Live Capture</span>
          </button>

          <button
            onClick={() => setActiveTab('preset')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'preset'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Clinical Avatar Presets</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-red-700 text-red-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Photo File</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 flex-1">
          {/* TAB 1: WEBCAM LIVE CAPTURE */}
          {activeTab === 'webcam' && (
            <div className="space-y-4">
              <div className="relative bg-gray-900 rounded-xl overflow-hidden aspect-square max-w-xs mx-auto flex items-center justify-center border-4 border-gray-800 shadow-inner">
                {/* Live Video Viewfinder */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover scale-x-[-1] ${cameraActive ? 'block' : 'hidden'}`}
                />

                {/* Oval/Circular face centering overlay */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-56 rounded-full border-2 border-white/60 border-dashed animate-pulse" />
                    <div className="absolute bottom-3 px-3 py-1 bg-black/60 rounded-full text-[10px] text-white font-mono">
                      Center face inside circle
                    </div>
                  </div>
                )}

                {/* Countdown overlay */}
                {countdown !== null && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-6xl font-bold animate-ping">
                    {countdown}
                  </div>
                )}

                {/* Camera Inactive / Error Fallback */}
                {!cameraActive && (
                  <div className="p-6 text-center text-gray-300 space-y-3">
                    <Camera className="w-10 h-10 mx-auto text-gray-500" />
                    {cameraError ? (
                      <div className="text-xs text-rose-300 space-y-2">
                        <p>{cameraError}</p>
                        <button
                          onClick={() => setActiveTab('preset')}
                          className="px-3 py-1 bg-red-700 hover:bg-red-800 text-white rounded text-xs font-semibold cursor-pointer"
                        >
                          Choose from Preset Avatars →
                        </button>
                      </div>
                    ) : (
                      <div className="text-xs space-y-2">
                        <p>Initializing camera feed...</p>
                        <button
                          onClick={startCamera}
                          className="px-3 py-1 bg-gray-800 hover:bg-gray-700 text-white rounded text-xs cursor-pointer"
                        >
                          Retry Camera Access
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Hidden canvas for snapshot rendering */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Camera Action Buttons */}
              <div className="flex items-center justify-center gap-3">
                {cameraActive ? (
                  <>
                    <button
                      type="button"
                      onClick={handleCaptureSnapshot}
                      className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Take Instant Snapshot</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCountdownCapture}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-medium cursor-pointer"
                      title="3-second countdown before capture"
                    >
                      <span>3s Timer</span>
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
                    <span>Restart Live Camera</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: CLINICAL AVATAR PRESETS */}
          {activeTab === 'preset' && (
            <div className="space-y-4">
              {/* Color Palette Selector */}
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <span className="text-xs font-semibold text-gray-700">Theme Color:</span>
                <div className="flex items-center gap-1.5">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.label}
                      onClick={() => handleChangeColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-transform cursor-pointer ${
                        selectedColor.bg === c.bg
                          ? 'border-gray-900 scale-110 shadow-xs'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.bg }}
                      title={c.label}
                    />
                  ))}
                </div>
              </div>

              {/* Grid of Avatars */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto p-1">
                {PRESET_STYLES.map((preset) => {
                  const isSelected = selectedPresetId === preset.id;
                  const dataUrl = generatePresetDataUrl(preset.id, selectedColor);

                  return (
                    <div
                      key={preset.id}
                      onClick={() => handleSelectPreset(preset.id)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                        isSelected
                          ? 'bg-red-50/80 border-red-500 shadow-2xs'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <img
                        src={dataUrl}
                        alt={preset.label}
                        className="w-12 h-12 rounded-full shadow-2xs"
                      />
                      <span className="text-[11px] font-medium text-gray-800 leading-tight">
                        {preset.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: FILE UPLOAD */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileUpload}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-red-600 rounded-xl p-8 text-center cursor-pointer bg-gray-50/50 hover:bg-red-50/30 transition-colors space-y-2"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-2xs border border-gray-200 flex items-center justify-center mx-auto text-red-700">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-bold text-gray-900">
                  Click to select an image from your device
                </div>
                <p className="text-[11px] text-gray-500">
                  Supports JPG, PNG, or WebP. Cropped automatically to 1:1 profile square.
                </p>
              </div>
            </div>
          )}

          {/* Current / New Avatar Preview Strip */}
          <div className="pt-3 border-t border-gray-200 flex items-center justify-between bg-gray-50 p-3 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                {previewPhotoUrl ? (
                  <img
                    src={previewPhotoUrl}
                    alt="Preview"
                    className="w-12 h-12 rounded-full object-cover border-2 border-red-700 shadow-2xs"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-sm shadow-2xs">
                    {patient.firstName?.[0]}
                    {patient.lastName?.[0]}
                  </div>
                )}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white rounded-full flex items-center justify-center text-[10px]">
                  ✓
                </div>
              </div>
              <div className="text-xs">
                <div className="font-bold text-gray-900">Avatar Live Preview</div>
                <div className="text-[11px] text-gray-500">
                  {previewPhotoUrl ? 'Photo ready to save' : 'Using default monogram'}
                </div>
              </div>
            </div>

            {patient.photoUrl && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                className="inline-flex items-center gap-1 text-[11px] text-rose-700 hover:text-rose-900 hover:underline cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Avatar</span>
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-5 py-3.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-3.5 py-1.5 text-xs text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md font-medium cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Apply & Save Profile Avatar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
