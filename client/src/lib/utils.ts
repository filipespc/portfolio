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
export function parseEducation(education: string[]): Array<{name: string, category: string}> {
  return education.map(edu => {
    try {
      return JSON.parse(edu);
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
export function stringifyEducation(education: Array<{name: string, category: string}>): string[] {
  return education.map(edu => JSON.stringify(edu));
}

// Check if text contains bullet points
export function hasBulletPoints(text: string): boolean {
  return text.includes('\n- ') || text.startsWith('- ');
}

// Parse text into structured content
export function parseTextContent(text: string): Array<{type: 'paragraph' | 'list', content: string | string[]}> {
  if (!text) return [];
  
  const lines = text.split('\n');
  const result: Array<{type: 'paragraph' | 'list', content: string | string[]}> = [];
  let currentList: string[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('- ')) {
      // This is a bullet point
      currentList.push(trimmedLine.substring(2).trim());
    } else {
      // Not a bullet point
      if (currentList.length > 0) {
        // Finish current list
        result.push({ type: 'list', content: [...currentList] });
        currentList = [];
      }
      
      if (trimmedLine) {
        result.push({ type: 'paragraph', content: trimmedLine });
      }
    }
  }
  
  // Handle any remaining list
  if (currentList.length > 0) {
    result.push({ type: 'list', content: currentList });
  }
  
  return result;
}
