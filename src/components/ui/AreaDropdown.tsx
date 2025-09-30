import React, { Fragment, useEffect, useRef, useState } from 'react';

import triangle from '@/assets/icons/actions/triangle.svg';
import { Button } from '@/components/ui/button';
import { useAreaSelection } from '@/hooks/useAreaSelection';
import { cn } from '@/lib/utils';

interface AreaDropdownProps {
  buttonText?: string;
  buttonClassName?: string;
  contentClassName?: string;
  childItemClassName?: string;
  triangleIcon?: string;
  onSelectionChange?: (selectedAreas: string[]) => void;

  selectedAreas?: string[];
  onSelectedAreasChange?: (areas: string[]) => void;
}

// Hardcoded area hierarchy for better performance
const areaHierarchy: { [key: string]: string[] } = {
  쌍문동: ['쌍문 1동', '쌍문 2동', '쌍문 3동', '쌍문 4동'],
  방학동: ['방학 1동', '방학 3동'],
};

export const AreaDropdown: React.FC<AreaDropdownProps> = ({
  buttonText = '구역 선택',
  buttonClassName = 'flex items-center shadow-none outline-none border-[#575757] focus:border-[#575757] mr-2',
  contentClassName = 'w-28 !p-0',
  childItemClassName = 'pl-10 bg-f0f0f0 rounded-none',
  triangleIcon = triangle,
  onSelectionChange,
  selectedAreas: controlledSelectedAreas,
  onSelectedAreasChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Internal state for uncontrolled mode
  const {
    selectedAreas: internalSelectedAreas,
    selectAll,
    deselectAll,
    toggleArea,
  } = useAreaSelection({
    areaHierarchy,
    initialSelectedAreas: [],
  });

  // Use controlled state if provided, otherwise use internal state
  const selectedAreas = controlledSelectedAreas ?? internalSelectedAreas;

  // Calculate total number of items for select all logic
  const allItems =
    Object.values(areaHierarchy).flat().length +
    Object.keys(areaHierarchy).length;

  // Get all areas (parents + children)
  const getAllAreas = () => {
    const allAreas: string[] = [];
    Object.entries(areaHierarchy).forEach(([parent, children]) => {
      allAreas.push(parent, ...children);
    });
    return allAreas;
  };

  const handleSelectAll = () => {
    if (selectedAreas.length === allItems) {
      // Deselect all
      if (onSelectedAreasChange) {
        onSelectedAreasChange([]);
      } else {
        deselectAll();
      }
    } else {
      // Select all
      if (onSelectedAreasChange) {
        onSelectedAreasChange(getAllAreas());
      } else {
        selectAll();
      }
    }
  };

  const handleAreaToggle = (area: string) => {
    if (onSelectedAreasChange) {
      // Controlled mode - calculate next state manually
      let newAreas: string[];

      if (selectedAreas.includes(area)) {
        // If it's a parent area, remove it and all its children
        if (areaHierarchy[area]) {
          newAreas = selectedAreas.filter(
            (a) => a !== area && !areaHierarchy[area].includes(a)
          );
        } else {
          // If it's a child area, just remove it
          newAreas = selectedAreas.filter((a) => a !== area);
        }
      } else {
        // If it's a parent area, add it and all its children
        if (areaHierarchy[area]) {
          newAreas = [...selectedAreas, area, ...areaHierarchy[area]];
          newAreas = [...new Set(newAreas)]; // Remove duplicates
        } else {
          // If it's a child area, just add it
          newAreas = [...selectedAreas, area];
        }
      }

      // Update parent areas based on their children's selection state
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

      onSelectedAreasChange(newAreas);
    } else {
      // Uncontrolled mode - use existing hook
      toggleArea(area);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Notify parent component when selection changes
  useEffect(() => {
    if (onSelectionChange) {
      onSelectionChange(selectedAreas);
    }
  }, [selectedAreas, onSelectionChange]);

  const handleTriggerClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div ref={dropdownRef} className="relative">
      <Button
        variant="outline"
        size="sm"
        className={buttonClassName}
        onClick={handleTriggerClick}
      >
        <span className="text-sm">{buttonText}</span>
        <img src={triangleIcon} alt={`${buttonText} 드롭다운`} />
      </Button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full right-0 md:left-0 mt-1 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
            contentClassName
          )}
        >
          <div className="relative flex cursor-default select-none items-center justify-between px-3 rounded-sm py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground pr-6">
            <input
              id="checkbox-allAreas"
              type="checkbox"
              checked={selectedAreas.length === allItems}
              onChange={handleSelectAll}
              className="accent-[#656565]"
            />
            <label htmlFor="checkbox-allAreas">
              {selectedAreas.length === allItems ? '전체 해제' : '전체 선택'}
            </label>
          </div>

          {Object.entries(areaHierarchy).map(([parentArea, childAreas]) => (
            <Fragment key={parentArea}>
              {/* Parent area */}
              <div className="relative flex cursor-pointer select-none items-center rounded-sm justify-between px-3 py-1.5 pr-8 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground">
                <input
                  id={`checkbox-${parentArea}`}
                  type="checkbox"
                  checked={selectedAreas.includes(parentArea)}
                  onChange={() => handleAreaToggle(parentArea)}
                  className="mr-2 accent-[#656565]"
                />
                <label htmlFor={`checkbox-${parentArea}`}>{parentArea}</label>
              </div>

              {/* Child areas */}
              {childAreas.map((childArea) => (
                <div
                  key={childArea}
                  className={cn(
                    'relative flex cursor-pointer select-none items-center rounded-sm py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground',
                    childItemClassName
                  )}
                >
                  <input
                    type="checkbox"
                    id={`checkbox-${childArea}`}
                    checked={selectedAreas.includes(childArea)}
                    onChange={() => handleAreaToggle(childArea)}
                    className="-ml-2 mr-3 accent-[#656565]"
                  />
                  <label htmlFor={`checkbox-${childArea}`}>{childArea}</label>
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
