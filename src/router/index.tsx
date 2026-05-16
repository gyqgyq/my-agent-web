import { createBrowserRouter } from "react-router-dom";
import About from "@/pages/about";

const router = createBrowserRouter([
  {
    path: "/",
    element: <div>Home</div>,
  },
  {
    path: "/about",
    element: <About />,
  },
]);

export default router;