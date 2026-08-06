import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Globe,
  Compass,
  Users,
  ExternalLink,
  Flag,
  Calendar,
  Code,
  Copy,
  Check,
  Link2,
} from 'lucide-react';
import { iso3166Service, SubdivisionData } from '../services/iso3166Service';
import APP_CONFIG from '../config/appConfig';

// ── Styled components ─────────────────────────────────────────────────────────

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideIn 0.3s ease-out;
  position: relative;

  @keyframes modalSlideIn {
    from {
      opacity: 0;
      transform: scale(0.9) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  padding: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px 16px 0 0;
  position: relative;
`;

const ModalCloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const ModalFooter = styled.div`
  position: sticky;
  bottom: 0;
  background: white;
  border-top: 1px solid #e9ecef;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-radius: 0 0 16px 16px;
`;

const NavButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  background: #667eea;
  color: white;
  border: 1px solid #667eea;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 110px;
  max-width: 200px;
  overflow: hidden;

  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &:hover:not(:disabled) {
    background: #5a6fd6;
    border-color: #5a6fd6;
  }

  &:disabled {
    background: #f8f9fa;
    color: #adb5bd;
    border-color: #dee2e6;
    cursor: not-allowed;
  }
`;

const NavPlaceholder = styled.div`
  min-width: 110px;
  max-width: 200px;
`;

const NavCounter = styled.span`
  font-size: 13px;
  color: #6c757d;
  white-space: nowrap;
  flex-shrink: 0;
`;

const FooterCenter = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
`;

const ShareButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: none;
  border: 1px solid #dee2e6;
  border-radius: 5px;
  font-size: 12px;
  color: #6c757d;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;

  &:hover {
    border-color: #667eea;
    color: #667eea;
  }
`;

const InlineCopyButton = styled.button`
  background: none;
  border: none;
  padding: 2px 5px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.6);
  display: inline-flex;
  align-items: center;
  border-radius: 3px;
  transition: all 0.15s;
  margin-left: 4px;
  vertical-align: middle;

  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.15);
  }
`;

const ModalFlagPlaceholder = styled.div`
  width: 120px;
  height: 90px;
  border: 2px dashed rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  opacity: 0.7;
`;

const SwipeHint = styled.div`
  display: none;

  @media (pointer: coarse) {
    display: block;
    font-size: 11px;
    color: #adb5bd;
    text-align: center;
    margin-top: 2px;
    letter-spacing: 0.2px;
  }
`;

const ModalTitle = styled.h2`
  margin: 0 50px 8px 0;
  font-size: 28px;
  font-weight: 600;
`;

const ModalSubtitle = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
`;

const ModalFlag = styled.img`
  width: 120px;
  height: 90px;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const ModalDetailGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ModalDetailItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;

  .icon {
    color: #667eea;
    flex-shrink: 0;
    margin-top: 2px;
  }

  .content {
    flex: 1;
  }

  .label {
    font-weight: 600;
    color: #333;
    font-size: 14px;
    display: block;
    margin-bottom: 4px;
  }

  .value {
    color: #666;
    font-size: 14px;
    line-height: 1.4;
  }
`;

const ModalSection = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ModalSectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// ── Types ─────────────────────────────────────────────────────────────────────

interface SubdivisionModalProps {
  subdivision: SubdivisionData;
  subdivisions: SubdivisionData[];
  currentIndex: number;
  countryCode: string;
  onClose: () => void;
  onNavigateNext: () => void;
  onNavigatePrevious: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

const SubdivisionModal: React.FC<SubdivisionModalProps> = ({
  subdivision,
  subdivisions,
  currentIndex,
  countryCode,
  onClose,
  onNavigateNext,
  onNavigatePrevious,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [flagError, setFlagError] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const flagUrl =
    subdivision.flag ||
    iso3166Service.getSubdivisionFlagUrl(countryCode, subdivision.code);

  // Reset flag error when subdivision changes, and scroll the card back to its
  // top so navigating next/previous never lands mid-way down the new content.
  useEffect(() => {
    setFlagError(false);
    // ponytail: scrollTop over scrollTo() — a plain property, so no jsdom guard.
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [subdivision.code]);

  // Move focus into the dialog on open and restore it to whatever was focused
  // before, so keyboard users are not dumped at the top of the document.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();
    return () => {
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, []);

  // Keyboard navigation, plus a focus trap so Tab cannot escape to the page
  // behind the overlay while the dialog is open.
  useEffect(() => {
    if (!APP_CONFIG.features.enableKeyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); onNavigatePrevious(); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); onNavigateNext(); return; }
      if (e.key !== 'Tab') return;

      const focusable = contentRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNavigateNext, onNavigatePrevious]);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 1500);
    }).catch(() => {});
  };

  const copyShareLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?country=${countryCode.toUpperCase()}&subdivision=${subdivision.code}`;
    navigator.clipboard.writeText(url).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }).catch(() => {});
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;
    // Only fire on predominantly horizontal swipes above a 50px threshold
    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY) * 1.5) return;
    if (deltaX < 0 && currentIndex < subdivisions.length - 1) onNavigateNext();
    if (deltaX > 0 && currentIndex > 0) onNavigatePrevious();
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="subdivision-modal-title"
        onClick={e => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <ModalHeader>
          <ModalCloseButton ref={closeButtonRef} onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </ModalCloseButton>
          <ModalTitle id="subdivision-modal-title">
            {subdivision.name}
            <span style={{ opacity: 0.6, margin: '0 8px' }}>·</span>
            <span style={{ fontFamily: 'monospace' }}>{subdivision.code}</span>
            <InlineCopyButton
              onClick={() => copyCode(subdivision.code)}
              title="Copy subdivision code"
            >
              {copiedCode === subdivision.code ? <Check size={14} /> : <Copy size={14} />}
            </InlineCopyButton>
          </ModalTitle>
          <ModalSubtitle>
            {flagError ? (
              <ModalFlagPlaceholder>🏳</ModalFlagPlaceholder>
            ) : (
              <ModalFlag
                src={flagUrl}
                alt={`${subdivision.name} flag`}
                loading="lazy"
                onError={() => setFlagError(true)}
              />
            )}
          </ModalSubtitle>
        </ModalHeader>

        <ModalBody>
          <ModalDetailGrid>
            <ModalDetailItem>
              <MapPin className="icon" size={16} />
              <div className="content">
                <span className="label">Type</span>
                <span className="value">{subdivision.type}</span>
              </div>
            </ModalDetailItem>

            <ModalDetailItem>
              <Globe className="icon" size={16} />
              <div className="content">
                <span className="label">Local/Other Name</span>
                <span className="value">
                  {subdivision.localOtherName || 'Not available'}
                </span>
              </div>
            </ModalDetailItem>

            <ModalDetailItem>
              <Compass className="icon" size={16} />
              <div className="content">
                <span className="label">Coordinates</span>
                <span className="value">
                  {subdivision.latLng && subdivision.latLng.length === 2 ? (
                    <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                      {Math.abs(subdivision.latLng[0]).toFixed(6)}°
                      {subdivision.latLng[0] >= 0 ? 'N' : 'S'},{' '}
                      {Math.abs(subdivision.latLng[1]).toFixed(6)}°
                      {subdivision.latLng[1] >= 0 ? 'E' : 'W'}
                    </span>
                  ) : (
                    'Not available'
                  )}
                </span>
              </div>
            </ModalDetailItem>

            <ModalDetailItem>
              <Users className="icon" size={16} />
              <div className="content">
                <span className="label">Parent Code</span>
                <span className="value">
                  {subdivision.parentCode || 'None'}
                </span>
              </div>
            </ModalDetailItem>
          </ModalDetailGrid>

          <ModalSection>
            <ModalSectionTitle>
              <ExternalLink size={16} />
              Flag Information
            </ModalSectionTitle>
            <ModalDetailItem>
              <Flag className="icon" size={16} />
              <div className="content">
                <span className="label">Flag URL</span>
                <span className="value">
                  <a
                    href={flagUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: '#667eea',
                      textDecoration: 'none',
                      wordBreak: 'break-all',
                    }}
                  >
                    {flagUrl}
                  </a>
                </span>
              </div>
            </ModalDetailItem>
          </ModalSection>

          {subdivision.history && subdivision.history.length > 0 && (
            <ModalSection>
              <ModalSectionTitle>
                <Calendar size={16} />
                History ({subdivision.history.length}{' '}
                {subdivision.history.length === 1 ? 'entry' : 'entries'})
              </ModalSectionTitle>
              <div
                style={{
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  padding: '16px',
                }}
              >
                {subdivision.history.map((entry, index) => (
                  <div
                    key={index}
                    style={{
                      marginBottom:
                        index < subdivision.history!.length - 1 ? '8px' : '0',
                      fontSize: '14px',
                      color: '#666',
                    }}
                  >
                    {entry['Date Issued'] && (
                      <div>
                        <strong>Date:</strong> {entry['Date Issued']}
                      </div>
                    )}
                    {entry.Change && (
                      <div>
                        <strong>Change:</strong> {entry.Change}
                      </div>
                    )}
                    {entry['Description of Change'] && (
                      <div>
                        <strong>Description:</strong>{' '}
                        {entry['Description of Change']}
                      </div>
                    )}
                    {entry.Source && (
                      <div>
                        <strong>Source:</strong> {entry.Source}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </ModalSection>
          )}

          <ModalSection>
            <ModalSectionTitle>
              <Code size={16} />
              Raw JSON Data
            </ModalSectionTitle>
            <div
              style={{
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                padding: '16px',
                fontFamily: 'monospace',
                fontSize: '12px',
                maxHeight: '300px',
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                color: '#495057',
              }}
            >
              {JSON.stringify(subdivision, null, 2)}
            </div>
          </ModalSection>
        </ModalBody>

        <ModalFooter>
          {currentIndex > 0 ? (
            <NavButton
              onClick={onNavigatePrevious}
              aria-label="Previous subdivision"
              title={`${subdivisions[currentIndex - 1].code}: ${subdivisions[currentIndex - 1].name}`}
            >
              <ChevronLeft size={16} />
              <span>{subdivisions[currentIndex - 1].code}: {subdivisions[currentIndex - 1].name}</span>
            </NavButton>
          ) : (
            <NavPlaceholder />
          )}

          <FooterCenter>
            <NavCounter>
              {currentIndex + 1} / {subdivisions.length}
            </NavCounter>
            <ShareButton onClick={copyShareLink} title="Copy link to this subdivision">
              {linkCopied ? <Check size={12} /> : <Link2 size={12} />}
              {linkCopied ? 'Copied!' : 'Copy link'}
            </ShareButton>
            <SwipeHint>← swipe to navigate →</SwipeHint>
          </FooterCenter>

          {currentIndex < subdivisions.length - 1 ? (
            <NavButton
              onClick={onNavigateNext}
              aria-label="Next subdivision"
              title={`${subdivisions[currentIndex + 1].code}: ${subdivisions[currentIndex + 1].name}`}
            >
              <span>{subdivisions[currentIndex + 1].code}: {subdivisions[currentIndex + 1].name}</span>
              <ChevronRight size={16} />
            </NavButton>
          ) : (
            <NavPlaceholder />
          )}
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default SubdivisionModal;
