
export default {
  theme: {
    extend: {
      keyframes: {
        successPulse: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)" },
        },
        shakeX: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%": { transform: "translateX(-6%)" },
          "40%": { transform: "translateX(6%)" },
          "60%": { transform: "translateX(-4%)" },
          "80%": { transform: "translateX(4%)" },
        },
        popIn: {
          "0%": { transform: "scale(0.98)", opacity: "0" },
          "60%": { transform: "scale(1.03)", opacity: "1" },
          "100%": { transform: "scale(1)" },
        },
      },
      animation: {
        "success-pulse": "successPulse 500ms ease-in-out both",
        "shake": "shakeX 500ms ease-in-out both",
        "pop-in": "popIn 350ms ease-out both",
      },
    },
  },

  safelist: ["animate-success-pulse", "animate-shake", "animate-pop-in"],
};
