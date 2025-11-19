export interface MindMapNode {
  id: string;
  label: string;
  level: number; // 1 = central, 2 = main topic, 3 = subtopic, 4 = key point
  children: MindMapNode[];
  parentId?: string;
}

/**
 * Parse Markdown text into a hierarchical mind map structure
 */
export function parseMarkdownToMindMap(markdown: string): MindMapNode | null {
  const lines = markdown.split('\n').filter(line => line.trim());

  if (lines.length === 0) return null;

  const root: MindMapNode = {
    id: 'root',
    label: 'Mapa Mental',
    level: 0,
    children: [],
  };

  const stack: MindMapNode[] = [root];
  let nodeCounter = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) continue;

    let level = 0;
    let content = trimmed;

    // Detect heading level (# = 1, ## = 2, ### = 3)
    if (trimmed.startsWith('###')) {
      level = 3;
      content = trimmed.replace(/^###\s*/, '');
    } else if (trimmed.startsWith('##')) {
      level = 2;
      content = trimmed.replace(/^##\s*/, '');
    } else if (trimmed.startsWith('#')) {
      level = 1;
      content = trimmed.replace(/^#\s*/, '');
    } else if (trimmed.startsWith('-') || trimmed.startsWith('•')) {
      level = 4; // List items
      content = trimmed.replace(/^[-•]\s*/, '');
    } else {
      // Regular text paragraphs - treat as level 4
      level = 4;
    }

    // Clean up markdown formatting
    content = content
      .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.+?)\*/g, '$1')     // Remove italic
      .replace(/`(.+?)`/g, '$1')       // Remove code
      .trim();

    if (!content) continue;

    // Create new node
    const newNode: MindMapNode = {
      id: `node-${++nodeCounter}`,
      label: content,
      level,
      children: [],
    };

    // Find parent based on level
    while (stack.length > 0 && stack[stack.length - 1].level >= level) {
      stack.pop();
    }

    if (stack.length > 0) {
      const parent = stack[stack.length - 1];
      newNode.parentId = parent.id;
      parent.children.push(newNode);
    }

    // Only push to stack if not a leaf node (level < 4)
    if (level < 4) {
      stack.push(newNode);
    }
  }

  return root.children.length > 0 ? root.children[0] : root;
}

/**
 * Flatten tree structure for React Flow
 */
export function flattenMindMap(node: MindMapNode): MindMapNode[] {
  const result: MindMapNode[] = [node];

  for (const child of node.children) {
    result.push(...flattenMindMap(child));
  }

  return result;
}
