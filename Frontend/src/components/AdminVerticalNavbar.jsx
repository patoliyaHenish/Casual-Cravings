import { Category, CategoryOutlined, ExpandMore, Group, Logout, Person, Settings } from '@mui/icons-material';
import React, { useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useLogoutUserMutation } from '../features/api/authApi';

const adminLinks = [
  {
    label: 'Manage Recipe Category',
    icon: <Settings />,
    subItems: [
      { to: '/admin/manage-recipe-category', label: 'Manage Category', icon: <Category /> },
      { to: '/admin/subcategories', label: 'Manage Sub Category', icon: <CategoryOutlined /> }
    ]
  },
];

const AdminVerticalNavbar = ({ open, setOpen }) => {
  const location = useLocation();
  const wasOpenByHover = useRef(false);
  const { user, setUser } = useUser();
  const [logoutUser] = useLogoutUserMutation();
  const navigate = useNavigate();

  const [submenuOpen, setSubmenuOpen] = useState(null);

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
      setSubmenuOpen(null);
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
    ${open ? 'w-80' : 'w-20'}
    ${open ? 'block' : 'hidden'}
    fixed md:static md:block
    top-0 left-0 z-50
  `}
        style={{
          minWidth: open ? '16rem' : '5rem',
          height: '100vh',
          ...(window.innerWidth < 768 && !open ? { display: 'none' } : {}),
        }}
      >

        <ul className="flex flex-col space-y-2 px-2 pt-20">
          {adminLinks.map(link => {
            if (link.subItems) {
              const isAnySubActive = link.subItems.some(sub => location.pathname === sub.to);
              const isOpen = submenuOpen === link.label;
              return (
                <li key={link.label} className="relative">
                  <div
                    className={`flex items-center gap-3 py-2 px-3 rounded transition font-semibold cursor-pointer
                      ${isAnySubActive ? 'bg-[#E06B00] text-white' : 'hover:bg-[#E06B00]/10'}
                    `}
                    style={{ color: isAnySubActive ? '#FFFFFF' : '#2C1400' }}
                    onClick={() => setSubmenuOpen(isOpen ? null : link.label)}
                  >
                    <span className="text-xl">{link.icon}</span>
                    <span
                      className={`whitespace-nowrap transition-all duration-200 ${open ? 'opacity-100 ml-2' : 'opacity-0 w-0 ml-0 overflow-hidden'}`}
                    >
                      {open && link.label}
                    </span>
                    {open && (
                      <ExpandMore
                        className={`ml-auto transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fontSize="small"
                      />
                    )}
                  </div>
                   {open && isOpen && (
                  <ul
                    className="mt-1 bg-white shadow rounded flex flex-col gap-1 py-2 z-40
                      transition-all duration-300
                      origin-top
                      animate-dropdown"
                    style={{
                      maxHeight: isOpen ? '500px' : '0px',
                      opacity: isOpen ? 1 : 0,
                      overflow: 'hidden',
                      transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
                      minWidth: open ? '19rem' : '5rem',
                      width: open ? '19rem' : '5rem',  
                    }}
                  >
                    {link.subItems.map(sub => {
                      const isSubActive = location.pathname === sub.to;
                      return (
                        <li key={sub.to}>
                          <Link
                            to={sub.to}
                            className={`flex items-center gap-2 py-1 px-4 rounded transition font-medium
                              ${isSubActive ? 'bg-[#E06B00] text-white' : 'hover:bg-[#E06B00]/10'}
                            `}
                            style={{ color: isSubActive ? '#FFFFFF' : '#2C1400' }}
                            onClick={() => {
                              setOpen(false);
                              setSubmenuOpen(null);
                            }}
                          >
                            <span className="text-lg">{sub.icon}</span>
                            <span className="whitespace-nowrap">{sub.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
                </li>
              );
            }
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
          className="flex flex-col px-2 pb-6 gap-2"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            background: 'transparent',
          }}
        >
          <Link
            to="/my-profile"
            className={`flex items-center gap-3 py-2 px-3 rounded transition font-semibold
    ${location.pathname === '/my-profile' ? 'bg-[#E06B00] text-white' : 'hover:bg-[#E06B00]/10'}
  `}
            style={{ color: location.pathname === '/my-profile' ? '#FFFFFF' : '#2C1400' }}
            onClick={() => setOpen(false)}
          >
            <Person className="text-xl" />
            <span
              className={`whitespace-nowrap transition-all duration-200 ${open ? 'opacity-100 ml-2' : 'opacity-0 w-0 ml-0 overflow-hidden'}`}
            >
              {open && 'Profile'}
            </span>
          </Link>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 py-2 px-3 rounded transition font-semibold
    hover:bg-[#E06B00]/10 text-[#2C1400]'
  `}
            style={{ color: '#2C1400' }}
            type="button"
          >
            <Logout className="text-xl" />
            <span
              className={`whitespace-nowrap transition-all duration-200 ${open ? 'opacity-100 ml-2' : 'opacity-0 w-0 ml-0 overflow-hidden'}`}
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