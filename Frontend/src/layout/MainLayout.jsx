import React, { useState } from 'react';
import { Outlet, useNavigation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Loader from '../components/loadingSpinner';
import AdminVerticalNavbar from '../components/AdminVerticalNavbar';
import { useUser } from '../context/UserContext';

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
          <AdminVerticalNavbar open={adminNavOpen} setOpen={setAdminNavOpen} />
        )}
        <div
          className={
            user?.role === 'admin'
              ? adminNavOpen
                ? 'flex-1 ml-64 transition-all duration-300'
                : 'flex-1 ml-0 transition-all duration-300'
              : 'flex-1'
          }
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;