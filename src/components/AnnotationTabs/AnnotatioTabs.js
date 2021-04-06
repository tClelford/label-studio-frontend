import React, { useCallback } from "react";
import { observer } from "mobx-react";
import { Userpic } from "../../common/Userpic/Userpic";
import { Space } from "../../common/Space/Space";
import { Block, Elem } from "../../utils/bem";
import "./AnnotationTabs.styl";
import { LsPlus, LsSparks } from "../../assets/icons";

const EntityTab = observer(({ entity, selected, prediction = false, onClick }) => {
  const isUnsaved = entity.userGenerate && !entity.sentUserGenerate;

  return (
    <Elem
      name="item"
      mod={{selected}}
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        onClick(entity, prediction);
      }}
    >
      <Space size="small">
        <Elem
          name="userpic"
          tag={Userpic}
          username={prediction ? entity.createdBy : null}
          showUsername={prediction}
          user={{email: entity.createdBy}}
          mod={{prediction}}
        >{prediction && <LsSparks/>}</Elem>
        ID {entity.pk ?? entity.id} {isUnsaved && "*"}
      </Space>
    </Elem>
  );
});

export const AnnotationTabs = observer(({
  store,
  showAnnotations = true,
  showPredictions = true,
  allowCreateNew = true,
}) => {
  const { annotationStore: as } = store;
  const onAnnotationSelect = useCallback((entity, isPrediction) => {
    if (!entity.selected) {
      if (isPrediction) {
        as.selectPrediction(entity.id);
      } else {
        as.selectAnnotation(entity.id);
      }
    }
  }, [as],);

  const onCreateAnnotation = useCallback(() => {
    const c = as.addAnnotation({ userGenerate: true });
    as.selectAnnotation(c.id);
  }, [as]);

  const visible = showAnnotations || showPredictions;

  return visible ? (
    <Block name="annotation-tabs" onMouseDown={e => e.stopPropagation()}>
      {showPredictions && as.predictions.map(prediction => (
        <EntityTab
          key={prediction.id}
          entity={prediction}
          selected={prediction.selected}
          onClick={onAnnotationSelect}
          prediction={true}
        />
      ))}

      {showAnnotations && as.annotations.map(annotation => (
        <EntityTab
          key={annotation.id}
          entity={annotation}
          selected={annotation.selected}
          onClick={onAnnotationSelect}
        />
      ))}

      {allowCreateNew && (
        <Elem tag="button" name="add" onClick={onCreateAnnotation}>
          <LsPlus/>
        </Elem>
      )}
    </Block>
  ) : null;
});