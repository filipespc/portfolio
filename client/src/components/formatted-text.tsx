import { parseTextContent } from "@/lib/utils";

interface FormattedTextProps {
  text: string;
  className?: string;
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
              {item.content.map((listItem, listIndex) => (
                <li key={listIndex}>{listItem}</li>
              ))}
            </ul>
          );
        } else if (item.type === 'paragraph' && typeof item.content === 'string') {
          return (
            <p key={index} className="mb-2">
              {item.content}
            </p>
          );
        }
        return null;
      })}
    </div>
  );
}