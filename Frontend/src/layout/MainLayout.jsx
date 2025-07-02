import React, { useState, useEffect } from 'react';
import { Outlet, useNavigation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/loadingSpinner';
import AdminVerticalNavbar from '../components/AdminVerticalNavbar';
import { useUser } from '../context/UserContext';
import { MenuOpenRounded, CloseRounded } from '@mui/icons-material';

const MainLayout = () => {
  const navigation = useNavigation();
  const { user } = useUser();

  const [adminNavOpen, setAdminNavOpen] = useState(() => {
  const stored = localStorage.getItem('adminNavOpen');
  if (stored === null || stored === "undefined") return true;
  try {
    return JSON.parse(stored);
  } catch {
    return true;
  }
});

  useEffect(() => {
    localStorage.setItem('adminNavOpen', JSON.stringify(adminNavOpen));
  }, [adminNavOpen]);

  return (
    <div>
      <Navbar />
      {navigation.state === 'loading' && <Loader />}
      <div className="flex">
        {user?.role === 'admin' && (
          <>
            <button
              className="md:hidden fixed z-[999] bg-[#FFF3E0] rounded-full shadow p-2"
              style={{
                top: '4rem',
                left: adminNavOpen ? '17rem' : '1rem'
              }}
              aria-label="Toggle Admin Menu"
              onClick={() => setAdminNavOpen(prev => !prev)}
              type="button"
            >
              {adminNavOpen ? (
                <CloseRounded style={{ color: '#E06B00', fontSize: 28 }} />
              ) : (
                <MenuOpenRounded style={{ color: '#E06B00', fontSize: 28 }} />
              )}
            </button>
            <AdminVerticalNavbar open={adminNavOpen} setOpen={setAdminNavOpen} />
          </>
        )}
       <div
          className={
            user?.role === 'admin'
              ? adminNavOpen
                ? 'flex-1 transition-all duration-300 h-screen overflow-y-auto mt-[5px] md:mt-0'
                : 'flex-1 ml-0 transition-all duration-300 h-screen overflow-y-auto mt-1 md:mt-0'
              : 'flex-1 h-screen overflow-y-auto'
          }
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;