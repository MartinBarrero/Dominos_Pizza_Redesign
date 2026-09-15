import { useState } from "react";
import { FieldError, Label, inputStyle } from "./formHelpers";

interface LoginModalProps {
  onClose: () => void;
  onLogin: (email: string) => void;
  onGuest: () => void;
}

interface LoginErrors {
  email?: string;
  password?: string;
}

function validate(email: string, password: string): LoginErrors {
  const errors: LoginErrors = {};
  if (!email.trim()) errors.email = "Ingresa tu correo";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Correo no válido";
  if (!password) errors.password = "Ingresa tu contraseña";
  return errors;
}

export default function LoginModal({ onClose, onLogin, onGuest }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit() {
    setSubmitted(true);
    const errs = validate(email, password);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onLogin(email);
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl p-6 sm:p-8 flex flex-col gap-6"
        style={{ backgroundColor: "#FFFFFF", border: "1.5px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-black text-neutral-900" style={{ fontFamily: "var(--font-display)" }}>Iniciar sesión</h2>
            <p className="text-neutral-900/50 text-sm font-medium mt-1">Inicia sesión para continuar con tu pedido.</p>
          </div>
          <button onClick={onClose} className="p-1 text-black/40 hover:text-black transition-colors shrink-0" aria-label="Cerrar">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <Label required>Correo electrónico</Label>
            <input
              type="email"
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (submitted) setErrors(validate(e.target.value, password));
              }}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-neutral-900/30"
              style={inputStyle(!!errors.email)}
            />
            <FieldError msg={errors.email} />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <Label required>Contraseña</Label>
              <a href="#" onClick={(e) => e.preventDefault()} className="text-xs font-bold" style={{ color: "#006491" }}>
                ¿Olvidaste tu contraseña?
              </a>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (submitted) setErrors(validate(email, e.target.value));
              }}
              className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-neutral-900/30"
              style={inputStyle(!!errors.password)}
            />
            <FieldError msg={errors.password} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl font-black text-sm text-white transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: "#E31837", fontFamily: "var(--font-display)", boxShadow: "0 4px 16px rgba(227,24,55,0.35)" }}
          >
            Iniciar sesión para esta orden
          </button>
          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-xl font-black text-sm text-white transition-all hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: "#006491", fontFamily: "var(--font-display)", boxShadow: "0 4px 16px rgba(0,100,145,0.35)" }}
          >
            Iniciar sesión y dejarla abierta
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ backgroundColor: "rgba(0,0,0,0.08)" }} />
          <span className="text-xs font-bold text-neutral-900/40 uppercase tracking-wide">o</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "rgba(0,0,0,0.08)" }} />
        </div>

        <button
          onClick={onGuest}
          className="w-full py-3 rounded-xl font-bold text-sm text-neutral-900/70 hover:text-neutral-900 transition-all"
          style={{ backgroundColor: "rgba(0,0,0,0.04)", fontFamily: "var(--font-display)" }}
        >
          Continuar como invitado
        </button>

        <p className="text-center text-sm text-neutral-900/50 font-medium">
          ¿No tienes cuenta?{" "}
          <a href="#" onClick={(e) => e.preventDefault()} className="font-bold" style={{ color: "#E31837" }}>
            Regístrate
          </a>
        </p>
      </div>
    </div>
  );
}
