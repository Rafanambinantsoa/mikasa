import { Category2, ClipboardText, People, DollarSquare, UserOctagon, BookSaved, Receipt, Setting2, Notepad, Map1 } from 'iconsax-react';
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/Projects';
import ProjectPage from '../pages/ProjectPage';
import Clients from '../pages/Clients';
import Quotes from '../pages/Quotes';
import Workers from '../pages/Workers';
import Library from '../pages/Library';
import Invoices from '../pages/Invoices';
import Map from '../pages/Map';
import Settings from '../pages/Settings';
import NotFound from '../pages/NotFound';
import Whiteboard from '../pages/Whiteboard';

// import Scheduler from '../pages/Scheduler';

import { Route, Routes } from 'react-router-dom';

// Centralized configuration for navbar and routes
const routesConfig = [
    { label: 'Tableau de bord', icon: <Category2 />, path: '/', element: <Dashboard /> },
    { label: 'Projets', icon: <ClipboardText />, path: '/projects', element: <Projects /> },
    { label: 'Clients', icon: <People />, path: '/clients', element: <Clients /> },
    { label: 'Devis', icon: <DollarSquare />, path: '/quotes', element: <Quotes /> },
    { label: 'Ouvriers', icon: <UserOctagon />, path: '/workers', element: <Workers /> },
    { label: 'Bibliothèque', icon: <BookSaved />, path: '/library', element: <Library /> },
    { label: 'Factures', icon: <Receipt />, path: '/invoices', element: <Invoices /> },
    { label: 'Whiteboard', icon: <Notepad />, path: '/whiteboard', element: <Whiteboard /> },
    { label: 'Carte', icon: <Map1 />, path: '/map', element: <Map /> },
    { label: 'Paramètres', icon: <Setting2 />, path: '/settings', element: <Settings /> },
];

// Navbar items derived from routesConfig
export const navbarItems = routesConfig.map(({ label, icon, path }) => ({
    label,
    icon,
    path,
}));

// RouterSwitcher using the same config
export default function RouterSwitcher() {
    return (
        <Routes>
            {routesConfig.map((route, index) => (
                <Route key={index} path={route.path} element={route.element} />
            ))}
            <Route path="*" element={<NotFound />} /> {/* 404 fallback */}
            <Route path="/projects/:id" element={<ProjectPage />} />
            {/* <Route path="/scheduler" element={<Scheduler />} /> */}
        </Routes>
    );
}
