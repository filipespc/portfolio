import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { CaseStudy } from "@shared/schema";
import { useEffect, useRef } from "react";

// Editor.js renderer component
function EditorRenderer({ content }: { content: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !content) return;

    try {
      const data = JSON.parse(content);
      const container = containerRef.current;
      container.innerHTML = '';

      data.blocks?.forEach((block: any) => {
        const element = document.createElement('div');
        element.className = 'mb-6';

        switch (block.type) {
          case 'header':
            const level = block.data.level || 2;
            const headerClass = level === 2 ? 'text-2xl font-baron tracking-wide mb-4' : 
                               level === 3 ? 'text-xl font-bold mb-3' : 'text-lg font-bold mb-2';
            element.innerHTML = `<h${level} class="${headerClass}">${block.data.text}</h${level}>`;
            break;

          case 'paragraph':
            element.innerHTML = `<p class="text-gray-700 leading-relaxed">${block.data.text}</p>`;
            break;

          case 'list':
            const listType = block.data.style === 'ordered' ? 'ol' : 'ul';
            const listClass = block.data.style === 'ordered' ? 'list-decimal list-inside space-y-2 text-gray-700' : 'list-disc list-inside space-y-2 text-gray-700';
            const items = block.data.items.map((item: string) => `<li>${item}</li>`).join('');
            element.innerHTML = `<${listType} class="${listClass}">${items}</${listType}>`;
            break;

          case 'quote':
            element.innerHTML = `
              <blockquote class="border-l-4 border-sollo-red pl-6 py-4 bg-gray-50 italic text-gray-700">
                "${block.data.text}"
                ${block.data.caption ? `<cite class="block mt-2 text-sm text-gray-500 not-italic">— ${block.data.caption}</cite>` : ''}
              </blockquote>
            `;
            break;

          case 'code':
            element.innerHTML = `
              <pre class="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                <code>${block.data.code}</code>
              </pre>
            `;
            break;

          case 'delimiter':
            element.innerHTML = '<div class="text-center py-8"><span class="text-gray-400">* * *</span></div>';
            break;

          case 'image':
            element.innerHTML = `
              <figure class="my-8">
                <img src="${block.data.file?.url || block.data.url}" alt="${block.data.caption || ''}" class="w-full rounded-lg shadow-sm" />
                ${block.data.caption ? `<figcaption class="text-center text-sm text-gray-500 mt-2">${block.data.caption}</figcaption>` : ''}
              </figure>
            `;
            break;

          default:
            element.innerHTML = `<p class="text-gray-700 leading-relaxed">${block.data.text || ''}</p>`;
        }

        container.appendChild(element);
      });
    } catch (error) {
      console.error('Error rendering content:', error);
      containerRef.current.innerHTML = '<p class="text-gray-500">Error loading content</p>';
    }
  }, [content]);

  return <div ref={containerRef} className="prose prose-gray max-w-none" />;
}

export default function CaseStudyPage() {
  const [match, params] = useRoute("/playground/:slug");
  const slug = params?.slug;

  const { data: caseStudy, isLoading, error } = useQuery<CaseStudy>({
    queryKey: ["/api/case-studies", slug],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="aspect-video bg-gray-200 rounded-lg mb-8"></div>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !caseStudy) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-baron tracking-wide mb-4">Case Study Not Found</h1>
          <p className="text-gray-600 mb-8">The case study you're looking for doesn't exist or has been removed.</p>
          <Link href="/playground">
            <button className="bg-sollo-red text-white px-6 py-3 hover:bg-sollo-red/90 transition-colors">
              Back to Playground
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link href="/playground" className="text-sollo-red hover:text-sollo-red/80 text-sm font-medium">
              ← Back to Playground
            </Link>
          </div>

          {/* Tags */}
          {caseStudy.tags && caseStudy.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {caseStudy.tags.map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-3 py-1 bg-gray-100 text-gray-600 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="font-baron text-3xl md:text-4xl tracking-wide mb-4">
            {caseStudy.title}
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 leading-relaxed mb-6">
            {caseStudy.description}
          </p>

          {/* Meta */}
          <div className="text-sm text-gray-500">
            Published on {caseStudy.createdAt ? new Date(caseStudy.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            }) : 'Date not available'}
          </div>
        </div>
      </div>

      {/* Featured Image */}
      {caseStudy.featuredImage && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <img
            src={caseStudy.featuredImage}
            alt={caseStudy.title}
            className="w-full rounded-lg shadow-sm"
          />
        </div>
      )}

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="prose prose-lg max-w-none">
          <EditorRenderer content={caseStudy.content} />
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-4xl mx-auto px-4 py-16 border-t border-gray-100">
        <div className="text-center">
          <h3 className="font-baron text-xl tracking-wide mb-4">Explore More Case Studies</h3>
          <Link href="/playground">
            <button className="bg-sollo-red text-white px-6 py-3 hover:bg-sollo-red/90 transition-colors">
              View All Case Studies
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}