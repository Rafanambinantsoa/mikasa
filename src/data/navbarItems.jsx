import { Category2, ClipboardText, People, DollarSquare, UserOctagon, BookSaved, Receipt, Setting2, Notepad, Map1 } from 'iconsax-react';

export const navbarItems = [
    { label: 'Tableau de bord', icon: <Category2 />, path: '/' },
    { label: 'Projets', icon: <ClipboardText />, path: '/projects' },
    { label: 'Clients', icon: <People />, path: '/clients' },
    { label: 'Ouvriers', icon: <UserOctagon />, path: '/workers' },
    // { label: 'Bibliothèque', icon: <BookSaved />, path: '/library' },
    { label: 'Devis', icon: <DollarSquare />, path: '/quotes' },
    { label: 'Factures', icon: <Receipt />, path: '/invoices' },
    { label: 'Carte', icon: <Map1 />, path: '/map' },
    { label: 'Whiteboard', icon: <Notepad />, path: '/whiteboard' },
    // { label: 'Paramètres', icon: <Setting2 />, path: '/settings' },
];