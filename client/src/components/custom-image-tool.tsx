import { useState } from "react";
import ImageResizeDialog from "./image-resize-dialog";

export class CustomImageTool {
  static get toolbox() {
    return {
      title: 'Image',
      icon: '<svg width="17" height="15" viewBox="0 0 336 276" xmlns="http://www.w3.org/2000/svg"><path d="M291 150V79c0-19-15-34-34-34H79c-19 0-34 15-34 34v42l67-44 81 72 103-115z"/><path d="M79 0h178c44 0 79 35 79 79v118c0 44-35 79-79 79H79c-44 0-79-35-79-79V79C0 35 35 0 79 0z" fill="none" stroke="currentColor" stroke-width="2"/></svg>'
    };
  }

  constructor({ data, config, api }: any) {
    this.data = data;
    this.config = config;
    this.api = api;
    this.wrapper = undefined;
    this.settings = [
      {
        name: 'withBorder',
        icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M15.8 10.592v2.043h2.35v2.138H15.8v2.232h-2.25v-2.232h-2.4v-2.138h2.4v-2.043h2.25zm-5.2-5.233v2.138h-2.4v2.043h2.4v2.138H8.35V9.54H5.95V7.397h2.4V5.359h2.25zm5.2-3.63v2.043h2.35v2.138H15.8v2.232h-2.25V5.312h-2.4V3.174h2.4V1.042h2.25z"/></svg>'
      },
      {
        name: 'stretched',
        icon: '<svg width="17" height="10" viewBox="0 0 17 10" xmlns="http://www.w3.org/2000/svg"><path d="M13.568 5.925H4.056l1.703 1.703a1.125 1.125 0 0 1-1.59 1.591L.962 6.014A1.069 1.069 0 0 1 .588 4.26L4.38.469a1.069 1.069 0 0 1 1.519 1.519L4.185 3.772h9.606l-1.703-1.703a1.069 1.069 0 0 1 1.519-1.519l3.793 3.793a1.069 1.069 0 0 1 0 1.519l-3.793 3.793a1.069 1.069 0 0 1-1.519-1.519L13.568 5.925z"/></svg>'
      },
      {
        name: 'withBackground',
        icon: '<svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M10.043 8.265l3.183-3.183h-2.924L4.75 10.636v2.923l4.15-4.15v2.351l2.017-2.351zm4.907.87l2.25-2.25 2.25 2.25v2.25l-2.25-2.25-2.25 2.25v-2.25z"/></svg>'
      }
    ];
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.classList.add('simple-image');

    if (this.data && this.data.url) {
      return this._createImage(this.data.url, this.data.caption);
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';

    const button = document.createElement('div');
    button.innerHTML = `
      <div style="
        border: 2px dashed #ccc;
        border-radius: 8px;
        padding: 40px;
        text-align: center;
        cursor: pointer;
        transition: border-color 0.2s;
      " class="image-upload-area">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0 auto 16px; color: #666;">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21,15 16,10 5,21"/>
        </svg>
        <p style="color: #666; margin: 0; font-size: 14px;">Click to upload an image</p>
        <p style="color: #999; margin: 8px 0 0; font-size: 12px;">Choose size before uploading</p>
      </div>
    `;

    button.addEventListener('mouseenter', () => {
      const area = button.querySelector('.image-upload-area') as HTMLElement;
      if (area) area.style.borderColor = '#999';
    });

    button.addEventListener('mouseleave', () => {
      const area = button.querySelector('.image-upload-area') as HTMLElement;
      if (area) area.style.borderColor = '#ccc';
    });

    button.addEventListener('click', () => {
      // Show resize dialog first
      this._showResizeDialog((width: number, height: number, maintainAspectRatio: boolean) => {
        input.click();
        input.onchange = () => {
          const file = input.files?.[0];
          if (file) {
            this._uploadImage(file, width, height, maintainAspectRatio);
          }
        };
      });
    });

    wrapper.appendChild(button);
    wrapper.appendChild(input);

    return wrapper;
  }

  _showResizeDialog(callback: (width: number, height: number, maintainAspectRatio: boolean) => void) {
    // Create and show resize dialog
    const dialogHtml = `
      <div id="resize-dialog" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
      ">
        <div style="
          background: white;
          padding: 24px;
          border-radius: 8px;
          max-width: 400px;
          width: 90%;
        ">
          <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600;">Image Size Settings</h3>
          
          <div style="margin-bottom: 16px;">
            <label style="display: block; margin-bottom: 8px; font-size: 14px; font-weight: 500;">Quick Presets</label>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
              <button data-preset="400,300" style="padding: 6px 12px; font-size: 12px; border: 1px solid #ccc; border-radius: 4px; background: white; cursor: pointer;">Small (400×300)</button>
              <button data-preset="800,600" style="padding: 6px 12px; font-size: 12px; border: 1px solid #ccc; border-radius: 4px; background: white; cursor: pointer;">Medium (800×600)</button>
              <button data-preset="1200,900" style="padding: 6px 12px; font-size: 12px; border: 1px solid #ccc; border-radius: 4px; background: white; cursor: pointer;">Large (1200×900)</button>
              <button data-preset="1200,400" style="padding: 6px 12px; font-size: 12px; border: 1px solid #ccc; border-radius: 4px; background: white; cursor: pointer;">Banner (1200×400)</button>
              <button data-preset="600,600" style="padding: 6px 12px; font-size: 12px; border: 1px solid #ccc; border-radius: 4px; background: white; cursor: pointer;">Square (600×600)</button>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
            <div>
              <label style="display: block; margin-bottom: 4px; font-size: 14px;">Width (px)</label>
              <input id="width-input" type="number" value="800" min="100" max="2000" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
            <div>
              <label style="display: block; margin-bottom: 4px; font-size: 14px;">Height (px)</label>
              <input id="height-input" type="number" value="600" min="100" max="2000" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
            </div>
          </div>

          <div style="margin-bottom: 16px;">
            <label style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
              <input id="aspect-ratio-checkbox" type="checkbox" checked>
              Maintain aspect ratio
            </label>
            <p id="resize-description" style="margin: 8px 0 0; font-size: 12px; color: #666;">Image will be resized proportionally to fit within dimensions</p>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px;">
            <button id="cancel-btn" style="padding: 8px 16px; border: 1px solid #ccc; border-radius: 4px; background: white; cursor: pointer;">Cancel</button>
            <button id="upload-btn" style="padding: 8px 16px; border: none; border-radius: 4px; background: #007bff; color: white; cursor: pointer;">Upload Image</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', dialogHtml);

    const dialog = document.getElementById('resize-dialog');
    const widthInput = document.getElementById('width-input') as HTMLInputElement;
    const heightInput = document.getElementById('height-input') as HTMLInputElement;
    const aspectRatioCheckbox = document.getElementById('aspect-ratio-checkbox') as HTMLInputElement;
    const resizeDescription = document.getElementById('resize-description');
    const cancelBtn = document.getElementById('cancel-btn');
    const uploadBtn = document.getElementById('upload-btn');

    // Preset buttons
    document.querySelectorAll('[data-preset]').forEach(btn => {
      btn.addEventListener('click', () => {
        const [w, h] = (btn as HTMLElement).dataset.preset!.split(',');
        widthInput.value = w;
        heightInput.value = h;
      });
    });

    // Aspect ratio handling
    const updateDescription = () => {
      if (resizeDescription) {
        resizeDescription.textContent = aspectRatioCheckbox.checked 
          ? 'Image will be resized proportionally to fit within dimensions'
          : 'Image will be cropped to exact dimensions';
      }
    };

    aspectRatioCheckbox.addEventListener('change', updateDescription);

    widthInput.addEventListener('input', () => {
      if (aspectRatioCheckbox.checked) {
        const width = parseInt(widthInput.value) || 800;
        heightInput.value = Math.round(width * 0.75).toString();
      }
    });

    heightInput.addEventListener('input', () => {
      if (aspectRatioCheckbox.checked) {
        const height = parseInt(heightInput.value) || 600;
        widthInput.value = Math.round(height * 1.33).toString();
      }
    });

    // Dialog actions
    const closeDialog = () => {
      dialog?.remove();
    };

    cancelBtn?.addEventListener('click', closeDialog);

    uploadBtn?.addEventListener('click', () => {
      const width = parseInt(widthInput.value) || 800;
      const height = parseInt(heightInput.value) || 600;
      const maintainAspectRatio = aspectRatioCheckbox.checked;
      closeDialog();
      callback(width, height, maintainAspectRatio);
    });
  }

  async _uploadImage(file: File, width: number, height: number, maintainAspectRatio: boolean) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('width', width.toString());
    formData.append('height', height.toString());
    formData.append('maintainAspectRatio', maintainAspectRatio.toString());
    formData.append('imageType', 'content');

    try {
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const result = await response.json();
      if (result.success) {
        this.data = {
          url: result.file.url,
          caption: '',
        };
        
        // Replace the upload area with the image
        if (this.wrapper) {
          this.wrapper.innerHTML = '';
          this.wrapper.appendChild(this._createImage(result.file.url, ''));
        }
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please try again.');
    }
  }

  _createImage(url: string, captionText: string) {
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-tool');

    const image = document.createElement('img');
    image.src = url;
    image.alt = captionText || 'Image';
    
    const caption = document.createElement('div');
    caption.contentEditable = 'true';
    caption.innerHTML = captionText || 'Enter caption (optional)';
    caption.classList.add('image-tool__caption');

    imageContainer.appendChild(image);
    imageContainer.appendChild(caption);

    return imageContainer;
  }

  save() {
    const image = this.wrapper?.querySelector('img');
    const caption = this.wrapper?.querySelector('.image-tool__caption');

    return {
      url: image?.src || '',
      caption: caption?.innerHTML || '',
    };
  }

  static get sanitize() {
    return {
      url: {},
      caption: {
        br: true,
      },
    };
  }
}