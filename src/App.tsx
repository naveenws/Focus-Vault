import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, Shield, Zap, AlertTriangle, Play, Smartphone, CheckSquare, Square,
  Database, Copy, RefreshCw, Clock, Trash2, Plus, Check, Settings, 
  Home, ArrowLeft, Loader2, Sparkles, BookOpen, ChevronRight, FileText, ExternalLink, Calendar, Key, AlertOctagon, HelpCircle, List
} from "lucide-react";
import { BlockedApp, LockSession, TamperingLog, UsageStats, KotlinFile } from "./types";
import { KOTLIN_PROJECT_FILES } from "./data/androidCode";

export default function App() {
  // --- Simulated Application State ---
  const [simulatedTime, setSimulatedTime] = useState<number>(Date.now());
  const [deviceAdminEnabled, setDeviceAdminEnabled] = useState<boolean>(true);
  const [accessibilityEnabled, setAccessibilityEnabled] = useState<boolean>(true);
  const [pinLockSet, setPinLockSet] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All Categories");

  // Installed and blocked application states
  const [installedApps, setInstalledApps] = useState<BlockedApp[]>([]);
  const [blockedPackageNames, setBlockedPackageNames] = useState<string[]>([
    "com.instagram.android",
    "com.zhiliaoapp.musically",
    "com.riotgames.wildrift"
  ]);

  // Live Focus Lock Session State
  const [activeSession, setActiveSession] = useState<LockSession | null>(null);
  const [customTimerMinutes, setCustomTimerMinutes] = useState<string>("45");
  const [selectedDurationOption, setSelectedDurationOption] = useState<number>(60); // 60 minutes default

  const durationOptions = [
    { minutes: 30, label: "30 Minutes" },
    { minutes: 60, label: "1 Hour" },
    { minutes: 180, label: "3 Hours" },
    { minutes: 480, label: "8 Hours" },
    { minutes: 1440, label: "24 Hours" },
    { minutes: 4320, label: "3 Days" },
    { minutes: 10080, label: "7 Days" },
    { minutes: -1, label: "Custom" }
  ];

  // Tampering logs table state (Simulating room db schema)
  const [tamperLogs, setTamperLogs] = useState<TamperingLog[]>([
    {
      id: "TL01",
      timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
      type: "admin_revoked",
      details: "Simulated administrator profile was successfully registered to the device ROM.",
      severity: "LOW"
    }
  ]);

  // Usage statistics
  const [usageStats, setUsageStats] = useState<UsageStats[]>([
    { date: "2026-06-08", totalFocusMinutes: 180, blockedLaunchesCount: 14, activeStreak: 4 },
    { date: "2026-06-07", totalFocusMinutes: 120, blockedLaunchesCount: 8, activeStreak: 3 },
    { date: "2026-06-06", totalFocusMinutes: 240, blockedLaunchesCount: 22, activeStreak: 2 },
    { date: "2026-06-05", totalFocusMinutes: 90, blockedLaunchesCount: 5, activeStreak: 1 }
  ]);

  const [blockedLaunchesToday, setBlockedLaunchesToday] = useState<number>(3);
  const [focusMinutesToday, setFocusMinutesToday] = useState<number>(45);
  const [activeStreak, setActiveStreak] = useState<number>(5);

  // Error/Success state displays
  const [appAlert, setAppAlert] = useState<{ type: "tamper" | "normal" | "success"; text: string } | null>(null);

  // Gemini motivator message state
  const [motivationMessage, setMotivationMessage] = useState<string>("Your future is being built in the hours you rescue today. Stay the course; the urge is temporary, but discipline is permanent.");
  const [isLoadingMotivation, setIsLoadingMotivation] = useState<boolean>(false);
  const [currentInterceptedApp, setCurrentInterceptedApp] = useState<BlockedApp | null>(null);

  // --- UI Screen States ---
  const [emulatorScreen, setEmulatorScreen] = useState<"home" | "vault" | "app_instagram" | "app_tiktok" | "app_reddit" | "app_wildrift" | "blocked_overlay" | "android_settings">("vault");
  const [lastOpenedApp, setLastOpenedApp] = useState<BlockedApp | null>(null);
  const [selectedFile, setSelectedFile] = useState<KotlinFile>(KOTLIN_PROJECT_FILES[2]); // Default BlockedAppEntity
  const [activeRightTab, setActiveRightTab] = useState<"code" | "schema" | "guide">("code");
  const [doubleConfirmOpen, setDoubleConfirmOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // --- Fetch Simulated App Stack on start ---
  useEffect(() => {
    fetch("/api/apps")
      .then((res) => res.json())
      .then((data) => {
        if (data.apps) {
          setInstalledApps(data.apps);
        }
      })
      .catch((err) => {
        // Safe standard fallback in case server is building
        setInstalledApps([
          { packageName: "com.instagram.android", appName: "Instagram", category: "Social Media", icon: "instagram", defaultUsageMin: 140 },
          { packageName: "com.zhiliaoapp.musically", appName: "TikTok", category: "Social Media", icon: "video", defaultUsageMin: 185 },
          { packageName: "com.reddit.frontpage", appName: "Reddit", category: "Entertainment", icon: "reddit", defaultUsageMin: 90 },
          { packageName: "com.google.android.youtube", appName: "YouTube", category: "Entertainment", icon: "youtube", defaultUsageMin: 120 },
          { packageName: "com.riotgames.wildrift", appName: "League of Legends: Wild Rift", category: "Gaming", icon: "gamepad", defaultUsageMin: 75 },
          { packageName: "com.supercell.clashofclans", appName: "Clash of Clans", category: "Gaming", icon: "swords", defaultUsageMin: 45 }
        ]);
      });
  }, []);

  // --- System clock synchronization inside simulator ---
  useEffect(() => {
    const timer = setInterval(() => {
      setSimulatedTime((prev) => prev + 1000);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Monitor session expiration based on simulated time
  useEffect(() => {
    if (activeSession && simulatedTime >= activeSession.endTime) {
      // Natural focus completion!
      setActiveSession(null);
      setFocusMinutesToday((prev) => prev + Math.floor(activeSession.totalDurationMs / 60000));
      setAppAlert({
        type: "success",
        text: `Congratulations! Your Focus Lock session "${activeSession.durationLabel}" completed successfully! Daily focus stats increased.`
      });
      // Update usage log
      const todayStr = new Date(simulatedTime).toISOString().split("T")[0];
      setUsageStats((prev) => {
        const index = prev.findIndex((s) => s.date === todayStr);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            totalFocusMinutes: updated[index].totalFocusMinutes + Math.floor(activeSession.totalDurationMs / 60000)
          };
          return updated;
        } else {
          return [{ date: todayStr, totalFocusMinutes: Math.floor(activeSession.totalDurationMs / 60000), blockedLaunchesCount: blockedLaunchesToday, activeStreak }, ...prev];
        }
      });
    }
  }, [simulatedTime, activeSession]);

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    alert("Source code copied to clipboard!");
  };

  const handleToggleBlockAppSelection = (packageName: string) => {
    if (activeSession) {
      setAppAlert({
        type: "normal",
        text: "SECURE LOCKOUT ACTIVE: You cannot add or remove apps from blocked list while focus lock is running!"
      });
      return;
    }
    setBlockedPackageNames((prev) => 
      prev.includes(packageName)
        ? prev.filter((p) => p !== packageName)
        : [...prev, packageName]
    );
  };

  // --- Request Gemini motivational quote on intercept ---
  const fetchGeminiMotivation = async (app: BlockedApp) => {
    setIsLoadingMotivation(true);
    setMotivationMessage("Consulting Focus Vault AI coach...");
    try {
      const hoursRemaining = activeSession
        ? Math.max(0.1, parseFloat(((activeSession.endTime - simulatedTime) / 3600000).toFixed(1)))
        : 1;

      const res = await fetch("/api/motivation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          blockedApp: app.appName,
          category: app.category,
          minutesSpent: app.defaultUsageMin,
          hoursRemaining
        })
      });
      const data = await res.json();
      setMotivationMessage(data.message);
    } catch (err) {
      setMotivationMessage("Discipline is choosing between what you want now and what you want most. Focus on the long game.");
    } finally {
      setIsLoadingMotivation(false);
    }
  };

  // Launch simulated phone application
  const handleLaunchApp = (app: BlockedApp) => {
    const isCurrentlyBlocked = blockedPackageNames.includes(app.packageName);
    setLastOpenedApp(app);

    if (activeSession && isCurrentlyBlocked) {
      // INTERCEPTED by Accessibility Service Overlay
      if (accessibilityEnabled) {
        setBlockedLaunchesToday((prev) => prev + 1);
        setCurrentInterceptedApp(app);
        setEmulatorScreen("blocked_overlay");
        fetchGeminiMotivation(app);
        
        // Log to database
        const todayStr = new Date(simulatedTime).toISOString().split("T")[0];
        setUsageStats((prev) => {
          const index = prev.findIndex((s) => s.date === todayStr);
          if (index !== -1) {
            const updated = [...prev];
            updated[index].blockedLaunchesCount += 1;
            return updated;
          }
          return prev;
        });
      } else {
        // Protection failure because user disabled accessibility service bypass!
        setAppAlert({
          type: "tamper",
          text: `CORRUPTING: Opened blocked app "${app.appName}" successfully! Accessibility Service is DISABLED. Tamper incident logged!`
        });
        const newLog: TamperingLog = {
          id: `TL${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
          type: "accessibility_disabled",
          details: `Distraction bypass detected: Blocked application '${app.appName}' loaded successfully because User Disabled Accessibility Service!`,
          severity: "HIGH"
        };
        setTamperLogs((prev) => [newLog, ...prev]);
        showAppSimulated(app.packageName);
      }
    } else {
      showAppSimulated(app.packageName);
    }
  };

  const showAppSimulated = (pkg: string) => {
    if (pkg === "com.instagram.android") setEmulatorScreen("app_instagram");
    else if (pkg === "com.zhiliaoapp.musically") setEmulatorScreen("app_tiktok");
    else if (pkg === "com.reddit.frontpage") setEmulatorScreen("app_reddit");
    else if (pkg === "com.riotgames.wildrift") setEmulatorScreen("app_wildrift");
    else {
      alert(`Launching normal app: ${pkg}`);
    }
  };

  // --- Start Locked Focus Session ---
  const handleStartFocusLock = () => {
    if (blockedPackageNames.length === 0) {
      setAppAlert({ type: "normal", text: "Please select at least 1 application to block before starting a focus lock." });
      return;
    }
    if (!accessibilityEnabled) {
      setAppAlert({ type: "normal", text: "ERROR: You must enable Accessibility Service in Android permissions to intercept app launches!" });
      return;
    }

    let durationMs = 0;
    let label = "";

    if (selectedDurationOption === -1) {
      const mins = parseInt(customTimerMinutes);
      if (isNaN(mins) || mins <= 0) {
        setAppAlert({ type: "normal", text: "Please enter a valid custom duration in minutes." });
        return;
      }
      durationMs = mins * 60 * 1000;
      label = `${mins} Minutes (Custom)`;
    } else {
      durationMs = selectedDurationOption * 60 * 1000;
      const option = durationOptions.find((o) => o.minutes === selectedDurationOption);
      label = option ? option.label : `${selectedDurationOption} mins`;
    }

    const newSession: LockSession = {
      id: `S${Math.floor(Math.random() * 10000)}`,
      startTime: simulatedTime,
      endTime: simulatedTime + durationMs,
      durationLabel: label,
      active: true,
      isCustom: selectedDurationOption === -1,
      totalDurationMs: durationMs
    };

    setActiveSession(newSession);
    setDoubleConfirmOpen(false);
    setAppAlert({ type: "success", text: `Vault Protected Active Session started for ${label}. All chosen apps are locked lock-tight!` });
  };

  // --- Simulations for SECURE TAMPER defenses ---

  // 1. TAMPER DETECTED: Simulate shifting system calendar/clock forward 5 hours
  const triggerSimulateChangeTime = () => {
    const shiftAmtMs = 5 * 60 * 60 * 1000; // 5 hours
    setSimulatedTime((prev) => prev + shiftAmtMs);

    if (activeSession && activeSession.active) {
      // In a real device, the hardware clock MONOTONIC loop alerts Focus Vault
      // We immediately calculate a PENALTY time +30 minutes, update session, and save high-severity tampering log.
      const penaltyMs = 30 * 60 * 1000; // +30 mins penalty
      
      setActiveSession((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          endTime: prev.endTime + penaltyMs + shiftAmtMs // Compensate shift AND add penalty!
        };
      });

      const newLog: TamperingLog = {
        id: `TL${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        type: "time_changed",
        details: "CRITICAL: System hardware NTP sync mismatch. Detected manual system timezone/time shift. Penalty +30 Minutes applied.",
        severity: "HIGH"
      };

      setTamperLogs((prev) => [newLog, ...prev]);
      setAppAlert({
        type: "tamper",
        text: "SECURITY THREAT: Detected clock manipulation attempt! Lock is extended by 30 mins, incident logged to Room DB."
      });
    } else {
      setAppAlert({
        type: "normal",
        text: "Simulated time shifted by +5 hours forward. No active locks found, system integrity stable."
      });
    }
  };

  // 2. Disable Accessibility service bypass simulation
  const handleToggleAccessibilityPermission = () => {
    const nextState = !accessibilityEnabled;
    setAccessibilityEnabled(nextState);

    if (activeSession && activeSession.active && !nextState) {
      const newLog: TamperingLog = {
        id: `TL${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString(),
        type: "accessibility_disabled",
        details: "PROHIBITED STATE: Defensive Accessibility Service was manually turned off during an active lockout session!",
        severity: "HIGH"
      };
      setTamperLogs((prev) => [newLog, ...prev]);
      setAppAlert({
        type: "tamper",
        text: "CRITICAL: Accessibility service killed! User bypassed digital locks. Log saved to database audits."
      });
    }
  };

  // 3. Deactivate Device Admin simulation
  const handleToggleDeviceAdminPermission = () => {
    const nextState = !deviceAdminEnabled;
    
    if (activeSession && activeSession.active && deviceAdminEnabled && !nextState) {
      // Trigger a lock alert warning first
      if (confirm("WARNING: Disabling device admin privileges logs a tampering audit. Are you sure you want to degrade system defenses?")) {
        setDeviceAdminEnabled(false);
        const newLog: TamperingLog = {
          id: `TL${Math.floor(Math.random() * 1000)}`,
          timestamp: new Date().toISOString(),
          type: "admin_revoked",
          details: "WARNING ADMIN STATUS REVOKED: Defensive Administrator permission profile detached during an active focus.",
          severity: "MEDIUM"
        };
        setTamperLogs((prev) => [newLog, ...prev]);
        setAppAlert({
          type: "tamper",
          text: "INTEGRITY DEGRADED: Focus Vault Device Administrator privilege stripped. Logged."
        });
      }
    } else {
      setDeviceAdminEnabled(nextState);
    }
  };

  // Helper formatting countdown labels
  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const totalSecs = Math.floor(ms / 1000);
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  // Format timestamp for Room grid
  const formatRoomTimestamp = (isoStr: string) => {
    const date = new Date(isoStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const filteredApps = installedApps.filter(app => 
    (selectedCategory === "All Categories" || app.category === selectedCategory) &&
    (app.appName.toLowerCase().includes(searchTerm.toLowerCase()) || app.packageName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-[#E0E0E0] flex flex-col antialiased">
      {/* Header Bar */}
      <header className="bg-[#0F0F11] border-b border-[#222224] py-3.5 px-6 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-[#D4AF37] rounded-lg text-[#0A0A0B] flex items-center justify-center shadow-md shadow-[#D4AF37]/10">
            <Lock className="w-5 h-5" id="hero-lock-icon" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight font-display uppercase text-white">Focus Vault</h1>
            <p className="text-xs text-[#666666]">Android Anti-Addiction Simulator & Kotlin Codebase Sandbox</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Simulated Universal Clock */}
          <div className="flex items-center space-x-2 bg-[#161618] border border-[#222224] px-3.5 py-1.5 rounded-full text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="text-[#666666]">System Clock:</span>
            <span className="text-[#E0E0E0]">{new Date(simulatedTime).toLocaleTimeString()}</span>
          </div>

          <div className="text-xs text-[#666666] hidden lg:block">
            Target Platform: <span className="text-[#D4AF37] font-semibold font-sans">Android SDK 34 (Kotlin)</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-[1920px] w-full mx-auto grid grid-cols-1 xl:grid-cols-12 gap-6 p-4 lg:p-6 overflow-hidden">
        
        {/* =========================================================================
            SECTION 1: THE INTERACTIVE MOBILE ANDROID PHONE EMULATOR (4 Columns)
            ========================================================================= */}
        <section className="xl:col-span-4 flex flex-col items-center justify-start space-y-4">
          <div className="w-full max-w-[390px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-[#666666] flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-[#D4AF37]" /> Phone Simulator
              </span>
              <div className="flex gap-2">
                {/* Status indicator pill */}
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  activeSession ? "bg-[#161618] text-[#4CAF50] border-[#222224] shadow-[0_0_8px_rgba(76,175,80,0.3)]" : "bg-[#161618] text-[#666666] border-[#222224]"
                }`}>
                  {activeSession ? "● FOCUS LOCKED" : "○ DEACTIVATED"}
                </span>
                <span className="text-[11px] text-[#666666]">Android 14 API 34</span>
              </div>
            </div>

            {/* Simulated Android Hardware Frame */}
            <div className="relative w-full h-[760px] bg-[#161618] rounded-[48px] p-3.5 shadow-2xl border-4 border-[#222224] ring-2 ring-[#0A0A0B] flex flex-col overflow-hidden">
              {/* Dynamic Notification pill block system */}
              <div className="absolute top-[22px] left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-50 flex items-center justify-center overflow-hidden">
                <div className="w-2.5 h-2.5 bg-neutral-900 rounded-full mr-2"></div>
                <div className="w-1.5 h-1.5 bg-neutral-950 rounded-full"></div>
              </div>

              {/* Screen Canvas Container */}
              <div className="flex-1 bg-[#0A0A0B] rounded-[38px] overflow-hidden relative flex flex-col">
                
                {/* Phone Status Center Bar */}
                <div className="h-10 bg-[#0A0A0B] flex items-center justify-between px-6 pt-2 select-none text-[11px] font-mono text-[#666666] z-40">
                  <span>{new Date(simulatedTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <div className="flex items-center space-x-1.5">
                    <Zap className="w-3 h-3 text-[#4CAF50] fill-[#4CAF50]" />
                    <span>98%</span>
                    <span className="tracking-widest">📶🛡️</span>
                  </div>
                </div>

                {/* Simulated Screen Body Content */}
                <div className="flex-1 overflow-y-auto px-4 pb-4 pt-1 flex flex-col">
                  
                  {/* APP STATE: FOCUS VAULT COMPOSABLE */}
                  {emulatorScreen === "vault" && (
                    <div className="flex-1 flex flex-col font-sans">
                      
                      {/* App Frame Header */}
                      <div className="flex items-center justify-between py-2 border-b border-[#222224] mb-4 text-[#E0E0E0]">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 bg-[#D4AF37] text-[#0A0A0B] rounded-lg flex items-center justify-center text-[10px] font-bold">FV</div>
                          <span className="font-semibold text-sm tracking-tight">Focus Vault</span>
                        </div>
                        <button 
                          onClick={() => setEmulatorScreen("android_settings")}
                          className="p-1 hover:bg-[#161618] rounded-md transition" 
                          title="Android Settings"
                        >
                          <Settings className="w-4 h-4 text-[#666666]" />
                        </button>
                      </div>

                      {/* CONDITIONAL SUBVIEW: IF FOCUS IS ACTIVE */}
                      {activeSession ? (
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            {/* LOCKED ALERT */}
                            <div className="bg-[#241113] border border-rose-900/60 p-3 rounded-xl flex items-start space-x-2.5 text-rose-300">
                              <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                              <div className="text-xs font-sans">
                                <span className="font-bold block">Hard Lock Enabled</span>
                                Deletion controls and settings are restricted. Force stop protection active.
                              </div>
                            </div>

                            {/* RING COUNTDOWN */}
                            <div className="bg-[#161618] rounded-2xl p-5 border border-[#222224] text-center flex flex-col items-center justify-center">
                              <span className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-semibold mb-1">Time Remaining</span>
                              <div className="text-3xl font-bold font-mono tracking-wider text-white">
                                {formatTimeRemaining(activeSession.endTime - simulatedTime)}
                              </div>
                              <div className="w-full bg-[#0A0A0B] rounded-full h-1.5 mt-3 overflow-hidden">
                                <div 
                                  className="bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.4)] h-full transition-all duration-1000" 
                                  style={{
                                    width: `${Math.max(0, Math.min(100, ((activeSession.endTime - simulatedTime) / activeSession.totalDurationMs) * 100))}%`
                                  }}
                                />
                              </div>
                              <span className="text-[10px] text-[#666666] mt-2 block font-sans">
                                Session End: {new Date(activeSession.endTime).toLocaleTimeString()}
                              </span>
                            </div>

                            {/* BLOCKED LAUNCHES COUNT & STATS BENTO */}
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-[#161618]/80 p-3 rounded-xl border border-[#222224]">
                                <span className="text-[10px] text-[#666666] uppercase block">Launches Saved</span>
                                <div className="text-xl font-bold text-slate-200 mt-1 flex items-center gap-1.5">
                                  <Lock className="w-4 h-4 text-red-400" /> {blockedLaunchesToday}
                                </div>
                              </div>
                              <div className="bg-[#161618]/80 p-3 rounded-xl border border-[#222224]">
                                <span className="text-[10px] text-[#666666] uppercase block">Daily Streak</span>
                                <div className="text-xl font-bold text-[#4CAF50] mt-1 flex items-center gap-1.5">
                                  <Zap className="w-4 h-4 text-[#4CAF50] fill-[#4CAF50]" /> {activeStreak} days
                                </div>
                              </div>
                            </div>

                            {/* LOCKED APPS COUNT */}
                            <div className="bg-[#161618] p-3.5 rounded-xl border border-[#222224] text-xs">
                              <span className="font-semibold text-[#BBBBBB] block mb-2">Locked Package Clocks ({blockedPackageNames.length}):</span>
                              <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto">
                                {blockedPackageNames.map(pkg => {
                                  const key = installedApps.find(a => a.packageName === pkg);
                                  return (
                                    <span key={pkg} className="bg-[#0A0A0B] border border-[#222224] px-2 py-0.5 rounded-md text-[10px] text-[#BBBBBB]">
                                      🛡️ {key ? key.appName : pkg.substring(12)}
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          {/* IMMUTABLE BUTTON CONTROLS */}
                          <div className="space-y-2 mt-4">
                            <button 
                              disabled 
                              className="w-full bg-[#161618] text-[#666666] border border-[#222224] py-2.5 rounded-xl text-xs cursor-not-allowed flex items-center justify-center space-x-1"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Deactivation Locked until Expiration</span>
                            </button>
                            <p className="text-[10px] text-center text-[#666666]">
                              Room entity row locked. To unblock, wait for the actual countdown timer to complete.
                            </p>
                          </div>
                        </div>
                      ) : (
                        // CONFIGURATION SUBVIEW: LAUNCH SETUP
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="space-y-4">
                            
                            {/* App Picker and statistics panel shortcut */}
                            <div className="bg-[#161618] p-3 rounded-xl border border-[#222224]">
                              <span className="text-[10px] font-semibold text-[#D4AF37] uppercase tracking-widest block mb-1">Focus Target</span>
                              <div className="flex justify-between items-center text-xs">
                                <span className="text-[#BBBBBB] font-medium">Select apps to block</span>
                                <span className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 px-2 py-0.5 rounded-full text-[10px]">
                                  {blockedPackageNames.length} selected
                                </span>
                              </div>

                              {/* Search Installed apps */}
                              <div className="mt-2 text-[10px] md:text-xs">
                                <input 
                                  type="text" 
                                  placeholder="Search installed packages..."
                                  value={searchTerm}
                                  onChange={(e) => setSearchTerm(e.target.value)}
                                  className="w-full bg-[#0A0A0B] border border-[#222224] rounded-md py-1 px-2.5 text-slate-350 placeholder-[#666666] focus:outline-none focus:border-[#D4AF37] text-[11px]"
                                />
                              </div>

                              {/* Category Tabs */}
                              <div className="flex gap-1 overflow-x-auto py-1.5 mt-1 text-[10px] no-scrollbar">
                                {["All Categories", "Social Media", "Entertainment", "Gaming"].map((cat) => (
                                  <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-2 py-0.5 rounded-full whitespace-nowrap border shrink-0 transition ${
                                      selectedCategory === cat 
                                        ? "bg-[#D4AF37] text-[#0A0A0B] border-[#D4AF37] font-bold" 
                                        : "bg-[#0A0A0B] border-[#222224] text-[#666666]"
                                    }`}
                                  >
                                    {cat}
                                  </button>
                                ))}
                              </div>

                              {/* Apps List Scroller */}
                              <div className="max-h-[160px] overflow-y-auto mt-2 space-y-1 pr-1 border-t border-[#222224] pt-1.5">
                                {filteredApps.map((app) => (
                                  <div 
                                    key={app.packageName}
                                    onClick={() => handleToggleBlockAppSelection(app.packageName)}
                                    className="flex items-center justify-between p-1.5 hover:bg-[#0A0A0B] rounded-md cursor-pointer text-xs"
                                  >
                                    <div className="flex items-center space-x-2 overflow-hidden">
                                      <div className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold text-slate-100 ${
                                        blockedPackageNames.includes(app.packageName) ? "bg-rose-950" : "bg-[#222224]"
                                      }`}>
                                        🔒
                                      </div>
                                      <div className="truncate">
                                        <div className="font-semibold text-slate-200 text-[11px] truncate">{app.appName}</div>
                                        <div className="text-[9px] text-[#666666] truncate">{app.packageName}</div>
                                      </div>
                                    </div>
                                    <div>
                                      {blockedPackageNames.includes(app.packageName) ? (
                                        <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
                                      ) : (
                                        <Square className="w-4 h-4 text-[#666666]" />
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {filteredApps.length === 0 && (
                                  <p className="text-[10px] text-center text-[#666666] py-4">No packages match the filter.</p>
                                )}
                              </div>
                            </div>

                            {/* Lock duration settings list */}
                            <div className="bg-[#161618] p-3 rounded-xl border border-[#222224]">
                              <span className="text-[10px] font-semibold text-[#D4AF37] uppercase tracking-widest block mb-1.5">Lock duration</span>
                              
                              <div className="grid grid-cols-2 gap-1.5">
                                {durationOptions.slice(0, 6).map((opt) => (
                                  <button
                                    key={opt.minutes}
                                    onClick={() => setSelectedDurationOption(opt.minutes)}
                                    className={`py-1.5 rounded-md border text-[11px] font-medium transition ${
                                      selectedDurationOption === opt.minutes
                                        ? "bg-[#D4AF37] text-[#0A0A0B] border-[#D4AF37] font-bold"
                                        : "bg-[#0A0A0B] text-[#BBBBBB] border-[#222224] hover:border-[#D4AF37]/50"
                                    }`}
                                  >
                                    {opt.label}
                                  </button>
                                ))}
                              </div>

                              <button 
                                onClick={() => setSelectedDurationOption(-1)}
                                className={`w-full py-1.5 rounded-md mt-1.5 border text-[11px] font-medium transition ${
                                  selectedDurationOption === -1
                                    ? "bg-[#D4AF37] text-[#0A0A0B] border-[#D4AF37] font-bold"
                                    : "bg-[#0A0A0B] text-[#BBBBBB] border-[#222224] hover:border-[#D4AF37]/50"
                                }`}
                              >
                                ⌛ Custom Duration Timer
                              </button>

                              {selectedDurationOption === -1 && (
                                <div className="mt-2 pt-2 border-t border-[#222224] flex items-center space-x-2">
                                  <label className="text-[10px] text-[#666666] uppercase">Minutes:</label>
                                  <input 
                                    type="number"
                                    value={customTimerMinutes}
                                    onChange={(e) => setCustomTimerMinutes(e.target.value)}
                                    className="w-16 bg-[#0A0A0B] border border-[#222224] rounded py-0.5 px-2 text-center text-xs text-slate-100"
                                  />
                                  <span className="text-[11px] text-[#666666]">(~{parseFloat((parseInt(customTimerMinutes || "0") / 60).toFixed(1))} hrs)</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* VAULT LAUNCH ACTIONS */}
                          <div className="space-y-2 mt-4 text-center">
                            <AnimatePresence mode="wait">
                              {!doubleConfirmOpen ? (
                                <motion.button
                                  initial={{ opacity: 0, y: 5 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -5 }}
                                  onClick={() => setDoubleConfirmOpen(true)}
                                  className="w-full bg-[#D4AF37] hover:bg-[#E5C158] text-[#0A0A0B] py-2.5 rounded-xl font-bold text-xs transition shadow-md shadow-black/40 flex items-center justify-center space-x-1 cursor-pointer"
                                >
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                  <span>Start Active Focus Session</span>
                                </motion.button>
                              ) : (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  className="bg-[#161618] border border-[#222224] p-3 rounded-xl space-y-2.5 shadow-xl"
                                >
                                  <p className="text-[10px] text-[#BBBBBB]">
                                    ⚠️ <strong>DOUBLE CONFIRMATION REQUIRED:</strong> This lock is strictly non-reducible and immutable. If Accessibility Service is running, you cannot bypass restrictions under any conditions. Start anyway?
                                  </p>
                                  <div className="flex space-x-2">
                                    <button 
                                      onClick={() => setDoubleConfirmOpen(false)}
                                      className="flex-1 bg-[#0A0A0B] border border-[#222224] text-[#666666] py-1 rounded-md text-[11px]"
                                    >
                                      No, Cancel
                                    </button>
                                    <button 
                                      onClick={handleStartFocusLock}
                                      className="flex-1 bg-[#4CAF50] text-[#0A0A0B] font-bold py-1 rounded-md text-[11px]"
                                    >
                                      Yes, Engage Lock!
                                    </button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* APP STATE: ANDROID SYSTEM CONFIG PERMISSIONS (SETTING MOCK) */}
                  {emulatorScreen === "android_settings" && (
                    <div className="flex-1 flex flex-col font-mono text-xs">
                      
                      {/* Back button */}
                      <button 
                        onClick={() => setEmulatorScreen("vault")}
                        className="flex items-center space-x-1.5 text-[#D4AF37] font-sans text-xs py-2 cursor-pointer"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Back to Focus Vault</span>
                      </button>

                      <div className="space-y-4 mt-2 font-sans">
                        <div className="border-b border-[#222224] pb-2">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-[#666666]">Android System Settings</h3>
                          <p className="text-[10px] text-[#666666]">Bypasses here trigger defensive secure Room DB logs</p>
                        </div>

                        {/* Permission settings card */}
                        <div className="bg-[#161618] p-3.5 rounded-xl border border-[#222224] space-y-3.5">
                          
                          {/* Setting 1: Device Administrator Settings */}
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#BBBBBB] text-[11px]">Device Administrator</span>
                              <button 
                                onClick={handleToggleDeviceAdminPermission}
                                className={`w-8 h-4 rounded-full relative transition duration-300 focus:outline-none cursor-pointer ${
                                  deviceAdminEnabled ? "bg-[#D4AF37]" : "bg-[#222224]"
                                }`}
                              >
                                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-slate-100 transition duration-300 ${
                                  deviceAdminEnabled ? "right-0.5" : "left-0.5"
                                }`}></span>
                              </button>
                            </div>
                            <span className="text-[9px] text-[#666666] block mt-1 leading-normal">
                              Grants Android device control privileges, protecting accessibility services against rapid deactivation.
                            </span>
                          </div>

                          {/* Setting 2: Accessibility Lock Shield Service */}
                          <div className="border-t border-[#222224] pt-3">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#BBBBBB] text-[11px]">Accessibility Service</span>
                              <button 
                                onClick={handleToggleAccessibilityPermission}
                                className={`w-8 h-4 rounded-full relative transition duration-300 focus:outline-none cursor-pointer ${
                                  accessibilityEnabled ? "bg-[#D4AF37]" : "bg-[#222224]"
                                }`}
                              >
                                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-slate-100 transition duration-300 ${
                                  accessibilityEnabled ? "right-0.5" : "left-0.5"
                                }`}></span>
                              </button>
                            </div>
                            <span className="text-[9px] text-[#666666] block mt-1 leading-normal">
                              Required to monitor Android app switches/package loads and immediately inject warning screens.
                            </span>
                          </div>

                          {/* Setting 3: Pin Lock */}
                          <div className="border-t border-[#222224] pt-3">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#BBBBBB] text-[11px]">Security PIN set</span>
                              <button 
                                onClick={() => setPinLockSet(!pinLockSet)}
                                className={`w-8 h-4 rounded-full relative transition duration-300 focus:outline-none cursor-pointer ${
                                  pinLockSet ? "bg-[#D4AF37]" : "bg-[#222224]"
                                }`}
                              >
                                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-slate-100 transition duration-300 ${
                                  pinLockSet ? "right-0.5" : "left-0.5"
                                }`}></span>
                              </button>
                            </div>
                            <span className="text-[9px] text-[#666666] block mt-1 leading-normal">
                              Enforces secondary authentication for all in-app setup edits.
                            </span>
                          </div>
                        </div>

                        {/* TAMPER TRIGGER BUTTONS */}
                        <div className="bg-[#161618] p-3.5 rounded-xl border border-[#222224]">
                          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block mb-2">Simulate Security Tampering</span>
                          
                          <div className="space-y-2">
                            <button
                              onClick={triggerSimulateChangeTime}
                              className="w-full bg-[#241113]/60 hover:bg-[#241113] border border-rose-900/60 text-rose-200 py-2 rounded-lg text-[10px] uppercase tracking-wider font-semibold transition cursor-pointer"
                            >
                              🕒 Shift System Clock (+5 Hours)
                            </button>
                            <p className="text-[9px] text-[#666666] px-1 leading-normal">
                              Tries to fool the active lock by manually editing system clock. Focus Vault measures monotonic hardware drift internally to apply penalties.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* APP STATE: SIMULATED INSTAGRAM */}
                  {emulatorScreen === "app_instagram" && (
                    <div className="flex-1 flex flex-col font-sans">
                      <div className="bg-[#161618] p-2.5 rounded-xl border border-[#222224] text-center flex-1 flex flex-col justify-between">
                        <div className="flex items-center space-x-2 text-[#666666] py-1 border-b border-[#222224]">
                          <ArrowLeft className="w-4 h-4 cursor-pointer" onClick={() => setEmulatorScreen("home")} />
                          <span className="text-xs text-[#BBBBBB] font-medium">com.instagram.android</span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col items-center justify-center space-y-3">
                          <span className="text-4xl text-pink-500">📸</span>
                          <h4 className="text-[#E0E0E0] font-bold text-sm">Instagram feed</h4>
                          <p className="text-xs text-[#666666]">Simulation running smoothly because Accessibility Service blockade was bypassed or session has expired.</p>
                        </div>
                        <button 
                          onClick={() => setEmulatorScreen("home")}
                          className="w-full py-1.5 bg-[#0A0A0B] border border-[#222224] text-slate-300 text-[10px] rounded cursor-pointer hover:border-[#D4AF37]/50 transition"
                        >
                          Home Screen
                        </button>
                      </div>
                    </div>
                  )}

                  {/* APP STATE: SIMULATED TIKTOK */}
                  {emulatorScreen === "app_tiktok" && (
                    <div className="flex-1 flex flex-col font-sans">
                      <div className="bg-[#161618] p-2.5 rounded-xl border border-[#222224] text-center flex-1 flex flex-col justify-between">
                        <div className="flex items-center space-x-2 text-[#666666] py-1 border-b border-[#222224]">
                          <ArrowLeft className="w-4 h-4 cursor-pointer" onClick={() => setEmulatorScreen("home")} />
                          <span className="text-xs text-[#BBBBBB] font-medium">com.zhiliaoapp.musically</span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col items-center justify-center space-y-3">
                          <span className="text-4xl text-cyan-400">🎵</span>
                          <h4 className="text-[#E0E0E0] font-bold text-sm">TikTok Stream</h4>
                          <p className="text-xs text-[#666666]">Infinite scrolls simulation active. Vault was not locked on TikTok.</p>
                        </div>
                        <button 
                          onClick={() => setEmulatorScreen("home")}
                          className="w-full py-1.5 bg-[#0A0A0B] border border-[#222224] text-slate-300 text-[10px] rounded cursor-pointer hover:border-[#D4AF37]/50 transition"
                        >
                          Home Screen
                        </button>
                      </div>
                    </div>
                  )}

                  {/* APP STATE: REDDIT */}
                  {emulatorScreen === "app_reddit" && (
                    <div className="flex-1 flex flex-col font-sans">
                      <div className="bg-[#161618] p-2.5 rounded-xl border border-[#222224] text-center flex-1 flex flex-col justify-between">
                        <div className="flex items-center space-x-2 text-[#666666] py-1 border-b border-[#222224]">
                          <ArrowLeft className="w-4 h-4 cursor-pointer" onClick={() => setEmulatorScreen("home")} />
                          <span className="text-xs text-[#BBBBBB] font-medium">com.reddit.frontpage</span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col items-center justify-center space-y-3">
                          <span className="text-4xl text-orange-500">👽</span>
                          <h4 className="text-[#E0E0E0] font-bold text-sm">Reddit Threads</h4>
                          <p className="text-xs text-[#666666]">Simulator successfully bypassed. Locked list does not exclude Reddit right now.</p>
                        </div>
                        <button 
                          onClick={() => setEmulatorScreen("home")}
                          className="w-full py-1.5 bg-[#0A0A0B] border border-[#222224] text-slate-300 text-[10px] rounded cursor-pointer hover:border-[#D4AF37]/50 transition"
                        >
                          Home Screen
                        </button>
                      </div>
                    </div>
                  )}

                  {/* APP STATE: WILD RIFT */}
                  {emulatorScreen === "app_wildrift" && (
                    <div className="flex-1 flex flex-col font-sans">
                      <div className="bg-[#161618] p-2.5 rounded-xl border border-[#222224] text-center flex-1 flex flex-col justify-between">
                        <div className="flex items-center space-x-2 text-[#666666] py-1 border-b border-[#222224]">
                          <ArrowLeft className="w-4 h-4 cursor-pointer" onClick={() => setEmulatorScreen("home")} />
                          <span className="text-xs text-[#BBBBBB] font-medium">com.riotgames.wildrift</span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col items-center justify-center space-y-3">
                          <span className="text-4xl">⚔️</span>
                          <h4 className="text-slate-100 font-bold text-sm">League of Legends</h4>
                          <p className="text-xs text-slate-400 font-sans">Matchmaking simulator successfully unlocked.</p>
                        </div>
                        <button 
                          onClick={() => setEmulatorScreen("home")}
                          className="w-full py-1.5 bg-[#0A0A0B] border border-[#222224] text-slate-300 text-[10px] rounded cursor-pointer hover:border-[#D4AF37]/50 transition"
                        >
                          Home Screen
                        </button>
                      </div>
                    </div>
                  )}

                  {/* APP STATE: SIMULATED PHONE DRAWER / HOME LAUNCHER SCREEN */}
                  {emulatorScreen === "home" && (
                    <div className="flex-1 flex flex-col justify-between font-sans">
                      <div className="space-y-4">
                        <div className="text-center py-2 border-b border-[#222224]">
                          <span className="text-xs text-[#D4AF37] uppercase tracking-widest font-bold block">Android Launcher</span>
                          <p className="text-[10px] text-[#666666]">Double click an icon to launch package hooks.</p>
                        </div>

                        {/* Apps Drawer Grid */}
                        <div className="grid grid-cols-3 gap-3">
                          {/* SYSTEM FOCUS VAULT APP LINK */}
                          <div 
                            onClick={() => setEmulatorScreen("vault")}
                            className="bg-[#161618] border border-[#222224] p-2.5 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#D4AF37]/50 transition shadow-sm"
                          >
                            <div className="w-8 h-8 bg-[#D4AF37] rounded-xl flex items-center justify-center text-[#0A0A0B] text-xs font-bold shadow-md shadow-[#D4AF37]/15">
                              🔒
                            </div>
                            <span className="text-[9px] font-semibold text-slate-200 mt-1.5 block truncate max-w-full">Focus Vault</span>
                          </div>

                          {/* DYNAMIC LISTED PACKAGES */}
                          {installedApps.map((app) => (
                            <div 
                              key={app.packageName}
                              onClick={() => handleLaunchApp(app)}
                              className="bg-[#161618] border border-[#161618] p-2 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#222224] transition relative"
                            >
                              {blockedPackageNames.includes(app.packageName) && activeSession && (
                                <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-600 border border-slate-950 rounded-full flex items-center justify-center text-[7px]" title="Currently Locked">
                                  🔒
                                </span>
                              )}
                              <div className="w-8 h-8 bg-[#0A0A0B] border border-[#222224]/85 rounded-xl flex items-center justify-center text-xs shadow-inner">
                                {app.icon === "instagram" && "📸"}
                                {app.icon === "video" && "🎥"}
                                {app.icon === "reddit" && "👽"}
                                {app.icon === "youtube" && "📺"}
                                {app.icon === "gamepad" && "🎮"}
                                {app.icon === "swords" && "⚔️"}
                                {app.icon === "facebook" && "👥"}
                                {app.icon === "twitter" && "🐦"}
                                {app.icon === "heart" && "❤️"}
                                {app.icon === "tv" && "🍿"}
                              </div>
                              <span className="text-[8px] font-medium text-[#BBBBBB] mt-1.5 block truncate max-w-full">{app.appName}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="p-2.5 bg-[#161618] border border-[#222224] rounded-xl text-[9px] text-[#666666] text-center leading-normal">
                        To test interceptor: Tap an application containing a red lock 🔒 above. If Focus Lock is active, Accessibility Service intercepts it.
                      </div>
                    </div>
                  )}

                  {/* APP STATE: BLOCK SCREEN OVERLAY SHIELD (THE RED HIJACK OVERLAY) */}
                  {emulatorScreen === "blocked_overlay" && (
                    <div className="flex-1 bg-[#120506]/98 flex flex-col justify-between p-4 rounded-[30px] border-2 border-[#E94A47] font-sans relative z-50 shadow-[0_0_25px_rgba(233,74,71,0.15)]">
                      
                      <div className="space-y-4">
                        {/* WARNING TEXT */}
                        <div className="flex items-center space-x-2 text-[#E94A47]">
                          <Shield className="w-5 h-5 text-[#E94A47]" />
                          <span className="text-xs uppercase font-bold tracking-widest">Focus Shield Engage</span>
                        </div>

                        <div className="bg-[#220B0C] border border-[#4C1A1C] p-3 rounded-xl space-y-1">
                          <h4 className="text-slate-100 text-xs font-bold uppercase tracking-wider">Access Blocked!</h4>
                          <p className="text-[10px] text-red-200 leading-normal">
                            Package <strong>{currentInterceptedApp?.packageName || lastOpenedApp?.packageName || "com.unauthorized"}</strong> is locked in Focus Vault.
                          </p>
                        </div>

                        {/* LIVE TIMER COMPONENT */}
                        <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#222224] text-center space-y-1 shadow-inner">
                          <span className="text-[9px] text-[#E94A47] uppercase tracking-wider block">Remaining Timer</span>
                          <span className="text-2xl font-bold font-mono tracking-widest text-[#E0E0E0]">
                            {activeSession ? formatTimeRemaining(activeSession.endTime - simulatedTime) : "00:00:00"}
                          </span>
                        </div>

                        {/* GEMINI MOTIVATIONAL TIP MODULE */}
                        <div className="bg-[#0A0A0B] border border-[#222224] p-3.5 rounded-xl space-y-2">
                          <div className="flex items-center space-x-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                            <span className="text-[9.5px] uppercase font-bold text-[#BBBBBB]">Gemini Digital Coach:</span>
                          </div>

                          <div className="text-xs text-red-105 leading-relaxed italic">
                            {isLoadingMotivation ? (
                              <div className="flex items-center space-x-2 py-2">
                                <Loader2 className="w-3 h-3 text-[#E94A47] animate-spin" />
                                <span className="text-[10px] text-red-300">Consulting psychological blocks...</span>
                              </div>
                            ) : (
                              `"${motivationMessage}"`
                            )}
                          </div>
                        </div>
                      </div>

                      {/* FORCE CONTROL BACK */}
                      <div className="space-y-2 mt-4 text-center">
                        <button 
                          onClick={() => setEmulatorScreen("home")}
                          className="w-full bg-[#E94A47] hover:bg-[#F25C59] text-black font-extrabold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md shadow-black/40"
                        >
                          ← Retrench to Smart Focus Home
                        </button>
                        <p className="text-[9px] text-red-300/80 italic">
                          Clicking will safely return device to Home launcher screen, terminating distractions.
                        </p>
                      </div>
                    </div>
                  )}

                </div>

                {/* Simulated Android System Navigation Dock Bar */}
                <div className="h-12 bg-slate-950 border-t border-slate-900 flex items-center justify-around px-12 pb-2 select-none z-40 text-slate-400">
                  {/* Accessibility Back button */}
                  <button 
                    onClick={() => {
                      if (emulatorScreen === "vault" || emulatorScreen === "android_settings") {
                        setEmulatorScreen("home");
                      } else if (emulatorScreen === "blocked_overlay") {
                        setEmulatorScreen("home");
                      } else {
                        setEmulatorScreen("vault");
                      }
                    }}
                    className="p-1 hover:text-slate-100 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  
                  {/* Home Key button */}
                  <button 
                    onClick={() => setEmulatorScreen("home")}
                    className="p-1 hover:text-slate-100 transition"
                  >
                    <Home className="w-4 h-4" />
                  </button>

                  {/* Recents App overview shortcut */}
                  <button 
                    onClick={() => setEmulatorScreen("vault")}
                    className="p-1 hover:text-slate-100 transition"
                    title="Active App"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>
          </div>

          {/* SIMULATOR QUICK ACTIONS AND STATUS PANELS */}
          <div className="w-full max-w-[390px] bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block">Simulator Sandbox Diagnostics</span>
            
            {/* Quick alert feedback */}
            {appAlert && (
              <div className={`p-2.5 rounded-lg text-[11px] border leading-normal flex items-start space-x-1.5 ${
                appAlert.type === "tamper" ? "bg-red-950/60 text-red-300 border-red-900" : 
                appAlert.type === "success" ? "bg-emerald-950/60 text-emerald-300 border-emerald-900" :
                "bg-slate-950 text-slate-350 border-slate-800"
              }`}>
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="font-sans flex-1">{appAlert.text}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 text-[10px] font-sans">
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                <span className="text-slate-400 block text-[9.5px]">Accessibility Service</span>
                <span className={`font-semibold block mt-1 ${accessibilityEnabled ? 'text-emerald-400' : 'text-red-500'}`}>
                  {accessibilityEnabled ? "● ACTIVE" : "○ DISABLED"}
                </span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg border border-slate-850">
                <span className="text-slate-400 block text-[9.5px]">Device Administration</span>
                <span className={`font-semibold block mt-1 ${deviceAdminEnabled ? 'text-emerald-400' : 'text-red-500'}`}>
                  {deviceAdminEnabled ? "● GRANTED" : "○ REVOKED"}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setBlockedLaunchesToday(0);
                  setAppAlert({ type: "success", text: "Simulated analytics metric counts cleared." });
                }}
                className="flex-1 font-sans text-[10.5px] py-1.5 bg-slate-950 border border-slate-805 text-slate-400 rounded-lg hover:border-slate-700 transition"
              >
                Reset Stats
              </button>
              <button
                onClick={() => {
                  setActiveSession(null);
                  setBlockedPackageNames(["com.instagram.android", "com.zhiliaoapp.musically"]);
                  setAppAlert({ type: "normal", text: "Simulated locks and app settings flushed back to defaults." });
                }}
                className="flex-1 font-sans text-[10.5px] py-1.5 bg-slate-950 border border-slate-805 text-slate-400 rounded-lg hover:border-slate-700 transition"
              >
                Reset App Lock
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: ROOM DATABASE AND KOTLIN CODEBASE (8 Columns)
            ========================================================================= */}
        <section className="xl:col-span-8 flex flex-col space-y-4">
          
          {/* Tabs for Code and Room Schema navigation */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex items-center justify-between shadow-md">
            <div className="flex space-x-1.5">
              <button
                onClick={() => setActiveRightTab("code")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
                  activeRightTab === "code"
                    ? "bg-indigo-600 text-slate-100 shadow-md"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Kotlin Android Source Explorer</span>
              </button>

              <button
                onClick={() => setActiveRightTab("schema")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
                  activeRightTab === "schema"
                    ? "bg-indigo-600 text-slate-100 shadow-md"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <Database className="w-4 h-4" />
                <span>Room SQLite DB Inspector</span>
              </button>

              <button
                onClick={() => setActiveRightTab("guide")}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-medium transition ${
                  activeRightTab === "guide"
                    ? "bg-indigo-600 text-slate-100 shadow-md"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-850"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Security & Policy Briefing</span>
              </button>
            </div>

            <span className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest px-3 hidden sm:inline">
              Focus Vault IDE
            </span>
          </div>

          <AnimatePresence mode="wait">
            
            {/* VIEW TAB 1: KOTLIN SOURCE CODE EXPLORER */}
            {activeRightTab === "code" && (
              <motion.div
                key="code-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col min-h-[500px] lg:min-h-[660px]"
              >
                {/* Embedded Kotlin files navigation bar */}
                <div className="grid grid-cols-1 md:grid-cols-12 border-b border-slate-800 flex-1">
                  
                  {/* Left Column File tree pane */}
                  <div className="md:col-span-3 border-r border-slate-800 bg-slate-900/60 p-4 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                      <span className="text-[10.5px] uppercase font-bold tracking-wider text-slate-450 flex items-center gap-1">
                        📦 Project Tree
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[11px] font-bold text-slate-400 font-mono tracking-wider flex items-center space-x-1.5 py-1">
                        <span>📂 app</span>
                      </div>
                      
                      <div className="pl-3 space-y-1">
                        {/* Manifest folder file */}
                        <div className="text-[11px] text-slate-400 font-mono">📂 manifest</div>
                        <div className="pl-4">
                          <button
                            onClick={() => setSelectedFile(KOTLIN_PROJECT_FILES[0])}
                            className={`flex items-center space-x-1.5 w-full text-left py-1 text-[11px] font-mono rounded px-1.5 transition ${
                              selectedFile.name === "AndroidManifest.xml" ? "bg-slate-850 text-indigo-100 font-bold" : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <span>📝 AndroidManifest</span>
                          </button>
                        </div>

                        {/* Room database files */}
                        <div className="text-[11px] text-slate-500 font-mono">📂 data (Room)</div>
                        <div className="pl-4 space-y-0.5">
                          {KOTLIN_PROJECT_FILES.slice(2, 7).map(file => (
                            <button
                              key={file.name}
                              onClick={() => setSelectedFile(file)}
                              className={`flex items-center space-x-1.5 w-full text-left py-0.5 text-[11px] font-mono rounded px-1.5 transition truncate ${
                                selectedFile.name === file.name ? "bg-slate-850 text-indigo-100 font-bold" : "text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              <span>📄 {file.name.substring(0, file.name.length - 3)}</span>
                            </button>
                          ))}
                        </div>

                        {/* Background Services */}
                        <div className="text-[11px] text-slate-500 font-mono">📂 services & receivers</div>
                        <div className="pl-4 space-y-0.5">
                          {/* Accessibility Service */}
                          <button
                            onClick={() => setSelectedFile(KOTLIN_PROJECT_FILES[7])}
                            className={`flex items-center space-x-1.5 w-full text-left py-0.5 text-[11px] font-mono rounded px-1.5 transition truncate ${
                              selectedFile.name === KOTLIN_PROJECT_FILES[7].name ? "bg-slate-850 text-indigo-100 font-bold" : "text-slate-400 hover:text-slate-200"
                            }`}
                            title={KOTLIN_PROJECT_FILES[7].name}
                          >
                            <span>⚙️ BlockerService</span>
                          </button>
                          {/* Device Admin Receiver */}
                          <button
                            onClick={() => setSelectedFile(KOTLIN_PROJECT_FILES[8])}
                            className={`flex items-center space-x-1.5 w-full text-left py-0.5 text-[11px] font-mono rounded px-1.5 transition truncate ${
                              selectedFile.name === KOTLIN_PROJECT_FILES[8].name ? "bg-slate-850 text-indigo-100 font-bold" : "text-slate-400 hover:text-slate-350"
                            }`}
                          >
                            <span>⚙️ AdminReceiver</span>
                          </button>
                          {/* Worker */}
                          <button
                            onClick={() => setSelectedFile(KOTLIN_PROJECT_FILES[10])}
                            className={`flex items-center space-x-1.5 w-full text-left py-0.5 text-[11px] font-mono rounded px-1.5 transition truncate ${
                              selectedFile.name === KOTLIN_PROJECT_FILES[10].name ? "bg-slate-850 text-indigo-100 font-bold" : "text-slate-400 hover:text-slate-350"
                            }`}
                          >
                            <span>⚙️ FocusWorker</span>
                          </button>
                        </div>

                        {/* ViewModel & Repository Layer */}
                        <div className="text-[11px] text-slate-500 font-mono">📂 MVVM Controller</div>
                        <div className="pl-4 space-y-0.5">
                          {/* Repository */}
                          <button
                            onClick={() => setSelectedFile(KOTLIN_PROJECT_FILES[9])}
                            className={`flex items-center space-x-1.5 w-full text-left py-0.5 text-[11px] font-mono rounded px-1.5 transition truncate ${
                              selectedFile.name === KOTLIN_PROJECT_FILES[9].name ? "bg-slate-850 text-indigo-100 font-bold" : "text-slate-450 hover:text-slate-200"
                            }`}
                          >
                            <span>📦 Repository</span>
                          </button>
                        </div>
                      </div>

                      {/* Build scripts folder */}
                      <div className="pt-2">
                        <div className="text-[11px] text-[#666666] font-mono">📂 build scripts</div>
                        <div className="pl-3">
                          <button
                            onClick={() => setSelectedFile(KOTLIN_PROJECT_FILES[1])}
                            className={`flex items-center space-x-1.5 w-full text-left py-1 text-[11px] font-mono rounded px-1.5 transition cursor-pointer ${
                              selectedFile.name === "build.gradle" ? "bg-[#161618] text-[#D4AF37] font-bold" : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            <span>🛠️ build.gradle</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column Code Viewer */}
                  <div className="md:col-span-9 flex flex-col overflow-hidden min-h-[460px] lg:min-h-[580px]">
                    
                    {/* Selected file summary */}
                    <div className="bg-[#161618] border-b border-[#222224] p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-[#D4AF37]/10 text-[#D4AF37] font-mono border border-[#D4AF37]/30 px-2 py-0.5 rounded">
                            {selectedFile.path}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1.5 font-sans leading-normal">
                          {selectedFile.description}
                        </p>
                      </div>

                      <div className="flex shrink-0 space-x-2">
                        <button
                          onClick={() => copyCodeToClipboard(selectedFile.code)}
                          className="flex items-center space-x-1 bg-[#0A0A0B] border border-[#222224] hover:border-[#D4AF37]/50 text-slate-300 py-1.5 px-3 rounded-lg text-xs font-medium cursor-pointer transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Kotlin</span>
                        </button>
                      </div>
                    </div>

                    {/* Syntax highlight style viewport */}
                    <div className="flex-1 overflow-auto bg-slate-950 text-slate-300 font-mono text-xs p-5 select-text no-scrollbar min-h-0 leading-relaxed rounded-br-2xl">
                      <pre className="whitespace-pre">{selectedFile.code}</pre>
                    </div>

                  </div>

                </div>
              </motion.div>
            )}
            {activeRightTab === "schema" && (
              <motion.div
                key="schema-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 bg-[#161618] border border-[#222224] rounded-2xl shadow-xl p-5 space-y-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-[#222224] gap-3">
                  <div>
                    <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1 px-1">
                      📂 SQLite Room Schema Live State Broker
                    </h2>
                    <p className="text-xs text-slate-400 leading-normal pl-1">
                      Watch Room Database entity rows insert and modify dynamically in real-time based on your actions in the mobile emulator.
                    </p>
                  </div>
                  
                  <div className="text-[11px] text-[#BBBBBB] font-mono bg-[#0A0A0B] border border-[#222224] px-3 py-1.5 rounded-full flex items-center gap-1.5 self-start">
                    <Database className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>SQLite Version 3.42.0 (Room Layer)</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Table 1: Blocked_Apps Entities */}
                  <div className="bg-[#0A0A0B] rounded-xl border border-[#222224] p-4 space-y-3 shadow-inner">
                     <div className="flex items-center justify-between border-b border-[#222224] pb-2">
                       <span className="text-xs font-bold text-[#D4AF37] font-mono">TABLE: blocked_apps</span>
                       <span className="text-[10px] text-[#666666] font-sans tracking-tight">Stores active blocker targeting configurations</span>
                     </div>

                     <div className="overflow-x-auto max-h-[180px] no-scrollbar">
                       <table className="w-full text-left text-xs font-mono">
                         <thead>
                           <tr className="border-b border-[#222224] text-[#666666]">
                             <th className="py-1 px-2">packageName (PK)</th>
                             <th className="py-1 px-2">appName</th>
                             <th className="py-1 px-2">category</th>
                           </tr>
                         </thead>
                         <tbody className="divide-y divide-[#222224]">
                           {blockedPackageNames.map(pkg => {
                             const app = installedApps.find(a => a.packageName === pkg) || { appName: "Generic App", category: "Social" };
                             return (
                               <tr key={pkg} className="text-slate-300 hover:bg-[#161618] transition">
                                 <td className="py-1.5 px-2 text-[#D4AF37] font-semibold text-[11px] truncate max-w-[200px]">{pkg}</td>
                                 <td className="py-1.5 px-2 text-slate-200 font-sans">{app.appName}</td>
                                 <td className="py-1.5 px-2 font-sans text-xs">
                                   <span className="px-1.5 py-0.2 bg-[#161618] text-[#BBBBBB] border border-[#222224] rounded">
                                     {app.category}
                                   </span>
                                 </td>
                               </tr>
                             );
                           })}
                         </tbody>
                       </table>
                     </div>
                  </div>

                  {/* Table 2: Lock_Sessions Entities */}
                  <div className="bg-[#0A0A0B] rounded-xl border border-[#222224] p-4 space-y-3 shadow-inner">
                    <div className="flex items-center justify-between border-b border-[#222224] pb-2">
                      <span className="text-xs font-bold text-[#D4AF37] font-mono">TABLE: lock_sessions</span>
                      <span className="text-[10px] text-[#666666] font-sans tracking-tight">Active block state synchronization row</span>
                    </div>

                    <div className="overflow-x-auto max-h-[185px] no-scrollbar">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="border-b border-[#222224] text-[#666666]">
                            <th className="py-1 px-2">id (PK)</th>
                            <th className="py-1 px-2">endTime</th>
                            <th className="py-1 px-2">durationLabel</th>
                            <th className="py-1 px-2">active</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#222224]">
                          {activeSession ? (
                            <tr className="text-slate-200 hover:bg-[#161618]/60 transition">
                              <td className="py-2 px-2 text-[#D4AF37] font-bold">{activeSession.id}</td>
                              <td className="py-2 px-2">{new Date(activeSession.endTime).toLocaleTimeString()}</td>
                              <td className="py-2 px-2 font-sans">{activeSession.durationLabel}</td>
                              <td className="py-2 px-2">
                                <span className="bg-[#112415] text-[#4CAF50] border border-emerald-900/50 px-1.5 py-0.2 rounded text-[10px] font-semibold">
                                  TRUE (Locked)
                                </span>
                              </td>
                            </tr>
                          ) : (
                            <tr>
                              <td colSpan={4} className="py-6 text-center text-[#666666] italic text-[11px]">
                                No active lock session rows found in SQLite. Configuration resides read/write.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Table 3: Tampering_Logs Entities */}
                  <div className="bg-[#0A0A0B] rounded-xl border border-[#222224] p-4 space-y-3 shadow-inner lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-[#222224] pb-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-xs font-bold text-red-400 font-mono">TABLE: tampering_logs</span>
                        <span className="bg-[#220B0C] text-[#E94A47] border border-[#4C1A1C] rounded-full text-[9px] px-2 py-0.2">
                          {tamperLogs.length} Records
                        </span>
                      </div>
                      <span className="text-[10px] text-[#666666] font-sans tracking-tight">Audit trails logging active device bypass attempts</span>
                    </div>

                    <div className="overflow-x-auto max-h-[220px] no-scrollbar">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="border-b border-[#222224] text-[#666666]">
                            <th className="py-1 px-2">id</th>
                            <th className="py-1 px-2">type</th>
                            <th className="py-1 px-2">details</th>
                            <th className="py-1 px-2">severity</th>
                            <th className="py-1 px-2">time</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#222224]">
                          {tamperLogs.map((log) => (
                            <tr key={log.id} className="text-slate-300 hover:bg-[#161618]/40 transition">
                              <td className="py-2 px-2 font-bold text-slate-500">{log.id}</td>
                              <td className="py-2 px-2 text-[#E94A47] uppercase text-[10px] font-semibold">{log.type}</td>
                              <td className="py-2 px-2 font-sans text-slate-300 leading-normal max-w-sm truncate" title={log.details}>
                                {log.details}
                              </td>
                              <td className="py-2 px-2">
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                                  log.severity === "HIGH" ? "bg-[#220B0C] text-[#E94A47] border border-[#4C1A1C]" : "bg-[#241a05] text-[#D4AF37] border border-[#4c3a0b]"
                                }`}>
                                  {log.severity}
                                </span>
                              </td>
                              <td className="py-2 px-2 text-[#666666] text-[10px]">{formatRoomTimestamp(log.timestamp)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Table 4: Daily Analytics */}
                  <div className="bg-[#0A0A0B] rounded-xl border border-[#222224] p-4 space-y-3 shadow-inner lg:col-span-2">
                    <div className="flex items-center justify-between border-b border-[#222224] pb-2">
                      <span className="text-xs font-bold text-[#D4AF37] font-mono">TABLE: usage_statistics</span>
                      <span className="text-[10px] text-[#666666] font-sans tracking-tight">Maintains focus analytics, historical trends, and streaks</span>
                    </div>

                    <div className="overflow-x-auto max-h-[180px] no-scrollbar">
                      <table className="w-full text-left text-xs font-mono">
                        <thead>
                          <tr className="border-b border-[#222224] text-[#666666]">
                            <th className="py-1 px-2">date (PK)</th>
                            <th className="py-1 px-2">totalFocusMinutes</th>
                            <th className="py-1 px-2">blockedLaunchesCount</th>
                            <th className="py-1 px-2">activeStreakCount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#222224]">
                          <tr className="bg-[#D4AF37]/5 text-slate-200">
                            <td className="py-2 px-2 font-bold text-[#D4AF37]">
                              {new Date(simulatedTime).toISOString().split("T")[0]} (Today)
                            </td>
                            <td className="py-2 px-2 font-sans">{focusMinutesToday} mins</td>
                            <td className="py-2 px-2 text-[#E94A47] font-bold">{blockedLaunchesToday} intercepts</td>
                            <td className="py-2 px-2 text-[#4CAF50] font-bold">{activeStreak} days</td>
                          </tr>
                          {usageStats.map((stat) => (
                            <tr key={stat.date} className="text-[#BBBBBB] hover:bg-[#161618]/40 transition">
                              <td className="py-1.5 px-2">{stat.date}</td>
                              <td className="py-1.5 px-2 font-sans">{stat.totalFocusMinutes} mins</td>
                              <td className="py-1.5 px-2 text-[#E94A47]/80">{stat.blockedLaunchesCount} intercepts</td>
                              <td className="py-1.5 px-2 font-sans">{stat.activeStreak} days</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}
                    {/* VIEW TAB 3: ANDROID ARCHITECTURE EXPLAINED & TECHNICAL POLICY CONTROLLER */}
            {activeRightTab === "guide" && (
              <motion.div
                key="guide-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex-1 bg-[#161618] border border-[#222224] rounded-2xl shadow-xl p-6 space-y-6 overflow-y-auto max-h-[640px] no-scrollbar"
              >
                <div>
                  <h2 className="text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-1.5">
                    🛡️ Focus Vault Security & Architecture Guide
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 leading-normal">
                    Learn how this application achieves rock-solid mobile lock protection in conformity with major Android operating system specifications.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed">
                  
                  {/* Card 1: Accessibility Blocking Layer */}
                  <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#222224] space-y-2.5">
                    <h3 className="text-slate-200 font-bold text-[13px] flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 rounded text-[11px] font-mono">01</span>
                      Accessibility Engine Overlay
                    </h3>
                    <p className="text-slate-400 text-[11.5px] leading-relaxed">
                      Android constraints prohibit applications from monitoring other active background software running in sandboxes. Focus Vault leverages high-privilege <strong>Accessibility Service APIs</strong>. 
                    </p>
                    <p className="text-slate-400 text-[11.5px] leading-relaxed">
                      By registering for window change triggers (<code>TYPE_WINDOW_STATE_CHANGED</code>), the system immediately detects whenever a user loads a target packageName registry. It acts instantly to issue a global <code>GLOBAL_ACTION_HOME</code> button override, ejecting the user outwards while loading our fullscreen block shield.
                    </p>
                  </div>

                  {/* Card 2: Device Admin Integration Anti-Uninstall */}
                  <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#222224] space-y-2.5">
                    <h3 className="text-slate-200 font-bold text-[13px] flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 rounded text-[11px] font-mono">02</span>
                      Device Admin Anti-Deactivation
                    </h3>
                    <p className="text-slate-400 text-[11.5px] leading-relaxed">
                      To prevent desperate users from simply deleting the Focus Vault app or deactivating its accessibility profile, the app registers as a <strong>Device Administrator</strong>.
                    </p>
                    <p className="text-slate-400 text-[11.5px] leading-relaxed">
                      When active, administrator level privileges block standard uninstallation prompts directly. Furthermore, any user requests to disable administrative access triggers the admin receiver, which can delay deactivation, generate warnings, and automatically log a persistent tamper alert or add penalty locked hours to the session dynamically.
                    </p>
                  </div>

                  {/* Card 3: Anti-Tampering Mechanism */}
                  <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#222224] space-y-2.5">
                    <h3 className="text-slate-200 font-bold text-[13px] flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 rounded text-[11px] font-mono">03</span>
                      Time-Shift Tampering Defense
                    </h3>
                    <p className="text-[#BBBBBB] text-[11.5px] leading-relaxed">
                      A classic bypass for blocker apps is shifting system time forwards manually (e.g. going 3 hours forward in Settings). To prevent this, Focus Vault initializes a dual verification key.
                    </p>
                    <p className="text-slate-400 text-[11.5px] leading-relaxed">
                      On start, the app saves both the starting calendar time and the hardware clock monotonic uptime (<code>SystemClock.elapsedRealtimeNanos()</code>) in <strong>EncryptedSharedPreferences</strong>. Since manual system clock changes do not shift underlying CPU hardware uptime registers, the app compares elapsed intervals of both registers. If a mismatch of more than 5 minutes occurs, temporal tampering is flagged, throwing automatically generated penalty periods like +30 minutes lock.
                    </p>
                  </div>

                  {/* Card 4: Background WorkManager & Reboot Guard */}
                  <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#222224] space-y-2.5">
                    <h3 className="text-slate-200 font-bold text-[13px] flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 rounded text-[11px] font-mono">04</span>
                      WorkManager Reboot Resilience
                    </h3>
                    <p className="text-slate-400 text-[11.5px] leading-relaxed">
                      If the phone reboot triggers, active system overlays are dropped. To resist this, Focus Vault implements an audit check on reboot cycles.
                    </p>
                    <p className="text-slate-400 text-[11.5px] leading-relaxed">
                      Focus Vault intercepts standard boot cycles with a <code>RECEIVE_BOOT_COMPLETED</code> intent receiver. On boot, it queries the Room DB for an unexpired lock session, and launches a resilient background Foreground Service with a sticky alert notification. Concurrently, a custom <strong>WorkManager periodic check</strong> triggers background validation routines should the foreground service be killed or throttled by low memory systems.
                    </p>
                  </div>

                  {/* Card 5: Google Play Policy Compliance */}
                  <div className="bg-[#0A0A0B] p-4 rounded-xl border border-[#222224] space-y-2.5 md:col-span-2">
                    <h3 className="text-slate-200 font-bold text-[13px] flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 rounded text-[11px] font-mono">05</span>
                      Google Play Store Policy & Legality Considerations
                    </h3>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Google strictly monitors applications requesting <strong>Accessibility BIND permissions</strong> and <strong>Device Admin Profiles</strong>. To pass production audits, Focus Vault implements the strongest allowed guidelines:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                      <div className="p-2 border border-[#222224] bg-[#161618] rounded-lg">
                        <span className="font-semibold text-slate-300 block mb-0.5">Prompt Consent</span>
                        The app provides explicit, clear-cut disclosures in-app before redirecting users to enable Settings profiles.
                      </div>
                      <div className="p-2 border border-[#222224] bg-[#161618] rounded-lg">
                        <span className="font-semibold text-slate-300 block mb-0.5">No Malicious Blocks</span>
                        Only applications manually added by the block selection are restricted. System calls and SOS dials remain open.
                      </div>
                      <div className="p-2 border border-[#222224] bg-[#161618] rounded-lg">
                        <span className="font-semibold text-slate-300 block mb-0.5">Secure SQLite Local</span>
                        Zero usage trackers are broadcasted to external analytics. All data stays compile-safe on Room database.
                      </div>
                    </div>
                  </div>

                </div>
              </motion.div>
            )}

          </AnimatePresence>

        </section>

      </main>

      {/* Footer System Credits */}
      <footer className="bg-[#0A0A0B] border-t border-[#222224] text-center py-4 text-xs text-slate-400">
        <p>Focus Vault applet running in standard sandboxed environment. Built with Jetpack Compose 1.5 & Room SQLite.</p>
        <p className="text-[10px] text-[#666666] mt-1">AI digital coach powered server-side via Google Gemini-3.5-Flash.</p>
      </footer>
    </div>
  );
}
