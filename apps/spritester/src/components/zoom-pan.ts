type Transformation = {
  pan: { x: number; y: number };
  zoom: number;
};

function zoomPan(context: CanvasRenderingContext2D, output: Transformation) {
  let isMouseDown = false;

  const baseTransform = {
    x: 0,
    y: 0,
    zoom: 1,
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

  function zoom(localX: number, localY: number, scrollDelta: number) {
    const { zoom: oldZoom, x: oldX, y: oldY } = baseTransform;

    const newZoom = (baseTransform.zoom = oldZoom + scrollDelta * -0.01);

    const oldScale = oldZoom > 1 ? oldZoom : 2 ** (oldZoom - 1);
    const newScale = newZoom > 1 ? newZoom : 2 ** (newZoom - 1);

    const newX = (baseTransform.x =
      localX - (localX - oldX) * (newScale / oldScale));
    const newY = (baseTransform.y =
      localY - (localY - oldY) * (newScale / oldScale));

    console.log(newX, newY);

    Object.assign(output, {
      pan: { x: newX, y: newY },
      zoom: newZoom,
    });
  }

  context.canvas.addEventListener('mousedown', (e) => {
    dragOrigin.x = e.clientX;
    dragOrigin.y = e.clientY;
    isMouseDown = true;
  });

  context.canvas.addEventListener('wheel', (e) => {
    zoom(e.clientX, e.clientY, e.deltaY);
  });

  function commitMove(e: MouseEvent) {
    baseTransform.x += inProgressTransform.x;
    baseTransform.y += inProgressTransform.y;
    inProgressTransform.x = inProgressTransform.y = 0;
    isMouseDown = false;
  }

  context.canvas.addEventListener('mouseup', commitMove);
  context.canvas.addEventListener('mouseleave', commitMove);

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
