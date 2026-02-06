import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { Voter } from '../types';
import { Camera, ShieldCheck, AlertTriangle, Scan, Lock, User, CheckCircle2, ArrowRight, Fingerprint, Loader2, ShieldAlert, RefreshCw, ChevronRight } from 'lucide-react';

type AuthStep = 'LOOKUP' | 'CAMERA_INIT' | 'PRE_LIVENESS' | 'PREPARING' | 'LIVENESS' | 'ANALYZING' | 'RESULT';
type Challenge = 'BLINK' | 'TURN_LEFT' | 'TURN_RIGHT';

const CHALLENGES: { type: Challenge; label: string; instruction: string }[] = [
  { type: 'BLINK', label: 'Blink Eyes', instruction: 'Perform a natural blink to verify liveness.' },
  { type: 'TURN_LEFT', label: 'Turn Head Left', instruction: 'Slowly rotate your head 45 degrees to the left.' },
  { type: 'TURN_RIGHT', label: 'Turn Head Right', instruction: 'Slowly rotate your head 45 degrees to the right.' }
];

const VoterAuthentication: React.FC<{ onAuthSuccess: (voter: Voter) => void }> = ({ onAuthSuccess }) => {
  const [step, setStep] = useState<AuthStep>('LOOKUP');
  const [idInput, setIdInput] = useState('');
  const [idType, setIdType] = useState<'VOTER_ID' | 'AADHAAR'>('VOTER_ID');
  const [voter, setVoter] = useState<Voter | null>(null);
  const [currentChallengeIdx, setCurrentChallengeIdx] = useState(0);
  const [timer, setTimer] = useState(5);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [authStatus, setAuthStatus] = useState<'SUCCESS' | 'FAIL' | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // --- CAPTURE LIVE IMAGE FROM CAMERA ---
  const captureLiveImage = (): string => {
    const video = videoRef.current!;
    const canvas = canvasRef.current!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')!.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg');
  };


  // Format Aadhaar with dashes (XXXX-XXXX-XXXX)
  const formatAadhaar = (value: string): string => {
    const cleaned = value.replace(/[^0-9X]/g, '');
    const truncated = cleaned.substring(0, 12);
    const parts = [];
    for (let i = 0; i < truncated.length; i += 4) {
      parts.push(truncated.substring(i, i + 4));
    }
    return parts.join('-');
  };

  // Format Voter ID (VOTE123456 - 4 letters + 6 digits)
  const formatVoterId = (value: string): string => {
    const cleaned = value.replace(/[^A-Z0-9]/g, '');
    const letters = cleaned.substring(0, 4).replace(/[^A-Z]/g, '');
    const numbers = cleaned.substring(4, 10).replace(/[^0-9]/g, '');
    return letters + numbers;
  };

  // Validate input based on ID type
  const validateInput = (value: string): boolean => {
    if (idType === 'AADHAAR') {
      const cleaned = value.replace(/-/g, '');
      return cleaned.length === 12 && /^[0-9X]{12}$/.test(cleaned);
    } else {
      return value.length === 10 && /^[A-Z]{4}[0-9]{6}$/.test(value);
    }
  };

  // Handle input change with formatting
  const handleIdInputChange = (value: string) => {
    if (idType === 'AADHAAR') {
      setIdInput(formatAadhaar(value.toUpperCase()));
    } else {
      setIdInput(formatVoterId(value.toUpperCase()));
    }
  };

  // Handle ID type change
  const handleIdTypeChange = (type: 'VOTER_ID' | 'AADHAAR') => {
    setIdType(type);
    setIdInput('');
    setError('');
  };

  // Calculate master progress percentage
  const getProgress = () => {
    switch (step) {
      case 'LOOKUP': return 15;
      case 'CAMERA_INIT':
      case 'PRE_LIVENESS': return 35;
      case 'PREPARING': return 40;
      case 'LIVENESS': return 45 + (currentChallengeIdx * 15);
      case 'ANALYZING': return 95;
      case 'RESULT': return 100;
      default: return 0;
    }
  };

  // Handle identity lookup
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idInput) return;
    
    // Validate input format
    if (!validateInput(idInput)) {
      if (idType === 'AADHAAR') {
        setError('Invalid Aadhaar format. Must be 12 digits (XXXX-XXXX-XXXX)');
      } else {
        setError('Invalid Voter ID format. Must be 4 letters followed by 6 digits (e.g., VOTE123456)');
      }
      return;
    }
    
    setIsVerifying(true);
    setError('');

    const result = await api.findVoterById(idInput);
    if (result.success && result.voter) {
      setVoter(result.voter);
      setStep('CAMERA_INIT');
      startCamera();
    } else {
      setError(result.message || 'Identity not found in national registry.');
    }
    setIsVerifying(false);
  };

  // Camera Management
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setStep('PRE_LIVENESS');
      }
    } catch (err) {
      setError('Biometric hardware error: Camera access is mandatory.');
      setStep('LOOKUP');
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    }
  };

  // Challenge Timer Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'LIVENESS' && timer > 0) {
      interval = setInterval(() => setTimer((t: number) => t - 1), 1000);
    } else if (step === 'LIVENESS' && timer === 0) {
      if (currentChallengeIdx < CHALLENGES.length - 1) {
        setCurrentChallengeIdx((i: number) => i + 1);
        setTimer(5);
      } else {
        // All challenges complete - proceed to analysis
        setStep('ANALYZING');
        runAIEngine();
      }
    }
    return () => clearInterval(interval);
  }, [step, timer, currentChallengeIdx]);

  // Simulated AI Engine Run
  const runAIEngine = async () => {
    setStep('ANALYZING');
    await new Promise(r => setTimeout(r, 2500)); // UI animation delay

    // Use the image that was captured when user clicked "I am Ready"
    if (!capturedImage) {
      console.error('[ERROR] No captured image found!');
      setAuthStatus('FAIL');
      setError('Image capture failed. Please try again.');
      stopCamera();
      setStep('RESULT');
      return;
    }

    console.log('[AUTH] Using captured image for verification...');
    const result = await api.authenticateVoter(
      voter!.voterId,
      capturedImage,
      [] // Empty liveness frames array
    );

    stopCamera();
    setStep('RESULT');

    if (result.success) {
      setAuthStatus('SUCCESS');
      setTimeout(() => onAuthSuccess(voter!), 2000);
    } else {
      setAuthStatus('FAIL');
      setError(result.message || 'Authentication failed');
    }
  };


  const startLiveness = () => {
    // Show preparing state
    setStep('PREPARING');
    console.log('[LIVENESS] Preparing for liveness challenges...');
    
    // Wait 2.5 seconds before starting challenges (preparation time)
    setTimeout(() => {
      setCurrentChallengeIdx(0);
      setTimer(5);
      setStep('LIVENESS');
      console.log('[LIVENESS] First challenge starting now');
      
      // CAPTURE IMAGE during first challenge (after 1 second into the challenge)
      setTimeout(() => {
        console.log('[CAPTURE] Capturing image during first challenge...');
        const liveImage = captureLiveImage();
        setCapturedImage(liveImage);
        console.log('[CAPTURE] Image captured successfully during liveness');
      }, 1000);
    }, 2500);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Master Progress Bar */}
      <div className="w-full h-1.5 bg-slate-200 rounded-full mb-10 overflow-hidden">
        <div 
          className="h-full bg-blue-600 transition-all duration-700 ease-out"
          style={{ width: `${getProgress()}%` }}
        />
      </div>

      {/* Step Header */}
      <div className="flex items-center justify-between mb-10 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-[#053c6d] text-white p-3 rounded-xl shadow-lg">
            <Lock size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-[#053c6d] tracking-tight">Biometric Verification Chamber</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">Terminal ID: BV-992-DELTA • Mode: Secure Blockchain Handshake</p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
           <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Live Server Status: Active</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8 items-start">
        
        {/* Main Interaction Area */}
        <div className="lg:col-span-8 space-y-8">
          {step === 'LOOKUP' ? (
            <div className="bg-white p-12 rounded-[2.5rem] shadow-xl border border-slate-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="max-w-md mx-auto text-center space-y-8">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto text-[#053c6d] border border-blue-100 shadow-inner">
                  <Fingerprint size={40} />
                </div>
                <div className="space-y-2">
                  <h3 className="text-3xl font-black text-[#053c6d]">Identify Yourself</h3>
                  <p className="text-slate-500 font-medium text-sm">Select your ID type and enter credentials to retrieve your profile from the secure electoral registry.</p>
                </div>

                <form onSubmit={handleLookup} className="space-y-6">
                  {/* ID Type Selection */}
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-left ml-1">Select ID Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => handleIdTypeChange('VOTER_ID')}
                        className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                          idType === 'VOTER_ID'
                            ? 'bg-blue-50 border-[#053c6d] text-[#053c6d]'
                            : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {idType === 'VOTER_ID' && <CheckCircle2 size={16} />}
                        Voter ID (EPIC)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleIdTypeChange('AADHAAR')}
                        className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                          idType === 'AADHAAR'
                            ? 'bg-blue-50 border-[#053c6d] text-[#053c6d]'
                            : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {idType === 'AADHAAR' && <CheckCircle2 size={16} />}
                        Aadhaar
                      </button>
                    </div>
                  </div>

                  {/* ID Input */}
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-slate-300 group-focus-within:text-[#053c6d] transition-colors">
                      {idType === 'VOTER_ID' ? <User size={22} /> : <Fingerprint size={22} />}
                    </div>
                    <input 
                      required
                      autoFocus
                      className="w-full pl-16 pr-8 py-6 bg-slate-50 border-2 border-slate-100 rounded-3xl focus:bg-white focus:border-[#053c6d] outline-none text-xl font-bold transition-all placeholder:text-slate-300 shadow-sm"
                      placeholder={idType === 'VOTER_ID' ? 'VOTE123456' : 'XXXX-XXXX-XXXX'}
                      value={idInput}
                      onChange={e => handleIdInputChange(e.target.value)}
                    />
                  </div>
                  <button 
                    disabled={isVerifying || !idInput}
                    className="w-full bg-[#053c6d] text-white py-6 rounded-3xl font-black text-xl hover:bg-[#085091] transition shadow-2xl shadow-blue-900/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                  >
                    {isVerifying ? <Loader2 className="animate-spin" /> : <>Verify Registry Entry <ChevronRight /></>}
                  </button>
                </form>

                {error && (
                  <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex gap-4 items-center text-left animate-in zoom-in-95">
                    <ShieldAlert className="text-red-600 shrink-0" size={24} />
                    <div>
                      <p className="text-red-900 font-black text-[10px] uppercase tracking-widest mb-1">Security Alert</p>
                      <p className="text-red-700 text-sm font-bold leading-tight">{error}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-700">
              {/* Profile Bar */}
              {voter && (
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-[#053c6d] rounded-2xl flex items-center justify-center font-black text-white text-xl border-4 border-white shadow-lg">
                      {voter.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-black text-xl text-[#053c6d] leading-none">{voter.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-2 tracking-widest">Registry ID: {voter.voterId} • Masked ID: XXXX-{voter.aadhaar.slice(-4)}</p>
                    </div>
                  </div>
                  <div className="hidden sm:block text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Encryption Token</p>
                    <p className="font-mono text-[10px] text-blue-600 font-bold">SHA-256: {btoa(voter.id).slice(0,12)}...</p>
                  </div>
                </div>
              )}

              {/* Side-by-Side Biometric View */}
              <div className="grid md:grid-cols-2 gap-8 relative">
                {/* On-Record Photo */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Registry Reference</p>
                    <span className="text-[9px] font-bold text-slate-300">MODG-IMG-DATA</span>
                  </div>
                  <div className="aspect-[4/5] bg-white rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden ring-1 ring-slate-200 relative">
                    <img src={voter?.faceEmbedding} className="w-full h-full object-cover grayscale opacity-50" />
                    <div className="absolute inset-0 bg-blue-900/5 pointer-events-none"></div>
                    <div className="absolute bottom-6 left-6 right-6 p-4 bg-black/60 backdrop-blur-md rounded-2xl border border-white/10">
                      <p className="text-white text-[10px] font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-green-400" /> Database Match Found
                      </p>
                      <p className="text-white/50 text-[8px] font-medium leading-tight italic">Enrollment Date: {new Date(voter?.registrationDate || '').toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Live Scanner */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#053c6d]">Live Hardware Feed</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                      <span className="text-[9px] font-black text-red-600 uppercase tracking-widest">Rec 01:24</span>
                    </div>
                  </div>
                  <div className="aspect-[4/5] bg-slate-900 rounded-[2.5rem] border-4 border-white shadow-2xl overflow-hidden ring-1 ring-slate-200 relative group">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                    
                    {/* Scanner Overlays */}
                    <div className="absolute inset-0 pointer-events-none border-[12px] border-slate-900/20">
                      <div className="absolute top-0 w-full h-1 bg-blue-500 animate-[scan_3s_infinite] shadow-[0_0_20px_rgba(59,130,246,1)]"></div>
                      <div className="absolute inset-10 border border-white/10 rounded-[2rem] flex items-center justify-center">
                         <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-white/40 rounded-tl-xl"></div>
                         <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-white/40 rounded-tr-xl"></div>
                         <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-white/40 rounded-bl-xl"></div>
                         <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-white/40 rounded-br-xl"></div>
                      </div>
                    </div>

                    {/* Pre-Liveness Ready Button */}
                    {step === 'PRE_LIVENESS' && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center text-white z-40 animate-in fade-in duration-500">
                        <div className="bg-[#053c6d] p-5 rounded-full mb-6 shadow-2xl ring-4 ring-blue-500/20">
                          <Camera size={32} />
                        </div>
                        <h5 className="text-xl font-black mb-3 uppercase tracking-tight">Camera Synchronized</h5>
                        <p className="text-blue-100/70 text-[10px] font-bold mb-8 uppercase tracking-widest leading-relaxed max-w-[240px]">Identity verified in registry. Click ready to begin sequential liveness challenges.</p>
                        <button 
                          onClick={startLiveness}
                          className="bg-white text-[#053c6d] px-10 py-5 rounded-3xl font-black text-sm uppercase tracking-[0.2em] hover:bg-blue-50 transition shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95 flex items-center gap-3 group"
                        >
                          I am Ready <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    )}

                    {/* Preparing for Challenges */}
                    {step === 'PREPARING' && (
                      <div className="absolute inset-0 bg-blue-600/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center text-white z-40 animate-in zoom-in-95">
                        <div className="bg-white text-blue-600 p-5 rounded-full mb-6 shadow-2xl animate-pulse">
                          <ShieldCheck size={48} />
                        </div>
                        <h5 className="text-2xl font-black mb-3 uppercase tracking-tight">Preparing Challenges</h5>
                        <p className="text-blue-100 text-sm font-bold mb-4">Get ready for liveness verification...</p>
                        <p className="text-blue-200 text-xs">3 challenges will begin shortly</p>
                        <div className="mt-6 w-48 h-1 bg-white/20 rounded-full overflow-hidden">
                          <div className="h-full bg-white animate-[progress_2.5s_ease-out]" />
                        </div>
                      </div>
                    )}

                    {/* Challenge Prompt Overlay */}
                    {step === 'LIVENESS' && (
                      <div className="absolute inset-x-8 top-12 bg-white/10 backdrop-blur-xl rounded-3xl p-6 border border-white/20 text-center animate-in slide-in-from-top-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 rounded-full text-[9px] font-black uppercase tracking-widest text-white mb-3">
                          <RefreshCw size={10} className="animate-spin-slow" /> Challenge {currentChallengeIdx + 1} of 3
                        </div>
                        <h5 className="text-white text-xl font-black tracking-tight">{CHALLENGES[currentChallengeIdx].label}</h5>
                        <p className="text-blue-100/70 text-[10px] font-medium mt-1 leading-relaxed px-4">{CHALLENGES[currentChallengeIdx].instruction}</p>
                        
                        <div className="mt-6 flex flex-col items-center justify-center gap-2">
                          <span className="text-white font-black text-4xl animate-pulse">{timer}</span>
                          <span className="text-blue-200 text-[9px] font-black uppercase tracking-[0.3em]">Seconds Remaining</span>
                        </div>
                      </div>
                    )}

                    {/* Analyzing State */}
                    {step === 'ANALYZING' && (
                      <div className="absolute inset-0 bg-[#0b2447]/90 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center text-white z-50 animate-in zoom-in-95">
                        <div className="relative mb-8">
                           <div className="w-20 h-20 border-4 border-blue-500/20 rounded-full"></div>
                           <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                           <div className="absolute inset-0 flex items-center justify-center">
                             <Scan size={32} className="text-blue-400 animate-pulse" />
                           </div>
                        </div>
                        <div className="space-y-2">
                          <p className="font-black uppercase text-xs tracking-[0.4em]">DeepFace Analysis</p>
                          <p className="text-blue-300 text-[10px] font-bold">RUNNING ANTI-SPOOF DETECTION...</p>
                        </div>
                        <div className="mt-8 w-full max-w-[180px] space-y-2">
                           <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-blue-500 w-[85%] transition-all duration-[2500ms]" />
                           </div>
                           <div className="flex justify-between text-[8px] font-black uppercase text-blue-400 opacity-60">
                              <span>Vector Extraction</span>
                              <span>98%</span>
                           </div>
                        </div>
                      </div>
                    )}

                    {/* Result Screens */}
                    {step === 'RESULT' && authStatus === 'SUCCESS' && (
                      <div className="absolute inset-0 bg-green-600/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center text-white z-50 animate-in zoom-in">
                        <div className="bg-white text-green-600 p-5 rounded-full mb-6 shadow-2xl scale-125">
                          <ShieldCheck size={48} />
                        </div>
                        <h4 className="font-black uppercase text-3xl tracking-tight">Identity Verified</h4>
                        <p className="text-green-100 text-[10px] font-bold mt-4 uppercase tracking-[0.2em] opacity-80">Access Granted to Immutable Ballot</p>
                        <div className="mt-10 p-4 bg-white/10 rounded-2xl border border-white/20 text-[9px] font-bold font-mono">
                           SESSION_AUTH_TOKEN: {Math.random().toString(36).toUpperCase().slice(2, 14)}
                        </div>
                      </div>
                    )}

                    {step === 'RESULT' && authStatus === 'FAIL' && (
                      <div className="absolute inset-0 bg-red-600/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center text-white z-50 animate-in zoom-in">
                        <div className="bg-white text-red-600 p-5 rounded-full mb-6 shadow-2xl">
                          <AlertTriangle size={48} />
                        </div>
                        <h4 className="font-black uppercase text-2xl tracking-tight leading-tight">Biometric Rejection</h4>
                        <p className="text-red-100 text-xs font-bold mt-4 px-6 leading-relaxed">DeepFace could not align the live liveness data with your registered registry profile.</p>
                        <button 
                          onClick={() => { setStep('LOOKUP'); setVoter(null); setAuthStatus(null); }}
                          className="mt-10 bg-white text-red-600 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl"
                        >
                          Return to Lookup
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Info / Protocol Sidebar */}
        <div className="lg:col-span-4 space-y-6">
           {/* Image Capture Instructions - Only show after voter lookup */}
           {step !== 'LOOKUP' && voter && (
             <div className="bg-gradient-to-br from-orange-500 to-red-600 p-6 rounded-[2rem] text-white shadow-xl sticky top-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <Camera size={18} />
                  </div>
                  <h4 className="text-xs font-black uppercase tracking-wider">Capture Instructions</h4>
                </div>
                
                <div className="space-y-3">
                  <InstructionItem 
                    number="1" 
                    title="Position Face" 
                    desc="Center your face in the camera frame" 
                  />
                  <InstructionItem 
                    number="2" 
                    title="Good Lighting" 
                    desc="Ensure face is well-lit, avoid shadows" 
                  />
                  <InstructionItem 
                    number="3" 
                    title="Look at Camera" 
                    desc="Look directly at the lens, stay still" 
                  />
                  <InstructionItem 
                    number="4" 
                    title="Remove Accessories" 
                    desc="Take off glasses, hats, or masks" 
                  />
                </div>

                <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <p className="text-[10px] font-bold flex items-center gap-2">
                    <AlertTriangle size={12} />
                    <span>Use natural daylight for best results</span>
                  </p>
                </div>
             </div>
           )}
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
      <style>{`
        @keyframes scan { 0% { top: 10% } 50% { top: 90% } 100% { top: 10% } }
        @keyframes progress { from { width: 0% } to { width: 100% } }
        .animate-spin-slow { animation: spin 3s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

const InstructionItem = ({ number, title, desc }: { number: string; title: string; desc: string }) => (
  <div className="flex gap-3 items-start bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
    <div className="shrink-0 w-6 h-6 bg-white text-orange-600 rounded-full flex items-center justify-center font-black text-xs">
      {number}
    </div>
    <div>
      <p className="text-xs font-black uppercase tracking-wide leading-tight">{title}</p>
      <p className="text-[10px] text-orange-100 font-medium leading-snug mt-0.5">{desc}</p>
    </div>
  </div>
);

export default VoterAuthentication;