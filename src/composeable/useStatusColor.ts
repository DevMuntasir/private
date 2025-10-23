
type Variant = "bg" | "text" | "dot" | "badge";

const MAP: Record<string | number, Record<Variant, string>> = {
  "under review": {
   bg: "bg-[#E08C23]",
    text: "text-[#E08C23]",
    dot: "w-3 h-3 rounded-full bg-[#E08C23]",
    badge: "bg-[#E08C23]/10 text-[#E08C23]",
  },
  "paused": {
   bg: "bg-[#fe9a00]",
    text: "text-[#fe9a00]",
    dot: "w-3 h-3 rounded-full bg-[#fe9a00]",
    badge: "bg-[#fe9a00]/10 text-[#fe9a00]",
  },
  "rejected": {
     bg: "bg-[#DA0000]", // red tone
    text: "text-[#DA0000]",
    dot: "w-3 h-3 rounded-full bg-[#DA0000]",
    badge: "bg-[#DA0000]/10 text-[#DA0000]",
  },
  "active": {
    bg: "bg-[#009689]",
    text: "text-[#009689]",
    dot: "w-3 h-3 rounded-full bg-[#009689]",
    badge: "bg-[#009689]/10 text-[#009689]",
  },
  "completed": {
 bg: "bg-[#8f8f8f]", 
    text: "text-[#8f8f8f]",
    dot: "w-3 h-3 rounded-full bg-[#8f8f8f]",
    badge: "bg-[#8f8f8f]/10 text-[#8f8f8f]",
  },
  default: {
 bg: "bg-[#009689]",
    text: "text-[#009689]",
    dot: "w-3 h-3 rounded-full bg-[#009689]",
    badge: "bg-[#009689]/10 text-[#009689]",
  },
};

export function useStatusColor() {
  function statusClass(
    status: string | number | undefined,
    variant: Variant = "bg"
  ) {
    if (!status) return MAP.default[variant];

    const key = status.toString().toLowerCase();
    const entry = MAP[key] ?? MAP.default;

    return entry[variant];
  }
  return { statusClass };
}


