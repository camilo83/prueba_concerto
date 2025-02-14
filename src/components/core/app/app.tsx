import { Router } from '../router/router';
import { Toaster } from 'react-hot-toast';

export function App() {
  return (
    <>
      <div>
        <Toaster />
        <Router />
      </div>
    </>
  );
}
