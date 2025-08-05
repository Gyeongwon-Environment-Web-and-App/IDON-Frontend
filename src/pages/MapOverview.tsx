import MapSideMenu from "@/components/MapSideMenu";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function MapOverview() {
  console.log("map overview");
  return (
    <div className="h-screen w-screen bg-lighter-green">
      <SidebarProvider>
        <MapSideMenu />
      </SidebarProvider>
    </div>
  );
}
