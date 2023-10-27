import { Editor } from './modules/index.js';
import { data } from './data.js';

const { ref, createApp, onMounted, onBeforeUnmount, computed } = Vue;
const app = createApp({
  setup() {
    const currentToolName = ref(null);
    const selected = ref(null);
    const zoom = ref(1);
    const minZoom = ref(null);
    const maxZoom = ref(null);
    const zoomInEnabled = computed(() => {
      if (!maxZoom) return false;
      return zoom.value < maxZoom.value;
    });
    const zoomOutEnabled = computed(() => {
      if (!minZoom) return false;
      return zoom.value > minZoom.value;
    });

    const handleSelectionChange = ({ models }) => {
      if (models.length === 1) {
        selected.value = models[0];
      } else {
        selected.value = null;
      }
    };
    const handleZoomChange = ({ zoom: newZoom }) => {
      zoom.value = Number(newZoom.toFixed(2));
    };
    onMounted(() => {
      console.log(data);
      window.editor = new Editor({ id: 'canvas-root' });
      // 初始化值
      currentToolName.value = window.editor.currentToolName;
      zoom.value = Number(window.editor.getZoom().toFixed(2));
      minZoom.value = window.editor.getMinZoom();
      maxZoom.value = window.editor.getMaxZoom();

      window.editor.on('selection:change', handleSelectionChange);
      window.editor.on('zoom:change', handleZoomChange);
      const { width, height, objects } = data;
      window.editor.reset(width, height, objects);
    });
    onBeforeUnmount(() => {
      window.editor.off('selection:change', handleSelectionChange);
      window.editor.off('zoom:change', handleZoomChange);
    });
    const onToolClick = (toolName) => {
      currentToolName.value = toolName;
      window.editor.invokeTool(toolName);
    };
    const onUndo = () => {
      window.editor.undo();
    };
    const onRedo = () => {
      window.editor.redo();
    };
    const onToggleEffect = () => {
      window.editor.toggleTileEffect();
    };
    const onToggleMask = () => {
      window.editor.toggleMask();
    };

    const onSwitchPrevClick = () => {
      selected.value.switchPrevImage();
    };
    const onSwitchNextClick = () => {
      selected.value.switchNextImage();
    };
    const onMaskPlayerChange = () => {
      selected.value.toggleMaskPlayer();
    };
    const onColliderChange = () => {
      selected.value.toggleCollider();
    };
    const onEffect3DChange = () => {
      selected.value.toggleEffect3D();
    };

    const onZoomIn = () => {
      const newZoom = (Math.round((zoom.value * 10)) * 10 + 10) / 100;
      window.editor.setZoom(newZoom);
    };
    const onZoomOut = () => {
      const newZoom = (Math.round((zoom.value * 10)) * 10 - 10) / 100;
      window.editor.setZoom(newZoom);
    };
    const onZoomChange = (e) => {
      const newZoom = Number(e.target.value);
      if (Number.isNaN(newZoom)) {
        e.target.value = zoom.value;
        return;
      }
      window.editor.setZoom(newZoom);
    };
    const onZoomToFit = () => {
      window.editor.zoomToFit();
    };
    const onOpacityChange = (e) => {
      const opacity = Number(e.target.value);
      selected.value.setOpacity(opacity);
    };
    return {
      currentToolName,
      selected,
      zoom,
      zoomInEnabled,
      zoomOutEnabled,
      onToolClick,
      onUndo,
      onRedo,
      onToggleEffect,
      onToggleMask,
      onSwitchPrevClick,
      onSwitchNextClick,
      onMaskPlayerChange,
      onColliderChange,
      onEffect3DChange,
      onZoomIn,
      onZoomOut,
      onZoomChange,
      onZoomToFit,
      onOpacityChange,
    }
  }
}).mount('#app');
window.app = app;
