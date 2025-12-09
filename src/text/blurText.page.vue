<template>
  <div>blur Text</div>
  <p ref="rootRef" :class="['blur-text', 'flex', 'flex-wrap',className]">
    <Motion v-for="(segment,index) in elements" :key="index" tag="span" :initial="fromSnapshot" :animate="inView ? getAnimateKeyframes() : fromSnapshot"
      :transition="getTransition(index)"
      :style="{
        display:'inline-block',
        willChnage: 'transform, filter, opacity',
      }"
      @animation-complete="() => handleAnimationComplete(index)">{{ segment === ' ' ? '\u00A0' : segment }}
      {{ animateBy === 'words' && index < elements.length - 1 ? '\u00A0' : '' }}</Motion>
  </p>
</template>

<script setup lang="ts">
import { Motion } from "motion-v";
import { ref, computed, onMounted, onUnmounted, watch, useTemplateRef } from "vue";

interface BlurTextProps {
	text?: string;
	delay?: number;
	className?: string;
	animateBy?: AnimateBy;
	direction?: Direction;
	threshold?: number;
	rootMargin?: string;
	animationFrom?: AnimationSnapshot;
	animationTo?: AnimationSnapshot[];
	easing?: (t: number) => number;
	onAnimationComplete?: () => void;
	stepDuration?: number;
}

type AnimateBy = "words" | "letters";
type Direction = "bottom" | "top";
type AnimationSnapshot = Record<string, string | number>;

const props = withDefaults(defineProps<BlurTextProps>(), {
	text: "Hello wrold",
	delay: 200,
	animateBy: "words" as AnimateBy,
	direction: "top" as Direction,
	stepDuration: 0.35,
});

const elements = computed(() => (props.animateBy === "words" ? props.text.split(" ") : props.text.split("")));

const defaultFrom = computed<AnimationSnapshot>(() =>
	props.direction === "top"
		? { filter: "blur(10px)", opacity: 0, y: -50 }
		: { filter: "blur(10px)", opacity: 0, y: 50 },
);

const defaultTo = computed<AnimationSnapshot[]>(() => [
	{ filter: "blur(0px)", opacity: 0.5, y: props.direction === "top" ? 5 : -5 },
	{ filter: "blur(0px)", opacity: 1, y: 0 },
]);

const fromSnapshot = computed(() => props.animationFrom ?? defaultFrom.value);
const toSnapshots = computed(() => props.animationTo ?? defaultTo.value);

const buildKeyframe = (from: AnimationSnapshot, steps: AnimationSnapshot[]): Record<string, Array<string | number>> => {
	const keys = new Set<string>([...Object.keys(from), ...steps.flatMap((step) => Object.keys(step))]);

	const keyframes: Record<string, Array<string | number>> = {};

	for (const key of keys) {
		keyframes[key] = [from[key]!, ...steps.map((step) => step[key]!)];
	}

	return keyframes;
};

const stepCount = computed(() => toSnapshots.value.length + 1);
const totalDuration = computed(() => props.stepDuration * (stepCount.value - 1));

const times = computed(() =>
	Array.from({ length: stepCount.value }, (_, i) => (stepCount.value === 1 ? 0 : i / (stepCount.value - 1))),
);

const inView = ref(false);
const rootRef = useTemplateRef<HTMLParagraphElement>("rootRef");
let observer: IntersectionObserver | null = null;

const setupObserver = () => {
	if (!rootRef.value) return;

	observer = new IntersectionObserver(
		([enrty]) => {
			if (enrty?.isIntersecting) {
				inView.value = true;
				observer?.unobserve(rootRef.value!);
			}
		},
		{ threshold: props.threshold, rootMargin: props.rootMargin },
	);

	observer.observe(rootRef.value);
};

const getAnimateKeyframes = () => {
	return buildKeyframe(fromSnapshot.value, toSnapshots.value);
};

const getTransition = (index: number) => {
	return {
		duration: totalDuration.value,
		times: times.value,
		delay: (index * props.delay) / 1000, // 注意：delay 是 ms，转成 s
		ease: props.easing,
	};
};

const completionFired = ref(false);

const handleAnimationComplete = (index: number) => {
	if (index === elements.value.length - 1 && !completionFired.value) {
		completionFired.value = true;
		props.onAnimationComplete?.();
	}
};

const animationKey = ref(0);

watch([() => props.delay, () => props.stepDuration, () => props.animateBy, () => props.direction], () => {
	animationKey.value++;
	completionFired.value = false;
});

onMounted(() => {
	setupObserver();
});

onUnmounted(() => {
	observer?.disconnect();
});
</script>
