const { app, BrowserWindow } = require("electron");
const path = require("path");
const http = require("http");
const next = require("next");

// Detectar si es desarrollo
const dev = !app.isPackaged;

const createWindow = async () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "VitalFit",
    // RUTA DEL ICONO: Debe estar en la carpeta public
    icon: path.join(__dirname, "public", "icon.ico"), 
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Útil para evitar problemas de CORS locales
    },
    autoHideMenuBar: true, // Oculta la barra pero permite Alt para mostrarla
  });

  // ESTA LÍNEA ELIMINA COMPLETAMENTE EL MENÚ (File, Edit...)
  win.setMenu(null);

  if (dev) {
    // MODO DESARROLLO
    win.loadURL("http://localhost:3000/es/login");
    win.webContents.openDevTools();
  } else {
    // MODO PRODUCCIÓN (El EXE)
    try {
      // Iniciamos Next.js apuntando a la carpeta actual del recurso
      const nextApp = next({
        dev: false,
        dir: app.getAppPath(),
        conf: {
          distDir: ".next", // Carpeta de build de Next
        }
      });

      const handle = nextApp.getRequestHandler();
      await nextApp.prepare();

      const server = http.createServer((req, res) => {
        handle(req, res);
      });

      // Escuchar en puerto 0 (aleatorio libre)
      server.listen(0, "localhost", () => {
        const port = server.address().port;
        // Cargamos la URL local del servidor que acabamos de crear
        win.loadURL(`http://localhost:${port}/es/login`); // Cambia /login si tu home es distinta
      });

    } catch (err) {
      console.error("Error iniciando servidor Next:", err);
    }
  }
};

app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {app.quit();}
});