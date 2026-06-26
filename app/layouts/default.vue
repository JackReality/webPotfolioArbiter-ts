<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col">
    <AppNavMenu />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter />
  </div>
</template>
