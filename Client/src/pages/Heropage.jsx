import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  Trophy,
  Zap,
  ArrowRight,
  Brain,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import Loader from "../components/Loader";

export default function HeroPage() {
  const [scrollY, setScrollY] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigation = (path) => {
    setIsLoading(true);
    setTimeout(() => {
      navigate(path);
      setIsLoading(false);
    }, 5000);
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-black text-gray-100">
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          scrollY > 50
            ? "bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/30"
            : "bg-black/5 backdrop-blur-md border-b border-white/5"
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/20 rounded-lg flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                QuizSprint
              </span>
            </div>

            {/* Auth Buttons - Right */}
            <div className="flex items-center gap-3">
              {token ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate("/login")}
                    className="px-5 py-2 text-md font-medium text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    Login
                  </button>
                  {/* <div className="w-8 h-8 rounded-full bg-gradient-to-br from-white/20 to-white/10 border border-white/20 backdrop-blur-sm"></div> */}
                </div>
              ) : (
                <>
                  <button
                    onClick={() => handleNavigation("/login")}
                    className="px-5 py-2.5 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-300"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => handleNavigation("/signup")}
                    className="px-5 py-2.5 bg-gradient-to-r from-white/20 to-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-semibold rounded-lg hover:from-white/30 hover:to-white/20 hover:border-white/30 transition-all duration-300"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="relative pt-40 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 rounded-full mb-8">
            <Sparkles className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-300">
              Time-Based Quiz Platform
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6 leading-tight">
            <span className="block text-white">Race Against</span>
            <span className="block text-gray-500">The Clock</span>
          </h1>

          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Test your knowledge in rapid-fire challenges. Three sprints, one
            winner. Every second counts.
          </p>

          <button
            onClick={() => handleNavigation("/signup")}
            className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-black font-semibold rounded hover:bg-gray-200 transition"
          >
            <span>Start Sprinting</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </section>

      <section className="relative py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-b from-gray-900 to-black border border-gray-800 rounded-2xl p-12">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-sm text-gray-500 font-medium">
                    Live Sprint Progress
                  </span>
                  <span className="px-3 py-1 bg-black border border-gray-800 text-gray-300 rounded text-xs font-bold">
                    SPRINT 2/3
                  </span>
                </div>

                <div className="flex items-center justify-center gap-6">
                  {[
                    { num: 1, status: "complete" },
                    { num: 2, status: "active" },
                    { num: 3, status: "locked" },
                  ].map((sprint) => (
                    <div
                      key={sprint.num}
                      className="flex flex-col items-center gap-2"
                    >
                      <div
                        className={`w-16 h-16 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-all ${
                          sprint.status === "complete"
                            ? "border-white bg-white text-black"
                            : sprint.status === "active"
                              ? "border-gray-600 bg-gray-900 text-white"
                              : "border-gray-800 bg-black text-gray-700"
                        }`}
                      >
                        {sprint.status === "complete" ? "✓" : sprint.num}
                      </div>
                      <span className="text-xs text-gray-600">
                        Sprint {sprint.num}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 mt-8">
                  <div className="bg-black border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <Trophy className="w-4 h-4" />
                      <span className="text-xs font-medium">Points</span>
                    </div>
                    <div className="text-2xl font-bold text-white">850</div>
                  </div>
                  <div className="bg-black border border-gray-800 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-gray-500 mb-2">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium">Time Left</span>
                    </div>
                    <div className="text-2xl font-bold text-white">45s</div>
                  </div>
                </div>
              </div>

              {/* Right - Content */}
              <div className="space-y-6">
                <h3 className="text-3xl font-bold text-white">How It Works</h3>
                <div className="space-y-4">
                  {[
                    {
                      step: "01",
                      title: "Choose Your Sprint",
                      desc: "Three difficulty levels await",
                    },
                    {
                      step: "02",
                      title: "Beat The Timer",
                      desc: "Answer fast for bonus points",
                    },
                    {
                      step: "03",
                      title: "Climb The Board",
                      desc: "Compete with players globally",
                    },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4">
                      <div className="w-10 h-10 bg-white text-black rounded flex items-center justify-center font-bold text-sm flex-shrink-0">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-semibold text-white mb-1">
                          {item.title}
                        </h4>
                        <p className="text-sm text-gray-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => handleNavigation("/login")}
                  className="w-full py-3 bg-white text-black font-semibold rounded hover:bg-gray-200 transition mt-6"
                >
                  Try Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="relative py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Built for Speed
            </h2>
            <p className="text-lg text-gray-500">
              Everything you need to dominate the leaderboard
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Target className="w-6 h-6" />,
                title: "Precision Scoring",
                desc: "Accuracy and speed combined for maximum points",
              },
              {
                icon: <TrendingUp className="w-6 h-6" />,
                title: "Progressive Challenge",
                desc: "Each sprint increases difficulty and rewards",
              },
              {
                icon: <Trophy className="w-6 h-6" />,
                title: "Global Rankings",
                desc: "Real-time leaderboard updates after every game",
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Time Bonuses",
                desc: "Faster answers earn exponentially more points",
              },
              {
                icon: <Brain className="w-6 h-6" />,
                title: "Smart Questions",
                desc: "Curated content across diverse categories",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Instant Results",
                desc: "No waiting, immediate feedback on every answer",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition group"
              >
                <div className="w-12 h-12 bg-white text-black rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sprint Levels */}
      <section className="relative py-20 px-6 bg-gradient-to-b from-black to-gray-950">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Three Sprint Levels
            </h2>
            <p className="text-lg text-gray-500">
              Progressive difficulty, exponential rewards
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                level: "Sprint 1",
                subtitle: "Warm Up",
                desc: "10 questions • 60 seconds • 100 points max",
                difficulty: "Beginner",
              },
              {
                level: "Sprint 2",
                subtitle: "Challenge",
                desc: "15 questions • 90 seconds • 300 points max",
                difficulty: "Intermediate",
              },
              {
                level: "Sprint 3",
                subtitle: "Elite",
                desc: "20 questions • 120 seconds • 600 points max",
                difficulty: "Advanced",
              },
            ].map((sprint, idx) => (
              <div
                key={idx}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-white text-black rounded-lg flex items-center justify-center font-bold text-xl">
                      {idx + 1}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">
                        {sprint.level}
                        <span className="text-gray-600 ml-2 text-base font-normal">
                          / {sprint.subtitle}
                        </span>
                      </h3>
                      <p className="text-sm text-gray-500">{sprint.desc}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-black border border-gray-800 text-gray-400 rounded text-xs font-medium">
                    {sprint.difficulty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Ready to Sprint?
          </h2>
          <p className="text-xl text-gray-500 mb-10">
            Join thousands racing to the top of the leaderboard
          </p>
          <button
            onClick={() => handleNavigation("/signup")}
            className="px-10 py-4 bg-white text-black font-bold rounded hover:bg-gray-200 transition text-lg"
          >
            Start Your First Sprint
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-900 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white rounded flex items-center justify-center">
                <Zap className="w-4 h-4 text-black" />
              </div>
              <span className="font-bold text-white">QuizSprint</span>
            </div>
            <p className="text-sm text-gray-600">
              © 2026 QuizSprint. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
