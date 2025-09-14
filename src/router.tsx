import { createBrowserRouter } from "react-router-dom";
import MainPage from "./pages/MainPage";
import Login from "./pages/Login";
import ComplaintManage from "./pages/ComplaintManage";
import MapOverview from "./pages/MapOverview";
import ComplaintDetail from "./components/map/ComplaintDetail";
import ComplaintListContainer from "./components/map/ComplaintListContainer";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainPage />,
  },
  {
    path: "/login",
    element: <Login onLogin={() => {}} />,
  },
  {
    path: "/complaints/table",
    element: <ComplaintManage />,
  },
  {
    path: "/map/overview",
    element: <MapOverview />,
    children: [
      {
        path: "complaints",
        element: <ComplaintListContainer />,
      },
      {
        path: "complaints/:complaintId",
        element: <ComplaintDetail />,
      },
    ],
  },
  {
    path: "/map/overview/:complaintId",
    element: <MapOverview />,
  },
]);
