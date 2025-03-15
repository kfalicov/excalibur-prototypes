type Transformation = {
  pan: { x: number; y: number };
  zoom: number;
};

function zoomPan(context: CanvasRenderingContext2D, output: Transformation) {
  let isMouseDown = false;

  const baseTransform = {
    x: 0,
    y: 0,
    scale: 1,
  };

  const inProgressTransform = {
    x: 0,
    y: 0,
  };

  const dragOrigin = {
    x: 0,
    y: 0,
  };

  function pan(localX: number, localY: number) {
    return { x: localX - dragOrigin.x, y: localY - dragOrigin.y };
  }

  context.canvas.addEventListener('mousedown', (e) => {
    dragOrigin.x = e.clientX;
    dragOrigin.y = e.clientY;
    isMouseDown = true;
  });

  context.canvas.addEventListener('mouseup', (e) => {
    baseTransform.x += inProgressTransform.x;
    baseTransform.y += inProgressTransform.y;
    inProgressTransform.x = inProgressTransform.y = 0;
    isMouseDown = false;
  });

  function onMouseMove(e: MouseEvent) {
    if (!isMouseDown) {
      return;
    }
    Object.assign(inProgressTransform, pan(e.clientX, e.clientY));
    Object.assign(output, {
      pan: {
        x: inProgressTransform.x + baseTransform.x,
        y: inProgressTransform.y + baseTransform.y,
      },
    });
  }

  context.canvas.addEventListener('mousemove', onMouseMove);
}

export { zoomPan };
