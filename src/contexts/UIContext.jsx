import { createContext, useContext, useState, useMemo } from 'react';

const UIContext = createContext();

export const UIProvider = ({ children }) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sidebarConfig, setSidebarConfig] = useState(null); // { title, navItems }
    const [showNotifications, setShowNotifications] = useState(false);

    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
    const openSidebar = () => setIsSidebarOpen(true);
    const closeSidebar = () => setIsSidebarOpen(false);

    const value = useMemo(() => ({
        isSidebarOpen,
        toggleSidebar,
        openSidebar,
        closeSidebar,
        sidebarConfig,
        setSidebarConfig,
        showNotifications,
        setShowNotifications
    }), [isSidebarOpen, sidebarConfig, showNotifications]);

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => useContext(UIContext);
