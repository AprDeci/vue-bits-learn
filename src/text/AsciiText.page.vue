<script setup lang="ts">
  import { onMounted } from 'vue';
  import * as THREE from 'three';

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
    text: 'David!',
    asciiFontSize: 8,
    textFontSize: 200,
    textColor: '#fdf9f3',
    planeBaseHeight: 8,
    enableWaves: true,
    className: ''
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
  Math.map = function (n: number, start: number, stop: number, start2: number, stop2: number) {
    return ((n - start) / (stop - start)) * (stop2 - start2) + start2;
  };

  const PX_RATIO = typeof window !== 'undefined' ? window.devicePixelRatio : 1;

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
  }
</script>

<template>
  <div>
    <div>AsciiText</div>
  </div>
</template>
