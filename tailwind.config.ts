import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: "var(--bg-void)",
        elevated: "var(--bg-elevated)",
        glass: "var(--bg-glass)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        muted: "var(--text-muted)",
        starlight: "var(--accent-starlight)",
        signal: "var(--accent-signal)",
        "signal-ink": "var(--accent-signal-ink)",
        hairline: "var(--border-hairline)",
        active: "var(--border-active)",
        orbital: "var(--orbital-line)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Clash Display", "sans-serif"],
        serif: ["var(--font-display)", "Clash Display", "sans-serif"],
        mono: ["var(--font-mono)", "Satoshi", "sans-serif"],
        sans: ["var(--font-sans)", "Satoshi", "sans-serif"],
      },
      borderRadius: {
        none: "0px",
        DEFAULT: "0px",
      },
    },
  },
  plugins: [],
};

export default config;
