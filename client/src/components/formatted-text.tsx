import { parseTextContent } from "@/lib/utils";

interface FormattedTextProps {
  text: string;
  className?: string;
}

// Helper function to render inline markdown
function renderInlineMarkdown(content: Array<{type: 'text' | 'bold' | 'italic' | 'code', content: string}>) {
  return content.map((item, index) => {
    switch (item.type) {
      case 'bold':
        return <strong key={index}>{item.content}</strong>;
      case 'italic':
        return <em key={index}>{item.content}</em>;
      case 'code':
        return <code key={index} className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">{item.content}</code>;
      case 'text':
      default:
        return item.content;
    }
  });
}

export default function FormattedText({ text, className = "" }: FormattedTextProps) {
  if (!text) return null;

  const content = parseTextContent(text);
  
  return (
    <div className={className}>
      {content.map((item, index) => {
        if (item.type === 'list' && Array.isArray(item.content)) {
          return (
            <ul key={index} className="list-disc list-inside mb-4 space-y-1">
              {item.content.map((listItem: any, listIndex: number) => (
                <li 
                  key={listIndex} 
                  className={`${listItem.level > 0 ? `ml-${listItem.level * 4}` : ''}`}
                >
                  {Array.isArray(listItem.text) ? renderInlineMarkdown(listItem.text) : listItem.text}
                </li>
              ))}
            </ul>
          );
        } else if (item.type === 'paragraph') {
          return (
            <p key={index} className="mb-2">
              {Array.isArray(item.content) ? renderInlineMarkdown(item.content) : item.content}
            </p>
          );
        }
        return null;
      })}
    </div>
  );
}