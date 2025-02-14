import { Route, Routes } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

const Home = lazy(() => import('../../../pages/homePage/homePage'));

export function Router() {
  return (
    <main>
      <Suspense fallback={<div></div>}>
        <TransitionGroup>
          <CSSTransition classNames="fade" timeout={3000}>
            <Routes>
              <Route path="/" element={<Home></Home>}></Route>
            </Routes>
          </CSSTransition>
        </TransitionGroup>
      </Suspense>
    </main>
  );
}
