import { createBrowserRouter } from "react-router";
import App from "./App";
import Main from "./pages/Main";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <div>ErrorPage</div>,
    children: [{ index: true, element: <Main /> }],
  },
]);
