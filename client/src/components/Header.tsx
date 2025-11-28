import { useState } from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import { CheckSquare, LogOut, Moon, Sun } from "lucide-react";

interface HeaderProps {
  userName?: string;
}

export default function Header({ userName = "User" }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle("dark-mode");
  };

  const initials = userName.slice(0, 2).toUpperCase();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <Navbar className="app-header sticky-top">
      <Container fluid className="px-3 px-sm-4">
        <Navbar.Brand className="d-flex align-items-center gap-2">
          <CheckSquare size={24} className="text-primary" />
          <span className="fw-semibold fs-5" data-testid="text-app-title">
            TaskFlow
          </span>
        </Navbar.Brand>

        <div className="d-flex align-items-center gap-2">
          <Button
            variant="light"
            size="sm"
            onClick={toggleDarkMode}
            className="p-2"
            data-testid="button-theme-toggle"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          
          <div className="d-flex align-items-center gap-2 border-start ps-2 ms-2">
            <div className="avatar rounded-circle d-flex align-items-center justify-content-center">
              {initials}
            </div>
            <span className="fw-medium small d-none d-sm-inline" data-testid="text-username">
              {userName}
            </span>
          </div>

          <Button
            variant="light"
            size="sm"
            onClick={handleLogout}
            className="d-flex align-items-center gap-2"
            data-testid="button-logout"
          >
            <LogOut size={16} />
            <span className="d-none d-sm-inline">Logout</span>
          </Button>
        </div>
      </Container>
    </Navbar>
  );
}
