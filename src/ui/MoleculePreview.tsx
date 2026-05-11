import { useEffect, useRef } from "react";
import { previewRegistry } from "../render/previewRegistry";

interface Props {
  recipeKey: string;
}

/**
 * Empty div that acts as the "viewport rect" for a registered preview.
 * The actual rendering happens on a shared canvas owned by the registry.
 */
export function MoleculePreview({ recipeKey }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const id = previewRegistry.register(ref.current, recipeKey);
    return () => previewRegistry.unregister(id);
  }, [recipeKey]);

  return <div className="molecule-preview" ref={ref} />;
}
