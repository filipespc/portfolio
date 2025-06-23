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
        rel: 'noopener noreferrer'
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
    this.button.title = 'Link';
    this.button.classList.add('ce-inline-tool');
    this.button.style.border = 'none';
    this.button.style.background = 'transparent';
    this.button.style.cursor = 'pointer';
    this.button.style.padding = '4px 8px';
    this.button.style.fontSize = '14px';
    
    return this.button;
  }

  surround(range: Range) {
    if (this.state) {
      this.unwrap(range);
      return;
    }

    this.wrap(range);
  }

  wrap(range: Range) {
    const selectedText = range.extractContents();
    const textContent = selectedText.textContent;
    
    if (!textContent || textContent.trim() === '') {
      range.insertNode(selectedText);
      return;
    }

    const url = prompt('Enter URL:');
    
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.style.color = '#d9272d'; // Sollo red
      link.style.textDecoration = 'underline';
      link.appendChild(selectedText);
      
      range.insertNode(link);
      
      // Select the newly created link
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(link);
        selection.addRange(newRange);
      }
    } else {
      range.insertNode(selectedText);
    }
  }

  unwrap(range: Range) {
    const link = this.api.selection.findParentTag('A');
    if (link) {
      const textContent = link.textContent || '';
      const textNode = document.createTextNode(textContent);
      
      if (link.parentNode) {
        link.parentNode.replaceChild(textNode, link);
      }
      
      // Update selection
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
      this.button.classList.toggle('ce-inline-tool--active', this.state);
      if (this.state) {
        this.button.style.backgroundColor = '#f0f0f0';
      } else {
        this.button.style.backgroundColor = 'transparent';
      }
    }
  }

  static get shortcut() {
    return 'CMD+L';
  }
}