/**
 * Libraries
 */
import React, { Component } from "react";
import { Result, Spin } from "antd";
import { getEnv } from "mobx-state-tree";
import { observer, Provider } from "mobx-react";

/**
 * Core
 */
import Tree from "../../core/Tree";

/**
 * Components
 */
import Annotations from "../Annotations/Annotations";
import Controls from "../Controls/Controls";
import Debug from "../Debug";
import Panel from "../Panel/Panel";
import Predictions from "../Predictions/Predictions";
import Segment from "../Segment/Segment";
import Settings from "../Settings/Settings";
import SideColumn from "../SideColumn/SideColumn";
import { RelationsOverlay } from "../RelationsOverlay/RelationsOverlay";

/**
 * Tags
 */
import * as ObjectTags from "../../tags/object"; // eslint-disable-line no-unused-vars
import * as ControlTags from "../../tags/control"; // eslint-disable-line no-unused-vars
import * as VisualTags from "../../tags/visual"; // eslint-disable-line no-unused-vars

/**
 * Styles
 */
import styles from "./App.module.scss";
import { TreeValidation } from "../TreeValidation/TreeValidation";
import { guidGenerator } from "../../utils/unique";
import Grid from "./Grid";

/**
 * App
 */
class App extends Component {
  renderSuccess() {
    return <Result status="success" title={getEnv(this.props.store).messages.DONE} />;
  }

  renderNoAnnotation() {
    return <Result status="success" title={getEnv(this.props.store).messages.NO_COMP_LEFT} />;
  }

  renderNothingToLabel() {
    return <Result status="success" title={getEnv(this.props.store).messages.NO_NEXT_TASK} />;
  }

  renderNoAccess() {
    return <Result status="warning" title={getEnv(this.props.store).messages.NO_ACCESS} />;
  }

  renderConfigValidationException() {
    return (
      <Segment>
        <TreeValidation errors={this.props.store.annotationStore.validation} />
      </Segment>
    );
  }

  renderLoader() {
    return <Result icon={<Spin size="large" />} />;
  }

  _renderAll(obj) {
    if (obj.length === 1) return <Segment annotation={obj[0]}>{[Tree.renderItem(obj[0].root)]}</Segment>;

    return (
      <div className="ls-renderall">
        {obj.map(c => (
          <div className="ls-fade">
            <Segment annotation={c}>{[Tree.renderItem(c.root)]}</Segment>
          </div>
        ))}
      </div>
    );
  }

  _renderUI(root, store, cs, settings) {
    return (
      <>
        {!cs.viewingAllAnnotations && !cs.viewingAllPredictions && (
          <Segment annotation={cs.selected} className={settings.bottomSidePanel ? "" : styles.segment + " ls-segment"}>
            <div style={{ position: "relative" }}>
              {Tree.renderItem(root)}
              {this.renderRelations(cs.selected)}
            </div>
            {store.hasInterface("controls") && <Controls item={cs.selected} />}
          </Segment>
        )}
        {cs.viewingAllAnnotations && this.renderAllAnnotations()}
        {cs.viewingAllPredictions && this.renderAllPredictions()}
      </>
    );
  }

  renderAllAnnotations() {
    const cs = this.props.store.annotationStore;
    return <Grid store={cs} annotations={[...cs.annotations, ...cs.predictions]} root={cs.root} />;
  }

  renderAllPredictions() {
    return this._renderAll(this.props.store.annotationStore.predictions);
  }

  renderRelations(selectedStore) {
    const store = selectedStore.relationStore;
    return <RelationsOverlay key={guidGenerator()} store={store} />;
  }

  render() {
    const self = this;
    const { store } = self.props;
    const cs = store.annotationStore;
    const root = cs.selected && cs.selected.root;
    const { settings } = store;

    if (store.isLoading) return self.renderLoader();

    if (store.noTask) return self.renderNothingToLabel();

    if (store.noAccess) return self.renderNoAccess();

    if (store.labeledSuccess) return self.renderSuccess();

    if (!root) return self.renderNoAnnotation();

    const stEditor = settings.fullscreen ? styles.editorfs : styles.editor;
    const stCommon = settings.bottomSidePanel ? styles.commonbsp : styles.common;
    const stMenu = settings.bottomSidePanel ? styles.menubsp : styles.menu;

    return (
      <div className={stEditor + " ls-editor"}>
        <Settings store={store} />
        <Provider store={store}>
          <div>
            {store.hasInterface("panel") && <Panel store={store} />}

            {store.showingDescription && (
              <Segment>
                <div dangerouslySetInnerHTML={{ __html: store.description }} />
              </Segment>
            )}

            {/* <div className={styles.pins}> */}
            {/*   <div style={{ width: "100%", marginRight: "20px" }}><PushpinOutlined /></div> */}
            {/*   <div className={styles.pinsright}><PushpinOutlined /></div> */}
            {/* </div> */}

            <div className={stCommon + " ls-common"}>
              {cs.validation === null
                ? this._renderUI(root, store, cs, settings)
                : this.renderConfigValidationException()}
              <div className={stMenu + " ls-menu"}>
                {store.hasInterface("annotations:menu") && store.settings.showAnnotationsPanel && (
                  <Annotations store={store} />
                )}
                {store.hasInterface("predictions:menu") && store.settings.showPredictionsPanel && (
                  <Predictions store={store} />
                )}
                {store.hasInterface("side-column") && !cs.viewingAllAnnotations && !cs.viewingAllPredictions && (
                  <SideColumn store={store} />
                )}
              </div>
            </div>
          </div>
        </Provider>
        {store.hasInterface("debug") && <Debug store={store} />}
      </div>
    );
  }
}

export default observer(App);
