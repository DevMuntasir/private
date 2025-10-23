// Minimal type declarations for CanvasJS Vue wrapper & core

declare module '@canvasjs/vue-charts' {
  import type { DefineComponent } from 'vue';

  // Global component registration: app.component('CanvasJSChart', CanvasJSChart)
  const CanvasJSChart: DefineComponent<{
    options: any; // CanvasJS options object
    styles?: Partial<CSSStyleDeclaration> | Record<string, string | number>;
  }>;

  export default CanvasJSChart;
}

declare module '@canvasjs/charts' {
  // If you import core CanvasJS anywhere, keep it loose-typed
  const CanvasJS: any;
  export default CanvasJS;
}
