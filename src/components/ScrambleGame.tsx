import { useReducer, useCallback, useMemo, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "sonner";
import LetterTile from "./LetterTitle";
import { RotateCcw, CheckCircle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

type GamePhase = "playing" | "correct" | "wrong";

const WORDS = [
  "REACT","JAVASCRIPT","COMPUTER","DEVELOP","PROGRAM","DESIGN","CREATE",
  "BUILD","SOLVE","THINK","LEARN","STUDY","WRITE","CODE","GAME",
] as const;

const SCORE_PER_LETTER = 10;
const BOUNCE_MS = 600;
const WRONG_RESET_MS = 900;
const NEXT_WORD_MS = 1400;
const FX_MS = 600;

const randInt = (n: number) => Math.floor(Math.random() * n);
const pickRandom = <T,>(arr: readonly T[]) => arr[randInt(arr.length)];
function scramble(word: string) {
  const letters = word.split("");
  for (let i = letters.length - 1; i > 0; i--) {
    const j = randInt(i + 1);
    [letters[i], letters[j]] = [letters[j], letters[i]];
  }
  return letters.join("");
}
function scrambleDistinct(word: string) {
  if (word.length <= 1) return word;
  let s = scramble(word);
  while (s === word) s = scramble(word);
  return s;
}

type Fx = "none" | "shake" | "pop";
type State = {
  currentWord: string;
  scrambledWord: string;
  userInput: string;
  score: number;
  attempts: number;
  phase: GamePhase;
  animating: boolean; 
  fx: Fx; 
};
type Action =
  | { type: "NEW_WORD" }
  | { type: "STOP_ANIM" }
  | { type: "SET_INPUT"; value: string }
  | { type: "CHECK_START" }
  | { type: "CHECK_OK" }
  | { type: "CHECK_FAIL" }
  | { type: "RESET_TO_PLAYING" }
  | { type: "CLEAR_FX" };

function makeNewWord() {
  const w = pickRandom(WORDS);
  return { word: w, scrambled: scrambleDistinct(w) };
}
function initialState(): State {
  const { word, scrambled } = makeNewWord();
  return {
    currentWord: word,
    scrambledWord: scrambled,
    userInput: "",
    score: 0,
    attempts: 0,
    phase: "playing",
    animating: true,
    fx: "none",
  };
}
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "NEW_WORD": {
      const { word, scrambled } = makeNewWord();
      return {
        ...state,
        currentWord: word,
        scrambledWord: scrambled,
        userInput: "",
        attempts: state.attempts + 1,
        phase: "playing",
        animating: true,
        fx: "none",
      };
    }
    case "STOP_ANIM":
      return { ...state, animating: false };
    case "SET_INPUT":
      return state.phase === "playing" ? { ...state, userInput: action.value } : state;
    case "CHECK_START":
      return { ...state, attempts: state.attempts + 1 };
    case "CHECK_OK":
      return {
        ...state,
        phase: "correct",
        score: state.score + state.currentWord.length * SCORE_PER_LETTER,
        fx: "pop",
      };
    case "CHECK_FAIL":
      return { ...state, phase: "wrong", fx: "shake" }; 
    case "RESET_TO_PLAYING":
      return { ...state, phase: "playing", userInput: "" };
    case "CLEAR_FX":
      return { ...state, fx: "none" };
    default:
      return state;
  }
}

const ScrambleGame = () => {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);
  const timeoutsRef = useRef<number[]>([]);

  // cleanup
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => dispatch({ type: "STOP_ANIM" }), BOUNCE_MS);
    timeoutsRef.current.push(t);
  }, [state.scrambledWord]);

  useEffect(() => {
    if (state.fx === "none") return;
    const t = window.setTimeout(() => dispatch({ type: "CLEAR_FX" }), FX_MS);
    timeoutsRef.current.push(t);
  }, [state.fx]);

  const tiles = useMemo(() => state.scrambledWord.split(""), [state.scrambledWord]);

  const setInput = useCallback(
    (v: string) => dispatch({ type: "SET_INPUT", value: v }),
    []
  );

  const newWord = useCallback(() => {
    dispatch({ type: "NEW_WORD" });
  }, []);

  const checkAnswer = useCallback(() => {
    if (state.phase !== "playing") return;
    const value = state.userInput.trim();
    if (!value) return;

    dispatch({ type: "CHECK_START" });

    if (value.toUpperCase() === state.currentWord) {
      dispatch({ type: "CHECK_OK" });
      toast.success("Correct! Well done! 🎉", {
        description: `+${state.currentWord.length * SCORE_PER_LETTER} points`,
      });
      const t = window.setTimeout(() => {
        dispatch({ type: "NEW_WORD" });
      }, NEXT_WORD_MS);
      timeoutsRef.current.push(t);
    } else {
      dispatch({ type: "CHECK_FAIL" });
      toast.error("Try again! 💪", { description: "Keep going, you can do it!" });
      const t = window.setTimeout(() => {
        dispatch({ type: "RESET_TO_PLAYING" });
      }, WRONG_RESET_MS);
      timeoutsRef.current.push(t);
    }
  }, [state.phase, state.userInput, state.currentWord]);

  const onInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && state.phase === "playing") {
        e.preventDefault();
        checkAnswer();
      }
    },
    [state.phase, checkAnswer]
  );

  const isPlaying = state.phase === "playing";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">

      <Card
        className={cn(
          "w-full max-w-2xl mx-auto shadow-xl transform-gpu",
          state.fx === "shake" && "animate-shake",
          state.fx === "pop" && "animate-pop-in"
        )}
      >
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-4xl font-bold text-blue-600">Word Scramble</CardTitle>
          <div className="flex justify-center gap-8 text-lg">
            <div className="flex items-center gap-2">
              <Trophy className="text-amber-400 h-5 w-5" aria-hidden />
              <span className="font-semibold">Score: {state.score}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="text-green-600 h-5 w-5" aria-hidden />
              <span>Attempts: {state.attempts}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="text-center space-y-4">
            <p className="text-lg text-muted-foreground">Unscramble these letters:</p>
            <div className="flex justify-center gap-2 flex-wrap">
              {tiles.map((letter, idx) => (
                <LetterTile
                  key={`${letter}-${idx}`}
                  letter={letter}
                  animate={state.animating}
                  state={
                    state.phase === "correct"
                      ? "correct"
                      : state.phase === "wrong"
                      ? "wrong"
                      : "default"
                  }
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                checkAnswer();
              }}
            >
              <Input
                placeholder="Type your answer here..."
                value={state.userInput}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onInputKeyDown}
                disabled={!isPlaying}
                className={cn(
                  "text-lg text-center font-semibold tracking-wide transform-gpu",
                  state.phase === "wrong" && "animate-shake"
                )}
                aria-label="Your answer"
                autoFocus
              />
              <Button
                type="submit"
                disabled={!state.userInput.trim() || !isPlaying}
                size="lg"
                className="bg-blue-600 text-white"
              >
                Submit
              </Button>
            </form>

            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={newWord}
                type="button"
                className="flex items-center gap-2 bg-blue-600 text-white"
              >
                <RotateCcw className="h-4 w-4" aria-hidden />
                New Word
              </Button>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Hint: This is a {state.currentWord.length}-letter word
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrambleGame;
