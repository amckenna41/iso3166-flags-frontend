import React from 'react';
import styled from 'styled-components';
import { MapPin, Mouse, Search, Flag, ChevronDown } from 'lucide-react';

const GuideContainer = styled.div`
  padding: 20px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  margin-top: 20px;
`;

const GuideTitle = styled.h4`
  margin: 0 0 16px 0;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StepList = styled.div`
  display: grid;
  gap: 12px;
`;

const Step = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e9ecef;
`;

const StepIcon = styled.div`
  background: #667eea;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StepContent = styled.div`
  flex: 1;
`;

const StepTitle = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
`;

const StepDescription = styled.div`
  font-size: 13px;
  color: #666;
  line-height: 1.4;
`;

const SampleCountries = styled.div`
  margin-top: 16px;
  padding: 16px;
  background: #e3f2fd;
  border-radius: 6px;
  border: 1px solid #bbdefb;
`;

const SampleTitle = styled.div`
  font-weight: 500;
  color: #1976d2;
  margin-bottom: 8px;
  font-size: 14px;
`;

const CountryList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const CountryTag = styled.span`
  background: white;
  color: #1976d2;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid #bbdefb;
`;

const UsageGuide: React.FC = () => {
  return (
    <GuideContainer>
      <GuideTitle>
        <Mouse size={16} />
        How to Use
      </GuideTitle>

      <StepList>
        <Step>
          <StepIcon>
            <Mouse size={16} />
          </StepIcon>
          <StepContent>
            <StepTitle>Explore the Map</StepTitle>
            <StepDescription>
              Hover over countries to see their flags and official ISO 3166-2 subdivision codes. Use your mouse to pan around and zoom in/out.
            </StepDescription>
          </StepContent>
        </Step>

        <Step>
          <StepIcon>
            <MapPin size={16} />
          </StepIcon>
          <StepContent>
            <StepTitle>Select a Country</StepTitle>
            <StepDescription>
              Click on any country to view detailed information about its subdivisions and regional flags.
            </StepDescription>
          </StepContent>
        </Step>

        <Step>
          <StepIcon>
            <ChevronDown size={16} />
          </StepIcon>
          <StepContent>
            <StepTitle>Select a Subdivision</StepTitle>
            <StepDescription>
              Once a country is selected, use the subdivision dropdown that appears to browse and select specific regions within that country. The dropdown includes search functionality to quickly find subdivisions by name or code.
            </StepDescription>
          </StepContent>
        </Step>

        <Step>
          <StepIcon>
            <Search size={16} />
          </StepIcon>
          <StepContent>
            <StepTitle>Search Subdivisions</StepTitle>
            <StepDescription>
              Use the search box to find specific regions or subdivisions across all countries.
            </StepDescription>
          </StepContent>
        </Step>

        <Step>
          <StepIcon>
            <Flag size={16} />
          </StepIcon>
          <StepContent>
            <StepTitle>Discover Flags & Data</StepTitle>
            <StepDescription>
              Explore comprehensive subdivision information including flags, local names, coordinates, administrative types, parent codes, flag URLs, and historical changes.
            </StepDescription>
          </StepContent>
        </Step>
      </StepList>

      <SampleCountries>
        <SampleTitle>Try These Countries (Rich Subdivision Data):</SampleTitle>
        <CountryList>
          <CountryTag>United States</CountryTag>
          <CountryTag>Germany</CountryTag>
          <CountryTag>Canada</CountryTag>
          <CountryTag>Australia</CountryTag>
          <CountryTag>Japan</CountryTag>
          <CountryTag>Brazil</CountryTag>
          <CountryTag>United Kingdom</CountryTag>
          <CountryTag>France</CountryTag>
        </CountryList>
      </SampleCountries>
    </GuideContainer>
  );
};

export default UsageGuide;