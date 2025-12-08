<script setup lang="ts">
  import { computed, ref, watchEffect, onUnmounted } from "vue";
  import { Motion } from "motion-v";

  interface CircleTexrProps {
    text: string;
    spinDuration?: number; // 正常旋转一圈需要几秒，默认20秒
    onHover?: "slowDown" | "speedUp" | "pause" | "goBonkers"; // 鼠标悬停时的行为
    className?: string; // 额外传的 class
  }

  const props = withDefaults(defineProps<CircleTexrProps>(), {
    text: "Hello World",
    spinDuration: 20,
    onHover: "speedUp",
    className: "text-blue-500"
  });

  const letters = computed(() => Array.from(props.text));

  const isHoverd = ref(false);
  const currentRotation = ref(0);
  const animationId = ref<number | null>(null);
  const lastTime = ref<number>(Date.now());
  const rotationSpeed = ref<number>(0);

  const getCurrentSpeed = () => {
    if (isHoverd.value && props.onHover === "pause") return 0;

    const baseDuration = props.spinDuration;
    const baseSpeed = 360 / baseDuration;

    if (!isHoverd.value) return baseSpeed;

    switch (props.onHover) {
      case "slowDown":
        return baseSpeed / 2;
      case "speedUp":
        return baseSpeed * 2;
      case "pause":
        return 0;
      case "goBonkers":
        return baseSpeed * 10;
      default:
        return baseSpeed;
    }
  };

  const getCurrentScale = () => {
    return isHoverd.value && props.onHover === "goBonkers" ? 0.8 : 1;
  };

  const animate = () => {
    const now = Date.now();
    const deltaTime = (now - lastTime.value) / 1000;
    lastTime.value = now;

    const targetSpeed = getCurrentSpeed();
    const speedDiff = targetSpeed - rotationSpeed.value;
    const smoothingFactor = Math.min(1, deltaTime * 5);
    rotationSpeed.value += speedDiff * smoothingFactor;

    currentRotation.value =
      (currentRotation.value + rotationSpeed.value * deltaTime) % 360;

    animationId.value = requestAnimationFrame(animate);
  };

  const startAnimation = () => {
    if (animationId.value) cancelAnimationFrame(animationId.value);
    lastTime.value = Date.now();
    rotationSpeed.value = getCurrentSpeed(); // 立即设置当前速度
    animate();
  };

  watchEffect(() => {
    startAnimation(); // 每当 props.spinDuration 或 onHover 变了，就重启动画
  });

  startAnimation(); // 组件初次挂载也启动

  onUnmounted(() => {
    if (animationId.value) cancelAnimationFrame(animationId.value);
  });

  const handleHoverStart = () => {
    isHoverd.value = true;
  };
  const handleHoverEnd = () => {
    isHoverd.value = false;
  };

  const getLetterTransform = (index: number) => {
    const rotationDeg = (360 / letters.value.length) * index;
    const factor = Math.PI / letters.value.length;
    const x = factor * index;
    const y = factor * index;
    return `rotateZ(${rotationDeg}deg) translate3d(${x}px, ${y}px, 0)`;
  };
</script>

<template>
  <div>{{ props.text }}</div>
  <div>
    <Motion
      :animate="{
        rotate: currentRotation,
        scale: getCurrentScale()
      }"
      :transition="{
        rotate: {
          duration: 0
        },
        scale: {
          type: 'spring',
          damping: 20,
          stiffness: 300
        }
      }"
      :class="`m-0 mx-auto rounded-full w-[200px] h-[200px] relative font-black text-black text-center cursor-pointer origin-center ${props.className}`"
      @mouseenter="handleHoverStart"
      @mouseleave="handleHoverEnd">
      <span
        v-for="(letter, i) in letters"
        :key="i"
        class="absolute inline-block inset-0 text-2xl transition-all duration-500 ease-[cubic-bezier(0,0,0,1)]"
        :style="{
          transform: getLetterTransform(i),
          WebkitTransform: getLetterTransform(i)
        }">
        {{ letter }}
      </span>
    </Motion>
  </div>
</template>
