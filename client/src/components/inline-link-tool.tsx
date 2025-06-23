export class InlineLinkTool {
  api: any;
  button: HTMLElement | null;
  state: boolean;

  static get isInline() {
    return true;
  }

  static get sanitize() {
    return {
      a: {
        href: true,
        target: true,
        rel: true,
      },
    };
  }

  constructor({ api }: any) {
    this.api = api;
    this.button = null;
    this.state = false;
  }

  render() {
    const button = document.createElement('button') as HTMLButtonElement;
    button.type = 'button';
    button.innerHTML = '🔗';
    button.title = 'Add Link';
    button.classList.add('ce-inline-tool');
    
    this.button = button;
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
    const link = document.createElement('a');
    
    // Prompt for URL
    const url = prompt('Enter URL:');
    if (!url) {
      range.insertNode(selectedText);
      return;
    }

    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.style.color = '#D9272D'; // Sollo red
    link.style.textDecoration = 'underline';
    link.appendChild(selectedText);
    range.insertNode(link);
  }

  unwrap(range: Range) {
    const link = this.api.selection.findParentTag('A');
    if (link) {
      this.api.selection.expandToTag(link);
      this.api.selection.extractContents();
      
      const text = link.textContent;
      const textNode = document.createTextNode(text || '');
      link.parentNode?.replaceChild(textNode, link);
    }
  }

  checkState() {
    const link = this.api.selection.findParentTag('A');
    this.state = !!link;

    if (this.state) {
      this.button?.classList.add('ce-inline-tool--active');
    } else {
      this.button?.classList.remove('ce-inline-tool--active');
    }

    return this.state;
  }

  static get shortcut() {
    return 'CMD+L';
  }
}