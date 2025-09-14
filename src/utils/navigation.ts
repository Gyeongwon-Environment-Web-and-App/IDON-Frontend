// Navigation utility functions for complaint routing

/**
 * Navigate to complaint list view
 */
export const navigateToComplaintList = (navigate: (path: string) => void) => {
  navigate("/map/overview/complaints");
};

/**
 * Navigate to specific complaint detail view
 */
export const navigateToComplaintDetail = (
  navigate: (path: string) => void,
  complaintId: string
) => {
  navigate(`/map/overview/complaints/${complaintId}`);
};

/**
 * Navigate back to map overview
 */
export const navigateToMapOverview = (navigate: (path: string) => void) => {
  navigate("/map/overview");
};

/**
 * Check if current path is complaint list
 */
export const isComplaintListPath = (pathname: string): boolean => {
  return pathname === "/map/overview/complaints";
};

/**
 * Check if current path is complaint detail
 */
export const isComplaintDetailPath = (pathname: string): boolean => {
  return (
    pathname.includes("/map/overview/complaints/") &&
    pathname !== "/map/overview/complaints"
  );
};

/**
 * Extract complaint ID from pathname
 */
export const extractComplaintIdFromPath = (pathname: string): string | null => {
  const match = pathname.match(/\/map\/overview\/complaints\/(.+)$/);
  return match ? match[1] : null;
};
