import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Trophy,
  Zap,
  ArrowRight,
  Menu,
  X,
  Brain,
  Sparkles,
} from "lucide-react";

export default function HeroPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 text-slate-800 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        <div
          className="absolute top-40 right-10 w-96 h-96 bg-cyan-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute bottom-20 left-1/2 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrollY > 50 ? "bg-white/80 backdrop-blur-lg shadow-sm" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Quiz
                </span>
                <span className="text-slate-800 italic">Sprint</span>
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-slate-600 hover:text-blue-600 transition font-medium"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-slate-600 hover:text-blue-600 transition font-medium"
              >
                How It Works
              </a>
              <a
                href="#leaderboard"
                className="text-slate-600 hover:text-blue-600 transition font-medium"
              >
                Leaderboard
              </a>
              {token ? (
                <button
                  onClick={() => navigate("/login")}
                  className="px-6 py-2 border-2 border-emerald-500 text-emerald-600 rounded-xl hover:bg-emerald-50 transition font-semibold"
                >
                  Login
                </button>
              ) : (
                <button
                  onClick={() => navigate("/signup")}
                  className="px-6 py-2 border-2 border-blue-500 text-blue-600 rounded-xl hover:bg-blue-50 transition font-semibold"
                >
                  Register
                </button>
              )}
            </div>

            <button
              className="md:hidden text-slate-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>

          {isMenuOpen && (
            <div className="md:hidden mt-4 pb-4 space-y-4">
              <a
                href="#features"
                className="block text-slate-600 hover:text-blue-600 transition"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block text-slate-600 hover:text-blue-600 transition"
              >
                How It Works
              </a>
              <a
                href="#leaderboard"
                className="block text-slate-600 hover:text-blue-600 transition"
              >
                Login
              </a>
              {token ? (
                <button
                  onClick={() => handleNavigation("/login")}
                  className="w-full px-6 py-2 border-2 border-emerald-500 text-emerald-600 rounded-xl hover:bg-emerald-50 transition font-semibold"
                >
                  login
                </button>
              ) : (
                <button
                  onClick={() => handleNavigation("/signup")}
                  className="w-full px-6 py-2 border-2 border-blue-500 text-blue-600 rounded-xl hover:bg-blue-50 transition font-semibold"
                >
                  Sign In
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      <section className="relative pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="inline-block">
                <span className="px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 border border-blue-200 rounded-full text-sm font-semibold text-blue-700 inline-flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Time-Based Challenge Platform
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-bold leading-tight text-slate-900">
                <span className="inline-block relative">
                  Sprint Through
                  <div className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-blue-400 to-cyan-400 opacity-30 blur-sm"></div>
                </span>
                <span className="block mt-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent italic font-black tracking-tight">
                  Knowledge at Speed
                </span>
              </h1>

              <p className="text-xl text-slate-600 leading-relaxed">
                Race against the clock through rapid-fire quiz challenges. Every
                second sharpens your mind, every answer brings you closer to
                victory.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate("/signup")}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold flex items-center justify-center space-x-2 hover:scale-105 transition-transform shadow-lg hover:shadow-xl"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-8">
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    50K+
                  </div>
                  <div className="text-sm text-slate-500 font-medium">
                    Active Sprinters
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    1M+
                  </div>
                  <div className="text-sm text-slate-500 font-medium">
                    Sprints Completed
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    98%
                  </div>
                  <div className="text-sm text-slate-500 font-medium">
                    Satisfaction
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-3xl blur-3xl opacity-20"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-8 border border-blue-100 shadow-2xl">
                <div className="space-y-6">
                  {/* Round Progress */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 font-medium">
                      Current Sprint
                    </span>
                    <span className="px-3 py-1 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 rounded-full text-sm font-bold">
                      Sprint 2/3
                    </span>
                  </div>
                  <div className="flex justify-center space-x-4">
                    {[1, 2, 3].map((sprint) => (
                      <div key={sprint} className="relative">
                        <div
                          className={`w-20 h-20 rounded-full flex items-center justify-center border-4 transition-all ${
                            sprint === 1
                              ? "border-emerald-500 bg-emerald-50 shadow-lg shadow-emerald-200"
                              : sprint === 2
                                ? "border-blue-500 bg-blue-50 animate-pulse shadow-lg shadow-blue-200"
                                : "border-slate-300 bg-slate-50"
                          }`}
                        >
                          <div className="text-center">
                            <div
                              className={`text-2xl font-bold ${
                                sprint === 1
                                  ? "text-emerald-600"
                                  : sprint === 2
                                    ? "text-blue-600"
                                    : "text-slate-400"
                              }`}
                            >
                              {sprint}
                            </div>
                            {sprint === 1 && (
                              <div className="text-xs text-emerald-600 font-bold">
                                ✓
                              </div>
                            )}
                            {sprint === 2 && (
                              <Clock className="w-4 h-4 mx-auto text-blue-500" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-200">
                      <div className="flex items-center space-x-2 text-amber-600 mb-2">
                        <Trophy className="w-5 h-5" />
                        <span className="text-sm font-semibold">Score</span>
                      </div>
                      <div className="text-2xl font-bold text-amber-700">
                        850
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl p-4 border border-sky-200">
                      <div className="flex items-center space-x-2 text-sky-600 mb-2">
                        <Clock className="w-5 h-5" />
                        <span className="text-sm font-semibold">Time</span>
                      </div>
                      <div className="text-2xl font-bold text-sky-700">45s</div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate("/login")}
                    className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:scale-105 transition-transform shadow-lg"
                  >
                    Start Your Sprint
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              Why{" "}
              <span className="relative inline-block">
                <span className="relative z-10">QuizSprint</span>
                <span className="absolute bottom-1 left-0 right-0 h-3 bg-gradient-to-r from-yellow-300 to-amber-300 -rotate-1"></span>
              </span>
              ?
            </h2>
            <p className="text-xl text-slate-600">
              Lightning-fast learning, explosive results
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Brain className="w-8 h-8" />,
                title: "Progressive Sprints",
                desc: "Start easy, get challenging. Each sprint tests your speed and accuracy.",
                gradient: "from-blue-500 to-cyan-500",
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: "Time Matters",
                desc: "Faster answers earn bonus points. Every second counts in your score.",
                gradient: "from-cyan-500 to-teal-500",
              },
              {
                icon: <Trophy className="w-8 h-8" />,
                title: "Live Leaderboard",
                desc: "Compete globally. See where you rank in real-time against others.",
                gradient: "from-teal-500 to-emerald-500",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group bg-white rounded-2xl p-8 border border-slate-200 hover:border-blue-300 transition-all hover:scale-105 hover:shadow-2xl shadow-md"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform text-white shadow-lg`}
                >
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="relative py-20 px-6 bg-gradient-to-b from-white to-blue-50"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              <span className="inline-block transform -skew-x-6 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                Three
              </span>{" "}
              Sprint Stages
            </h2>
            <p className="text-xl text-slate-600">
              Accelerate from novice to master
            </p>
          </div>

          <div className="space-y-8">
            {[
              {
                sprint: "Sprint 1",
                desc: "Warm-up lap. Build speed and confidence with starter questions.",
                color: "from-emerald-500 to-teal-500",
                bg: "from-emerald-50 to-teal-50",
                border: "border-emerald-200",
              },
              {
                sprint: "Sprint 2",
                desc: "Full throttle. Difficulty rises, pressure builds, champions emerge.",
                color: "from-blue-500 to-cyan-500",
                bg: "from-blue-50 to-cyan-50",
                border: "border-blue-200",
              },
              {
                sprint: "Sprint 3",
                desc: "Final dash. Only the fastest minds claim victory.",
                color: "from-orange-500 to-amber-500",
                bg: "from-orange-50 to-amber-50",
                border: "border-orange-200",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className={`flex items-center space-x-6 bg-gradient-to-r ${step.bg} rounded-2xl p-6 border ${step.border} shadow-md hover:shadow-xl transition-shadow`}
              >
                <div
                  className={`w-20 h-20 bg-gradient-to-br ${step.color} rounded-xl flex items-center justify-center text-2xl font-bold flex-shrink-0 text-white shadow-lg`}
                >
                  {idx + 1}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-slate-900">
                    {step.sprint}
                  </h3>
                  <p className="text-slate-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-slate-900">
            Ready to{" "}
            <span className="inline-block relative">
              <span className="relative z-10 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 bg-clip-text text-transparent italic">
                Sprint
              </span>
              <span className="absolute bottom-2 left-0 right-0 h-4 bg-yellow-300 -rotate-2 -z-10"></span>
            </span>{" "}
            Ahead?
          </h2>
          <p className="text-xl text-slate-600 mb-12">
            Join thousands of sprinters racing to knowledge mastery daily
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/signup")}
              className="px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold text-lg hover:scale-105 transition-transform shadow-xl"
            >
              Start First Quiz
            </button>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white py-12 px-6">
        <div className="max-w-7xl mx-auto text-center text-slate-500">
          <p>
            &copy; 2026 QuizSprint. Race through knowledge, one sprint at a
            time.
          </p>
        </div>
      </footer>
    </div>
  );
}
