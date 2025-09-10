import { cn } from "@/lib/utils";

interface LetterTileProps {
  letter: string;
  className?: string;
  onClick?: () => void;
  state?: "default" | "correct" | "wrong";
  animate?: boolean;
}


const LetterTile = ({ letter, className, onClick, state = "default", animate = false }: LetterTileProps) => {

  console.log(state)
  return (
    <div
      className={cn(
        "relative flex h-16 w-16 cursor-pointer select-none items-center justify-center rounded-lg border-2 text-2xl font-bold transition-all",
        "bg-game-tile text-game-tile-foreground border-game-tile-border shadow-md hover:shadow-lg",
        "hover:scale-105 hover:-translate-y-1",
        "transform-gpu will-change-transform",
        {
          "bg-game-correct text-game-correct-foreground border-game-correct animate-success-pulse": state === "correct",
          "bg-game-wrong text-game-wrong-foreground border-game-wrong animate-shake": state === "wrong",
          "animate-bounce-in": animate,
        },
        className
      )}
      onClick={onClick}
    >
      <span
        className={cn(
          "transition-transform transform-gpu will-change-transform",
          { "animate-tile-flip [transform-style:preserve-3d]": animate }
        )}
      >
        {letter.toUpperCase()}
      </span>
    </div>
  );
};

export default LetterTile;