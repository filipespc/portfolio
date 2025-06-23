export class HTMLParagraphTool {
  api: any;
  data: any;
  wrapper: HTMLElement | null = null;

  static get toolbox() {
    return {
      title: 'Paragraph',
      icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M248 276c0 11-9 20-20 20H20c-11 0-20-9-20-20V20C0 9 9 0 20 0h208c11 0 20 9 20 20v256z"/></svg>'
    };
  }

  static get isReadOnlySupported() {
    return true;
  }

  constructor({ data, api }: any) {
    this.api = api;
    this.data = {
      text: data.text || '',
    };
  }

  render() {
    this.wrapper = document.createElement('div');
    this.wrapper.classList.add('ce-paragraph');
    
    const input = document.createElement('div');
    input.classList.add('ce-paragraph__text');
    input.contentEditable = 'true';
    input.innerHTML = this.data.text;
    
    // Style the input
    Object.assign(input.style, {
      minHeight: '1.2em',
      outline: 'none',
      lineHeight: '1.6',
    });

    // Handle input events
    input.addEventListener('input', () => {
      this.data.text = input.innerHTML;
    });

    // Handle paste events to preserve formatting
    input.addEventListener('paste', (e) => {
      e.preventDefault();
      const text = e.clipboardData?.getData('text/html') || e.clipboardData?.getData('text/plain') || '';
      document.execCommand('insertHTML', false, text);
    });

    this.wrapper.appendChild(input);
    return this.wrapper;
  }

  save() {
    return {
      text: this.data.text
    };
  }

  static get sanitize() {
    return {
      text: {
        a: {
          href: true,
          target: true,
          rel: true
        },
        b: true,
        i: true,
        strong: true,
        em: true,
        code: true
      }
    };
  }

  static get pasteConfig() {
    return {
      tags: ['P', 'A', 'B', 'I', 'STRONG', 'EM', 'CODE']
    };
  }
}