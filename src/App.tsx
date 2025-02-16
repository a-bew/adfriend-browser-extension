import { StateProvider } from './contexts/StateContext';
import Home from './screens/Home';
// import Home from './Home';

const App = () => {

  return (
    <StateProvider>
      <Home />
    </StateProvider>
  );
};

export default App;