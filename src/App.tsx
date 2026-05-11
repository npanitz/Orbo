import { useEffect, useState } from "react";
import { Home } from "./pages/Home";
import { Sandbox } from "./pages/Sandbox";
import { LearningModules } from "./pages/LearningModules";

export type View = "home" | "sandbox" | "modules";

export function App() {
  const [view, setView] = useState<View>(
    () => (localStorage.getItem("orbo-view") as View) || "home",
  );

  useEffect(() => {
    localStorage.setItem("orbo-view", view);
  }, [view]);

  switch (view) {
    case "sandbox":
      return <Sandbox onExit={() => setView("home")} />;
    case "modules":
      return <LearningModules onExit={() => setView("home")} />;
    case "home":
    default:
      return <Home onPick={setView} />;
  }
}
