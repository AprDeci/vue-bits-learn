<script setup lang="ts">
  import { useTemplateRef } from "vue";

  interface FuzzyTextProps {
    text: string;
    fontSize?: number | string;
    fontWeight?: string | number;
    fontFamily?: string;
    color?: string;
    enableHover?: boolean;
    baseIntensity?: number;
    hoverIntensity?: number;
  }

  const props = withDefaults(defineProps<FuzzyTextProps>(), {
    text: "",
    fontSize: "clamp(2rem, 8vw, 8rem)",
    fontWeight: 900,
    fontFamily: "inherit",
    color: "#fff",
    enableHover: true,
    baseIntensity: 0.18,
    hoverIntensity: 0.5
  });

  const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasRef");

  let animationFrameId: number;
  let isCancelled = false;
  let cleanup: (() => void) | null = null;

  const waitForFont = async (
    fontFamily: string,
    fontWeight: string | number,
    fontSize: string
  ): Promise<boolean> => {
    if (document.fonts?.check) {
      const fontString = `${fontWeight} ${fontSize} ${fontFamily}`;
      if (document.fonts.check(fontString)) return true;
      try {
        await document.fonts.load(fontString);
        return document.fonts.check(fontString);
      } catch (error) {
        console.error("Font loading error:", error);
        return false;
      }
    }
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(false);

      ctx.font = `${fontWeight} ${fontSize} ${fontFamily}`;
      const testWidth = ctx.measureText("M").width;

      let attempts = 0;
      const checkFont = () => {
        ctx.font = `${fontWeight} ${fontSize} ${fontFamily}`;
        const newWidth = ctx.measureText("M").width;
        if (newWidth !== testWidth && newWidth > 0) {
          resolve(true);
        } else if (attempts < 20) {
          attempts++;
          setTimeout(checkFont, 50);
        } else {
          resolve(false);
        }
      };
      setTimeout(checkFont, 10);
    });
  };
</script>

<template>
  <div>FuzzyText</div>
  <div>
    <canvas ref="canvasRef"></canvas>
  </div>
</template>
