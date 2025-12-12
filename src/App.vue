<template>
  <div class="app-shell">
    <div class="app-background"></div>
    <main class="app-content">
      <router-view />
    </main>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --primary: #2563eb;
  --primary-dark: #1e40af;
  --accent: #a855f7;
  --surface: #0b1224;
  --card: rgba(255, 255, 255, 0.06);
  --text: #e5e7eb;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: radial-gradient(circle at 20% 20%, #1a2b4b, #060b17 45%),
    radial-gradient(circle at 80% 0%, #16213e, #060b17 40%),
    #060b17;
  color: var(--text);
  min-height: 100vh;
}

.app-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.app-background {
  position: fixed;
  inset: 0;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(168, 85, 247, 0.06));
  filter: blur(90px);
  z-index: -1;
}

.app-content {
  position: relative;
  z-index: 1;
  min-height: 100vh;
}
</style>
