import { getPlayerId } from "./engine/telemetry.js";
import { useGameStore } from "./store.js";
import AdminDashboard from "./ui/admin/AdminDashboard.jsx";
import BoardMeeting from "./ui/BoardMeeting.jsx";
import CharacterScreen from "./ui/CharacterScreen.jsx";
import EndScreen from "./ui/EndScreen.jsx";
import GameScreen from "./ui/GameScreen.jsx";
import PlayerNamePrompt from "./ui/PlayerNamePrompt.jsx";
import SetupScreen from "./ui/SetupScreen.jsx";
import TitleScreen from "./ui/TitleScreen.jsx";

export default function App() {
	// Admin route
	if (window.location.pathname === "/admin") {
		return <AdminDashboard />;
	}

	return <GameApp />;
}

function GameApp() {
	const screen = useGameStore((s) => s.screen);
	const playerId = getPlayerId();

	// Prompt for player name before game starts (but not on title/character)
	if (!playerId && screen === "title") {
		return <PlayerNamePrompt />;
	}

	switch (screen) {
		case "title":
			return <TitleScreen />;
		case "character":
			return <CharacterScreen />;
		case "setup":
			return <SetupScreen />;
		case "game":
			return <GameScreen />;
		case "board":
			return <BoardMeeting />;
		case "end":
			return <EndScreen />;
		default:
			return <TitleScreen />;
	}
}
