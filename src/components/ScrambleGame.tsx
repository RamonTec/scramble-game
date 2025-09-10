import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "sonner";
import LetterTile from "./LetterTitle";
import { RotateCcw, CheckCircle, Trophy } from "lucide-react";

// Sample words for the game
const WORDS = [
  "REACT", "JAVASCRIPT", "COMPUTER", "DEVELOP", "PROGRAM", "DESIGN", "CREATE",
  "BUILD", "SOLVE", "THINK", "LEARN", "STUDY", "WRITE", "CODE", "GAME"
];

const ScrambleGame = () => {
  const [currentWord, setCurrentWord] = useState("");
  const [scrambledWord, setScrambledWord] = useState("");
  const [userInput, setUserInput] = useState("");
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "correct" | "wrong">("playing");
  const [isAnimating, setIsAnimating] = useState(false);

  const scrambleWord = (word: string) => {
    const letters = word.split("");
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [letters[i], letters[j]] = [letters[j], letters[i]];
    }
    return letters.join("");
  };

  const newGame = () => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    setCurrentWord(word);
    let scrambled = scrambleWord(word);
    // Make sure the scrambled word is different from the original
    while (scrambled === word && word.length > 1) {
      scrambled = scrambleWord(word);
    }
    setScrambledWord(scrambled);
    setUserInput("");
    setGameState("playing");
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const checkAnswer = () => {
    if (!userInput.trim()) return;
    
    setAttempts(prev => prev + 1);
    
    if (userInput.toUpperCase() === currentWord) {
      setGameState("correct");
      setScore(prev => prev + currentWord.length * 10);
      toast.success("Correct! Well done! 🎉", {
        description: `+${currentWord.length * 10} points`
      });
      setTimeout(() => {
        newGame();
      }, 2000);
    } else {
      setGameState("wrong");
      toast.error("Try again! 💪", {
        description: "Keep going, you can do it!"
      });
      setTimeout(() => {
        setGameState("playing");
        setUserInput("");
      }, 1000);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (gameState === "playing") {
      setUserInput(e.target.value);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && gameState === "playing") {
      checkAnswer();
    }
  };

  useEffect(() => {
    newGame();
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl mx-auto shadow-xl">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-4xl font-bold text-primary">Word Scramble</CardTitle>
          <div className="flex justify-center gap-8 text-lg">
            <div className="flex items-center gap-2">
              <Trophy className="text-warning h-5 w-5" />
              <span className="font-semibold">Score: {score}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-muted-foreground h-5 w-5" />
              <span>Attempts: {attempts}</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Scrambled Letters */}
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">Unscramble these letters:</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {scrambledWord.split("").map((letter, index) => (
                <LetterTile
                  key={`${letter}-${index}`}
                  letter={letter}
                  animate={isAnimating}
                  state={gameState === "correct" ? "correct" : gameState === "wrong" ? "wrong" : "default"}
                />
              ))}
            </div>
          </div>

          {/* User Input */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type your answer here..."
                value={userInput}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={gameState !== "playing"}
                className="text-lg text-center font-semibold tracking-wide"
              />
              <Button
                onClick={checkAnswer}
                disabled={!userInput.trim() || gameState !== "playing"}
                size="lg"
              >
                Submit
              </Button>
            </div>
            
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={newGame}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                New Word
              </Button>
            </div>
          </div>

          {/* Hint */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Hint: This is a {currentWord.length}-letter word
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrambleGame;