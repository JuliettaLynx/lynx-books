import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import "./assets/main.css";

import PrimeVue from "primevue/config";
import { useDisplaySettingsStore } from "./stores/displaySettings";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(PrimeVue, {
  ripple: true,
  inputStyle: "outlined",
});

// Инициализация display settings после монтирования
app.mount("#app");

// Загружаем настройки отображения
const displaySettingsStore = useDisplaySettingsStore();
displaySettingsStore.loadFromLocalStorage();
