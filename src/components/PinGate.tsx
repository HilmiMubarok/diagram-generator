import { useEffect, useRef, useState } from "react";
import { Workflow } from "lucide-react";

const CORRECT_PIN = import.meta.env.VITE_ACCESS_PIN as string;
const PIN_LENGTH = CORRECT_PIN?.length ?? 6;
const SESSION_KEY = "dg_pin_ok";

interface PinGateProps {
  children: React.ReactNode;
}

export function PinGate({ children }: PinGateProps) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === "1");
  const [digits, setDigits] = useState<string[]>(Array(PIN_LENGTH).fill(""));
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 5 minutes
  const IDLE_MS = 5 * 60 * 1000;

  const lock = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setUnlocked(false);
    setDigits(Array(PIN_LENGTH).fill(""));
  };

  const resetIdleTimer = () => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(lock, IDLE_MS);
  };

  useEffect(() => {
    if (!unlocked) {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
      return;
    }
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "wheel"];
    events.forEach((e) => window.addEventListener(e, resetIdleTimer, { passive: true }));
    resetIdleTimer();
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdleTimer));
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unlocked]);

  const reset = () => {
    setDigits(Array(PIN_LENGTH).fill(""));
    setTimeout(() => inputRefs.current[0]?.focus(), 0);
  };

  const submit = (pin: string) => {
    if (pin === CORRECT_PIN) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setUnlocked(true);
    } else {
      setShake(true);
      setError(true);
      setTimeout(() => {
        setShake(false);
        setError(false);
        reset();
      }, 600);
    }
  };

  const handleChange = (index: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setError(false);

    if (char && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    if (next.every((d) => d !== "")) {
      submit(next.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[index]) {
        const next = [...digits];
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
        const next = [...digits];
        next[index - 1] = "";
        setDigits(next);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, PIN_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(PIN_LENGTH).fill("");
    pasted.split("").forEach((c, i) => { next[i] = c; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, PIN_LENGTH - 1);
    inputRefs.current[focusIdx]?.focus();
    if (pasted.length === PIN_LENGTH) submit(pasted);
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background text-foreground">
      <div className="flex flex-col items-center gap-6 w-full max-w-sm px-6">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-2">
          <Workflow className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg">Diagram Generator</span>
        </div>

        <div className="text-center">
          <h1 className="text-xl font-semibold mb-1">Masukkan PIN</h1>
          <p className="text-sm text-muted-foreground">
            Akses dibatasi. Masukin PIN buat lanjut, bestie 🔐
          </p>
        </div>

        {/* PIN inputs */}
        <div
          className={`flex gap-3 transition-transform ${shake ? "animate-[shake_0.4s_ease-in-out]" : ""}`}
          onPaste={handlePaste}
        >
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="password"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`
                w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-card
                focus:outline-none focus:ring-2 focus:ring-primary transition-colors
                ${error
                  ? "border-destructive text-destructive focus:ring-destructive"
                  : digit
                  ? "border-primary"
                  : "border-border"
                }
              `}
            />
          ))}
        </div>

        {error && (
          <p className="text-sm text-destructive -mt-2">PIN salah, coba lagi 😅</p>
        )}

        <p className="text-xs text-muted-foreground text-center">
          Sesi tersimpan sampai tab ditutup
        </p>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
