import './App.css';
import Persona from './pages/Persona';
import personaContext from './Context/PersonaContext';

function App() {
  return <Persona context={personaContext} />;
}

export default App;
