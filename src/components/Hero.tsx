import React from "react";
import { Button } from "@/components/ui/button";
import pokemonLogo from "../assets/International_Pokémon_logo.svg.png";
import pikachu from "../assets/pikachu.png";

interface HeroProps {
  onViewDeck: () => void;
}

const Hero: React.FC<HeroProps> = ({ onViewDeck }) => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#9DD6D3] via-[#A8DED8] to-[#B5E5DD] flex items-center justify-center">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle pattern or texture */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Main content container */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left side - Content */}
          <div className="flex flex-col items-center lg:items-start space-y-8 order-2 lg:order-1">
            {/* Pokemon Logo */}
            <div className="w-full max-w-[400px] lg:max-w-[500px]">
              <img
                src={pokemonLogo}
                alt="Pokemon Logo"
                className="w-full h-auto drop-shadow-2xl"
              />
            </div>

            {/* Content Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 lg:p-12 max-w-[500px] w-full transform hover:scale-[1.02] transition-transform duration-300">
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-[#6B9D96] mb-6 leading-tight">
                GOTTA CATCH EM' ALL!
              </h1>

              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <Button
                  onClick={onViewDeck}
                  className="bg-[#6B9D96] hover:bg-[#5A8C85] text-white px-8 py-6 text-lg rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
                  size="lg"
                >
                  View Deck
                </Button>
              </div>
            </div>
          </div>

          {/* Right side - Pikachu 3D effect */}
          <div className="relative flex items-center justify-center order-1 lg:order-2">
            {/* Shadow effect */}
            <div className="absolute bottom-0 w-[400px] h-[100px] bg-black/20 rounded-full blur-3xl transform scale-x-150"></div>
            
            {/* Pikachu image with 3D transform */}
            <div className="relative pikachu-container">
              <img
                src={pikachu}
                alt="Pikachu"
                className="w-full max-w-[500px] h-auto drop-shadow-2xl animate-float"
                style={{
                  filter: "drop-shadow(20px 30px 40px rgba(0,0,0,0.3))",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(-2deg);
          }
          25% {
            transform: translateY(-20px) translateX(10px) rotate(0deg);
          }
          50% {
            transform: translateY(-10px) translateX(-5px) rotate(2deg);
          }
          75% {
            transform: translateY(-15px) translateX(5px) rotate(0deg);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .pikachu-container {
          perspective: 1000px;
        }

        .pikachu-container img {
          transform-style: preserve-3d;
          transition: transform 0.3s ease;
        }

        .pikachu-container:hover img {
          transform: translateY(-10px) rotateY(5deg) rotateX(-5deg);
        }
      `}</style>
    </section>
  );
};

export default Hero;
