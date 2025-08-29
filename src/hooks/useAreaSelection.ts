import { useState, useCallback } from "react";

interface AreaHierarchy {
  [parentArea: string]: string[];
}

interface UseAreaSelectionProps {
  areaHierarchy: AreaHierarchy;
  initialSelectedAreas?: string[];
}

export const useAreaSelection = ({
  areaHierarchy,
  initialSelectedAreas = [],
}: UseAreaSelectionProps) => {
  const [selectedAreas, setSelectedAreas] =
    useState<string[]>(initialSelectedAreas);

  // Get all areas (parents + children)
  const getAllAreas = useCallback(() => {
    const allAreas: string[] = [];
    Object.entries(areaHierarchy).forEach(([parent, children]) => {
      allAreas.push(parent, ...children);
    });
    return allAreas;
  }, [areaHierarchy]);

  // Select all areas
  const selectAll = useCallback(() => {
    setSelectedAreas(getAllAreas());
  }, [getAllAreas]);

  // Deselect all areas
  const deselectAll = useCallback(() => {
    setSelectedAreas([]);
  }, []);

  // Toggle individual area
  const toggleArea = useCallback(
    (area: string) => {
      setSelectedAreas((prev) => {
        let newAreas: string[];

        if (prev.includes(area)) {
          // If it's a parent area, remove it and all its children
          if (areaHierarchy[area]) {
            newAreas = prev.filter(
              (a) => a !== area && !areaHierarchy[area].includes(a)
            );
          } else {
            // If it's a child area, just remove it
            newAreas = prev.filter((a) => a !== area);
          }
        } else {
          // If it's a parent area, add it and all its children
          if (areaHierarchy[area]) {
            newAreas = [...prev, area, ...areaHierarchy[area]];
            newAreas = [...new Set(newAreas)]; // Remove duplicates
          } else {
            // If it's a child area, just add it
            newAreas = [...prev, area];
          }
        }

        // Update parent areas based on their children's selection state
        // Parent is selected only when ALL children are selected
        // Parent is deselected when ANY child is deselected
        Object.entries(areaHierarchy).forEach(([parent, children]) => {
          const allChildrenSelected = children.every((child) =>
            newAreas.includes(child)
          );

          if (allChildrenSelected && !newAreas.includes(parent)) {
            // All children are selected, so select the parent
            newAreas.push(parent);
          } else if (!allChildrenSelected && newAreas.includes(parent)) {
            // Not all children are selected, so deselect the parent
            newAreas = newAreas.filter((a) => a !== parent);
          }
        });

        return newAreas;
      });
    },
    [areaHierarchy]
  );

  return {
    selectedAreas,
    selectAll,
    deselectAll,
    toggleArea,
    getAllAreas,
  };
};
