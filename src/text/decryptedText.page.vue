<script setup lang="ts">
import { ref, useTemplateRef, watch } from "vue";

interface DecryptedTextProps {
	text: string;
	speed?: number;
	maxIterations?: number;
	sequential?: boolean;
	revealDirection?: "start" | "end" | "center";
	useOriginalCharsOnly?: boolean;
	characters?: string;
	className?: string;
	encryptedClassName?: string;
	parentClassName?: string;
	animateOn?: "view" | "hover";
}

const props = withDefaults(defineProps<DecryptedTextProps>(), {
	text: "Hello world",
	speed: 50,
	maxIterations: 10,
	sequential: false,
	revealDirection: "start",
	useOriginalCharsOnly: false,
	characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
	className: "",
	parentClassName: "",
	encryptedClassName: "",
	animateOn: "hover",
});

const emit = defineEmits<{
	animationComplete: [];
}>();

const containerRef = useTemplateRef<HTMLSpanElement>("containerRef");

const displayText = ref(props.text);
const isHovering = ref(false);
const isScrambling = ref(false);
const revealIndices = ref(new Set<number>());
const hasAnimated = ref(false);

let interval: number | null = null;
let intersectionObserver: IntersectionObserver | null = null;

watch(
	[
		() => isHovering.value,
		() => props.text,
		() => props.speed,
		() => props.maxIterations,
		() => props.sequential,
		() => props.revealDirection,
		() => props.useOriginalCharsOnly,
	],
	() => {
		let currentIteration = 0;

		const getNextIndex = (revealedSet: Set<number>): number => {
			const textLength = props.text.length;
			switch (props.revealDirection) {
				case "start":
					return revealedSet.size;
				case "end":
					return textLength - 1 - revealedSet.size;
				case "center": {
					const middle = Math.floor(textLength / 2);
					const offset = Math.floor(revealedSet.size / 2);
					const nextIndex = revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;
					if (nextIndex >= 0 && nextIndex < textLength && !revealedSet.has(nextIndex)) {
						return nextIndex;
					}
					for (let i = 0; i < textLength; i++) {
						if (!revealedSet.has(i)) return i;
					}
					return 0;
				}
				default:
					return revealedSet.size;
			}
		};

		//可用乱码字符
		const availableChars = props.useOriginalCharsOnly
			? Array.from(new Set(props.text.split(""))).filter((char) => char !== " ")
			: props.characters.split("");

		const shuffleText = (originalText: string, currentRevealed: Set<number>): string => {
			if (props.useOriginalCharsOnly) {
				const positions = originalText.split("").map((char, index) => ({
					char,
					isSpace: char === " ",
					index: index,
					isRevealed: currentRevealed.has(index),
				}));
				const nonSpaceChars = positions.filter((p) => !p.isSpace && !p.isRevealed).map((p) => p.char);
				for (let i = nonSpaceChars.length - 1; i > 0; i--) {
					const j = Math.floor(Math.random() * (i + 1));
					[nonSpaceChars[i], nonSpaceChars[j]] = [nonSpaceChars[j], nonSpaceChars[i]];
				}
				let charIndex = 0;
				return positions
					.map((p) => {
						if (p.isSpace) return " ";
						if (p.isRevealed) return originalText[p.index];
						return nonSpaceChars[charIndex++];
					})
					.join("");
			} else {
				return originalText
					.split("")
					.map((char, i) => {
						if (char === " ") return " ";
						if (currentRevealed.has(i)) return originalText[i];
						return availableChars[Math.floor(Math.random() * availableChars.length)];
					})
					.join("");
			}
		};

		// 清除旧的interval
		if (interval) {
			clearInterval(interval);
			interval = null;
		}
	},
);
</script>

<template>
<div>Decrypted Text</div>
</template>