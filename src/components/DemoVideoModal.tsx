import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  Download,
  Film,
  Sparkles,
  Shield,
  Stethoscope,
  Camera,
  FileText,
  TestTube,
  QrCode,
  CheckCircle2,
  Maximize2,
  ChevronRight,
  ChevronLeft,
  FastForward,
  UserCheck,
  TrendingUp,
} from 'lucide-react';

interface DemoVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SceneInfo {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  themeColor: string;
  icon: any;
  duration: number; // in seconds
  narrationText: string;
  bulletPoints: string[];
  mockUiType: 'overview' | 'roles' | 'webcam' | 'soap' | 'labs' | 'mobile_qr';
}

const DEMO_SCENES: SceneInfo[] = [
  {
    id: 1,
    title: 'PraxisMD Family Physician EHR',
    subtitle: 'Comprehensive Primary Care Clinical Intelligence',
    badge: 'PLATFORM OVERVIEW',
    themeColor: 'from-red-900 to-slate-950',
    icon: Stethoscope,
    duration: 12,
    narrationText:
      'Welcome to PraxisMD Family Physician EHR. This platform is custom engineered for high-volume primary care clinics, combining longitudinal patient dossiers, cloud Firestore synchronization, and instant offline caching for complete clinical reliability.',
    bulletPoints: [
      'Universal Longitudinal Patient Dossiers & Demographics',
      'Dual-layer Storage: Live Google Cloud Firestore + Offline Cache',
      'Comprehensive ICD-10 Search, Diagnosis Trackers & Safety Audits',
    ],
    mockUiType: 'overview',
  },
  {
    id: 2,
    title: 'Multi-Role Staff Authorization',
    subtitle: 'Attending Doctor, Compounder, Lab Tech & Super User Governance',
    badge: 'SECURITY & ACCESS CONTROL',
    themeColor: 'from-purple-950 to-slate-950',
    icon: Shield,
    duration: 14,
    narrationText:
      'Security and accountability are paramount. The system introduces four role tiers: Attending Doctors with full SOAP and prescription authority, Compounders who manage clinic queues and dispense medications, Diagnostic Lab Technicians, and a dedicated Super User Admin with complete user management control.',
    bulletPoints: [
      'Super User (admin / admin): Full account provisioning & password governance',
      'Doctor (dr_sarah): Full clinical authority, SOAP notes, and encounter sign-off',
      'Compounder (compounder_raj): Queue management, vitals triage & dispensing',
      'Lab Technician (lab_elena): Direct diagnostic results entry & critical alerts',
    ],
    mockUiType: 'roles',
  },
  {
    id: 3,
    title: 'Patient Directory & Live Webcam Avatars',
    subtitle: 'Urgency Triage & Real-Time Photo Identification',
    badge: 'INTAKE & IDENTIFICATION',
    themeColor: 'from-sky-950 to-slate-950',
    icon: Camera,
    duration: 13,
    narrationText:
      'The Patient Directory features instant multi-field searching, emergency triage flags, and an integrated HTML5 live webcam capture tool. Staff can capture 1-to-1 patient face snapshots with countdown timers, or select from twelve customizable clinical avatar presets.',
    bulletPoints: [
      'Live in-browser webcam capture with circular face alignment guidelines',
      '12 vector clinical avatar presets across age brackets and genders',
      'Color palette theming and seamless local & cloud profile syncing',
    ],
    mockUiType: 'webcam',
  },
  {
    id: 4,
    title: 'The SOAP Clinical Encounter Suite',
    subtitle: 'Streamlined Notes, Vitals Trendlines & Encounter Sign-Off',
    badge: 'CLINICAL ENCOUNTER',
    themeColor: 'from-rose-950 to-slate-950',
    icon: FileText,
    duration: 14,
    narrationText:
      'During patient visits, providers navigate an intuitive SOAP interface with integrated ICD-10 coders, live longitudinal vitals analytics, and electronic prescriptions. Strict signature guards ensure only licensed physicians or admins can sign and finalize encounters.',
    bulletPoints: [
      'Structured Subjective, Objective, Assessment, and Plan documentation',
      'Instant ICD-10 code search and auto-calculating vitals BMI & MAP',
      'Encounter finalization guard: restricts unsigned notes to draft status',
    ],
    mockUiType: 'soap',
  },
  {
    id: 5,
    title: 'Diagnostic Labs & WHO Pediatric Growth',
    subtitle: 'Blood Panels, Critical Alerts & WHO Percentile Curves',
    badge: 'DIAGNOSTICS & PEDIATRICS',
    themeColor: 'from-emerald-950 to-slate-950',
    icon: TestTube,
    duration: 13,
    narrationText:
      'Laboratory technicians directly manage HbA1c, lipid, and hematology panels with instant critical value alerts. For pediatric patients, the interactive WHO Growth Chart plots height, weight, and BMI percentiles across longitudinal well-child visits.',
    bulletPoints: [
      'Standardized reference ranges for HbA1c, Lipids, CBC, and Electrolytes',
      'Automatic critical, high, and low abnormal flag highlights',
      'WHO growth percentiles for pediatric patient development tracking',
    ],
    mockUiType: 'labs',
  },
  {
    id: 6,
    title: 'After-Visit Summaries & Mobile QR Access',
    subtitle: 'Printable Care Plans & Instant Smartphone Portal',
    badge: 'PATIENT PORTAL & AVS',
    themeColor: 'from-amber-950 to-slate-950',
    icon: QrCode,
    duration: 13,
    narrationText:
      'Upon encounter completion, generate official CMS-compliant After-Visit Summaries. Patients can scan the dynamic high-density QR code directly from the paper or screen to access their encrypted care plan, medications, and follow-up directives on their mobile device.',
    bulletPoints: [
      'Instant QR code scan opens mobile-optimized patient portal',
      'Zero-login friction for patients to view active prescriptions & warnings',
      'Full-page printer-friendly discharge documentation',
    ],
    mockUiType: 'mobile_qr',
  },
];

export const DemoVideoModal: React.FC<DemoVideoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'interactive' | 'mp4'>('interactive');
  const [elapsedSceneTime, setElapsedSceneTime] = useState(0);
  const [audioBars, setAudioBars] = useState<number[]>([12, 18, 28, 42, 35, 20, 30, 48, 25, 15]);

  const scene = DEMO_SCENES[currentSceneIndex];
  const totalDuration = DEMO_SCENES.reduce((acc, s) => acc + s.duration, 0);

  // Web Speech API Male Voice Engine
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Stop speech when component unmounts or modal closes
  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  };

  // Speak current scene narration with deep male voice
  const speakCurrentScene = (text: string) => {
    if (isMuted || !isPlaying || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    stopSpeech();

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Look for preferred male voices
    const voices = window.speechSynthesis.getVoices();
    const maleVoice = voices.find(
      (v) =>
        (v.name.includes('Male') ||
          v.name.includes('David') ||
          v.name.includes('Guy') ||
          v.name.includes('Daniel') ||
          v.name.includes('Alex') ||
          v.name.includes('George') ||
          v.name.includes('en-US')) &&
        !v.name.includes('Female') &&
        !v.name.includes('Zira')
    );

    if (maleVoice) {
      utterance.voice = maleVoice;
    }

    // Set voice properties for commanding, warm male cadence
    utterance.pitch = 0.92; // slightly deeper male pitch
    utterance.rate = 0.96 * playbackSpeed;
    utterance.volume = 1.0;

    window.speechSynthesis.speak(utterance);
  };

  // Timer loop for interactive scene playback
  useEffect(() => {
    if (!isOpen || !isPlaying || activeTab !== 'interactive') {
      stopSpeech();
      return;
    }

    speakCurrentScene(scene.narrationText);
    setElapsedSceneTime(0);

    const interval = 250;
    const timer = setInterval(() => {
      setElapsedSceneTime((prev) => {
        const next = prev + 0.25 * playbackSpeed;
        if (next >= scene.duration) {
          // Advance to next scene or loop
          if (currentSceneIndex < DEMO_SCENES.length - 1) {
            setCurrentSceneIndex((i) => i + 1);
          } else {
            setCurrentSceneIndex(0);
          }
          return 0;
        }
        return next;
      });

      // Animate live audio visualizer bars while speaking
      setAudioBars(() =>
        Array.from({ length: 12 }, () => Math.floor(Math.random() * 38) + 10)
      );
    }, interval);

    return () => {
      clearInterval(timer);
      stopSpeech();
    };
  }, [isOpen, isPlaying, currentSceneIndex, isMuted, playbackSpeed, activeTab]);

  // Handle Play/Pause
  const handleTogglePlay = () => {
    if (isPlaying) {
      stopSpeech();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakCurrentScene(scene.narrationText);
    }
  };

  // Handle Mute
  const handleToggleMute = () => {
    if (!isMuted) {
      stopSpeech();
      setIsMuted(true);
    } else {
      setIsMuted(false);
      speakCurrentScene(scene.narrationText);
    }
  };

  // Jump to specific scene
  const handleJumpScene = (index: number) => {
    stopSpeech();
    setCurrentSceneIndex(index);
    setElapsedSceneTime(0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5">
      <div className="bg-gray-900 border border-gray-800 text-white rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[95vh] animate-fade-in">
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 bg-gray-950/80 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-tight">
                  PraxisMD EHR Walkthrough & Feature Demo
                </h2>
                <span className="text-[10px] font-mono bg-red-600/30 text-red-400 border border-red-500/40 px-1.5 py-0.5 rounded font-bold uppercase">
                  Voice Over (Male)
                </span>
              </div>
              <p className="text-[11px] text-gray-400">
                Official product demonstration: clinical workflows, roles, webcam avatars & mobile summaries
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Switcher */}
            <div className="flex bg-gray-800 rounded-lg p-0.5 border border-gray-700 text-xs">
              <button
                onClick={() => setActiveTab('interactive')}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeTab === 'interactive'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Interactive Walkthrough
              </button>
              <button
                onClick={() => {
                  stopSpeech();
                  setActiveTab('mp4');
                }}
                className={`px-3 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
                  activeTab === 'mp4'
                    ? 'bg-red-700 text-white shadow-xs'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                MP4 Video File
              </button>
            </div>

            <button
              onClick={() => {
                stopSpeech();
                onClose();
              }}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video Canvas / Screen */}
        <div className="relative bg-black flex-1 min-h-[380px] sm:min-h-[440px] flex flex-col justify-between overflow-hidden">
          {activeTab === 'interactive' ? (
            <>
              {/* Scene Backdrop Gradients */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${scene.themeColor} opacity-95 transition-all duration-700`}
              />

              {/* Grid Background Pattern */}
              <div
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
                  backgroundSize: '24px 24px',
                }}
              />

              {/* Main Screen Content */}
              <div className="relative z-10 p-6 sm:p-8 flex-1 flex flex-col justify-between">
                {/* Top Scene Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-white/10 text-red-400 border border-red-500/30 flex items-center gap-1.5 backdrop-blur-xs">
                      <Sparkles className="w-3 h-3" />
                      <span>{scene.badge}</span>
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      Scene {scene.id} of {DEMO_SCENES.length}
                    </span>
                  </div>

                  {/* Realtime Audio Waveform Visualizer */}
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-black/40 rounded-full border border-white/10 backdrop-blur-xs">
                    <Volume2 className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-[10px] font-mono text-gray-300">
                      {isMuted ? 'Voice Muted' : 'Male Voice Synthesizer'}
                    </span>
                    {!isMuted && isPlaying && (
                      <div className="flex items-end gap-0.5 h-3.5 px-1">
                        {audioBars.map((height, i) => (
                          <div
                            key={i}
                            className="w-1 bg-red-500 rounded-full transition-all duration-150"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Central Feature Showcase & Mockup */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto py-4">
                  {/* Left Column: Titles & Clinical Value */}
                  <div className="lg:col-span-6 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 text-white flex items-center justify-center shadow-lg">
                      <scene.icon className="w-6 h-6 text-red-400" />
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                      {scene.title}
                    </h1>

                    <p className="text-sm text-gray-300 font-medium leading-relaxed">
                      {scene.subtitle}
                    </p>

                    <div className="space-y-1.5 pt-2">
                      {scene.bulletPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-gray-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{point}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Visual Simulated Clinical Component */}
                  <div className="lg:col-span-6">
                    <div className="bg-gray-950/80 border border-white/15 rounded-xl p-4 shadow-2xl backdrop-blur-md space-y-3">
                      <div className="flex items-center justify-between border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          <span className="text-[11px] font-mono text-gray-400 ml-2">
                            PraxisMD Clinical Live Feed
                          </span>
                        </div>
                        <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                          VERIFIED EHR
                        </span>
                      </div>

                      {/* Mockup Specific Renderers */}
                      {scene.mockUiType === 'overview' && (
                        <div className="space-y-2 text-xs font-mono">
                          <div className="bg-white/5 p-2.5 rounded border border-white/10 flex justify-between items-center">
                            <span className="text-gray-300 font-bold">Vance, Eleanor (41y F)</span>
                            <span className="text-red-400 font-bold">MRN: P-80429</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div className="bg-white/5 p-2 rounded border border-white/5">
                              <span className="text-gray-400 block">Blood Pressure</span>
                              <span className="text-emerald-400 font-bold text-sm">124/82 mmHg</span>
                            </div>
                            <div className="bg-white/5 p-2 rounded border border-white/5">
                              <span className="text-gray-400 block">HbA1c Baseline</span>
                              <span className="text-sky-400 font-bold text-sm">6.8% (Borderline)</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {scene.mockUiType === 'roles' && (
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                          <div className="p-2 bg-purple-900/30 border border-purple-500/40 rounded">
                            <span className="text-purple-300 font-bold block">Super Admin</span>
                            <span className="text-[10px] text-gray-400">admin / admin</span>
                          </div>
                          <div className="p-2 bg-blue-900/30 border border-blue-500/40 rounded">
                            <span className="text-blue-300 font-bold block">Doctor (Attending)</span>
                            <span className="text-[10px] text-gray-400">dr_sarah (SOAP Sign)</span>
                          </div>
                          <div className="p-2 bg-amber-900/30 border border-amber-500/40 rounded">
                            <span className="text-amber-300 font-bold block">Compounder</span>
                            <span className="text-[10px] text-gray-400">compounder_raj (Vitals)</span>
                          </div>
                          <div className="p-2 bg-emerald-900/30 border border-emerald-500/40 rounded">
                            <span className="text-emerald-300 font-bold block">Lab Technician</span>
                            <span className="text-[10px] text-gray-400">lab_elena (Results)</span>
                          </div>
                        </div>
                      )}

                      {scene.mockUiType === 'webcam' && (
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center gap-3 bg-white/5 p-2 rounded border border-white/10">
                            <div className="w-10 h-10 rounded-full bg-red-700 text-white font-bold flex items-center justify-center text-sm">
                              EV
                            </div>
                            <div>
                              <div className="font-bold text-white">Eleanor Vance</div>
                              <div className="text-[10px] text-emerald-400 font-mono">Webcam 1:1 Headshot Active</div>
                            </div>
                          </div>
                          <div className="text-[11px] text-gray-400 flex items-center gap-1.5 bg-black/40 p-2 rounded">
                            <Camera className="w-3.5 h-3.5 text-red-400" />
                            <span>Instant snapshot timer, crop tool, and 12 presets</span>
                          </div>
                        </div>
                      )}

                      {scene.mockUiType === 'soap' && (
                        <div className="space-y-1.5 text-xs font-mono">
                          <div className="bg-white/5 p-1.5 rounded border border-white/10">
                            <span className="text-red-400 font-bold">S: </span>
                            <span className="text-gray-300 text-[11px]">Follow-up hypertension & type 2 diabetes</span>
                          </div>
                          <div className="bg-white/5 p-1.5 rounded border border-white/10">
                            <span className="text-red-400 font-bold">O: </span>
                            <span className="text-gray-300 text-[11px]">BP 128/82, HR 74, BMI 27.2 kg/m²</span>
                          </div>
                          <div className="bg-white/5 p-1.5 rounded border border-white/10">
                            <span className="text-red-400 font-bold">A: </span>
                            <span className="text-gray-300 text-[11px]">I10 Essential HTN, E11.9 T2DM without complications</span>
                          </div>
                          <div className="bg-white/5 p-1.5 rounded border border-white/10">
                            <span className="text-red-400 font-bold">P: </span>
                            <span className="text-gray-300 text-[11px]">Continue Lisinopril 20mg PO QD, Metformin 500mg</span>
                          </div>
                        </div>
                      )}

                      {scene.mockUiType === 'labs' && (
                        <div className="space-y-1.5 text-xs font-mono">
                          <div className="flex justify-between items-center bg-white/5 p-1.5 rounded border border-white/10">
                            <span className="text-gray-300">Hemoglobin A1c</span>
                            <span className="text-emerald-400 font-bold">6.8% [Normal &lt;7.0%]</span>
                          </div>
                          <div className="flex justify-between items-center bg-rose-950/40 p-1.5 rounded border border-rose-500/30">
                            <span className="text-rose-200">LDL Cholesterol</span>
                            <span className="text-rose-400 font-bold">142 mg/dL [HIGH]</span>
                          </div>
                          <div className="flex justify-between items-center bg-white/5 p-1.5 rounded border border-white/10">
                            <span className="text-gray-300">eGFR (CKD-EPI)</span>
                            <span className="text-emerald-400 font-bold">&gt;90 mL/min/1.73m²</span>
                          </div>
                        </div>
                      )}

                      {scene.mockUiType === 'mobile_qr' && (
                        <div className="flex items-center gap-3 bg-white/5 p-2.5 rounded border border-white/10">
                          <div className="w-16 h-16 bg-white rounded p-1 flex items-center justify-center shrink-0">
                            <QrCode className="w-14 h-14 text-gray-900" />
                          </div>
                          <div className="text-xs space-y-0.5">
                            <div className="font-bold text-white">Direct Mobile QR Portal</div>
                            <div className="text-[11px] text-gray-300">
                              Instant patient smartphone handoff without app installation
                            </div>
                            <div className="text-[10px] text-emerald-400 font-mono">
                              AVS Session Encrypted
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Subtitle Teleprompter Strip (Synchronized Male Voice Narration) */}
                <div className="bg-black/60 border border-white/10 rounded-xl p-3.5 backdrop-blur-md flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-600/30 text-red-400 border border-red-500/40 flex items-center justify-center shrink-0">
                    <Volume2 className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                      Narration Transcript (Male Voice)
                    </div>
                    <p className="text-xs sm:text-sm font-medium text-white italic leading-snug">
                      &ldquo;{scene.narrationText}&rdquo;
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* MP4 Video Player View */
            <div className="h-full flex flex-col items-center justify-center p-6 space-y-4">
              <video
                controls
                autoPlay
                className="w-full max-h-[380px] rounded-xl border border-gray-800 shadow-2xl bg-black"
                src="/family-physician-ehr-demo.mp4"
              >
                Your browser does not support the video tag.
              </video>
              <div className="flex items-center justify-between w-full max-w-2xl px-2">
                <span className="text-xs text-gray-400 font-mono">
                  Full rendered MP4 video with male voice narration
                </span>
                <a
                  href="/family-physician-ehr-demo.mp4"
                  download="family-physician-ehr-demo.mp4"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download MP4 File</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Video Scrubber & Controls Bar */}
        <div className="px-5 py-4 bg-gray-950 border-t border-gray-800 space-y-3">
          {/* Progress Timeline Scrubber */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-gray-400">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white">
                  Scene {currentSceneIndex + 1}: {scene.title}
                </span>
              </div>
              <div>
                <span>
                  {Math.floor(elapsedSceneTime)}s / {scene.duration}s
                </span>
              </div>
            </div>

            {/* Segmented Timeline */}
            <div className="flex items-center gap-1.5 h-2 w-full">
              {DEMO_SCENES.map((s, idx) => {
                const isPast = idx < currentSceneIndex;
                const isCurrent = idx === currentSceneIndex;
                const progressPct = isPast
                  ? 100
                  : isCurrent
                  ? (elapsedSceneTime / scene.duration) * 100
                  : 0;

                return (
                  <div
                    key={s.id}
                    onClick={() => handleJumpScene(idx)}
                    className="flex-1 bg-gray-800 hover:bg-gray-700 h-2 rounded-full overflow-hidden cursor-pointer transition-colors"
                    title={`Jump to Scene ${idx + 1}: ${s.title}`}
                  >
                    <div
                      className="bg-red-600 h-full transition-all duration-200"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Button Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  handleJumpScene(
                    currentSceneIndex > 0
                      ? currentSceneIndex - 1
                      : DEMO_SCENES.length - 1
                  )
                }
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg cursor-pointer"
                title="Previous Scene"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleTogglePlay}
                className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pause' : 'Play Walkthrough'}</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  handleJumpScene(
                    currentSceneIndex < DEMO_SCENES.length - 1
                      ? currentSceneIndex + 1
                      : 0
                  )
                }
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg cursor-pointer"
                title="Next Scene"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => handleJumpScene(currentSceneIndex)}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg cursor-pointer"
                title="Restart Current Scene"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Mute Voice */}
              <button
                type="button"
                onClick={handleToggleMute}
                className={`p-2 rounded-lg cursor-pointer transition-colors ${
                  isMuted
                    ? 'bg-rose-900/50 text-rose-300'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
                title={isMuted ? 'Unmute Male Voice' : 'Mute Voice'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Scene Selector Quick Pills & Download Button */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400 font-mono hidden md:inline">
                Speed:
              </span>
              <div className="flex bg-gray-800 rounded-lg p-0.5 border border-gray-700 text-[11px] font-mono">
                {[0.75, 1, 1.25].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded cursor-pointer ${
                      playbackSpeed === spd
                        ? 'bg-gray-700 text-white font-bold'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>

              <a
                href="/family-physician-ehr-demo.mp4"
                download="family-physician-ehr-demo.mp4"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 hover:text-white rounded-lg text-xs font-medium border border-gray-700 transition-colors"
                title="Download offline MP4 demo video"
              >
                <Download className="w-3.5 h-3.5 text-red-400" />
                <span>Download MP4</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
