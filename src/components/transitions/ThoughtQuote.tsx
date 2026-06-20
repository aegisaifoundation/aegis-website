import React from "react";

interface ThoughtQuoteProps {
  title: string;
  subtitle?: string;
  alignment: "left" | "center" | "right";
  quoteSize: "small" | "medium" | "large" | "massive";
}

export default function ThoughtQuote({ title, subtitle, alignment, quoteSize }: ThoughtQuoteProps) {
  const alignClass = 
    alignment === "left" ? "text-left items-start" :
    alignment === "right" ? "text-right items-end" :
    "text-center items-center";

  const sizeClass =
    quoteSize === "small" ? "text-lg sm:text-xl md:text-2xl lg:text-3xl" :
    quoteSize === "medium" ? "text-xl sm:text-2xl md:text-3xl lg:text-4xl" :
    quoteSize === "large" ? "text-2xl sm:text-3xl md:text-4xl lg:text-5xl" :
    "text-3xl sm:text-4xl md:text-5xl lg:text-6xl";

  const selfAlignClass = 
    alignment === "left" ? "items-start" :
    alignment === "right" ? "items-end" :
    "items-center";

  return (
    <div className={`thought-quote absolute inset-0 z-50 pointer-events-none flex flex-col justify-center px-8 md:px-24 ${alignClass}`}>
      <div className={`max-w-4xl flex flex-col ${selfAlignClass}`}>
        <h3 className={`font-heading font-extrabold text-white leading-[1.2] tracking-tight mb-6 quote-title ${sizeClass}`}>
          {title.split("\n").map((line, i) => (
            <React.Fragment key={i}>
              {line}
              {i < title.split("\n").length - 1 && <br />}
            </React.Fragment>
          ))}
        </h3>
        {subtitle && (
          <p className="font-body text-xs sm:text-sm md:text-base text-gray-400 font-light tracking-wide leading-relaxed quote-subtitle max-w-xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
