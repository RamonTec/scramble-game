import { cn } from "@/lib/utils";

interface LetterTileProps {
  letter: string;
  className?: string;
  onClick?: () => void;
  state?: "default" | "correct" | "wrong";
  animate?: boolean;
}


const LetterTile = ({ letter, className, onClick, state = "default", animate = false }: LetterTileProps) => {
  return (
    <div
      className={cn(
        "relative flex h-16 w-16 cursor-pointer select-none items-center justify-center rounded-lg border-2 text-2xl font-bold transition-all duration-200",
        "bg-game-tile text-game-tile-foreground border-game-tile-border shadow-md hover:shadow-lg",
        "hover:scale-105 hover:-translate-y-1",
        {
          "bg-game-correct text-game-correct-foreground border-game-correct animate-success-pulse": state === "correct",
          "bg-game-wrong text-game-wrong-foreground border-game-wrong animate-shake": state === "wrong",
          "animate-bounce-in": animate,
        },
        className
      )}
      onClick={onClick}
    >
      <span className={cn("transition-transform duration-200", { "animate-tile-flip": animate })}>
        {letter.toUpperCase()}
      </span>
    </div>
  );
};

export default LetterTile;