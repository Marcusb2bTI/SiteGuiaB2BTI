import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from './pages/HomePage';
import OptionsHomePage from './pages/OptionsHomePage';
import GuiaPage from './pages/Guia/[slug]';
import RegisterPage from './pages/RegisterPage';
import LoginSenha from './pages/article/LoginSenha';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />, // layout com o Outlet
    children: [
      { index: true, element: <OptionsHomePage /> },   // "/"        -> cards
      { path: 'guia/:slug', element: <GuiaPage /> },     // "/guia/x" -> detalhe
      { path: 'cadastrar', element: <RegisterPage /> },
      { path: 'login', element: < LoginSenha/> },  // "/cadastrar"
      { path: 'guia/:slug', element: <GuiaPage /> } // "/guia/x" -> detalhe
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;