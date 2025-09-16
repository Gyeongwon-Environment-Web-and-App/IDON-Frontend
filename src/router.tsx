import { createBrowserRouter } from 'react-router-dom';

import ComplaintDetail from './components/map/ComplaintDetail';
import ComplaintManage from './pages/ComplaintManage';
import Login from './pages/Login';
import MainPage from './pages/MainPage';
import MapOverview from './pages/MapOverview';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainPage />,
  },
  {
    path: '/login',
    element: <Login onLogin={() => {}} />,
  },
  {
    path: '/complaints/table',
    element: <ComplaintManage />,
  },
  {
    path: '/map/overview',
    element: <MapOverview />,
    children: [
      {
        path: 'complaints',
        element: <div>Complaint List (rendered in sidebar)</div>,
      },
      {
        path: 'complaints/:complaintId',
        element: <ComplaintDetail />,
      },
    ],
  },
  {
    path: '/map/overview/:complaintId',
    element: <MapOverview />,
  },
]);
