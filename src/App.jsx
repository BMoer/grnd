import { useGameStore } from './store.js';
import TitleScreen from './ui/TitleScreen.jsx';
import CharacterScreen from './ui/CharacterScreen.jsx';
import SetupScreen from './ui/SetupScreen.jsx';
import GameScreen from './ui/GameScreen.jsx';
import BoardMeeting from './ui/BoardMeeting.jsx';
import EndScreen from './ui/EndScreen.jsx';

export default function App() {
  const screen = useGameStore(s => s.screen);

  switch (screen) {
    case 'title': return <TitleScreen />;
    case 'character': return <CharacterScreen />;
    case 'setup': return <SetupScreen />;
    case 'game': return <GameScreen />;
    case 'board': return <BoardMeeting />;
    case 'end': return <EndScreen />;
    default: return <TitleScreen />;
  }
}
