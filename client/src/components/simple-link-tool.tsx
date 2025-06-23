export class SimpleLinkTool {
  api: any;
  button: HTMLElement | null = null;
  state: boolean = false;
  
  static get isInline() {
    return true;
  }

  static get title() {
    return 'Link';
  }

  static get sanitize() {
    return {
      a: {
        href: true,
        target: '_blank',
        rel: 'noopener noreferrer',
        class: true
      }
    };
  }

  constructor({ api }: any) {
    this.api = api;
  }

  render() {
    this.button = document.createElement('button');
    (this.button as HTMLButtonElement).type = 'button';
    this.button.innerHTML = '🔗';
    this.button.title = 'Convert to Link (Cmd+L)';
    this.button.classList.add('ce-inline-tool');
    
    // Styling to match Editor.js inline toolbar
    Object.assign(this.button.style, {
      border: 'none',
      background: 'transparent',
      cursor: 'pointer',
      padding: '8px',
      fontSize: '16px',
      borderRadius: '4px',
      transition: 'background-color 0.15s ease'
    });
    
    return this.button;
  }

  surround(range: Range) {
    if (this.state) {
      this.unwrap(range);
    } else {
      this.wrap(range);
    }
  }

  wrap(range: Range) {
    const selectedText = range.extractContents();
    const textContent = selectedText.textContent?.trim();
    
    if (!textContent) {
      range.insertNode(selectedText);
      return;
    }

    const url = prompt('Enter URL for "' + textContent + '":');
    
    if (url && url.trim()) {
      const link = document.createElement('a');
      link.href = url.trim();
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.className = 'inline-link';
      
      // Apply Sollo red styling
      Object.assign(link.style, {
        color: '#d9272d',
        textDecoration: 'underline',
        transition: 'color 0.2s ease'
      });
      
      // Add hover effect
      link.addEventListener('mouseenter', () => {
        link.style.color = '#b8232a';
      });
      
      link.addEventListener('mouseleave', () => {
        link.style.color = '#d9272d';
      });
      
      link.appendChild(selectedText);
      range.insertNode(link);
      
      // Clear selection after creating link
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
      }
    } else {
      range.insertNode(selectedText);
    }
  }

  unwrap(range: Range) {
    const link = this.api.selection.findParentTag('A');
    if (link && link.parentNode) {
      const textContent = link.textContent || '';
      const textNode = document.createTextNode(textContent);
      link.parentNode.replaceChild(textNode, link);
      
      // Select the unwrapped text
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(textNode);
        selection.addRange(newRange);
      }
    }
  }

  checkState() {
    const link = this.api.selection.findParentTag('A');
    this.state = !!link;
    
    if (this.button) {
      if (this.state) {
        this.button.classList.add('ce-inline-tool--active');
        this.button.style.backgroundColor = '#e8f4fd';
        this.button.title = 'Remove Link (Cmd+L)';
      } else {
        this.button.classList.remove('ce-inline-tool--active');
        this.button.style.backgroundColor = 'transparent';
        this.button.title = 'Convert to Link (Cmd+L)';
      }
    }
  }

  static get shortcut() {
    return 'CMD+L';
  }
}