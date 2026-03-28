import { RNPlugin, PluginRem } from '@remnote/plugin-sdk';
import { TreeNode } from './interfaces';

export async function buildDocumentTree(plugin: RNPlugin): Promise<TreeNode[]> {
  const allRem = await plugin.rem.getAll();

  // Filter to documents and folders
  const docFolderRems: PluginRem[] = [];
  for (const rem of allRem) {
    if ((await rem.isDocument()) || (await rem.isFolder())) {
      docFolderRems.push(rem);
    }
  }

  // Resolve names and find IDs to exclude (ARCHIVE folder and descendants)
  const nameById = new Map<string, string>();
  for (const rem of docFolderRems) {
    const name = rem.text ? await plugin.richText.toString(rem.text) : '(untitled)';
    nameById.set(rem._id, name);
  }

  // Collect IDs of ARCHIVE folders
  const excludedIds = new Set<string>();
  for (const rem of docFolderRems) {
    if (nameById.get(rem._id) === 'ARCHIVE') {
      excludedIds.add(rem._id);
    }
  }

  // Propagate exclusion to all descendants
  let changed = true;
  while (changed) {
    changed = false;
    for (const rem of docFolderRems) {
      if (!excludedIds.has(rem._id) && rem.parent && excludedIds.has(rem.parent)) {
        excludedIds.add(rem._id);
        changed = true;
      }
    }
  }

  // Filter out excluded rems
  const filteredRems = docFolderRems.filter((rem) => !excludedIds.has(rem._id));

  // Build lookup maps
  const remById = new Map<string, PluginRem>();
  const childrenMap = new Map<string, string[]>();
  const docFolderIds = new Set<string>();

  for (const rem of filteredRems) {
    remById.set(rem._id, rem);
    docFolderIds.add(rem._id);
  }

  // Group children by parent
  for (const rem of filteredRems) {
    const parentId = rem.parent;
    if (parentId && docFolderIds.has(parentId)) {
      const siblings = childrenMap.get(parentId) || [];
      siblings.push(rem._id);
      childrenMap.set(parentId, siblings);
    }
  }

  // Find root nodes (no parent or parent not in our set)
  const rootIds = filteredRems
    .filter((rem) => !rem.parent || !docFolderIds.has(rem.parent))
    .map((rem) => rem._id);

  // Recursively build tree
  async function buildNode(id: string, depth: number): Promise<TreeNode> {
    const name = nameById.get(id) || '(untitled)';
    const childIds = childrenMap.get(id) || [];
    const children: TreeNode[] = [];
    for (const childId of childIds) {
      children.push(await buildNode(childId, depth + 1));
    }
    children.sort((a, b) => a.name.localeCompare(b.name));
    return { id, name, children, depth };
  }

  const roots: TreeNode[] = [];
  for (const rootId of rootIds) {
    roots.push(await buildNode(rootId, 0));
  }
  roots.sort((a, b) => a.name.localeCompare(b.name));
  return roots;
}
