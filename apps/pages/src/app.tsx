import * as React from "react";
import { Badge } from "@tilli.dev/ui-atoms/badge";
import { Button } from "@tilli.dev/ui-atoms/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@tilli.dev/ui-atoms/card";
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
  ProgressValue,
} from "@tilli.dev/ui-atoms/progress";
import { Spinner } from "@tilli.dev/ui-atoms/spinner";
import { Book, ChefHat, Moon, Sun } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { loadData, randomInteger } from "./data";

const toggleTheme = () => {
  const currentTheme = document.documentElement.getAttribute("data-theme");
  const isSystem = currentTheme?.startsWith("system-");
  const theme = isSystem ? currentTheme?.split("-")[1] : currentTheme;
  const newTheme = theme === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
};

export const App: React.FC = () => {
  const [loaded, setLoaded] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [current, setCurrent] = React.useState<string>("");
  const [data, setData] = React.useState<unknown[]>([]);

  const handleLoadData = (incoming: unknown) => {
    setData((_data) => [..._data, incoming]);
    if (
      incoming &&
      typeof incoming === "object" &&
      "endpoint" in incoming &&
      typeof incoming.endpoint === "string"
    ) {
      setCurrent(incoming.endpoint);
    }
    setProgress((_progress) => Math.min(_progress + randomInteger(3, 8), 100));
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: :(
  React.useEffect(() => {
    void loadData(handleLoadData).then(() => {
      if (progress < 100) {
        setProgress(100);
        setTimeout(() => setLoaded(true), 800);
      } else {
        setLoaded(true);
      }
    });
  }, []);

  React.useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      console.log(mutations);
    });

    observer.observe(document, {
      childList: false,
      subtree: false,
      attributes: true,
      attributeFilter: ["data-*"],
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="flex size-full min-h-dvh min-w-full flex-col items-center justify-center gap-4 p-4">
      <AnimatePresence>
        <motion.div
          animate={{ opacity: 1 }}
          className="absolute top-4 right-4"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          key="theme-toggle"
        >
          <Button
            className="text-muted-foreground hover:shadow-amber-700 dark:hover:shadow-amber-200"
            onClick={toggleTheme}
            size="icon-sm"
            variant="ghost"
          >
            <Sun className="block size-4 dark:hidden dark:size-0 dark:drop-shadow-none" />
            <Moon className="hidden size-0 dark:block dark:size-4" />
          </Button>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {!loaded && (
          <motion.div
            animate={{ opacity: 1, translateY: 0 }}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0, translateY: 12 }}
            key="progress"
          >
            <Progress
              aria-label="Loading..."
              className="w-64 max-w-[80vw]"
              max={100}
              value={progress}
            >
              <div className="flex items-center justify-between gap-2">
                <ProgressLabel className="flex items-center">
                  <Spinner className="size-4" />
                  <span className="ml-2 text-sm">{current.toUpperCase()}</span>
                </ProgressLabel>
                <ProgressValue>
                  {(_formatted, value) => `${value} / 100`}
                </ProgressValue>
              </div>
              <ProgressTrack>
                <ProgressIndicator />
              </ProgressTrack>
            </Progress>
          </motion.div>
        )}

        <AnimatePresence>
          {loaded && (
            <motion.div
              animate={{ opacity: 1, translateY: 0, transition: { delay: 2 } }}
              className="flex flex-col items-start justify-center gap-4"
              exit={{ opacity: 0 }}
              initial={{ opacity: 0, translateY: 12 }}
              key="loaded"
            >
              <Badge className="ml-2 font-header">@tilli.dev/ui-atoms</Badge>
              <div className="flex w-full items-stretch gap-4 max-sm:flex-col">
                <Card className="w-full sm:max-w-80 lg:max-w-102">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Book className="size-4" />
                      <h2>Storybook</h2>
                    </CardTitle>
                    <CardDescription>
                      Many pages woven; a tale enscribed for each.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    Turns out that this entire thing was a fable all along.
                  </CardContent>
                  <CardFooter>
                    <a className="w-full" href="/storybook">
                      <Button className="w-full">Read along</Button>
                    </a>
                  </CardFooter>
                </Card>

                <Card className="w-full sm:max-w-80 lg:max-w-102">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChefHat className="size-4" />
                      <h2>Recipes</h2>
                    </CardTitle>
                    <CardDescription>
                      We threw them at each other at very very high speeds.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    At first they were just molecules. And then something
                    extraordinary happened.
                  </CardContent>
                  <CardFooter>
                    <a className="w-full" href="/recipes">
                      <Button className="w-full">Take a peek</Button>
                    </a>
                  </CardFooter>
                </Card>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );
};
