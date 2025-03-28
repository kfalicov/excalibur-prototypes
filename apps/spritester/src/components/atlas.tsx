import { cva, cx } from 'class-variance-authority';
import { DropzoneOptions, useDropzone } from 'react-dropzone';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './atlas.module.css';
import { AtlasGen, bounds, trim } from './atlas-manager';
import { Packed } from './potpack';

const packingBehavior = {
  bounds,
  trim,
};

const dropzoneVariants = cva(
  [
    'pointer-events-none absolute inset-0 grid place-items-center',
    'before:border-2 before:border-white before:absolute before:inset-0 before:m-4 before:rounded-lg before:border-dashed',
  ],
  {
    variants: {
      accept: {
        true: ['before:opacity-100'],
        false: ['before:opacity-70'],
      },
    },
    defaultVariants: { accept: false },
  },
);

function Atlas() {
  const atlasManager = useRef(AtlasGen);
  const alignedContent = useRef<HTMLDivElement>(null);
  const [packed, setPacked] = useState<Packed>();

  const [selected, setSelected] = useState<string>();

  const init = useCallback((el: HTMLCanvasElement) => {
    if (el === null) return;
    atlasManager.current.register(el);
    atlasManager.current.onRepack(setPacked);
    atlasManager.current.onTransform((t) => {
      const scale = t.zoom > 1 ? t.zoom : 2 ** (t.zoom - 1);
      if (!alignedContent.current) return;
      alignedContent.current.style.transform = `translate(${t.x}px, ${t.y}px) scale(${scale})`;
      alignedContent.current.style.setProperty('--scale', scale);
    });
  }, []);

  const onDrop: DropzoneOptions['onDrop'] = (files: File[]) => {
    atlasManager.current?.addImages(files);
  };

  const [isDraggingOverWindow, setIsDraggingOverWindow] = useState(false);

  const { getRootProps, getInputProps, isDragAccept, open } = useDropzone({
    noClick: true,
    accept: {
      'image/jpeg': [],
      'image/png': [],
    },
    onDrop,
  });
  /**
   * Handle dragging files into the browser window. This is used to show a visual indicator that the user is dragging
   * and that the file input is a valid drop target for the action.
   */
  useEffect(() => {
    let dragCounter = 0;
    const handleDragEnter = () => {
      dragCounter++;
      setIsDraggingOverWindow(dragCounter > 0);
    };
    const handleDragLeave = () => {
      dragCounter--;
      setIsDraggingOverWindow(dragCounter > 0);
    };
    const handleDragEnd = () => {
      dragCounter = 0;
      setIsDraggingOverWindow(false);
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragend', handleDragEnd);
    window.addEventListener('drop', handleDragEnd);
    return () => {
      dragCounter = 0;
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragend', handleDragEnd);
      window.removeEventListener('drop', handleDragEnd);
    };
  }, []);

  const selectedBox = packed?.boxes.find((b) => b.meta.filename === selected);

  return (
    <>
      <div className="overflow-hidden grid place-items-stretch">
        <div className="relative overflow-hidden">
          <canvas
            ref={init}
            className={`${styles.canvas} bg-gray-700 absolute w-full h-full`}
          />
          <div
            className="relative pointer-events-none origin-top-left"
            style={{ '--scale': 1 }}
            ref={alignedContent}
          >
            {packed?.boxes.map((box) => (
              <button
                key={box.meta.filename}
                className="absolute pointer-events-auto hover:bg-green-500/50 inline-flex before:absolute before:origin-top-left before:w-[calc(100%*var(--scale))] before:h-[calc(100%*var(--scale))] before:transform-[scale(calc(1/var(--scale)))] before:border-2 before:border-green-500"
                style={{
                  left: box.x,
                  top: box.y,
                  width: box.width,
                  height: box.height,
                }}
                onClick={() => {
                  console.log(box);
                  setSelected(box.meta.filename);
                }}
              >
                <span className="transform-[scale(calc(1/var(--scale)))] origin-top-left text-white text-outline text-sm pl-0.5">
                  {box.meta.filename.substring(
                    0,
                    box.meta.filename.lastIndexOf('.'),
                  ) || box.meta.filename}
                </span>
              </button>
            ))}
          </div>
        </div>
        <select
          onChange={(v) => {
            atlasManager.current?.setPackingBehavior(
              packingBehavior[v.currentTarget.value] ?? bounds,
            );
          }}
        >
          <option value="bounds">As Uploaded</option>
          <option value="trim">Trim Empty Space</option>
        </select>
        <div
          {...getRootProps({
            className: cx('fixed inset-0 text-white bg-slate-700/25', {
              hidden: !isDraggingOverWindow,
            }),
          })}
        >
          <div
            className={dropzoneVariants({
              accept: isDragAccept,
            })}
          >
            Drop here to add sprites
          </div>
          <input {...getInputProps()} />
        </div>
      </div>
      <div className="bg-gray-300 p-4 grid">
        {selectedBox ? (
          <div className="whitespace-pre">
            <img
              style={{ imageRendering: 'pixelated' }}
              src={selectedBox.image.src}
              width="100%"
            />
            {JSON.stringify(selectedBox, undefined, 4)}
          </div>
        ) : (
          <div className="border border-2 border-dashed border-white p-4 rounded-lg">
            Select a Frame
          </div>
        )}
      </div>
    </>
  );
}

export { Atlas };
