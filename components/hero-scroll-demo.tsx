"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import Image from "next/image";

export function HeroScrollDemo() {
  return (
    <div className="flex w-full max-w-[100vw] flex-col overflow-x-clip bg-white pb-16 sm:pb-24">
      <ContainerScroll
        titleComponent={
          <>
            <h1 className="text-[1.65rem] font-semibold leading-tight text-[#06254a] sm:text-4xl">
              اقرأ بتمهّل
              <br />
              <span className="mt-1 block text-[2.35rem] font-bold leading-none min-[400px]:text-5xl sm:text-6xl md:text-[6rem]">
                نور يتلى
              </span>
            </h1>
          </>
        }
      >
        <Image
          src="https://images.unsplash.com/photo-1609599006353-e629aaabfeae?auto=format&fit=crop&w=1400&q=80"
          alt="مصحف مفتوح"
          fill
          className="object-cover object-center"
          sizes="(max-width: 768px) 90vw, 1024px"
          draggable={false}
          priority
        />
      </ContainerScroll>
    </div>
  );
}
