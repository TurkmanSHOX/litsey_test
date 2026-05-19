import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box
} from '@mui/material'
import { LayoutDashboard, School, User, ShieldCheck } from 'lucide-react'

const Sidebar = ({ open, onClose }) => {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { text: 'Dashboard', icon: <LayoutDashboard />, path: '/dashboard' },
    { text: 'Kurslar', icon: <School />, path: '/home' },
    { text: 'Profil', icon: <User />, path: '/profile' },
  ]

  const adminItems = [
    { text: 'Admin Panel', icon: <ShieldCheck />, path: '/admin' },
  ]

  const handleNavigate = (path, external = false) => {
    if (external) {
      window.location.href = path
    } else {
      navigate(path)
      onClose()
    }
  }

  const drawer = (
    <Box sx={{ width: 250 }}>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigate(item.path, item.external)}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}

        {isAdmin && (
          <>
            <Divider />
            {adminItems.map((item) => (
              <ListItem key={item.text} disablePadding>
                <ListItemButton
                  selected={location.pathname === item.path}
                  onClick={() => handleNavigate(item.path, item.external)}
                >
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            ))}
          </>
        )}
      </List>
    </Box>
  )

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          backgroundColor: 'background.paper',
          color: 'text.primary'
        }
      }}
    >
      {drawer}
    </Drawer>
  )
}

export default Sidebar
