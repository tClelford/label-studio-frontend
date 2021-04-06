import { observer } from "mobx-react";
import { CurrentAnnotation } from "../CurrentAnnotation/CurrentAnnotation";
import Entities from "../Entities/Entities";
import Entity from "../Entity/Entity";
import Relations from "../Relations/Relations";

export const AnnotationTab = observer(({ store }) => {
  const as = store.annotationStore;
  const annotation = store.annotationStore.selected;
  const node = annotation.highlightedNode;

  return (
    <>
      {store.hasInterface("annotations:current") && (
        <CurrentAnnotation
          annotation={as.selected}
          showControls={store.hasInterface("controls")}
        />
      )}

      {node ? (
        <Entity store={store} annotation={as.selected} />
      ) : (
        <p style={{ marginBottom: 0, paddingInline: 15}}>Nothing selected</p>
      )}

      <Entities store={store} regionStore={as.selected.regionStore} />

      <Relations store={store} item={as.selected} />
    </>
  );
});