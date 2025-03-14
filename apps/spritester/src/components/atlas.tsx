import { cva, cx } from 'class-variance-authority';
import { DropzoneOptions, useDropzone } from 'react-dropzone';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './atlas.module.css';
import { AtlasGen, bounds, trim } from './atlas-manager';

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

  const init = useCallback((el: HTMLCanvasElement) => {
    if (el === null) return;
    atlasManager.current.register(el);
  }, []);

  const onDrop: DropzoneOptions['onDrop'] = (files: File[]) => {
    atlasManager.current?.addImages(files).then(console.log);
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

  return (
    <div className="overflow-hidden grid place-items-stretch">
      <div className="relative">
        <canvas
          ref={init}
          className={`${styles.canvas} bg-gray-700 absolute w-full h-full`}
        />
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
  );
}

export { Atlas };
