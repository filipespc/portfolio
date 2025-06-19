import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date from YYYY-MM to readable format
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const [year, month] = dateString.split('-');
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

// Format date range
export function formatDateRange(startDate: string, endDate?: string | null, isCurrentJob?: boolean): string {
  const start = formatDate(startDate);
  if (isCurrentJob || !endDate) {
    return `${start} - Present`;
  }
  return `${start} - ${formatDate(endDate)}`;
}

// Parse tools array
export function parseTools(tools: string[]): Array<{name: string, usage: string}> {
  return tools.map(tool => {
    try {
      return JSON.parse(tool);
    } catch {
      return { name: tool, usage: '' };
    }
  });
}

// Parse education array
export function parseEducation(education: string[]): Array<{name: string, category: string, link?: string, date?: string}> {
  return education.map(edu => {
    try {
      const parsed = JSON.parse(edu);
      return {
        name: parsed.name || edu,
        category: parsed.category || 'Other',
        link: parsed.link || undefined,
        date: parsed.date || undefined
      };
    } catch {
      return { name: edu, category: 'Other' };
    }
  });
}

// Stringify tools for storage
export function stringifyTools(tools: Array<{name: string, usage: string}>): string[] {
  return tools.map(tool => JSON.stringify(tool));
}

// Stringify education for storage
export function stringifyEducation(education: Array<{name: string, category: string, link?: string, date?: string}>): string[] {
  return education.map(edu => JSON.stringify(edu));
}

// Check if text contains bullet points
export function hasBulletPoints(text: string): boolean {
  return text.includes('\n- ') || text.startsWith('- ');
}

// Parse markdown text into structured content
export function parseTextContent(text: string): Array<{type: 'paragraph' | 'list', content: any}> {
  if (!text) return [];
  
  const lines = text.split('\n');
  const result: Array<{type: 'paragraph' | 'list', content: any}> = [];
  let currentList: Array<{text: any, level: number}> = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('- ')) {
      // Calculate indentation level (spaces before the dash)
      const leadingSpaces = line.length - line.trimStart().length;
      const level = Math.floor(leadingSpaces / 2); // 2 spaces = 1 level
      
      currentList.push({
        text: parseInlineMarkdown(trimmedLine.substring(2).trim()),
        level: level
      });
    } else {
      // Not a bullet point
      if (currentList.length > 0) {
        // Finish current list
        result.push({ type: 'list', content: [...currentList] });
        currentList = [];
      }
      
      if (trimmedLine) {
        result.push({ type: 'paragraph', content: parseInlineMarkdown(trimmedLine) });
      }
    }
  }
  
  // Handle any remaining list
  if (currentList.length > 0) {
    result.push({ type: 'list', content: currentList });
  }
  
  return result;
}

// Parse inline markdown (bold, italic, code)
export function parseInlineMarkdown(text: string): Array<{type: 'text' | 'bold' | 'italic' | 'code', content: string}> {
  const result: Array<{type: 'text' | 'bold' | 'italic' | 'code', content: string}> = [];
  let remaining = text;
  
  while (remaining.length > 0) {
    // Check for bold (**text**)
    const boldMatch = remaining.match(/^\*\*(.*?)\*\*/);
    if (boldMatch) {
      result.push({ type: 'bold', content: boldMatch[1] });
      remaining = remaining.substring(boldMatch[0].length);
      continue;
    }
    
    // Check for italic (*text*)
    const italicMatch = remaining.match(/^\*(.*?)\*/);
    if (italicMatch) {
      result.push({ type: 'italic', content: italicMatch[1] });
      remaining = remaining.substring(italicMatch[0].length);
      continue;
    }
    
    // Check for code (`text`)
    const codeMatch = remaining.match(/^`(.*?)`/);
    if (codeMatch) {
      result.push({ type: 'code', content: codeMatch[1] });
      remaining = remaining.substring(codeMatch[0].length);
      continue;
    }
    
    // Find next markdown character or end of string
    let nextSpecial = remaining.length;
    const specials = ['**', '*', '`'];
    for (const special of specials) {
      const index = remaining.indexOf(special);
      if (index !== -1 && index < nextSpecial) {
        nextSpecial = index;
      }
    }
    
    if (nextSpecial === 0) {
      // Single character that didn't match pattern
      result.push({ type: 'text', content: remaining[0] });
      remaining = remaining.substring(1);
    } else {
      // Regular text
      result.push({ type: 'text', content: remaining.substring(0, nextSpecial) });
      remaining = remaining.substring(nextSpecial);
    }
  }
  
  return result;
}
