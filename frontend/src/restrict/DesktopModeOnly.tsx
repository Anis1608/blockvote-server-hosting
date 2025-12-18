import React, { useEffect, useState, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const DesktopModeOnly: React.FC<Props> = ({ children }) => {
  const [isDesktopMode, setIsDesktopMode] = useState<boolean>(false);

  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    // Check if it's a mobile device
    const isMobile = /android|iphone|ipad|mobile/i.test(userAgent);

    // If "Mobile" is not in user agent string but it's a known mobile device, assume desktop mode is on
    const isForcedDesktop = isMobile && !/Mobile/i.test(userAgent);

    // If not mobile OR mobile with desktop mode on
    if (!isMobile || isForcedDesktop) {
      setIsDesktopMode(true);
    }
  }, []);

  if (!isDesktopMode) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gray-100 text-center px-4">
        <h1 className="text-2xl font-semibold mb-4">Please Enable Desktop Mode</h1>
        <p className="text-gray-600 max-w-md">
          This application requires desktop mode on mobile browsers. <br />
          In Chrome, tap the 3-dot menu and enable “Desktop site”.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

export default DesktopModeOnly;
