<script lang="ts">
	import Hero from '$lib/components/landing/hero.svelte';
</script>

<div class="space-y-16">
	<Hero />

	<div class="w-full max-w-3xl space-y-6 pb-8">
		<section id="goal" aria-labelledby="goal-heading">
			<div class="space-y-3">
				<h2
					id="goal-heading"
					class="font-gp-circle text-2xl text-ink md:text-3xl dark:text-foreground"
				>
					Goal
				</h2>
				<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
					My goal is to make it simpler for Svelte developers to add interactive globes into their
					projects... just grab an example and lesss go 😁😁🚀
				</p>
			</div>
		</section>

		<section
			id="credits"
			aria-labelledby="credits-heading"
			class="space-y-5 border-t border-dashed border-ink/20 pt-10 dark:border-primary/20"
		>
			<div class="space-y-3">
				<h2
					id="credits-heading"
					class="font-gp-circle text-2xl text-ink md:text-3xl dark:text-foreground"
				>
					Credits
				</h2>
				<div>
					<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
						This project is built on top of <a
							href="https://cobe.vercel.app"
							target="_blank"
							rel="noreferrer"
							class="text-ink dark:text-primary underline underline-offset-3">cobe</a
						>, an open-source WebGL globe library by
						<a
							href="https://x.com/shuding"
							target="_blank"
							rel="noreferrer"
							class="text-ink dark:text-primary underline underline-offset-3"
						>
							Shu
						</a>.
					</p>
					<p class="max-w-2xl font-figtree text-base leading-7 text-muted-foreground">
						The real engineering is Shu's work, I just built the Svelte layer around it.
					</p>
				</div>
			</div>
		</section>
	</div>
</div>
