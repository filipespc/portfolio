import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface ImageResizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onResize: (width: number, height: number, maintainAspectRatio: boolean) => void;
  initialWidth?: number;
  initialHeight?: number;
}

const presets = [
  { label: 'Small', w: 400, h: 300 },
  { label: 'Medium', w: 800, h: 600 },
  { label: 'Large', w: 1200, h: 900 },
  { label: 'Banner', w: 1200, h: 400 },
  { label: 'Square', w: 600, h: 600 }
];

export default function ImageResizeDialog({ 
  isOpen, 
  onClose, 
  onResize, 
  initialWidth = 800, 
  initialHeight = 600 
}: ImageResizeDialogProps) {
  const [width, setWidth] = useState(initialWidth);
  const [height, setHeight] = useState(initialHeight);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  if (!isOpen) return null;

  const handlePresetClick = (preset: typeof presets[0]) => {
    setWidth(preset.w);
    setHeight(preset.h);
  };

  const handleWidthChange = (newWidth: number) => {
    setWidth(newWidth);
    if (maintainAspectRatio) {
      setHeight(Math.round(newWidth * 0.75));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    setHeight(newHeight);
    if (maintainAspectRatio) {
      setWidth(Math.round(newHeight * 1.33));
    }
  };

  const handleApply = () => {
    onResize(width, height, maintainAspectRatio);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Resize Image</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Preset sizes */}
        <div className="mb-4">
          <Label className="text-sm mb-2 block">Quick Presets</Label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetClick(preset)}
                className="px-3 py-1 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
              >
                {preset.label} ({preset.w}×{preset.h})
              </button>
            ))}
          </div>
        </div>

        {/* Custom dimensions */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Label htmlFor="dialogWidth" className="text-sm">Width (px)</Label>
            <Input
              id="dialogWidth"
              type="number"
              value={width}
              onChange={(e) => handleWidthChange(parseInt(e.target.value) || 800)}
              min="100"
              max="2000"
              className="text-sm"
            />
          </div>
          <div>
            <Label htmlFor="dialogHeight" className="text-sm">Height (px)</Label>
            <Input
              id="dialogHeight"
              type="number"
              value={height}
              onChange={(e) => handleHeightChange(parseInt(e.target.value) || 600)}
              min="100"
              max="2000"
              className="text-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 mb-4">
          <input
            type="checkbox"
            id="dialogAspectRatio"
            checked={maintainAspectRatio}
            onChange={(e) => setMaintainAspectRatio(e.target.checked)}
          />
          <Label htmlFor="dialogAspectRatio" className="text-sm">Maintain aspect ratio</Label>
        </div>

        <p className="text-xs text-gray-500 mb-4">
          {maintainAspectRatio 
            ? 'Image will be resized proportionally to fit within dimensions' 
            : 'Image will be cropped to exact dimensions'
          }
        </p>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleApply}>
            Apply Resize
          </Button>
        </div>
      </div>
    </div>
  );
}