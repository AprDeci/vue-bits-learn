<script setup lang="ts">
  import { onMounted } from "vue";
  import * as THREE from "three";

  interface AsciiTextProps {
    text?: string;
    asciiFontSize?: number;
    textFontSize?: number;
    textColor?: string;
    planeBaseHeight?: number;
    enableWaves?: boolean;
    className?: string;
  }

  const props = withDefaults(defineProps<AsciiTextProps>(), {
    text: "David!",
    asciiFontSize: 8,
    textFontSize: 200,
    textColor: "#fdf9f3",
    planeBaseHeight: 8,
    enableWaves: true,
    className: ""
  });

  const vertexShader = `
    varying vec2 vUv;
    uniform float uTime;
    uniform float mouse;
    uniform float uEnableWaves;

    void main() {
        vUv = uv;
        float time = uTime * 5.;

        float waveFactor = uEnableWaves;

        vec3 transformed = position;

        transformed.x += sin(time + position.y) * 0.5 * waveFactor;
        transformed.y += cos(time + position.z) * 0.15 * waveFactor;
        transformed.z += sin(time + position.x) * waveFactor;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
    }
  `;

  const fragmentShader = `
varying vec2 vUv;
uniform float mouse;
uniform float uTime;
uniform sampler2D uTexture;

void main() {
    float time = uTime;
    vec2 pos = vUv;
    
    float move = sin(time + mouse) * 0.01;
    float r = texture2D(uTexture, pos + cos(time * 2. - time + pos.x) * .01).r;
    float g = texture2D(uTexture, pos + tan(time * .5 + pos.x - time) * .01).g;
    float b = texture2D(uTexture, pos - cos(time * 2. + time + pos.y) * .01).b;
    float a = texture2D(uTexture, pos).a;
    gl_FragColor = vec4(r, g, b, a);
}
`;

  // @ts-expect-error - Adding map function to Math object
  Math.map = function (
    n: number,
    start: number,
    stop: number,
    start2: number,
    stop2: number
  ) {
    return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
  };

  const PX_RATIO = typeof window !== "undefined" ? window.devicePixelRatio : 1;

  interface AsciiFilterOptions {
    fontSize?: number;
    fontFamily?: string;
    charset?: string;
    invert?: boolean;
  }

  interface CanvasTxtOptions {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
  }

  class AsciiFilter {
    renderer: THREE.WebGLRenderer;
    domElement: HTMLDivElement;
    pre: HTMLPreElement;
    canvas: HTMLCanvasElement;
    context: CanvasRenderingContext2D | null;
    deg: number;
    invert: boolean;
    fontSize: number;
    fontFamily: string;
    charset: string;
    width: number = 0;
    height: number = 0;
    center: { x: number; y: number } = { x: 0, y: 0 };
    mouse: { x: number; y: number } = { x: 0, y: 0 };
    cols: number = 0;
    rows: number = 0;
    constructor(
      renderer: THREE.WebGLRenderer,
      { fontSize, fontFamily, charset, invert }: AsciiFilterOptions = {}
    ) {
      this.renderer = renderer;
      this.domElement = document.createElement("div");
      this.domElement.style.position = "absolute";
      this.domElement.style.top = "0";
      this.domElement.style.left = "0";
      this.domElement.style.width = "100%";
      this.domElement.style.height = "100%";
      this.pre = document.createElement("pre");
      this.domElement.appendChild(this.pre);
      this.canvas = document.createElement("canvas");
      this.context = this.canvas.getContext("2d");
      this.domElement.appendChild(this.canvas);
      this.deg = 0;
      this.invert = invert ?? true;
      this.fontSize = fontSize ?? 12;
      this.fontFamily = fontFamily ?? "'Courier New', monospace";
      this.charset =
        charset ??
        " .'`^\",:;Il!i~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
      if (this.context) {
        this.context.imageSmoothingEnabled = false;
      }
      this.onMouseMove = this.onMouseMove.bind(this);
      document.addEventListener("mousemove", this.onMouseMove);
    }

    setSize(width: number, height: number) {
      this.width = width;
      this.height = height;
      this.renderer.setSize(width, height);
      this.reset();
      this.center = { x: width / 2, y: height / 2 };
      this.mouse = { x: this.center.x, y: this.center.y };
    }
    reset() {
      this.context!.font = `${this.fontSize}px ${this.fontFamily}`;
      const testChar = "M";
      const charMetrics = this.context!.measureText(testChar);
      const charWidth = charMetrics.width;
      const charHeight = this.fontSize;
      this.cols = Math.floor(this.width / charWidth);
      this.rows = Math.floor(this.height / charHeight);
      this.canvas.width = this.cols;
      this.canvas.height = this.rows;
      const totalWidth = this.cols * charWidth;
      const totalHeight = this.rows * charHeight;
      const offsetX = (this.width - totalWidth) / 2;
      const offsetY = (this.height - totalHeight) / 2;
      this.pre.style.fontFamily = this.fontFamily;
      this.pre.style.fontSize = `${this.fontSize}px`;
      this.pre.style.margin = "0";
      this.pre.style.padding = "0";
      this.pre.style.lineHeight = `${this.fontSize}px`;
      this.pre.style.position = "absolute";
      this.pre.style.left = `${offsetX}px`;
      this.pre.style.top = `${offsetY}px`;
      this.pre.style.width = `${totalWidth}px`;
      this.pre.style.height = `${totalHeight}px`;
      this.pre.style.letterSpacing = "0";
      this.pre.style.wordSpacing = "0";
      this.pre.style.whiteSpace = "pre";
      this.pre.style.overflow = "hidden";
      this.pre.style.zIndex = "9";
      this.pre.style.backgroundImage =
        "radial-gradient(circle, #ff6188 0%, #fc9867 50%, #ffd866 100%)";
      this.pre.style.backgroundAttachment = "fixed";
      this.pre.style.webkitTextFillColor = "transparent";
      this.pre.style.webkitBackgroundClip = "text";
      this.pre.style.backgroundClip = "text";
      this.pre.style.mixBlendMode = "difference";
    }
    onMouseMove(e: MouseEvent) {
      this.mouse = { x: e.clientX * PX_RATIO, y: e.clientY * PX_RATIO };
    }
  }
</script>

<template>
  <div>
    <div>AsciiText</div>
  </div>
</template>
