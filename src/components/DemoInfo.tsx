import React from 'react';
import styled from 'styled-components';
import { MapPin, Flag, Globe, Calendar } from 'lucide-react';

const DemoContainer = styled.div`
  padding: 20px;
`;

const DemoTitle = styled.h3`
  margin: 0 0 16px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FeatureGrid = styled.div`
  display: grid;
  gap: 16px;
  margin-bottom: 24px;
`;

const FeatureCard = styled.div`
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.2s;
  
  &:hover {
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

const FeatureTitle = styled.h4`
  margin: 0;
  color: #333;
  font-size: 16px;
`;

const FeatureDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
  line-height: 1.5;
`;

const StatsContainer = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatNumber = styled.div`
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px;
  opacity: 0.9;
`;



const DemoInfo: React.FC = () => {
  return (
    <DemoContainer>
      <DemoTitle>
        <Globe size={20} />
        Welcome to ISO 3166 Flags Explorer
      </DemoTitle>

      <StatsContainer>
        <h4 style={{ margin: '0 0 16px 0' }}>Dataset Statistics</h4>
        <StatsGrid>
          <StatItem>
            <StatNumber>250</StatNumber>
            <StatLabel>Countries</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>5,046</StatNumber>
            <StatLabel>Subdivisions</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>3,092</StatNumber>
            <StatLabel>Total Flags</StatLabel>
          </StatItem>
          <StatItem>
            <StatNumber>2,842</StatNumber>
            <StatLabel>Regional Flags</StatLabel>
          </StatItem>
        </StatsGrid>
      </StatsContainer>

      <FeatureGrid>
        <FeatureCard>
          <FeatureHeader>
            <Globe size={16} color="#2196F3" />
            <FeatureTitle>Rich Subdivision Data</FeatureTitle>
          </FeatureHeader>
          <FeatureDescription>
            Discover comprehensive information of over 5000 administrative regions/subdivisions including: flags, local names, precise coordinates, parent codes and complete historical change records from the ISO 3166-2 standard.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureHeader>
            <MapPin size={16} color="#4CAF50" />
            <FeatureTitle>Interactive Map</FeatureTitle>
          </FeatureHeader>
          <FeatureDescription>
            Explore countries and regions by via an interactive world map. Zoom, pan and click to learn more about countries and regions or use the dropdowns and search bar.
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureHeader>
            <Flag size={16} color="#FF9800" />
            <FeatureTitle>Comprehensive Flags</FeatureTitle>
          </FeatureHeader>
          <FeatureDescription>
            View the thousands of official flags for countries and their subdivisions, sourced from the comprehensive ISO 3166 flags dataset (<a href="https://github.com/amckenna41/iso3166-flags" target="_blank" rel="noopener noreferrer" style={{ color: '#FF9800', textDecoration: 'underline' }}>https://github.com/amckenna41/iso3166-flags</a>).
          </FeatureDescription>
        </FeatureCard>

        <FeatureCard>
          <FeatureHeader>
            <Calendar size={16} color="#9C27B0" />
            <FeatureTitle>Historical Updates</FeatureTitle>
          </FeatureHeader>
          <FeatureDescription>
            Access historical information about changes to subdivision codes and naming conventions pulled via the ISO 3166 updates dataset (<a href="https://github.com/iso3166-updates" target="_blank" rel="noopener noreferrer" style={{ color: '#9C27B0', textDecoration: 'underline' }}>https://github.com/iso3166-updates</a>).
          </FeatureDescription>
        </FeatureCard>
      </FeatureGrid>
    </DemoContainer>
  );
};

export default DemoInfo;