import React, { useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import { MenuOpenRounded, Person, RestaurantMenu, Group, Settings, Logout } from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { useLogoutUserMutation } from '../features/api/authApi';

const adminLinks = [
  { to: '/admin/recipes', label: 'Manage Recipes', icon: <RestaurantMenu /> },
  { to: '/admin/users', label: 'Manage Users', icon: <Group /> },
  { to: '/admin/settings', label: 'Settings', icon: <Settings /> },
];

const AdminVerticalNavbar = ({ open, setOpen }) => {
  const location = useLocation();
  const wasOpenByHover = useRef(false);
  const { user, setUser } = useUser();
  const [logoutUser] = useLogoutUserMutation();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';

  const handleMouseEnter = () => {
    if (!open) {
      setOpen(true);
      wasOpenByHover.current = true;
    }
  };

  const handleMouseLeave = () => {
    if (wasOpenByHover.current) {
      setOpen(false);
      wasOpenByHover.current = false;
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    navigate('/auth');
  };

  return (
    <>
      <nav
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={`
          h-screen bg-[#fff3e07b] text-[#2C1400] shadow-lg flex flex-col
          transition-all duration-300
          ${open ? 'w-64' : 'w-20'}
          fixed top-0 left-0 z-40
          md:block
        `}
        style={{ minWidth: open ? '16rem' : '5rem' }}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#E06B00]/20">
          <span className="font-bold text-lg" style={{ opacity: open ? 1 : 0, transition: 'opacity 0.2s' }}>
            {open && 'Admin'}
          </span>
          <button
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Collapse Admin Menu' : 'Expand Admin Menu'}
            className="bg-[#FFF3E0] rounded-full shadow p-1 transition"
            type="button"
          >
            {open ? (
              <CloseIcon style={{ color: '#E06B00', fontSize: 28 }} />
            ) : (
              <MenuOpenRounded style={{ color: '#E06B00', fontSize: 28 }} />
            )}
          </button>
        </div>
        <ul className="flex flex-col space-y-2 px-2 pt-4">
          {adminLinks.map(link => {
            const isActive = location.pathname === link.to;
            return (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={`flex items-center gap-3 py-2 px-3 rounded transition font-semibold
                    ${isActive ? 'bg-[#E06B00] text-white' : 'hover:bg-[#E06B00]/10'}
                  `}
                  style={{ color: isActive ? '#FFFFFF' : '#2C1400' }}
                  onClick={() => setOpen(false)}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span
                    className={`whitespace-nowrap transition-all duration-200 ${open ? 'opacity-100 ml-2' : 'opacity-0 w-0 ml-0 overflow-hidden'}`}
                    style={{ width: open ? 'auto' : 0 }}
                  >
                    {open && link.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
  <div
    className="flex flex-col px-4 pb-6 gap-2"
    style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      width: '100%',
      background: 'transparent',
    }}
  >
    <Link
      to="/my-profile"
      className="flex items-center gap-3 py-2 px-3 rounded transition font-semibold hover:bg-[#E06B00]/10"
      style={{ color: '#2C1400' }}
      onClick={() => setOpen(false)}
    >
      <Person className="text-xl" />
      <span
        className={`whitespace-nowrap transition-all duration-200 ${open ? 'opacity-100 ml-2' : 'opacity-0 w-0 ml-0 overflow-hidden'}`}
        style={{ width: open ? 'auto' : 0 }}
      >
        {open && 'Profile'}
      </span>
    </Link>
    <button
      onClick={handleLogout}
      className="flex items-center gap-3 py-2 px-3 rounded transition font-semibold hover:bg-red-100 text-[#E06B00]"
      style={{ color: '#E06B00' }}
      type="button"
    >
      <Logout className="text-xl" />
      <span
        className={`whitespace-nowrap transition-all duration-200 ${open ? 'opacity-100 ml-2' : 'opacity-0 w-0 ml-0 overflow-hidden'}`}
        style={{ width: open ? 'auto' : 0 }}
      >
        {open && 'Logout'}
      </span>
    </button>
  </div>
      </nav>
    </>
  );
};

export default AdminVerticalNavbar;