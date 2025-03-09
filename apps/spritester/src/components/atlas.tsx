import { cva } from 'class-variance-authority';
import styles from './atlas.module.css';
import { DropzoneOptions, useDropzone } from 'react-dropzone';
import { useEffect, useRef, useState } from 'react';

const dropzoneVariants = cva(
  [
    'pointer-events-none absolute inset-0 place-items-center',
    'before:border-2 before:border-white before:absolute before:inset-0 before:m-4 before:rounded-lg before:border-dashed',
  ],
  {
    variants: {
      active: {
        true: ['grid'],
        false: ['hidden'],
      },
      accept: {
        true: ['before:opacity-100'],
        false: ['before:opacity-70'],
      },
    },
    defaultVariants: { active: false, accept: false },
  },
);

function Atlas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onDrop: DropzoneOptions['onDrop'] = (files: File[]) => {
    const context = canvasRef.current?.getContext('2d');
    if (!context) return;

    /**
     * loaded images to be tracked and moved around on the canvas
     */
    const images = files.map((file) => {
      const { promise, resolve, reject } =
        Promise.withResolvers<HTMLImageElement>();
      const reader = new FileReader();
      reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
          context.drawImage(img, 0, 0);
          resolve(img);
        };
        if (e.target?.result) img.src = e.target.result as string;
      };
      reader.readAsDataURL(file);
      return promise;
    });
    Promise.all(images).then(console.log);
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
    <div>
      <canvas ref={canvasRef} />
      <div
        {...getRootProps()}
        className={`${styles.canvas} relative bg-gray-800 w-96 text-white h-full`}
      >
        <div
          className={dropzoneVariants({
            active: isDraggingOverWindow,
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
