import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Lobby from "./pages/Lobby";
import Game from "./pages/Game";
import PostGame from "./pages/PostGame";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-full bg-cream text-espresso">
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/game" element={<Game />} />
          <Route path="/summary" element={<PostGame />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
