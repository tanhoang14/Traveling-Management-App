"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-cards";
import { useState } from "react";
import { Destination } from "../types/activity";

interface Props {
  recommendedDestinations: Destination[];
}

export default function StackedCards({ recommendedDestinations }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!recommendedDestinations?.length)
    return (
      <div className="text-gray-400 text-center">No recommendations yet.</div>
    );

  const activeDestination = recommendedDestinations[activeIndex];

  return (
    <section className="flex flex-col md:flex-row items-center rounded-xl overflow-hidden bg-brown-700 cursor-pointer hover:shadow-lg transition p-card p-component gap-10 p-4">
      {/* --- Left: Stacked Swiper Cards --- */}
      <div className="w-[280px] md:w-[320px] h-[420px]">
        <Swiper
          effect="cards"
          grabCursor={true}
          loop={true}
          modules={[EffectCards, Autoplay]}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
          className="w-full h-full"
        >
          {recommendedDestinations.map((dest, i) => (
            <SwiperSlide
              key={i}
              className="relative overflow-hidden rounded-2xl shadow-lg bg-black/70"
            >
              {/* Background Image */}
              <img
                src={dest.image}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) =>
                  ((e.currentTarget as HTMLImageElement).src =
                    "https://img.freepik.com/free-vector/illustration-gallery-icon_53876-27002.jpg?semt=ais_hybrid")
                }
              />

              {/* Fixed bottom overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white p-4">
                <h3 className="text-lg font-semibold truncate">{dest.name}</h3>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      {/* --- Right: Article Section --- */}
        <div className="w-[100%] md:w-[100%] h-[420px]">
                  <article className="w-full space-y-4 ml-2 flex justify-center flex-col">
        <h2 className="text-2xl font-bold text-brown-700 dark:text-dark flex justify-center italic">
          {activeDestination.name}
        </h2>

        <p className="text-sm leading-relaxed flex justify-center ">
          {activeDestination.description
            ? activeDestination.description.length > 450
              ? activeDestination.description.slice(0, 450) + "..."
              : activeDestination.description
            : "No description available."}
        </p>
      </article>
        </div>
    </section>
  );
}
