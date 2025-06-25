import React, { useState } from 'react';
import { Outlet, useNavigation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/loadingSpinner';
import AdminVerticalNavbar from '../components/AdminVerticalNavbar';
import { useUser } from '../context/UserContext';
import { MenuOpenRounded } from '@mui/icons-material';

const MainLayout = () => {
  const navigation = useNavigation();
  const { user } = useUser();
  const [adminNavOpen, setAdminNavOpen] = useState(true);

  return (
    <div>
      <Navbar />
      {navigation.state === 'loading' && <Loader />}
      <div className="flex">
        {user?.role === 'admin' && (
        <>
           <button
            className="md:hidden fixed top-14 left-4 z-[999] bg-[#FFF3E0] rounded-full shadow p-2"
            onClick={() => setAdminNavOpen((prev) => !prev)}
            aria-label="Toggle Admin Menu"
            type="button"
          >
            <MenuOpenRounded style={{ color: '#E06B00', fontSize: 28 }} />
          </button>
          <AdminVerticalNavbar open={adminNavOpen} setOpen={setAdminNavOpen} />
        </>
      )}
        <div
          className={
            user?.role === 'admin'
              ? adminNavOpen
                ? 'flex-1 transition-all duration-300 h-screen overflow-y-auto'
                : 'flex-1 ml-0 transition-all duration-300 h-screen overflow-y-auto'
              : 'flex-1 h-screen overflow-y-auto'
          }
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;