const { app, BrowserWindow, Menu, ipcMain } = require("electron"); // Añadido Menu
const path = require("path");
const http = require("http");
const next = require("next");

const dev = !app.isPackaged;

function createMenu(win) {
  const template = [
    {
      label: "Navegación",
      submenu: [
        {
          label: "Atrás",
          accelerator: "Alt+Left",
          click: () => {
            if (win.webContents.canGoBack()) {
              win.webContents.goBack();
            }
          },
        },
        {
          label: "Adelante",
          accelerator: "Alt+Right",
          click: () => {
            if (win.webContents.canGoForward()) {
              win.webContents.goForward();
            }
          },
        },
        { type: "separator" },
        {
          label: "Recargar",
          role: "reload",
        },
      ],
    },
    {
      label: "VitalFit",
      submenu: [
        {
          label: "Mi Perfil",
          click: () => {
            const currentURL = win.webContents.getURL();
            try {
              const urlObj = new URL(currentURL);
              win.loadURL(`${urlObj.origin}/es/settings/profile`);
            } catch (e) {
              // Fallback si la URL no es válida
              win.loadURL(
                dev ? "http://localhost:3000/es/settings/profile" : currentURL
              );
            }
          },
        },
        { type: "separator" },
        { label: "Salir", role: "quit" },
      ],
    },
    {
      label: "Editar",
      role: "editMenu", // Habilita Copiar, Pegar, etc.
    },
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu); // Aplica el menú a la aplicación
}

const createWindow = async () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "VitalFit",
    icon: path.join(__dirname, "public", "icon.ico"), // Asegúrate que el archivo existe
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Evita bloqueos de CORS en local
      preload: path.join(__dirname, "preload.js"), // Puente de seguridad
    },
    autoHideMenuBar: false, // Asegura que no se oculte
    menubarVisibilityState: "visible", // Fuerza a que sea visible desde el inicio
  });

  // Inicializar el Menú
  createMenu(win);

  if (dev) {
    // MODO DESARROLLO: Conecta al servidor de Next.js en ejecución
    win.loadURL("http://localhost:3000/es/login");
    win.webContents.openDevTools();
  } else {
    // MODO PRODUCCIÓN (El EXE): Levanta servidor Next.js embebido
    try {
      const nextApp = next({
        dev: false,
        dir: app.getAppPath(),
        conf: {
          distDir: ".next",
        },
      });

      const handle = nextApp.getRequestHandler();
      await nextApp.prepare();

      const server = http.createServer((req, res) => {
        handle(req, res);
      });

      // Escuchar en puerto aleatorio disponible para evitar conflictos
      server.listen(0, "localhost", () => {
        const port = server.address().port;
        win.loadURL(`http://localhost:${port}/es/login`);
      });
    } catch (err) {
      console.error("Error iniciando servidor Next en producción:", err);
    }
  }
};

/**
 * Comunicación IPC para los botones de la interfaz
 */
ipcMain.on("nav-back", (event) => {
  const webContents = event.sender; // Detecta automáticamente qué ventana envió el mensaje
  if (webContents.canGoBack()) {
    webContents.goBack();
  }
});

ipcMain.on("nav-forward", (event) => {
  const webContents = event.sender;
  if (webContents.canGoForward()) {
    webContents.goForward();
  }
});

// Ciclo de vida de la aplicación
app.on("ready", createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
