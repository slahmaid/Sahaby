"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const [isMobile, setIsMobile] = React.useState(true);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [1.08, 1] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], isMobile ? [22, 0] : [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], isMobile ? [0, -40] : [0, -100]);
  const imageScale = useTransform(scrollYProgress, [0, 1], isMobile ? [1.55, 1] : [1, 1]);

  return (
    <div
      className="relative flex h-auto min-h-[150vh] w-full max-w-[100vw] flex-col items-center justify-start px-3 pt-24 pb-16 sm:px-6 sm:pt-28 md:h-[80rem] md:min-h-0 md:px-10 md:pt-32"
      ref={containerRef}
    >
      <div
        className="relative w-full max-w-5xl py-2 sm:py-6 md:py-8"
        style={{
          perspective: "1000px",
        }}
      >
        <Header translate={translate} titleComponent={titleComponent} />
        <Card
          rotate={rotate}
          translate={translate}
          scale={scale}
          imageScale={imageScale}
        >
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  titleComponent,
}: {
  translate: MotionValue<number>;
  titleComponent: string | React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        translateY: translate,
      }}
      className="div mx-auto w-full max-w-5xl px-1 text-center"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  imageScale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  translate: MotionValue<number>;
  imageScale: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        boxShadow:
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003",
      }}
      className="mx-auto mt-4 aspect-[9/16] h-auto w-full max-w-[26rem] rounded-[22px] border-2 border-[#6C6C6C] bg-[#222222] p-1.5 shadow-2xl sm:mt-6 sm:rounded-[30px] sm:border-4 sm:p-2 md:mt-8 md:aspect-auto md:h-[40rem] md:max-w-5xl md:p-6"
    >
      <div className="h-full w-full overflow-hidden rounded-xl bg-gray-100 md:rounded-2xl md:p-4 dark:bg-zinc-900">
        <motion.div
          style={{ scale: imageScale }}
          className="relative h-full w-full origin-center"
        >
          {children}
        </motion.div>
      </div>
    </motion.div>
  );
};
