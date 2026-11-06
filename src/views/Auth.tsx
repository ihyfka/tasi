"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Lock,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";

import logo from "@/assets/media/tasi_dark_logo.svg";
import hero from "@/assets/media/hero_auth.jpg";

interface AuthProps {
  initialMode?: "login" | "signup";
  redirect?: string;
}

export default function Auth({ initialMode = "login", redirect }: AuthProps) {
  const router = useRouter();
  const { login, register, continueAsGuest, user } = useAuth();

  const [isLogin, setIsLogin] = useState<boolean>(initialMode === "login");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  const isCheckout = redirect === "checkout";
  const targetDestination =
    redirect === "checkout" ? "/checkout" : redirect || "/shop/browse";

  // If already authenticated and visiting auth page, redirect immediately
  useEffect(() => {
    if (user) {
      router.push(targetDestination);
    }
  }, [user, targetDestination, router]);

  // Sync mode if initialMode prop changes
  useEffect(() => {
    setIsLogin(initialMode === "login");
    setError(null);
  }, [initialMode]);

  const toggleMode = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => {
    e.preventDefault();
    const nextMode = !isLogin;
    setIsLogin(nextMode);
    setError(null);
    const query = redirect ? `?redirect=${encodeURIComponent(redirect)}` : "";
    window.history.pushState(
      {},
      "",
      nextMode ? `/auth/login${query}` : `/auth/signup${query}`,
    );
  };

  const handleFillDemo = () => {
    setEmail("client@tasi.com");
    setPassword("password123");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("Please complete all required fields.");
      return;
    }

    if (!isLogin && password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      if (isLogin) {
        await login({ email: cleanEmail, password });
      } else {
        await register({
          email: cleanEmail,
          password,
          name: name.trim() || cleanEmail.split("@")[0],
        });
      }

      // Smooth transition to target destination
      router.push(targetDestination);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Authentication failed. Please verify your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGuestCheckout = () => {
    continueAsGuest({
      email: email.trim() || "guest@tasi.com",
      name: name.trim() || "Guest Client",
    });
    router.push(targetDestination);
  };

  const handleSendReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetSent(true);
    setTimeout(() => {
      setForgotModalOpen(false);
      setResetSent(false);
      setResetEmail("");
    }, 2200);
  };

  const handleBack = () => {
    if (isCheckout) {
      router.push("/cart");
    } else {
      router.push("/shop/browse");
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#fcfcfb] text-[#121212] overflow-x-hidden">
      {/*  Left Column: Form & Interaction  */}
      <div className="w-full lg:w-[48%] xl:w-[42%] flex flex-col relative z-10 min-h-screen border-r border-black/6 bg-[#fcfcfb]">
        {/* Top Header */}
        <header className="px-6 py-6 sm:px-10 flex items-center justify-between border-b border-black/4">
          <button
            type="button"
            onClick={handleBack}
            className="group flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/60 hover:text-[#121212] transition-colors cursor-pointer"
            aria-label="Return to previous page"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform duration-200"
            />
            <span>{isCheckout ? "Back to Cart" : "Back"}</span>
          </button>

          {/* Tasi Brand Mark */}
          <a
            href="/"
            aria-label="Tasi home"
            className="flex items-center opacity-90 hover:opacity-100 transition-opacity"
          >
            <img
              src={logo.src}
              alt="Tasi"
              className="h-4.5 sm:h-5 w-auto object-contain"
            />
          </a>
        </header>

        {/* Form Body Container */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 py-10 w-full max-w-120 mx-auto">
          {/* Title and Subtitle */}
          <div className="mb-8">
            <h1 className="font-main text-3xl sm:text-4xl font-bold tracking-tight text-[#121212] uppercase">
              {isLogin ? "Sign in to Tasi" : "Create Account"}
            </h1>
            <p className="text-xs sm:text-sm text-black/55 mt-2 font-normal leading-relaxed">
              {isLogin
                ? "Sign in to proceed with delivery and order tracking."
                : "Join Tasi for curated drops, sizing, and express checkout."}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              role="alert"
              className="mb-6 p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 text-xs flex items-start gap-2.5 rounded-sm"
            >
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
              <div className="flex-1">
                <span>{error}</span>
                {error.includes("create one") && (
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="block mt-1.5 font-bold uppercase tracking-wider underline hover:text-red-700 cursor-pointer"
                  >
                    Switch to Create Account →
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {/* Semantic Form adhering to modern autofill standards */}
          <form
            className="space-y-5"
            onSubmit={handleSubmit}
            noValidate={false}
          >
            {/* Full Name (Sign Up only) */}
            <AnimatePresence initial={false}>
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="space-y-1.5 pb-2">
                    <label
                      htmlFor="auth-name"
                      className="block text-[11px] font-bold uppercase tracking-wider text-black/70"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="auth-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      enterKeyHint="next"
                      required={!isLogin}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Moses Obinna"
                      className="w-full bg-white border border-black/15 px-3.5 py-3 text-sm text-[#121212] placeholder-black/30 focus:border-[#121212] focus:outline-none transition-colors"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label
                htmlFor="auth-email"
                className="block text-[11px] font-bold uppercase tracking-wider text-black/70"
              >
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="auth-email"
                name="email"
                type="email"
                autoComplete="username"
                spellCheck={false}
                enterKeyHint="next"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full bg-white border border-black/15 px-3.5 py-3 text-sm text-[#121212] placeholder-black/30 focus:border-[#121212] focus:outline-none transition-colors"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor={isLogin ? "current-password" : "new-password"}
                  className="block text-[11px] font-bold uppercase tracking-wider text-black/70"
                >
                  Password <span className="text-red-500">*</span>
                </label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(true)}
                    className="text-[11px] font-medium text-black/50 hover:text-black underline underline-offset-2 transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  id={isLogin ? "current-password" : "new-password"}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  enterKeyHint="done"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    isLogin
                      ? "Enter your password"
                      : "Create secure password (min. 6 characters)"
                  }
                  className="w-full bg-white border border-black/15 px-3.5 py-3 pr-11 text-sm text-[#121212] placeholder-black/30 focus:border-[#121212] focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 px-3.5 flex items-center text-black/40 hover:text-black transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#121212] text-white py-4 font-bold text-xs tracking-widest uppercase hover:bg-[#2a2a2a] active:scale-99 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2 shadow-sm"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              <span>
                {loading
                  ? "Verifying..."
                  : isLogin
                    ? "Sign In"
                    : "Create Account"}
              </span>
            </button>

            {/* Guest Checkout Option (Available when coming from cart checkout) */}
            {isCheckout && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleGuestCheckout}
                  className="w-full py-3.5 border border-black/20 text-[#121212] text-xs font-bold tracking-widest uppercase hover:bg-black/3 hover:border-black/40 transition-colors cursor-pointer"
                >
                  Continue as Guest
                </button>
              </div>
            )}
          </form>

          {/* Quick Demo Helper Hint */}
          {isLogin && (
            <div className="mt-5 p-3 bg-black/2 border border-dashed border-black/10 rounded-sm flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-black/45">
                  Demo account:
                </p>
                <span className="text-xs text-black/80 truncate">
                  client@tasi.com
                </span>
              </div>

              <button
                type="button"
                onClick={handleFillDemo}
                className="shrink-0 bg-[#121212] px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-white transition-opacity hover:opacity-80 cursor-pointer"
              >
                Use-demo
              </button>
            </div>
          )}

          {/* Toggle Login / Sign Up */}
          <p className="mt-8 text-center text-xs text-black/60">
            {isLogin ? "Don't have an account? " : "Already registered? "}
            <button
              type="button"
              onClick={toggleMode}
              className="font-bold text-[#121212] underline underline-offset-3 hover:text-black transition-colors cursor-pointer ml-1"
            >
              {isLogin ? "Create account" : "Log in here"}
            </button>
          </p>
        </div>
      </div>

      {/*  Right Column: Editorial Visual Showcase  */}
      <div className="hidden lg:block lg:w-[52%] xl:w-[58%] relative overflow-hidden bg-[#121212]">
        <div className="w-full h-full relative group">
          {/* Editorial Background Image */}
          <div className="absolute inset-0 transition-transform">
            <img
              src={hero.src}
              alt="hero_image"
              className="w-full h-full object-cover object-[50%_10%] opacity-85"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black via-black/30 to-black/0" />
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 h-full flex flex-col justify-between p-12 xl:p-16 text-white">
            {/* Bottom Editorial Copy */}
            <div className="max-w-xl mt-auto">
              <h2 className="font-main text-4xl xl:text-5xl font-bold tracking-tight uppercase leading-[1.05] drop-shadow-md">
                Wear your Perspective.
                <br />
                Beyond Convention.
              </h2>
              <p className="mt-4 text-sm xl:text-base text-white/80 leading-relaxed font-light drop-shadow-sm">
                From carefully sourced materials to precise finishing, every
                detail serves a purpose. Quality that goes beyond the season.
              </p>

              {/* Badges / Guarantees */}
              <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-3 gap-4 text-left">
                <div className="flex items-center gap-2.5">
                  <Truck size={18} className="text-white/70 shrink-0" />
                  <span className="text-[11px] uppercase tracking-wider text-white/80 font-medium">
                    Express Delivery
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <ShieldCheck size={18} className="text-white/70 shrink-0" />
                  <span className="text-[11px] uppercase tracking-wider text-white/80 font-medium">
                    Premium Quality
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Lock size={18} className="text-white/70 shrink-0" />
                  <span className="text-[11px] uppercase tracking-wider text-white/80 font-medium">
                    Easy Returns
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/*  Forgot Password Dialog Modal  */}
      <AnimatePresence>
        {forgotModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#fcfcfb] border border-black/15 p-6 sm:p-8 max-w-md w-full shadow-2xl relative"
            >
              <h3 className="font-main text-2xl font-bold uppercase tracking-tight text-[#121212]">
                Reset Password
              </h3>
              <p className="text-xs text-black/60 mt-1.5 leading-relaxed">
                Enter your registered email address. We will send a secure link
                to reset your password.
              </p>

              {resetSent ? (
                <div className="my-6 p-3 bg-green-500/5 border border-green-500/20 text-green-700 text-xs flex items-center gap-2.5">
                  <span>
                    Password reset instructions have been sent. Please check
                    your inbox.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSendReset} className="mt-5 space-y-4">
                  <div>
                    <label
                      htmlFor="reset-email"
                      className="block text-[11px] font-bold uppercase tracking-wider text-black/70 mb-1"
                    >
                      Email Address
                    </label>
                    <input
                      id="reset-email"
                      type="email"
                      required
                      autoFocus
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      placeholder="client@tasi.com"
                      className="w-full bg-white border border-black/15 px-3 py-2.5 text-sm text-[#121212] focus:outline-none focus:border-[#121212]"
                    />
                  </div>
                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setForgotModalOpen(false)}
                      className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black/60 hover:text-black cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#121212] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#2a2a2a] cursor-pointer"
                    >
                      Send Reset Link
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
