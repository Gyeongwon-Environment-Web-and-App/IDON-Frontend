import MapSideMenu from "@/components/map/MapSideMenu";
import { SidebarProvider } from "@/components/ui/sidebar";

interface MapOverviewProps {
  onLogout: () => void;
}

export default function MapOverview({ onLogout }: MapOverviewProps) {
  return (
    <div className="h-screen w-screen bg-lighter-green">
      <SidebarProvider>
        <MapSideMenu />
      </SidebarProvider>
    </div>
  );
}
