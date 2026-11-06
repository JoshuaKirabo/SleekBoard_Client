import { useLayoutEffect, useState } from "react";

// Hands back a ref to put on an element and that element's outer size, kept up to date as it resizes.
// The size is null until the first measure lands.
export function useElementSize()
  {
    const [node, setNode] = useState(null);
    const [size, setSize] = useState(null);

    useLayoutEffect(() =>
      {
        if(!node) return;

        const observer = new ResizeObserver(([entry]) =>
          {
            const box = entry.borderBoxSize[0];
            setSize({ width: box.inlineSize, height: box.blockSize });
          });
        observer.observe(node);
        return () => observer.disconnect();
      }, [node]);

    return [setNode, size];
  }
