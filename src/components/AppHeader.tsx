import React from 'react';
import styled from 'styled-components';
import { Github, Info } from 'lucide-react';

const HeaderContainer = styled.header`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%);
  backdrop-filter: blur(10px);
  color: white;
  padding: 14px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-height: 52px;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 36px;
  font-weight: 600;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 600;
`;

const Navigation = styled.nav`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const NavLink = styled.a`
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
  font-size: 18px;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

const InfoButton = styled.button`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: rgba(255, 255, 255, 0.3);
  }
`;

interface AppHeaderProps {
  onInfoClick?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ onInfoClick }) => {
  return (
    <HeaderContainer>
      <Logo>
        <span>🌍</span>
        <div>
          <Title>ISO 3166 Flags Explorer</Title>
        </div>
      </Logo>

      <Navigation>
        <NavLink 
          href="https://github.com/amckenna41/iso3166-flags" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Github size={20} />
          Flags Dataset
        </NavLink>
        <NavLink 
          href="https://github.com/amckenna41/iso3166-2" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Github size={20} />
          Subdivision Data
        </NavLink>
        <NavLink 
          href="https://iso3166-2-api.vercel.app/api" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          <Github size={20} />
          Subdivision API
        </NavLink>
        {onInfoClick && (
          <InfoButton onClick={onInfoClick}>
            <Info size={16} />
            About
          </InfoButton>
        )}
      </Navigation>
    </HeaderContainer>
  );
};

export default AppHeader;