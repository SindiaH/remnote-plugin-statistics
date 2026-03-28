import { useState, useRef, useEffect, useCallback } from 'react';
import { TreeNode } from '../shared/interfaces';

interface DocumentFilterDropdownProps {
  treeNodes: TreeNode[];
  selectedId: string | null;
  onSelect: (id: string | null, name: string | null) => void;
}

export const DocumentFilterDropdown = ({
  treeNodes,
  selectedId,
  onSelect,
}: DocumentFilterDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find the selected node name on mount / when selectedId changes
  useEffect(() => {
    if (!selectedId) {
      setSelectedName(null);
      return;
    }
    const findName = (nodes: TreeNode[]): string | null => {
      for (const node of nodes) {
        if (node.id === selectedId) return node.name;
        const found = findName(node.children);
        if (found) return found;
      }
      return null;
    };
    setSelectedName(findName(treeNodes));
  }, [selectedId, treeNodes]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleExpand = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleSelect = useCallback(
    (id: string | null, name: string | null) => {
      setSelectedName(name);
      onSelect(id, name);
      setIsOpen(false);
    },
    [onSelect],
  );

  const renderNode = (node: TreeNode): JSX.Element => {
    const hasChildren = node.children.length > 0;
    const isExpanded = expandedIds.has(node.id);
    const isSelected = node.id === selectedId;

    return (
      <div key={node.id}>
        <div
          className={`filter-dropdown-item ${isSelected ? 'filter-dropdown-item--selected' : ''}`}
          style={{ paddingLeft: node.depth * 16 + 8 }}
          onClick={() => handleSelect(node.id, node.name)}
        >
          {hasChildren ? (
            <span
              className="filter-dropdown-chevron"
              onClick={(e) => toggleExpand(node.id, e)}
            >
              {isExpanded ? '▾' : '▸'}
            </span>
          ) : (
            <span className="filter-dropdown-chevron-placeholder" />
          )}
          <span className="filter-dropdown-item-label">{node.name}</span>
        </div>
        {hasChildren && isExpanded && node.children.map(renderNode)}
      </div>
    );
  };

  return (
    <div className="filter-dropdown" ref={dropdownRef}>
      <button
        className="filter-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selectedName || 'Alle Dokumente'}
        <span className="filter-dropdown-arrow">{isOpen ? '▴' : '▾'}</span>
      </button>
      {isOpen && (
        <div className="filter-dropdown-panel">
          <div
            className={`filter-dropdown-item ${selectedId === null ? 'filter-dropdown-item--selected' : ''}`}
            style={{ paddingLeft: 8 }}
            onClick={() => handleSelect(null, null)}
          >
            <span className="filter-dropdown-chevron-placeholder" />
            <span className="filter-dropdown-item-label">Alle Dokumente</span>
          </div>
          {treeNodes.map(renderNode)}
        </div>
      )}
    </div>
  );
};
