// PreciosYa — Documentación Técnica de Tesis v3.1
// Correcciones Seminario Final — genera Word con diagramas embebidos
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle,
  WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak, ImageRun,
  TabStopType, TabStopPosition, UnderlineType
} = require('docx');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'docs', 'entrega', 'PreciosYa_Documentacion_Tesis_v3.1.docx');
const LOGO_PATH = path.join(ROOT, 'apps', 'web', 'src', 'assets', 'preciosya-logo.png');
const ASSETS = path.join(ROOT, 'docs', 'entrega', 'assets');
const DER_PATH = path.join(ASSETS, 'der-diagram.png');
const LOGO_BUF = fs.existsSync(LOGO_PATH) ? fs.readFileSync(LOGO_PATH) : null;
const DER_BUF = fs.existsSync(DER_PATH) ? fs.readFileSync(DER_PATH) : null;
function loadPng(name) {
  const pth = path.join(ASSETS, name);
  return fs.existsSync(pth) ? fs.readFileSync(pth) : null;
}
const IMG = {
  casosUso: loadPng('uml-casos-uso.png'),
  seqLogin: loadPng('uml-seq-login.png'),
  seqIpc: loadPng('uml-seq-ipc.png'),
  seqUsd: loadPng('uml-seq-usd.png'),
  seqVenta: loadPng('uml-seq-venta.png'),
  seqCron: loadPng('uml-seq-cron.png'),
  clases: loadPng('uml-clases.png'),
  despliegue: loadPng('uml-despliegue.png'),
  componentes: loadPng('componentes.png'),
  capas: loadPng('uml-arquitectura-capas.png'),
  porter: loadPng('porter.png'),
  foda: loadPng('foda.png'),
  bmc: loadPng('bmc.png'),
  gantt: loadPng('gantt.png'),
};
function figure(buf, caption, w = 520, h = 320) {
  if (!buf) return [p(`[FIGURA pendiente: ${caption}]`, { color: AMBER, italic: true })];
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60 },
      children: [new ImageRun({ data: buf, transformation: { width: w, height: h }, type: 'png' })],
    }),
    p(caption, { color: MID, italic: true, align: AlignmentType.CENTER, size: 18 }),
  ];
}

// ── Paleta ─────────────────────────────────────────────────────────────────
const GREEN  = "16A34A";
const GRKD   = "0F3D22";
const AMBER  = "D97706";
const DARK   = "1C1917";
const MID    = "44403C";
const LGRAY  = "F3F4F6";
const CREAM  = "F8F7F4";
const GLIGHT = "DCFCE7";
const WHITE  = "FFFFFF";
const BORDER = "E7E5E4";
const RED    = "DC2626";

// ── Fuente ──────────────────────────────────────────────────────────────────
const FONT = "Calibri";

// ── Helpers básicos ─────────────────────────────────────────────────────────
const border1 = { style: BorderStyle.SINGLE, size: 1, color: BORDER };
const borders  = { top: border1, bottom: border1, left: border1, right: border1 };
const noBorder = { style: BorderStyle.NONE, size: 0, color: WHITE };
const noBorders= { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function sp(before=80, after=80) { return { spacing: { before, after } }; }

// Párrafo simple
function p(text, opts={}) {
  const { bold=false, color=DARK, size=22, italic=false, align=AlignmentType.LEFT } = opts;
  return new Paragraph({
    alignment: align,
    spacing: { before: 60, after: 60 },
    children: [new TextRun({ text, bold, color, size, italic, font: FONT })]
  });
}

// Párrafo mixto (label + texto)
function pMix(label, rest, color=DARK) {
  return new Paragraph({
    spacing: { before: 60, after: 60 },
    children: [
      new TextRun({ text: label, bold: true, color: GRKD, size: 22, font: FONT }),
      new TextRun({ text: rest,  bold: false, color,       size: 22, font: FONT })
    ]
  });
}

// Títulos
function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 160 },
    children: [new TextRun({ text, bold: true, size: 36, color: GRKD, font: FONT })]
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
    children: [new TextRun({ text, bold: true, size: 28, color: GRKD, font: FONT })]
  });
}
function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 80 },
    children: [new TextRun({ text, bold: true, size: 24, color: GREEN, font: FONT })]
  });
}
function h4(text) {
  return new Paragraph({
    spacing: { before: 160, after: 60 },
    children: [new TextRun({ text, bold: true, size: 22, color: AMBER, font: FONT })]
  });
}

// Bullet
function bullet(text, level=0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 40, after: 40 },
    children: [new TextRun({ text, size: 22, color: DARK, font: FONT })]
  });
}
function bulletMix(label, rest) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    spacing: { before: 40, after: 40 },
    children: [
      new TextRun({ text: label, bold: true, size: 22, color: GRKD, font: FONT }),
      new TextRun({ text: rest,  size: 22, color: DARK, font: FONT })
    ]
  });
}

// Salto de página
function pb() { return new Paragraph({ children: [new PageBreak()] }); }

// Espacio vacío
function space(n=1) {
  return new Paragraph({ spacing: { before: 0, after: 0 },
    children: [new TextRun({ text: "", size: n * 20 })] });
}

// Línea divisora
function rule(color=GREEN) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color } }
  });
}

// ── Celdas de tabla ──────────────────────────────────────────────────────────
function cell(text, opts={}) {
  const { w=2000, shade=WHITE, bold=false, color=DARK, size=20,
          align=AlignmentType.LEFT, colspan=1 } = opts;
  return new TableCell({
    borders,
    width: { size: w, type: WidthType.DXA },
    shading: { fill: shade, type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    columnSpan: colspan,
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text, bold, color, size, font: FONT })]
    })]
  });
}
function hdrCell(text, w=2000) {
  return new TableCell({
    borders,
    width: { size: w, type: WidthType.DXA },
    shading: { fill: GRKD, type: ShadingType.CLEAR },
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, size: 20, color: WHITE, font: FONT })]
    })]
  });
}
function row(cells) { return new TableRow({ children: cells }); }

// ── Tabla RF ────────────────────────────────────────────────────────────────
// Widths: ID(1000) | Nombre(2000) | Descripción(4000) | Prio(900) | Tipo(1100) | Estado(1300) = 10300
const RFW = [1000, 2000, 4000, 900, 1100, 1300];
function rfHeader() {
  return new TableRow({
    tableHeader: true,
    children: ["ID","Nombre","Descripción","Prioridad","Tipo","Estado"].map((t,i) =>
      new TableCell({
        borders, width: { size: RFW[i], type: WidthType.DXA },
        shading: { fill: GRKD, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 80, right: 80 },
        children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, size: 18, color: WHITE, font: FONT })] })]
      })
    )
  });
}
function rfRow(id, nombre, desc, prio, tipo, estado, even=false) {
  const shade = even ? CREAM : WHITE;
  const sc = estado==="Implementado" ? GREEN : estado==="Parcial" ? AMBER : RED;
  const vals = [id, nombre, desc, prio, tipo];
  const cs = vals.map((v,i) => new TableCell({
    borders, width: { size: RFW[i], type: WidthType.DXA },
    shading: { fill: shade, type: ShadingType.CLEAR },
    margins: { top: 50, bottom: 50, left: 80, right: 80 },
    children: [new Paragraph({ children: [new TextRun({ text: v, size: 17, color: DARK, font: FONT })] })]
  }));
  cs.push(new TableCell({
    borders, width: { size: RFW[5], type: WidthType.DXA },
    shading: { fill: shade, type: ShadingType.CLEAR },
    margins: { top: 50, bottom: 50, left: 80, right: 80 },
    children: [new Paragraph({ children: [new TextRun({ text: estado, bold: true, size: 17, color: sc, font: FONT })] })]
  }));
  return new TableRow({ children: cs });
}
function rfTable(rows) {
  return new Table({
    width: { size: 10300, type: WidthType.DXA },
    columnWidths: RFW,
    rows: [rfHeader(), ...rows]
  });
}

// ── Tabla CU ────────────────────────────────────────────────────────────────
function cuBlock(id, titulo, items) {
  const CW = [2200, 7600];
  function cuRow(label, content, even=false) {
    return new TableRow({ children: [
      new TableCell({
        borders, width: { size: CW[0], type: WidthType.DXA },
        shading: { fill: even ? CREAM : GLIGHT, type: ShadingType.CLEAR },
        margins: { top: 70, bottom: 70, left: 100, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, color: GRKD, font: FONT })] })]
      }),
      new TableCell({
        borders, width: { size: CW[1], type: WidthType.DXA },
        shading: { fill: WHITE, type: ShadingType.CLEAR },
        margins: { top: 70, bottom: 70, left: 100, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: content, size: 20, color: DARK, font: FONT })] })]
      })
    ]});
  }
  const labels = ["Actor principal","Precondición","Flujo principal","Flujo alternativo","Postcondición","Excepciones"];
  return [
    h3(`${id} — ${titulo}`),
    new Table({
      width: { size: 9800, type: WidthType.DXA },
      columnWidths: CW,
      rows: labels.map((l,i) => cuRow(l, items[i] || "—", i%2===0))
    }),
    space(0.5)
  ];
}

// ── Tabla CP ────────────────────────────────────────────────────────────────
function cpBlock(id, nombre, entrada, esperado, obtenido, estado) {
  const sc = estado==="Aprobado" ? GREEN : estado.includes("Fuera") ? RED : AMBER;
  const CW = [2200, 7600];
  function cpRow(label, content, even=false) {
    return new TableRow({ children: [
      new TableCell({
        borders, width: { size: CW[0], type: WidthType.DXA },
        shading: { fill: even ? CREAM : GLIGHT, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, color: GRKD, font: FONT })] })]
      }),
      new TableCell({
        borders, width: { size: CW[1], type: WidthType.DXA },
        shading: { fill: WHITE, type: ShadingType.CLEAR },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [new Paragraph({ children: [new TextRun({ text: content, size: 20, color: DARK, font: FONT })] })]
      })
    ]});
  }
  return [
    new Table({
      width: { size: 9800, type: WidthType.DXA },
      columnWidths: CW,
      rows: [
        cpRow("ID / Nombre", `${id} — ${nombre}`, false),
        cpRow("Datos de entrada", entrada, true),
        cpRow("Resultado esperado", esperado, false),
        cpRow("Resultado obtenido", obtenido, true),
        new TableRow({ children: [
          new TableCell({ borders, width: { size: CW[0], type: WidthType.DXA }, shading: { fill: GLIGHT, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: "Estado", bold: true, size: 20, color: GRKD, font: FONT })] })] }),
          new TableCell({ borders, width: { size: CW[1], type: WidthType.DXA }, shading: { fill: WHITE, type: ShadingType.CLEAR }, margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [new Paragraph({ children: [new TextRun({ text: estado, bold: true, size: 20, color: sc, font: FONT })] })] })
        ]})
      ]
    }),
    space(0.4)
  ];
}

// ── Tabla genérica 2 cols ────────────────────────────────────────────────────
function table2(headers, rows2, widths=[4000,5800]) {
  return new Table({
    width: { size: widths[0]+widths[1], type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h,i) => hdrCell(h, widths[i])) }),
      ...rows2.map((r, ri) => new TableRow({ children: r.map((v,ci) => cell(v, { w: widths[ci], shade: ri%2===0?WHITE:CREAM })) }))
    ]
  });
}

// ── Tabla genérica N cols ────────────────────────────────────────────────────
function tableN(headers, rows2, widths) {
  return new Table({
    width: { size: widths.reduce((a,b)=>a+b,0), type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h,i) => hdrCell(h, widths[i])) }),
      ...rows2.map((r,ri) => new TableRow({ children: r.map((v,ci) => cell(v, { w: widths[ci], shade: ri%2===0?WHITE:CREAM })) }))
    ]
  });
}

// ── Mermaid block (como código) ──────────────────────────────────────────────
function mermaidBlock(code) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    shading: { fill: "F0FFF4", type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 8, color: GREEN } },
    children: [new TextRun({ text: code, size: 18, color: "166534", font: "Courier New" })]
  });
}

// Helper para bloques de código grandes (texto + saltos)
function codeLines(lines) {
  return lines.map(line => new Paragraph({
    spacing: { before: 0, after: 0 },
    shading: { fill: "F0FFF4", type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 8, color: GREEN } },
    children: [new TextRun({ text: line, size: 18, color: "166534", font: "Courier New" })]
  }));
}

// ── Nota informativa (box ámbar) ─────────────────────────────────────────────
function noteBox(text) {
  return new Paragraph({
    spacing: { before: 100, after: 100 },
    shading: { fill: "FEF9C3", type: ShadingType.CLEAR },
    border: { left: { style: BorderStyle.SINGLE, size: 8, color: AMBER } },
    children: [new TextRun({ text: "📌 " + text, size: 20, color: "92400E", font: FONT })]
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONTENIDO
// ═══════════════════════════════════════════════════════════════════════════════

// ── PORTADA ──────────────────────────────────────────────────────────────────
function portada() {
  const TW = [3600, 6000];
  function fRow(label, val, even=false) {
    return new TableRow({ children: [
      cell(label, { w: TW[0], shade: even?CREAM:GLIGHT, bold: true, color: GRKD }),
      cell(val,   { w: TW[1], shade: even?WHITE:WHITE })
    ]});
  }
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 800, after: 120 },
      children: [new TextRun({ text: "PRECIOSYA", bold: true, size: 60, color: GRKD, font: FONT })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 },
      children: [new TextRun({ text: "Gestor de precios y márgenes mobile-first para comercios pequeños", size: 26, color: MID, font: FONT, italic: true })]
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER, spacing: { before: 0, after: 320 },
      children: [new TextRun({ text: "DOCUMENTACIÓN TÉCNICA DE TESIS — VERSIÓN 3.1", bold: true, size: 24, color: AMBER, font: FONT })]
    }),
    new Table({
      width: { size: 9600, type: WidthType.DXA }, columnWidths: TW,
      rows: [
        fRow("Proyecto","PreciosYa — Gestor de precios y márgenes mobile-first",false),
        fRow("Carrera","Analista de Sistemas",true),
        fRow("Institución","Escuela Multimedial Da Vinci",false),
        fRow("Materia","Seminario Final",true),
        fRow("Docente","Gabriel Ernesto Cavasso",false),
        fRow("Cuatrimestre","6.º Cuatrimestre — 2026 | Curso ACM6AP",true),
        fRow("Integrante","VILLANUEVA, Lautaro Nahuel",false),
        fRow("Versión","3.1 — julio 2026 (correcciones Seminario Final; APK Android verificada)",true),
        fRow("App","https://preciosya.vercel.app",false),
        fRow("Alias app (Vercel)","https://preciosya-app.vercel.app — alias secundario del proyecto web / origen adicional de la APK",true),
        fRow("Landing","https://preciosya-landing.vercel.app",false),
        fRow("API Railway","https://api-production-3626.up.railway.app",true),
        fRow("Contacto","sales@preciosya.com",false),
      ]
    }),
    pb()
  ];
}

// ── SECCIÓN 1: INTRODUCCIÓN ───────────────────────────────────────────────────
function seccion1() {
  return [
    h1("1. Introducción"),
    h2("1.1 Descripción del proyecto"),
    p("PreciosYa es una aplicación web progresiva (PWA) y paquete Android (APK) diseñada para resolver un problema exclusivamente argentino: la gestión manual de precios y márgenes en contextos de alta inflación. El sistema permite a dueños de kioscos, almacenes y pequeños comercios calcular, actualizar y proteger sus precios de venta con base en costos de proveedores e índices económicos oficiales del INDEC y el BCRA."),
    p("La plataforma es un SaaS Freemium mobile-first. No es un POS, no es un sistema de facturación ni un ERP. Su función específica es la gestión de precios y márgenes."),
    space(),
    pMix("Stack tecnológico: ", "React 19 + Vite + PWA Plugin (preciosya.vercel.app) + API Express 4 / Prisma en Railway + Supabase (Auth, DB, Storage)."),
    pMix("APK Android: ", "La misma PWA empaquetada como APK Android, sin lógica nativa adicional (sin push nativo, sin widget, sin biometría propia, sin offline bidireccional completo). Paquete: app.preciosya.twa."),
    space(),
    p("El sistema aplica el IPC del INDEC por rubro (divisiones COICOP), no un único índice mensual a todo el catálogo. Adicionalmente, permite indexar rubros sensibles al tipo de cambio oficial BCRA. La actualización de índices ocurre mediante cron diario en Railway (IPC 03:00 ART, BCRA 03:30 ART) con fuentes Alphacast/Argly y fallback de carga manual desde el panel de administración."),

    h2("1.2 Problemática identificada"),
    p("De acuerdo al relevamiento de campo realizado con n = 4 comerciantes del GBA (muestra de conveniencia, método entrevista semiestructurada + observación directa):"),
    bullet("Los cuatro entrevistados actualizan precios de forma manual (papel, calculadora o Excel)."),
    bullet("Tiempo promedio dedicado a remarcación: ~2 h/semana (rango: 1,5–2,5 h)."),
    bullet("El 100% ajusta algún rubro «al dólar», pero lo hace a ojo, sin fórmula ni registro."),
    bullet("Disposición a pagar: $4.000–$7.000/mes, promedio ~$5.500. El plan Pro a $4.500 queda por debajo del valor percibido."),
    bullet("La barrera principal no es el precio, sino el hábito manual (papel/Excel)."),
    p("No existe en el mercado argentino ninguna solución digital simple, accesible y orientada específicamente a este segmento con integración de IPC por rubro y tipo de cambio BCRA."),

    h2("1.3 Objetivos del sistema"),
    h3("Objetivos implementados (v1/v2 — junio 2026)"),
    bullet("✅ Automatizar el cálculo del precio de venta a partir del costo y el margen deseado (redondeo a decenas)."),
    bullet("✅ Integrar IPC del INDEC por rubro (COICOP) para actualización masiva con un toque (apply-ipc)."),
    bullet("✅ Indexar rubros sensibles al tipo de cambio oficial BCRA (variación diaria) con apply-usd."),
    bullet("✅ Alertar al comerciante cuando el margen de un producto cae por debajo del umbral mínimo del local."),
    bullet("✅ Registrar historial de precios append-only (price_history) con motivo de cada cambio."),
    bullet("✅ Exportar lista de precios como imagen PNG y compartir por WhatsApp (Web Share API)."),
    bullet("✅ Escanear códigos de barras (cámara del dispositivo, con autocompletado desde Open Food Facts)."),
    bullet("✅ Registrar ventas en gestor simplificado (snapshot de rentabilidad, sin caja, ticket ni stock)."),
    bullet("✅ Operar como PWA con soporte offline limitado (caché/lectura); sin sincronización bidireccional completa."),
    bullet("✅ Gestionar múltiples locales según plan (Free: 1, Pro: 3, Agency: ilimitado)."),
    bullet("✅ Panel de administración: usuarios, carga manual de IPC, estadísticas."),
    bullet("✅ APK Android verificada con Digital Asset Links y assetlinks.json. Pantalla completa sin barra de URL."),
    h3("Objetivos fuera de alcance por el momento"),
    bullet("❌ Sincronización offline bidireccional completa."),
    bullet("❌ Notificaciones push nativas en APK (fuera de alcance v1; requeriría FCM adicional)."),
    bullet("❌ Widget de pantalla de inicio Android."),
    bullet("❌ Autenticación biométrica propia."),

    h2("1.4 Alcance"),
    p("El sistema contempla dos superficies de entrega que comparten backend y base de datos:"),
    bulletMix("PWA (preciosya.vercel.app): ", "accesible desde cualquier navegador, mobile-first. Toda la funcionalidad del producto."),
    bulletMix("APK Android: ", "misma PWA empaquetada. Agrega instalación directa, acceso a cámara nativa (EAN-13) y Digital Asset Links (assetlinks.json). No agrega push nativo, widget ni biometría."),
    bulletMix("Backend: ", "API Express 4/Prisma en Railway. Supabase gestiona Auth (Google OAuth), base de datos (PostgreSQL) y Storage (imágenes PNG)."),
    noteBox("Nota técnica APK (jun. 2026): huella SHA-256 assetlinks = 09:49:6E:73:4D:68:B1:2C:A0:87:CA:01:8D:BF:6D:E1:77:94:70:68:89:B6:45:51:D1:5E:C2:2D:2E:20:73:66. Tras cada deploy en Vercel, reasignar el alias preciosya.vercel.app al deployment activo manualmente."),
    pb()
  ];
}

// ── SECCIÓN 2: RF WEB ────────────────────────────────────────────────────────
function seccion2() {
  const rows = [
    ["RF-W001","Login Google OAuth","El usuario se registra/autentica mediante su cuenta de Google (Supabase Auth). Sin formularios adicionales.","Alta","Acceso","Implementado"],
    ["RF-W002","JWT + sesión","Autenticación JWT generado por Supabase; refresco automático de sesión.","Alta","Acceso","Implementado"],
    ["RF-W003","Alta de local comercial","El comerciante registra su negocio con nombre, dirección y margen mínimo. Límite por plan (Free: 1, Pro: 3, Agency: ilimitado).","Alta","ABM","Implementado"],
    ["RF-W004","Activación de rubros COICOP","El usuario activa/desactiva rubros predefinidos del catálogo COICOP/INDEC. No se crean categorías custom.","Alta","ABM","Implementado"],
    ["RF-W005","Toggle 'Indexar USD' por rubro","Cada rubro activo puede marcarse para indexación por USD BCRA. Excluye ese rubro del apply-ipc.","Alta","ABM","Implementado"],
    ["RF-W006","Alta de producto","Registro con nombre, barcode opcional, cost, margin_pct y sale_price calculado automáticamente.","Alta","ABM","Implementado"],
    ["RF-W007","Escáner de código de barras","PWA accede a cámara del dispositivo para EAN-13. Autocompleta nombre desde Open Food Facts.","Alta","ABM","Implementado"],
    ["RF-W008","Modificación de producto","Edición de cost, margin_pct y nombre con recálculo automático de sale_price.","Alta","ABM","Implementado"],
    ["RF-W009","Baja lógica de producto","Desactivación sin eliminación física para preservar price_history.","Media","ABM","Implementado"],
    ["RF-W010","Cálculo automático de precio","sale_price = cost × (1 + margin_pct/100), redondeado a la decena más cercana.","Alta","Lógica","Implementado"],
    ["RF-W011","Actualización masiva por porcentaje","Aumento del cost de todos los productos o de un rubro completo por % ingresado.","Alta","Lógica","Implementado"],
    ["RF-W012","IPC multi-serie por rubro","El sistema obtiene el IPC correspondiente a cada rubro COICOP (no índice único). Fuentes: Alphacast/Argly + fallback manual admin.","Alta","Lógica","Implementado"],
    ["RF-W013","Apply-IPC por local","Aplica IPC pendiente al local. Solo rubros sin flag indexByUsd. Banner pendiente/aplicado.","Alta","Lógica","Implementado"],
    ["RF-W014","Apply-USD por local","Aplica variación diaria USD BCRA a rubros con flag indexByUsd. Registra change_reason BCRA_RATE.","Alta","Lógica","Implementado"],
    ["RF-W015","Cron actualización índices","Proceso automático diario: IPC a las 03:00 ART y USD BCRA a las 03:30 ART (timezone America/Argentina/Buenos_Aires). Upsert en economic_indices.","Alta","Sistema","Implementado"],
    ["RF-W016","Alertas de margen","Marca productos con is_margin_alert cuando margin_pct < min_margin_pct del local. Notificación in-app.","Alta","Alerta","Implementado"],
    ["RF-W017","Historial de precios append-only","Registro cronológico en price_history con change_reason: MANUAL, BULK_PCT, IPC_INDEC, BCRA_RATE, IMPORT.","Alta","Reporte","Implementado"],
    ["RF-W018","Exportación PNG","Generación de lista de precios como imagen PNG (html2canvas) guardada en Supabase Storage.","Alta","Exportación","Implementado"],
    ["RF-W019","Compartir por WhatsApp","Botón de compartir lista PNG por WhatsApp (Web Share API).","Alta","Exportación","Implementado"],
    ["RF-W020","Notificaciones in-app","Notificaciones in-app (Supabase Realtime). NEW_IPC: Ver rubros → desglose gráfico 13 series COICOP (Chart.js). Sin push nativo.","Media","Notificación","Implementado"],
    ["RF-W021","Gestor de ventas lite","Registro de ventas con snapshot de rentabilidad. Free: historial y resumen limitados a los últimos 7 días. Pro: gestor completo / analytics. Sin cobro, ticket ni stock.","Media","Ventas","Implementado"],
    ["RF-W022","Planes y suscripción","FREE (30 productos, 1 local; incluye IPC/USD/alertas/PNG; ventas 7 días). PRO ($4.500 ARS/mes vía Mercado Pago sandbox: capacidad + analytics ventas + email IPC). AGENCY a medida.","Alta","Admin","Implementado"],
    ["RF-W023","Panel de administración","Gestión de usuarios, carga manual de IPC, estadísticas globales.","Alta","Admin","Implementado"],
    ["RF-W024","Modo offline limitado (PWA)","PWA con Workbox: lectura en caché sin conexión. Sin sync bidireccional ni edición offline con reconciliación.","Baja","PWA","Parcial"],
    ["RF-W025","Gráfico evolución de precios","Visualización de la evolución histórica de sale_price por producto en /history con Chart.js.","Baja","Reporte","Implementado"],
  ];
  return [
    h1("2. Requisitos Funcionales — Plataforma Web (PWA)"),
    p("Los siguientes requisitos corresponden a la versión web progresiva (PWA). Estado al 30/06/2026. Nota: el frontend usa React 19 (actualizado desde v18)."),
    space(),
    rfTable(rows.map((r,i) => rfRow(r[0],r[1],r[2],r[3],r[4],r[5],i%2!==0))),
    pb()
  ];
}

// ── SECCIÓN 3: RF APK ────────────────────────────────────────────────────────
function seccion3() {
  const rows = [
    ["RF-A001","Descarga directa APK","Distribución por archivo APK sin Google Play Store. URLs: preciosya-landing.vercel.app/preciosya.apk y preciosya.vercel.app/preciosya.apk.","Alta","Distribución","Implementado"],
    ["RF-A002","Paridad funcional con PWA","La APK expone las mismas funcionalidades que la PWA. No agrega lógica propia de negocio.","Alta","APK","Implementado"],
    ["RF-A003","Digital Asset Links","assetlinks.json en /.well-known/ verifica la relación entre dominio web y app Android. Huella SHA-256 verificada jun. 2026.","Alta","Seguridad","Implementado"],
    ["RF-A004","Acceso a cámara para escáner","La APK accede a la cámara nativa del dispositivo para escanear códigos EAN-13.","Alta","Lógica","Implementado"],
    ["RF-A005","Autocompletado por escaneo","Al escanear un código no registrado, el sistema precompleta nombre desde Open Food Facts.","Alta","ABM","Implementado"],
    ["RF-A006","Pantalla completa sin barra URL","Experiencia standalone verificada: sin barra de URL ni mensaje 'Se está ejecutando en Chrome'. Requiere assetlinks.json válido.","Alta","APK","Implementado"],
    ["RF-A007","Notificaciones in-app (Realtime)","La APK recibe notificaciones in-app a través de Supabase Realtime. Sin push nativo (fuera de alcance v1; sin FCM).","Media","Notificación","Implementado"],
    ["RF-A008","Script regeneración APK","Script scripts/build-preciosya-apk.mjs para regenerar el APK ante cambios de certificado o dominio.","Alta","Build","Implementado"],
    ["RF-A009","Push nativo APK (IPC/margen)","Notificaciones push nativas cuando el INDEC publica IPC o cuando hay alertas de margen.","Alta","Notificación","Fuera de alcance v1"],
    ["RF-A010","Offline completo con sync","Gestión offline total con sincronización automática al recuperar internet.","Alta","Offline","Fuera de alcance v1"],
    ["RF-A011","Widget de pantalla de inicio","Widget que muestra el total de alertas de margen activas.","Baja","UX","Fuera de alcance v1"],
    ["RF-A012","Biometría para login","Autenticación por huella dactilar o reconocimiento facial.","Baja","Seguridad","Fuera de alcance v1"],
  ];
  return [
    h1("3. Requisitos Funcionales — APK Android"),
    p("La APK de PreciosYa empaqueta la misma PWA en una shell Android. Comparte el backend API REST con la versión web. Paquete: app.preciosya.twa."),
    pMix("Host principal de la APK: ", "https://preciosya.vercel.app"),
    pMix("Alias app (origen adicional): ", "https://preciosya-app.vercel.app — alias secundario del mismo proyecto Vercel «web». Se declara como origen adicional de confianza de la APK y en assetlinks; no es un producto distinto ni un typo de la landing."),
    space(),
    rfTable(rows.map((r,i) => rfRow(r[0],r[1],r[2],r[3],r[4],r[5],i%2!==0))),
    pb()
  ];
}

// ── SECCIÓN 4: CASOS DE USO ──────────────────────────────────────────────────
function seccion4() {
  const actores = [
    ["Comerciante (usuario)","Propietario o encargado de un kiosco o almacén. Usuario principal del sistema."],
    ["Administrador","Equipo de PreciosYa. Gestiona usuarios, carga manual de índices y monitorea el sistema."],
    ["Sistema INDEC / Alphacast (externo)","API pública que provee los valores del IPC mensual por rubro COICOP."],
    ["Sistema BCRA (externo)","API pública del BCRA que provee la cotización y variación diaria del dólar oficial."],
    ["Mercado Pago (externo)","Pasarela de pago para suscripciones al plan Pro (sandbox en etapa tesis)."],
    ["Cron / Scheduler","Proceso automático en Railway que ejecuta la sincronización de índices."],
  ];

  const cus = [
    ["CU-01","Iniciar sesión con Google",
      "Comerciante",
      "El usuario no tiene sesión activa en PreciosYa.",
      "1. El usuario accede a preciosya.vercel.app. 2. Hace clic en 'Ingresar con Google'. 3. Autoriza el acceso a su cuenta de Gmail (Supabase Auth). 4. El sistema verifica el token JWT, ejecuta findOrCreateUser en PostgreSQL y redirige al /dashboard con plan Free activo.",
      "Si la cuenta de Google ya existe, el sistema inicia sesión directamente sin crear un nuevo perfil.",
      "El usuario tiene sesión activa (JWT) y puede acceder a todas las funciones del plan Free.",
      "E1: Cancelación OAuth → mensaje 'Autenticación cancelada'. E2: Falla de red → mensaje de error con opción de reintentar."],
    ["CU-02","Crear local",
      "Comerciante",
      "El usuario tiene sesión activa. Si está en plan Free, no tiene locales creados aún.",
      "1. El comerciante accede a Ajustes > Locales > Nuevo local. 2. Ingresa nombre, dirección y margen mínimo porcentual (min_margin_pct). 3. El sistema valida el límite según plan y guarda el local.",
      "Si el usuario Free ya tiene 1 local, el sistema muestra el modal de upgrade a Pro.",
      "El local queda registrado. El comerciante puede empezar a activar rubros y agregar productos.",
      "E1: Plan Free con 1 local existente → modal de upgrade. E2: Nombre vacío → validación de campo requerido."],
    ["CU-03","Activar rubros COICOP",
      "Comerciante",
      "El usuario tiene sesión activa y al menos un local registrado.",
      "1. El comerciante accede a Rubros (/categories). 2. Visualiza el listado de category_templates COICOP/INDEC. 3. Activa o desactiva rubros con el toggle. 4. Opcionalmente, activa el toggle 'Indexar USD' por rubro. 5. El sistema actualiza la tabla categories (is_active, indexByUsd).",
      "El usuario puede activar varios rubros en secuencia sin guardar uno por uno.",
      "Los rubros activos aparecen como agrupadores en la sección Productos. Los rubros con indexByUsd se excluyen del apply-ipc.",
      "E1: Sin locales creados → el sistema solicita crear un local primero."],
    ["CU-04","Alta producto con escáner",
      "Comerciante",
      "El usuario tiene sesión activa y al menos un local con rubros activados.",
      "1. El comerciante accede a Productos > Nuevo producto. 2. Escanea o ingresa manualmente el código EAN-13. 3. Si el código está en Open Food Facts, el sistema precompleta el nombre. 4. El comerciante ingresa cost y margin_pct. 5. El sistema calcula sale_price = cost × (1 + margin_pct/100) redondeado a la decena más cercana. 6. Confirma y el sistema guarda el producto + registra en price_history con change_reason MANUAL.",
      "Sin escáner disponible: el comerciante ingresa nombre y barcode manualmente.",
      "El producto aparece en la lista del local con precio y margen calculados.",
      "E1: Plan Free con 30 productos → modal de upgrade. E2: cost ≤ 0 → error de validación."],
    ["CU-05","Editar producto",
      "Comerciante",
      "El usuario tiene sesión activa y al menos un producto registrado.",
      "1. El comerciante selecciona un producto de la lista. 2. Modifica cost, margin_pct o nombre. 3. El sistema recalcula sale_price automáticamente. 4. Al guardar, registra el cambio en price_history con change_reason MANUAL.",
      "—",
      "El producto tiene el nuevo precio y el historial queda actualizado.",
      "E1: cost negativo → error de validación."],
    ["CU-06","Ver alertas de margen",
      "Comerciante",
      "El usuario tiene al menos un local con productos y un margen mínimo configurado.",
      "1. El sistema compara margin_pct de cada producto con min_margin_pct del local. 2. Si margin_pct < min_margin_pct, el sistema marca is_margin_alert = true y muestra el producto destacado en rojo. 3. El comerciante puede filtrar la vista por 'Solo alertas' para ver los productos en riesgo.",
      "Si el comerciante actualiza el costo o el margen mínimo, las alertas se recalculan en tiempo real.",
      "El comerciante tiene visibilidad de todos los productos que están vendiendo por debajo del margen mínimo.",
      "E1: Sin margen mínimo configurado → el sistema no genera alertas."],
    ["CU-07","Actualización masiva por %",
      "Comerciante",
      "El usuario tiene sesión activa y al menos un producto en el local.",
      "1. El comerciante accede a Productos > Actualizar masivo. 2. Selecciona un rubro o todos los productos. 3. Ingresa el porcentaje de aumento de costo. 4. El sistema actualiza el cost de todos los productos seleccionados y recalcula sale_price. 5. Registra en price_history con change_reason BULK_PCT.",
      "El comerciante puede previsualizar el impacto antes de confirmar.",
      "Todos los productos seleccionados tienen cost y sale_price actualizados. Historial registrado.",
      "E1: Porcentaje = 0 → el sistema advierte que no habrá cambios."],
    ["CU-08","Aplicar IPC al local",
      "Comerciante / Sistema",
      "El cron diario 03:00 ART actualizó economic_indices con el IPC del período. El local tiene rubros activos sin flag indexByUsd.",
      "1. El sistema detecta IPC pendiente (last_ipc_applied_period desactualizado) y muestra banner. 2. El comerciante hace clic en 'Aplicar IPC'. 3. La API PUT /api/locals/:id/apply-ipc invoca economic-index.service. 4. El servicio actualiza cost de productos en rubros elegibles (excluye indexByUsd). 5. Recalcula sale_price. 6. Registra change_reason IPC_INDEC en price_history. 7. Actualiza last_ipc_applied_period en el local.",
      "El comerciante puede ignorar el banner y aplicar manualmente desde el panel de índices.",
      "Todos los rubros elegibles tienen cost y sale_price actualizados. Banner cambia a 'IPC aplicado'.",
      "E1: API de índices no disponible → el sistema usa último valor en caché y lo indica al usuario."],
    ["CU-09","Aplicar variación USD BCRA",
      "Comerciante / Sistema",
      "El cron diario actualizó economic_indices con la variación USD BCRA. El local tiene al menos un rubro con flag indexByUsd.",
      "1. El sistema detecta variación USD pendiente y muestra banner en rubros USD. 2. El comerciante hace clic en 'Aplicar USD'. 3. La API PUT /api/locals/:id/apply-usd invoca economic-index.service. 4. El servicio aplica la variación BCRA solo a rubros con indexByUsd = true. 5. Recalcula sale_price. 6. Registra change_reason BCRA_RATE. 7. Actualiza last_usd_applied_period en el local.",
      "El comerciante puede aplicar manualmente desde el panel de índices si omitió el banner.",
      "Los rubros USD tienen cost y sale_price actualizados según la variación del día.",
      "E1: API BCRA no disponible → usa último value_pct en caché de economic_indices."],
    ["CU-10","Consultar historial de precios",
      "Comerciante",
      "El usuario tiene sesión activa y al menos un producto con registros en price_history.",
      "1. El comerciante accede a Historial (/history). 2. Selecciona un producto. 3. El sistema muestra la evolución de sale_price con Chart.js (gráfico de línea) y la tabla de registros con change_reason y fecha. 4. El comerciante puede filtrar por rango de fechas.",
      "—",
      "El comerciante visualiza la evolución del precio de cada producto en el tiempo.",
      "E1: Sin historial para el producto → el sistema muestra 'Sin registros disponibles'."],
    ["CU-11","Consultar resumen ventas",
      "Comerciante",
      "El usuario tiene sesión activa y al menos una venta registrada.",
      "1. El comerciante accede a Ventas (/sales) > pestaña Resumen. 2. El sistema muestra KPIs: ingresos totales, margen promedio, cantidad de ventas. 3. El comerciante puede filtrar por período.",
      "—",
      "El comerciante tiene visibilidad del desempeño de su negocio en el período seleccionado.",
      "E1: Sin ventas en el período → el sistema muestra 'Sin datos para el período seleccionado'."],
    ["CU-12","Registrar venta (gestor lite)",
      "Comerciante",
      "El usuario tiene sesión activa y al menos un producto en el local.",
      "1. El comerciante accede a Ventas > Nueva venta. 2. Selecciona o escanea los productos vendidos con sus cantidades. 3. El sistema calcula el snapshot: revenue = Σ(unit_sale_price × qty), cost_snap = Σ(unit_cost_snapshot × qty). 4. El comerciante confirma. 5. La API POST /api/sales ejecuta sale.service en transacción: crea Sale + SaleLines.",
      "—",
      "La venta queda registrada en sales y sale_lines. El sistema NO gestiona stock ni emite ticket ni procesa cobro.",
      "E1: Producto sin sale_price → el sistema solicita actualizar el precio antes de registrar."],
    ["CU-13","Consultar historial ventas",
      "Comerciante",
      "El usuario tiene sesión activa y al menos una venta registrada.",
      "1. El comerciante accede a Ventas > Historial. 2. El sistema lista las ventas con fecha, nota y margen_snapshot. 3. Al expandir una venta, muestra el detalle de SaleLines.",
      "—",
      "El comerciante puede revisar el detalle de cada venta registrada.",
      "E1: Sin ventas → muestra 'Todavía no registraste ventas'."],
    ["CU-14","Exportar lista PNG",
      "Comerciante",
      "El local tiene al menos un producto activo.",
      "1. El comerciante accede a Lista de precios (/price-list). 2. Hace clic en 'Generar lista'. 3. El sistema genera imagen PNG con html2canvas y la sube a Supabase Storage (PriceList). 4. El comerciante puede descargar o compartir por WhatsApp (Web Share API).",
      "—",
      "El PNG está disponible para descarga y compartir. Registro creado en PriceList.",
      "E1: Local sin productos activos → mensaje 'Agregá productos antes de generar la lista'."],
    ["CU-15","Consultar plan y mejorar (Pro vía Mercado Pago)",
      "Comerciante",
      "El usuario está en plan Free y superó el límite de 30 productos o quiere agregar un segundo local.",
      "1. El sistema muestra modal de upgrade o el comerciante accede a Ajustes > Plan. 2. Hace clic en 'Suscribirse a Pro'. 3. Se redirige a Mercado Pago (sandbox en etapa tesis). 4. Completado el pago, el sistema actualiza el campo plan del usuario y registra en subscriptions.",
      "El administrador puede activar Pro manualmente desde el panel admin.",
      "El usuario accede a hasta 3 locales y productos ilimitados.",
      "E1: Pago rechazado → el usuario mantiene plan Free. E2: Timeout → el sistema verifica el estado con MP webhook."],
    ["CU-16","Admin: forzar IPC / gestionar usuarios",
      "Administrador",
      "El administrador está autenticado con flag is_admin = true.",
      "1. El admin accede al panel /admin. 2. Puede: (a) cargar manualmente el value_pct de un período en economic_indices si la fuente automática falló; (b) ver listado de usuarios con plan y estado; (c) activar plan Pro a un usuario específico; (d) ver estadísticas globales de uso.",
      "—",
      "El índice queda disponible para aplicar desde los locales. Los cambios de plan se reflejan inmediatamente.",
      "E1: value_pct fuera de rango razonable → advertencia de validación. E2: Usuario no encontrado → mensaje de error."],
    ["CU-17","Sincronizar índices (cron automático)",
      "Cron / Scheduler",
      "El servicio Railway está activo. Las fuentes Alphacast/BCRA están disponibles.",
      "1. El cron se ejecuta según la programación configurada con node-cron (timezone America/Argentina/Buenos_Aires). 2. Para IPC: ipc-fetch consulta Alphacast/Argly todos los días a las 03:00 ART (idempotente: si el período ya existe en economic_indices, no vuelve a insertar). 3. Para USD BCRA: bcra.service consulta diariamente a las 03:30 ART. 4. Los valores se insertan o actualizan en economic_indices (type, value_pct, period, source_url). 5. El sistema emite notificaciones in-app (NEW_IPC / BCRA_USD_ALERT según umbral) a usuarios activos.",
      "Si la fuente primaria falla, el cron intenta el fallback / cache local. Si no hay dato usable, el admin puede cargar el valor manualmente (CU-16).",
      "economic_indices contiene los últimos índices disponibles. Los locales pueden ver banner de actualización pendiente (IPC/USD) hasta aplicar.",
      "E1: Fuente no disponible → log de error; se mantiene cache si existe. E2: Valor ya insertado para el período → se omite (idempotencia)."],
    ["CU-18","Instalar APK Android",
      "Comerciante (Android)",
      "El comerciante tiene un dispositivo Android 8+ con el permiso 'instalar apps desconocidas' habilitado.",
      "1. El comerciante accede a preciosya-landing.vercel.app. 2. Descarga preciosya.apk. 3. Instala y abre desde el launcher. 4. La APK carga preciosya.vercel.app (alias preciosya-app.vercel.app como origen adicional). 5. Login Google (CU-01).",
      "Si assetlinks falla, la app abre con barra Chrome (estético; reasignar alias Vercel).",
      "App instalada en modo standalone con paridad funcional PWA.",
      "E1: Android < 8 → incompatibilidad. E2: assetlinks inválido → Custom Tabs."],
    ["CU-19","Baja lógica de producto",
      "Comerciante",
      "Sesión activa; producto activo en el local.",
      "1. Productos → seleccionar producto. 2. Desactivar / baja lógica. 3. API soft-delete (is_active=false).",
      "—",
      "Producto deja de listarse y exportarse; permanece en price_history y ventas históricas.",
      "E1: no se elimina físicamente (RESTRICT / soft delete)."],
    ["CU-20","Notificaciones in-app",
      "Comerciante",
      "Sesión activa; Realtime habilitado.",
      "1. Evento (IPC nuevo, alerta margen). 2. API crea notifications (NEW_IPC incluye metadata.series con 13 series COICOP). 3. Supabase Realtime → campana in-app. 4. En IPC: Ver rubros abre desglose gráfico (barras Chart.js + leyenda íconos) vía metadata o GET /api/ipc/series. 5. Usuario marca leída / aplica desde Productos.",
      "—",
      "Usuario ve título/cuerpo y, en IPC, comparativa gráfica por división; sin push nativo (fuera de alcance v1).",
      "E1: Realtime caído → lista al refrescar /api/notifications. E2: sin metadata.series → carga GET /api/ipc/series."],
    ["CU-21","Modo offline limitado (lectura en caché)",
      "Comerciante",
      "App cargada previamente con conexión (Workbox).",
      "1. Pérdida de red → banner offline. 2. Lectura de datos precacheados. 3. Sin edición ni sync bidireccional. 4. Al recuperar red, reanuda API.",
      "—",
      "Consulta de catálogo en caché posible; sin reconciliación offline.",
      "E1: primera visita sin caché → sin datos offline."],
  ];

  return [
    h1("4. Casos de Uso"),
    h2("4.1 Actores del sistema"),
    table2(["Actor","Descripción"], actores, [3000, 6800]),
    space(),
    h2("4.2 Detalle de casos de uso (CU-01 a CU-21)"),
    ...cus.flatMap(cu => cuBlock(cu[0], cu[1], [cu[2],cu[3],cu[4],cu[5],cu[6],cu[7]])),
    space(),
    h3("NT-BUILD — Regenerar APK Android (desarrollador)"),
    p("Actor: Desarrollador / administrador técnico. RF: RF-A008. No es un caso de uso del comerciante (no se vincula a CU-18). Flujo: node scripts/build-preciosya-apk.mjs → actualizar assetlinks.json → deploy web → reasignar alias preciosya.vercel.app si aplica."),
    pb()
  ];
}

// ── SECCIÓN 4B: DIAGRAMAS UML ────────────────────────────────────────────────
function seccionUML() {
  return [
    h1("4b. Diagramas UML"),

    h2("4b.1 Diagrama de casos de uso"),
    p("Actores: Comerciante, Administrador y Sistema externo (cron). Incluye CU-01 a CU-21 alineados a la sección 4."),
    ...figure(IMG.casosUso, "Figura 4b.1 — Diagrama de casos de uso (CU-01 a CU-21)", 520, 420),

    h2("4b.2 Diagrama de secuencia — Login Google OAuth"),
    p("Flujo: OAuth en el frontend vía Supabase Auth; la API verifica el JWT (sin RLS) y crea o encuentra el usuario en PostgreSQL."),
    ...figure(IMG.seqLogin, "Figura 4b.2 — Secuencia Login Google OAuth", 500, 360),

    h2("4b.3 Diagrama de secuencia — Aplicar IPC"),
    p("Flujo: desglose por rubro COICOP → PUT apply-ipc. Actualiza costos excluyendo rubros BCRA_USD; setea last_ipc_applied_period."),
    ...figure(IMG.seqIpc, "Figura 4b.3 — Secuencia Aplicar IPC", 500, 400),

    h2("4b.4 Diagrama de secuencia — Aplicar USD"),
    p("Flujo: desglose USD → PUT apply-usd. Solo rubros con preferred_index BCRA_*; setea last_usd_applied_period."),
    ...figure(IMG.seqUsd, "Figura 4b.4 — Secuencia Aplicar USD", 500, 380),

    h2("4b.5 Diagrama de secuencia — Registrar venta"),
    p("Flujo: POST /api/sales crea Sale + SaleLines con snapshot de costo/precio. sold_at es timestamptz; el resumen «Hoy» usa día calendario ART."),
    ...figure(IMG.seqVenta, "Figura 4b.5 — Secuencia Registrar venta", 500, 400),

    h2("4b.6 Diagrama de secuencia — Sync índices (cron)"),
    p("Jobs en Railway (timezone America/Argentina/Buenos_Aires): IPC diario a las 03:00 ART (multi-serie, idempotente) y USD BCRA a las 03:30 ART, con alertas de salto."),
    ...figure(IMG.seqCron, "Figura 4b.6 — Secuencia Sync índices (cron IPC 03:00 / BCRA 03:30 ART)", 500, 420),

    h2("4b.7 Diagrama de clases (dominio)"),
    p("Dominio en packages/shared (PricingEngine, SalesMath) y entidades Prisma usadas por la API."),
    ...figure(IMG.clases, "Figura 4b.7 — Diagrama de clases (dominio)", 500, 380),

    h2("4b.8 Diagrama de despliegue"),
    p("Usuario → Vercel (preciosya.vercel.app + landing) → Railway API → Supabase (Auth, Postgres, Storage, Realtime). Integraciones: Alphacast/INDEC (cron IPC 03:00 ART), BCRA (cron 03:30 ART), Mercado Pago sandbox, Resend."),
    ...figure(IMG.despliegue, "Figura 4b.8 — Diagrama de despliegue", 500, 400),
    pb()
  ];
}

// ── SECCIÓN 5: CASOS DE PRUEBA ───────────────────────────────────────────────
function seccion5() {
  const all = [
    // Auth
    ["CP-01","Login exitoso con Google","Cuenta Google válida y activa","Redirige al dashboard; JWT generado y almacenado en Supabase Auth.","Redirige correctamente con sesión activa.","Aprobado"],
    ["CP-02","Login con cuenta Google suspendida","Cuenta Google deshabilitada","Mensaje: 'No se pudo autenticar tu cuenta de Google'.","Muestra mensaje de error apropiado.","Aprobado"],
    ["CP-03","Sesión expirada — refresco automático","Token JWT vencido","El sistema refresca el token automáticamente; el usuario no nota interrupción.","Refresco automático mediante Supabase Auth.","Aprobado"],
    ["CP-04","Logout correcto","Usuario con sesión activa","Sesión cerrada, token invalidado, redirige a home.","Correcto.","Aprobado"],
    ["CP-05","Verificación de ownership","Usuario A intenta acceder a local del Usuario B","El sistema rechaza la petición con 403 Forbidden.","Middleware de ownership devuelve 403.","Aprobado"],
    // Productos
    ["CP-06","Cálculo de precio de venta — caso base","cost: $1.000 | margin_pct: 30%","sale_price = $1.300 (redondeado a decenas).","$1.300 calculado correctamente.","Aprobado"],
    ["CP-07","Cálculo con margin_pct 0%","cost: $500 | margin_pct: 0%","sale_price = $500 (sin error, sin margen aplicado).","$500 calculado correctamente.","Aprobado"],
    ["CP-08","Rechazo de cost negativo","cost: -$100","Mensaje de error: 'El costo debe ser mayor a 0'.","Validación activa en frontend y backend.","Aprobado"],
    ["CP-09","Alerta de margen bajo","min_margin_pct local: 20% | producto margin_pct: 10%","Producto marcado en rojo; is_margin_alert = TRUE en DB.","Alerta visual activa correctamente.","Aprobado"],
    ["CP-10","Actualización masiva por porcentaje +15%","Rubro 'Gaseosas' con 5 productos","Los 5 productos actualizan cost +15% y recalculan sale_price.","Correcto. price_history registra change_reason BULK_PCT.","Aprobado"],
    ["CP-11","Límite plan Free — producto 31","Usuario Free intenta agregar producto 31","Modal de upgrade aparece; producto no se guarda.","Modal de upgrade mostrado correctamente.","Aprobado"],
    ["CP-12","Historial registrado en cambio manual","Producto con cost $1.000 → $1.200","Se inserta fila en price_history con change_reason MANUAL.","Historial registrado.","Aprobado"],
    ["CP-13","Baja lógica de producto","Producto activo marcado como inactivo","Producto desaparece de la lista y exportación; permanece en price_history.","Correcto.","Aprobado"],
    ["CP-14","Escáner EAN-13 — producto conocido","Código de barras de producto en Open Food Facts","Sistema precompleta nombre del producto.","Autocompletado correcto con datos de Open Food Facts.","Aprobado"],
    // Exportación
    ["CP-15","Exportar lista PNG","Local con 10 productos activos","Imagen PNG generada con todos los productos y fecha; subida a Supabase Storage.","PNG generado y almacenado correctamente.","Aprobado"],
    ["CP-16","Lista PNG con 0 productos","Local sin productos activos","Mensaje: 'Agregá productos antes de generar la lista'.","Mensaje mostrado correctamente.","Aprobado"],
    ["CP-17","Compartir por WhatsApp (Web Share API)","Archivo PNG generado","Se abre diálogo de compartir del sistema operativo con PNG adjunto.","Web Share API funciona en Chrome Android.","Aprobado"],
    // IPC / USD
    ["CP-18","Aplicar IPC — rubros USD excluidos","3 rubros activos: 2 IPC, 1 con indexByUsd=true","El IPC se aplica solo a los 2 rubros IPC. El rubro USD no cambia.","Correcto.","Aprobado"],
    ["CP-19","Aplicar USD BCRA — solo rubros USD","2 rubros: 1 IPC, 1 USD | variación BCRA 1.5%","Solo el rubro USD se actualiza. price_history change_reason BCRA_RATE.","Correcto.","Aprobado"],
    ["CP-20","Scheduler IPC — ejecución automática 03:00 ART","Cron job en Railway activo","economic_indices se actualiza con el último IPC (idempotente). Banner 'IPC pendiente' en locales.","Cron ejecutado correctamente en Railway.","Aprobado"],
    ["CP-21","Fallback manual de IPC por admin","Fuente automática no disponible; admin carga IPC manualmente","El índice queda registrado y disponible para aplicar en locales.","Panel admin permite carga manual.","Aprobado"],
    // Ventas
    ["CP-22","Registro de venta — gestor lite","2 productos seleccionados; precios registrados","Venta guardada en sales/sale_lines; margin_snapshot calculado.","Venta registrada correctamente. Sin ticket ni stock.","Aprobado"],
    ["CP-23","Activación plan Pro desde panel admin","Admin activa plan Pro en usuario específico","El usuario pasa a plan Pro; límites actualizados.","Correcto.","Aprobado"],
    ["CP-24","Modo offline — lectura en caché","Dispositivo en modo avión; app previamente cargada","La app muestra productos desde caché sin error.","Lectura offline funciona. Sin edición offline con sync.","Aprobado"],
    // APK Android (nuevos)
    ["CP-25","Descarga APK desde landing","Usuario en preciosya-landing.vercel.app/#descargar","El archivo preciosya.apk se descarga correctamente.","APK descargable desde ambas URLs de landing y app.","Aprobado"],
    ["CP-26","Apertura APK con paridad funcional y pantalla completa","Instalar APK → abrir desde launcher → login Google → navegar Dashboard y Productos","Misma UX que PWA; sin barra de URL ni mensaje 'Se está ejecutando en Chrome' (verificado vía Digital Asset Links).","Verificado en producción junio 2026. Pantalla completa standalone confirmada. Trazabilidad: CU-18 · RF-A003 · RF-A006.","Aprobado"],
    ["CP-27","Escáner de barras en APK","Formulario producto → permiso cámara → escanear EAN-13","Código detectado; autocompletado Open Food Facts si el producto existe.","Escáner funciona vía cámara nativa Android. Trazabilidad: CU-04 · RF-A004 · RF-A005.","Aprobado"],
    ["CP-28","Gráfico evolución de precios (/history)","Producto con ≥2 entradas en price_history","Chart.js muestra evolución de sale_price; tabla con change_reason.","Implementado en /history. Trazabilidad: CU-10 · RF-W025.","Aprobado"],
  ];

  return [
    h1("5. Casos de Prueba"),
    p("Los siguientes casos de prueba corresponden a las funcionalidades críticas del sistema. Formato: ID, datos de entrada, resultado esperado, resultado obtenido y estado. Total: 28 casos de prueba."),

    h2("5.1 Módulo de autenticación (CP-01 a CP-05)"),
    ...all.slice(0,5).flatMap(r => cpBlock(r[0],r[1],r[2],r[3],r[4],r[5])),

    h2("5.2 Módulo de productos y precios (CP-06 a CP-14)"),
    ...all.slice(5,14).flatMap(r => cpBlock(r[0],r[1],r[2],r[3],r[4],r[5])),

    h2("5.3 Módulo de exportación (CP-15 a CP-17)"),
    ...all.slice(14,17).flatMap(r => cpBlock(r[0],r[1],r[2],r[3],r[4],r[5])),

    h2("5.4 Módulo IPC / USD (CP-18 a CP-21)"),
    ...all.slice(17,21).flatMap(r => cpBlock(r[0],r[1],r[2],r[3],r[4],r[5])),

    h2("5.5 Módulo de ventas y admin (CP-22 a CP-24)"),
    ...all.slice(21,24).flatMap(r => cpBlock(r[0],r[1],r[2],r[3],r[4],r[5])),

    h2("5.6 APK Android (CP-25 a CP-27)"),
    ...all.slice(24,27).flatMap(r => cpBlock(r[0],r[1],r[2],r[3],r[4],r[5])),

    h2("5.7 Reportes (CP-28)"),
    ...all.slice(27).flatMap(r => cpBlock(r[0],r[1],r[2],r[3],r[4],r[5])),

    pb()
  ];
}

// ── SECCIÓN 6: DER ────────────────────────────────────────────────────────────
function seccion6() {
  const entidades = [
    ["User","id (UUID PK), email (UK), name, avatar_url, google_id (UK), plan (enum FREE/PRO/AGENCY), plan_expires_at, created_at, updated_at."],
    ["Subscription","id (UUID PK), user_id (FK), plan (enum), status (enum), mp_subscription_id, amount_ars, billing_cycle, started_at, expires_at, cancelled_at, created_at."],
    ["Local","id (UUID PK), user_id (FK), name, address, min_margin_pct (decimal), currency, last_ipc_applied_period, last_usd_applied_period, is_active, created_at, updated_at."],
    ["Notification","id (UUID PK), user_id (FK), type (enum), title, body, is_read, metadata (jsonb), created_at."],
    ["CategoryTemplate","id (UUID PK), slug (UK), name, color_hex, preferred_index (enum), sort_order (int), created_at. Solo lectura por usuarios."],
    ["Category","id (UUID PK), local_id (FK), template_id (FK → CategoryTemplate), name, color_hex, preferred_index (enum), is_active, created_at."],
    ["Product","id (UUID PK), local_id (FK), category_id (FK opt), name, barcode, unit (enum), cost (decimal), margin_pct (decimal), sale_price (decimal), margin_status (enum), is_margin_alert (bool), notes, is_active, created_at, updated_at."],
    ["PriceHistory","id (UUID PK), product_id (FK), cost (decimal), margin_pct (decimal), sale_price (decimal), change_reason (enum: MANUAL | BULK_PCT | IPC_INDEC | BCRA_RATE | IMPORT), ipc_reference (decimal), note, recorded_at."],
    ["EconomicIndex","id (UUID PK), type (enum: IPC_INDEC | IPC_INDEC_ALIMENTOS | IPC_INDEC_BEBIDAS | BCRA_USD_OFICIAL | …), period (UK con type), value_pct (decimal), source_url, fetched_at."],
    ["PriceList","id (UUID PK), local_id (FK), format (enum), file_url, shared_via, created_at."],
    ["Sale","id (UUID PK), local_id (FK), sold_at, note, created_at, updated_at."],
    ["SaleLine","id (UUID PK), sale_id (FK), product_id (FK RESTRICT), quantity (decimal), unit_sale_price (decimal), unit_cost_snapshot (decimal), created_at."],
  ];

  const relaciones = [
    ["User → Subscription","1 → N","FK","Historial de cambios de plan del usuario."],
    ["User → Local","1 → N","FK","Un usuario puede tener hasta N locales según plan."],
    ["User → Notification","1 → N","FK","Notificaciones in-app por usuario."],
    ["Local → Category","1 → N","FK","Un local activa rubros del catálogo COICOP."],
    ["CategoryTemplate → Category","1 → N","FK","El template define el rubro predefinido; Category es la instancia del local."],
    ["Local → Product","1 → N","FK","Un local tiene múltiples productos en su catálogo."],
    ["Category → Product","1 → N","FK opt.","Una categoría agrupa productos (opcional)."],
    ["Product → PriceHistory","1 → N","FK","Cada cambio de precio genera un registro append-only en PriceHistory."],
    ["Local → PriceList","1 → N","FK","Un local puede exportar múltiples listas de precios PNG."],
    ["Local → Sale","1 → N","FK","Un local puede registrar múltiples ventas."],
    ["Sale → SaleLine","1 → N","FK","Cada venta tiene líneas de detalle por producto."],
    ["SaleLine → Product","N → 1","FK RESTRICT","No se puede eliminar un producto con ventas asociadas."],
    ["EconomicIndex","—","—","Entidad independiente consultada por apply-ipc y apply-usd."],
  ];

  return [
    h1("6. Modelo de Datos — DER"),

    h2("6.1 Diagrama entidad-relación"),
    p("El siguiente diagrama refleja el schema Prisma desplegado en Supabase PostgreSQL (incluye EconomicIndex, ventas, suscripciones y last_ipc/usd_applied_period)."),
    space(),
    ...figure(DER_BUF, "Figura 6.1 — DER PreciosYa (schema Prisma)", 520, 560),
    space(),
    noteBox("Nota nomenclatura v3.1: margin_pct, sale_price, change_reason (MANUAL | BULK_PCT | IPC_INDEC | BCRA_RATE | IMPORT). Alias preciosya-app.vercel.app = alias secundario del proyecto web / origen adicional de la APK."),

    h2("6.2 Entidades principales"),
    table2(["Entidad","Atributos y notas"], entidades, [2400, 7400]),
    space(),

    h2("6.3 Relaciones principales"),
    tableN(["Relación","Cardinalidad","Tipo","Nota"], relaciones, [3200, 1400, 1200, 4000]),
    pb()
  ];
}

// ── SECCIÓN 7: ARQUITECTURA + COMPONENTES ────────────────────────────────────
function seccion7() {
  const arqRows = [
    ["Presentación Web","React 19 + Vite + PWA Plugin","Interfaz mobile-first, service worker, caché offline (lectura). Workbox para estrategias de caché."],
    ["Presentación Mobile","APK Android","Shell Android que empaqueta la PWA. Acceso a cámara nativa (escáner EAN-13). Pantalla completa standalone."],
    ["Lógica de negocio","Node.js + Express 4 + Prisma 5","API REST, validaciones, PricingEngine, scheduler de índices (node-cron), alertas, exportación PNG."],
    ["Autenticación","Google OAuth 2.0 (Supabase Auth) + JWT","Tokens gestionados por Supabase. Sin passwords propias."],
    ["Base de datos","PostgreSQL (Supabase)","Persistencia principal. Triggers para historial y updated_at."],
    ["Almacenamiento","Supabase Storage","Imágenes PNG exportadas (price lists)."],
    ["Realtime","Supabase Realtime","Notificaciones in-app (IPC pendiente, alertas de margen)."],
    ["Hosting API","Railway","API Express + cron jobs IPC (diario 03:00 ART) y USD BCRA (diario 03:30 ART)."],
    ["Hosting Frontend","Vercel","PWA preciosya.vercel.app (+ alias preciosya-app.vercel.app) + Landing preciosya-landing.vercel.app."],
    ["Índices económicos","Alphacast / Argly + API BCRA","Fuentes primarias del cron. Fallback: carga manual admin."],
    ["Email transaccional","Resend","Emails de bienvenida y resumen IPC para usuarios Pro."],
    ["Pagos","Mercado Pago","Suscripciones plan Pro (sandbox en etapa tesis)."],
  ];

  const endpoints = [
    ["/api/auth/google","POST","Login/registro con Google OAuth","No","Free"],
    ["/api/locals","GET/POST","Listar / crear locales del usuario","JWT","Free"],
    ["/api/locals/:id","PUT","Editar local","JWT+owner","Free"],
    ["/api/categories","GET/POST","Listar / activar rubros COICOP","JWT","Free"],
    ["/api/products","GET/POST","Listar / crear producto","JWT","Free (máx 30)"],
    ["/api/products/:id","PUT/DELETE","Editar / baja lógica","JWT+owner","Free"],
    ["/api/products/bulk-update","PUT","Actualización masiva por %","JWT","Free"],
    ["/api/products/:id/history","GET","Historial de precios (price_history)","JWT","Free"],
    ["/api/locals/:id/apply-ipc","PUT","Aplicar IPC al local","JWT","Free"],
    ["/api/locals/:id/apply-usd","PUT","Aplicar USD BCRA al local","JWT","Free"],
    ["/api/ipc/latest","GET","IPC más reciente por rubro","JWT","Free"],
    ["/api/exports/price-list","POST","Generar PNG de lista de precios","JWT","Free"],
    ["/api/sales","POST","Registrar venta (gestor lite)","JWT","Free"],
    ["/api/sales","GET","Listar ventas del local","JWT","Free"],
    ["/api/notifications","GET","Listar notificaciones del usuario","JWT","Free"],
    ["/api/subscriptions","POST","Suscribirse al plan Pro","JWT","Free → Pro"],
    ["/api/admin/ipc","POST","Carga manual de índice IPC","JWT + is_admin","Admin"],
    ["/api/admin/users","GET","Listado de usuarios","JWT + is_admin","Admin"],
  ];

  const modulos = [
    ["Dashboard","/dashboard","KPIs del local: alertas activas, último IPC aplicado, resumen ventas."],
    ["Productos","/products","ABM de productos, escáner EAN-13, filtros por rubro, alertas de margen."],
    ["Categorías / Rubros","/categories","Activación/desactivación de rubros COICOP. Toggle indexByUsd por rubro."],
    ["Historial","/history","Evolución de sale_price por producto (Chart.js). Búsqueda + tabla de price_history."],
    ["Ventas","/sales","Tabs: Nueva venta, Resumen KPIs, Historial de ventas, Análisis (sale-analytics.service)."],
    ["Productos","/products","Catálogo; deep-links ?bulk=ipc|usd, ?export=1, ?new=1. Export PNG modal (todas las páginas del filtro)."],
    ["Categorías","/categories","Activar rubros COICOP e Indexar USD."],
    ["Locales","/locals","Alta/edición de local (margen mínimo)."],
    ["Ajustes","/settings","Negocio (enlace a Locales), cuenta, plan Mercado Pago."],
    ["Lista de precios","/price-list","Generación de PNG con html2canvas. Compartir por WhatsApp."],
    ["Ajustes","/settings","Configuración del local (min_margin_pct), cuenta, plan Free/Pro/Agency."],
    ["Admin","/admin","Solo is_admin: usuarios, IPC manual, estadísticas globales."],
  ];

  const componentes = [
    ["apps/web","React 19 + Vite + PWA Plugin","Frontend mobile-first. App.tsx (Router), AppLayout (sidebar + bottom nav)."],
    ["apps/api","Express 4 + Prisma 5","API REST. Routes → Controllers → Services → Prisma."],
    ["apps/landing","Astro / estático","Landing page. Botón descarga APK, planes, testimonios, blog."],
    ["packages/shared","TypeScript puro","PricingEngine, SalesMath, tipos compartidos, validaciones Zod."],
  ];

  const servicios = [
    ["product.service","ABM de productos, cálculo de sale_price, bulk-update, alertas de margen."],
    ["economic-index.service","apply-ipc, apply-usd, obtención de índices de economic_indices."],
    ["sale.service","Registro de ventas en transacción (Sale + SaleLines)."],
    ["sale-analytics.service","KPIs: revenue, margin_snapshot, análisis por período."],
    ["ipc-fetch.service","Obtención de IPC desde Alphacast/Argly. Ejecutado por cron."],
    ["bcra-fetch.service","Obtención de variación USD BCRA. Ejecutado por cron diario."],
    ["notification.service","Creación y envío de notificaciones in-app vía Supabase Realtime."],
    ["export.service","Generación de PNG con html2canvas y upload a Supabase Storage."],
  ];

  return [
    h1("7. Diseño de Arquitectura"),

    h2("7.1 Patrón arquitectónico"),
    p("PreciosYa utiliza una arquitectura de tres capas desacopladas. El frontend (React PWA / APK Android) se comunica exclusivamente con el backend a través de una API REST. El backend no tiene lógica de presentación. La base de datos solo es accesible desde el backend (excepto Auth y Realtime con la anon key)."),
    space(),
    ...figure(IMG.capas, "Figura 7.1 — Arquitectura en tres capas", 520, 280),
    space(),
    tableN(["Capa","Tecnología","Responsabilidad"], arqRows, [2400, 2800, 4600]),
    space(),

    h2("7.2 API REST — Endpoints principales"),
    tableN(["Endpoint","Método","Descripción","Auth","Plan mín."], endpoints, [2800, 900, 3600, 1200, 1300]),
    space(),

    h2("7.3 Diagrama de componentes"),
    p("PreciosYa es un monorepo pnpm con cuatro paquetes principales. El diagrama describe la estructura interna de cada aplicación y sus dependencias."),

    h3("Monorepo — paquetes"),
    tableN(["Paquete","Tecnología","Responsabilidad"], componentes, [2000, 2500, 5300]),
    space(),

    h3("Frontend — componentes principales (apps/web)"),
    bullet("App.tsx: Router con rutas protegidas + AuthContext."),
    bullet("AppLayout: sidebar en escritorio + barra inferior móvil (Dashboard, Productos, Ventas, Historial, Ajustes)."),
    bullet("Pages: Dashboard, Products, Sales, History, Categories, Locals, Settings, Admin, PriceList."),
    bullet("Módulos de productos (products/*): ProductForm, ProductScanner, BulkUpdateModal."),
    bullet("Módulos de ventas (sales/*): SalesTabs, SalesKPIs, SalesChart, SaleHistory."),
    bullet("Hooks: TanStack Query para fetching/caching, AuthContext, useApiClient (Axios + JWT interceptors)."),
    space(),

    h3("Módulos UI — tabla completa"),
    tableN(["Módulo UI","Ruta","Responsabilidad"], modulos, [2200, 1600, 6000]),
    space(),

    h3("Backend — servicios principales (apps/api)"),
    tableN(["Servicio","Responsabilidad"], servicios, [3000, 6800]),
    space(),

    h3("Schedulers (node-cron en Railway)"),
    bulletMix("IPC diario 03:00 ART: ", "sincroniza series IPC (divisiones COICOP) vía Alphacast; idempotente si el período ya existe."),
    bulletMix("BCRA diario 03:30 ART: ", "cotización USD oficial y alertas de salto (BCRA_USD_ALERT)."),
    bulletMix("Integraciones externas: ", "Alphacast (IPC), BCRA (USD), Supabase Auth/DB/Storage/Realtime, Resend (emails Pro), Mercado Pago sandbox."),
    space(),
    ...figure(IMG.componentes, "Figura 7.3 — Diagrama de componentes (monorepo)", 500, 360),
    pb()
  ];
}

// ── SECCIÓN 8: MODELO DE NEGOCIOS ────────────────────────────────────────────
function seccion8() {
  // Conservada íntegramente del PDF v2, con ajustes mínimos
  const porterRows = [
    ["Rivalidad entre competidores existentes","Baja","Los POS actuales (Líder Gestión, MaxiKiosco) son pesados y genéricos; ninguno se especializa en margen e IPC mobile-first. No hay competencia directa en el nicho."],
    ["Amenaza de sustitutos","Alta (fuerza dominante)","El sustituto dominante es el método manual: papel, calculadora y Excel. Percepción de costo cero. Táctica: Freemium sin fricción y UX tan simple como WhatsApp."],
    ["Poder de negociación de proveedores","Baja","Infraestructura cloud (Railway, Supabase, Vercel) y APIs públicas (INDEC, BCRA) con alternativas disponibles y bajo costo de sustitución."],
    ["Poder de negociación de clientes","Media","Mercado fragmentado en miles de kioscos; ningún cliente impone precio. El costo de cambio crece a medida que el usuario carga su catálogo e historial. Táctica: retención por datos."],
    ["Amenaza de nuevos entrantes","Media","Barreras técnicas relativamente bajas. La barrera real es el conocimiento del dolor hiperlocal argentino y la confianza del comerciante."],
  ];

  const investigacionRows = [
    ["Horas/sem. en remarcación","1,5","2,0","2,0","2,5","~2 h","Confirma dolor recurrente"],
    ["Actualizaciones/sem.","1","1","1","1","1","Concentradas en remisiones"],
    ["Herramienta principal","Papel","Papel+calc.","Excel","Papel/Excel","—","Sustituto dominante = manual"],
    ["Conoce IPC INDEC","No","Sí (vago)","No","Sí (TV)","50%","Apply-IPC debe ser simple"],
    ["Usa dólar en algún rubro","Sí","Sí","Sí","Sí","100%","Apply-USD validado"],
    ["Disposición a pagar ($/mes)","$5.000","$6.000","$4.000","$7.000","~$5.500","Pro $4.500 < WTP"],
  ];

  const fodaRows = [
    ["Fortalezas","Propuesta hiperespecífica: resuelve margen + inflación sin competir como POS. · IPC por rubro + USD BCRA en un solo flujo. · Freemium con retención (historial + catálogo). · Stack cloud ~$40k/mes. · WTP campo $5.500 > Pro $4.500."],
    ["Debilidades","Marca nueva sin presupuesto de marketing. · Equipo unipersonal. · Dependencia de APIs externas (Supabase, Railway, INDEC, BCRA). · Offline parcial. · Muestra cualitativa n=4 (no representativa estadísticamente)."],
    ["Oportunidades","Inflación estructural → demanda recurrente. · 100% de la muestra ajusta al dólar a ojo. · Digitalización del kiosco (celular + WhatsApp + MP). · Blog SEO. · Alianzas UKRA, CAME."],
    ["Amenazas","Sustitutos gratuitos y arraigados (papel/Excel). · Resistencia al cambio tecnológico. · POS que agregan funciones de precios. · Nuevos entrantes con baja barrera técnica. · Riesgo regulatorio (índices oficiales, Ley 25.326)."],
  ];

  const costosRows = [
    ["API + cron jobs","Railway","$8.000–$15.000","Fijo"],
    ["Base de datos, Auth, Storage","Supabase","$0–$12.000","Fijo"],
    ["Frontend app + landing","Vercel","$0–$5.000","Fijo"],
    ["Dominio","—","~$5.000","Fijo anualizado"],
    ["Emails Pro","Resend","$0–$3.000","Fijo/variable"],
    ["Datos IPC","Alphacast","$0 (plan dev)","Fijo"],
    ["Total CF conservador","—","~$40.000","—"],
    ["Comisión Mercado Pago (3,5%)","MP","~$158/suscriptor Pro","Variable"],
  ];

  const mveRows = [
    ["Conservador","$40.000","≈ 10 Pro","~500 usuarios"],
    ["Austero (MVE mínimo)","$25.000","≈ 6 Pro","~300 usuarios"],
  ];

  const proyRows = [
    ["T1 (meses 1–3)","80","0–1","~$2.250","Déficit"],
    ["T2 (meses 4–6)","200","2–3","~$11.250","Déficit"],
    ["T3 (meses 7–9)","350","5–6","~$24.750","Déficit/Austero"],
    ["T4 (meses 10–12)","500","9–10","~$42.750","Equilibrio"],
  ];

  const funnel = [
    ["1. Descubrimiento","Que Pepe nos ubique","Posts Instagram/WhatsApp '¿Sabés cuánto ganás?'; notas SEO; blog.","Alcance, clics a landing"],
    ["2. Consideración","Evaluar sin miedo al POS","Carrusel 'PreciosYa no es facturación'; artículos IPC/USD.","Tiempo en blog, scroll landing"],
    ["3. Decisión","Bajar fricción","Plan Free sin tarjeta; demo en 30 s en landing.","Clic 'Probar gratis'"],
    ["4. Conversión","Acción concreta","Registro Google OAuth + primer producto; upgrade Pro vía Mercado Pago.","Registros, activación, % Pro"],
    ["5. Fidelización","Retener y recomendar","Banner IPC, alertas margen, historial, PNG para clientes; recomendación en grupos WA.","DAU, retención 30 días, exports PNG"],
  ];

  const blog = [
    ["1. Precios y márgenes","Cómo calcular el precio de venta con margen en un kiosco (sin Excel)","5 errores que hacen que vendas a pérdida sin darte cuenta"],
    ["2. Inflación e índices","Qué es el IPC del INDEC y por qué importa en tu almacén","IPC general vs IPC alimentos: qué conviene en cada rubro"],
    ["3. Herramientas prácticas","Cómo armar tu lista de precios para WhatsApp en dos minutos","Cuándo conviene indexar rubros al dólar oficial (BCRA)"],
    ["4. Tu negocio digital","Plan Free vs Pro: cuándo tiene sentido pagar $4.500","Gestor de ventas sin POS: registrar ventas sin complicarte"],
  ];

  return [
    h1("8. Modelo de Negocios"),

    h2("8.1 Resumen ejecutivo"),
    p("PreciosYa es un SaaS Freemium de gestión de precios y márgenes mobile-first orientado a kioscos y almacenes del Gran Buenos Aires. El modelo de negocio se sustenta en una versión gratuita (plan Free) que elimina la barrera de entrada, y un plan pago mensual (Pro, $4.500 ARS/mes) que financia la operación. El plan Agency, a medida, atiende negocios multi-local."),
    p("La empresa opera como startup unipersonal en etapa de validación, sin financiamiento externo (bootstrap). La proyección es formalizar como SAS cuando los ingresos recurrentes lo permitan."),

    h2("8.2 Análisis de las 5 Fuerzas de Porter"),
    p("Unidad de análisis: mercado de software de gestión de precios para pequeños comercios en Argentina."),
    space(),
    ...figure(IMG.porter, "Figura 8.2 — Cinco fuerzas de Porter (PreciosYa)", 480, 360),
    space(),
    tableN(["Fuerza","Intensidad","Análisis y táctica"], porterRows, [3200, 1600, 4900]),
    space(),
    pMix("Conclusión de viabilidad: ", "el proyecto es viable. La fuerza más exigente es la de sustitutos (hábito manual), no la rivalidad directa con otros softwares."),
    pMix("Estrategia genérica elegida: ", "enfoque / concentración. PreciosYa no compite como ERP universal ni POS; concentra sus recursos en pequeños comerciantes abrumados por la remarcación. No se opta por liderazgo en costos ni por diferenciación amplia."),

    h2("8.3 Segmento de mercado y Buyer Persona"),
    pMix("Segmento principal: ", "kiosqueros y almaceneros tradicionales del GBA e interior urbano. Perfil: 35–65 años, clase media/media-baja, alto estrés económico, uso básico de tecnología (WhatsApp, Mercado Pago), necesidad de herramientas con curva de aprendizaje casi nula."),
    pMix("Segmento secundario: ", "emprendedores de reventa por WhatsApp/Instagram (18–40 años), uso intermitente, alta sensibilidad al precio."),
    space(),
    p("Buyer Persona — José «Pepe» García, 47 años, dueño de un kiosco en Lomas de Zamora hace 20 años:"),
    bulletMix("¿Quién es? ","Secundario completo. Pragmático, trabajador, resistente a lo complicado."),
    bulletMix("¿Dónde está? ","90% del día detrás del mostrador; señal Wi-Fi irregular en el fondo del local."),
    bulletMix("¿Por qué lo hace? ","Pierde 2 h/semana tachando carteles; teme vender a pérdida; rechaza apps complejas."),
    bulletMix("¿En qué momentos? ","Cuando llega la remisión del proveedor; cuando WhatsApp anuncia que subió un precio; al publicarse el IPC."),
    bulletMix("¿Qué hace en digital? ","Solo celular. WhatsApp para pedidos, Mercado Pago para cobros. Rechaza apps pesadas."),

    h2("8.4 Propuesta de valor"),
    p("Para el comerciante de barrio abrumado por la inflación, PreciosYa es la herramienta móvil que protege sus ganancias automatizando precios y márgenes con índices oficiales (IPC INDEC por rubro y dólar BCRA), alertándolo antes de vender a pérdida, permitiendo escanear productos y compartir listas por WhatsApp — sin la complejidad de un POS ni de un sistema contable."),
    pMix("Posicionamiento: ", "herramienta de supervivencia y agilidad, no de facturación."),

    h2("8.5 Investigación de mercado"),
    pMix("Objetivo: ","validar tiempo de remarcación manual, disposición a pagar, uso del IPC y del dólar en rubros, y obstáculos de adopción."),
    pMix("Método: ","entrevista en profundidad semiestructurada + observación directa del proceso de actualización de precios."),
    pMix("Muestra: ","n = 4 dueños/encargados de kioscos y almacenes del GBA (conveniencia)."),
    space(),
    h3("Tabla — Indicadores cuantitativos por entrevistado"),
    tableN(["Indicador","E-01","E-02","E-03","E-04","Promedio","Impacto en producto"],
      investigacionRows, [2800,850,850,850,850,1100,2600]),
    space(),
    h3("Hallazgos cualitativos clave"),
    bulletMix("Patrón 1 — El dolor es real: ","los 4 entrevistados enfrentan remarcación manual recurrente, una vez por semana."),
    bulletMix("Patrón 2 — El IPC existe en la cabeza, no en la práctica: ","solo el 50% lo conoce, y de forma vaga."),
    bulletMix("Patrón 3 — El dólar es transversal: ","el 100% ajusta rubros al dólar a ojo, sin fórmula. Valida Apply-USD."),
    bulletMix("Patrón 4 — WTP por encima del plan Pro: ","promedio $5.500/mes vs. Pro $4.500/mes."),
    bulletMix("Patrón 5 — La barrera principal es el hábito: ","papel, calculadora y Excel tienen costo percibido cero."),
    space(),
    p("Cita representativa (E-04): «Hay cosas que las subo cuando sube el dólar, pero lo hago a ojo. Si la app me avisa y me calcula solo, pagaría, pero primero la probaría gratis.»"),
    p("Cita representativa (E-02): «Generalmente mi jefe me manda por WhatsApp cuánto tengo que subirle en porcentaje a los productos y tengo que hacer el cálculo manualmente.»"),

    h2("8.6 Misión, Visión y Valores"),
    pMix("Visión: ","democratizar el control de precios y márgenes en el comercio de proximidad argentino, para que proteger la rentabilidad no dependa de software caro, de tiempo libre ni de un contador."),
    pMix("Misión: ","proteger la rentabilidad de los comercios minoristas argentinos mediante tecnología mobile-first, automatizando precios y márgenes frente a la inflación con índices oficiales y alertas que cualquier dueño de local puede usar sin ser técnico ni contador."),
    space(),
    bullet("Simplicidad: el producto debe ser intuitivo como enviar un mensaje por WhatsApp."),
    bullet("Transparencia: los ajustes se apoyan en índices oficiales (INDEC, BCRA) y en un historial auditable."),
    bullet("Empatía local: el diseño nace del contexto argentino: inflación, remisiones de proveedores, grupos de WhatsApp, mala señal."),
    bullet("Accesibilidad (Freemium responsable): el plan gratuito permite validar el valor antes de pagar."),
    bullet("Bootstrap y sostenibilidad: sin financiamiento externo; se optimizan costos cloud para sostener el modelo."),

    h2("8.7 Diagnóstico estratégico — FODA"),
    ...figure(IMG.foda, "Figura 8.7 — Matriz FODA", 500, 360),
    space(),
    table2(["Cuadrante","Contenido"], fodaRows, [2000,7800]),
    space(),

    h2("8.8 Business Model Canvas"),
    ...figure(IMG.bmc, "Figura 8.8 — Business Model Canvas", 500, 400),
    space(),
    tableN(["Bloque","Contenido"],[
      ["Segmento de clientes","Principal: kiosqueros y almaceneros GBA 35–65 a. Secundario: reventa por redes 18–40 a."],
      ["Propuesta de valor","Remarcar con confianza en minutos, con el margen protegido, desde el celular."],
      ["Canales","Landing → App PWA → Supabase Storage (PNG) → Web Share API (WhatsApp). Sin intermediarios."],
      ["Relación con clientes","Free: autoservicio. Pro: automatizado (alertas, emails). Agency: asistencia personal."],
      ["Fuentes de ingresos","Free $0 (lead). Pro $4.500/mes (Mercado Pago). Agency a medida (B2B multi-local)."],
      ["Recursos clave","PricingEngine, código, datos de índices e historial, fundador full-stack."],
      ["Actividades clave","Desarrollo/mejora del producto; operación de índices (cron IPC/USD); uptime API; onboarding; contenido SEO."],
      ["Socios clave","INDEC/BCRA/Alphacast (datos), Mercado Pago (cobro), UKRA/CAME (difusión), Supabase/Railway/Vercel (infra)."],
      ["Estructura de costos","CF ~$40.000 ARS/mes. CV: comisión MP ~3,5%/suscripción. No monetizado: tiempo del fundador."],
    ], [3000, 6800]),
    space(),

    h2("8.9 Viabilidad económica"),
    h3("Estructura de costos"),
    tableN(["Rubro","Proveedor","Costo/mes (ARS)","Tipo"], costosRows, [3500,2200,2200,1900]),
    space(),
    h3("Punto de equilibrio (MVE)"),
    p("Fórmula: Unidades equilibrio = CF ÷ (Precio − CV unitario) = CF ÷ (4.500 − 158) ≈ CF ÷ 4.342"),
    tableN(["Escenario","CF/mes","Pro necesarios","Free base (conv. 2%)"], mveRows, [3200,2200,2200,2200]),
    space(),
    p("Ingreso mensual en equilibrio conservador: 10 × $4.500 = $45.000. Plazo estimado para alcanzar el MVE: 12–18 meses post-lanzamiento público con cobro real."),
    h3("Proyección de ingresos — escenario base (año 1)"),
    tableN(["Trimestre","Free acumulados","Pro (fin trim.)","Ingreso mensual","Resultado vs CF"],
      proyRows, [2500,2000,2000,1900,1400]),
    space(),
    p("Indicadores de inversión (I₀ = $100.000 ARS, tasa descuento 40% anual): VAN a 3 años ~−$35.000 en escenario base; TIR < 40%; Payback descontado mes 20–24. Coherente con un emprendimiento bootstrap donde el fundador aporta trabajo en especie."),

    h2("8.10 Plan de marketing digital"),
    h3("Las 4P"),
    tableN(["P","PreciosYa","Buyer Persona"],[
      ["Producto","SaaS PWA: cálculo de margen, IPC/USD por rubro, alertas, PNG, escáner, gestor de ventas lite.","Quiere una herramienta simple desde el celular, no un POS."],
      ["Precio","Freemium. Pro $4.500/mes. Agency a medida.","Por debajo del WTP de campo ($5.500). Free elimina el riesgo de probar."],
      ["Plaza","100% digital: landing → app PWA; cobro por Mercado Pago.","Donde ya está el comerciante: celular, WhatsApp. Sin instalación desde tienda."],
      ["Promoción","Contenido educativo, SEO, redes, grupos de comerciantes, notificaciones in-app.","Diálogo útil, no discurso de venta agresivo."],
    ], [1000, 4650, 4150]),
    space(),
    h3("Ecosistema digital — fases del funnel"),
    tableN(["Etapa","Objetivo","Acciones / canal","Métrica clave"],
      funnel, [2200, 1800, 3400, 2400]),
    space(),
    h3("Blog — estructura de contenidos (8 notas)"),
    tableN(["Categoría","Tema 1","Tema 2"], blog, [2800, 3700, 3300]),
    pb()
  ];
}

// ── SECCIÓN 9: GANTT ──────────────────────────────────────────────────────────
function seccion9() {
  const WS = [3200, ...Array(12).fill(530)]; // 3200 + 12×530 = 9560
  const ganttData = [
    ["1. Relevamiento con comerciantes (n=4)","■","■","","","","","","","","","",""],
    ["2. Diseño de wireframes y UX","■","■","","","","","","","","","",""],
    ["3. Modelado de base de datos (Prisma)","","■","■","","","","","","","","",""],
    ["4. Setup del proyecto (monorepo pnpm)","","","■","","","","","","","","",""],
    ["5. Auth Google OAuth + JWT (Supabase)","","","■","■","","","","","","","",""],
    ["6. ABM de productos y rubros COICOP","","","","■","■","","","","","","",""],
    ["7. PricingEngine (cálculo + redondeo)","","","","■","■","","","","","","",""],
    ["8. Apply-IPC por rubro + Apply-USD","","","","","■","■","","","","","",""],
    ["9. Integración Alphacast/BCRA + cron","","","","","■","■","","","","","",""],
    ["10. Alertas de margen + notificaciones","","","","","","■","■","","","","",""],
    ["11. Exportación PNG (html2canvas)","","","","","","","■","■","","","",""],
    ["12. Historial de precios (price_history)","","","","","","","■","■","","","",""],
    ["13. Gestor de ventas lite","","","","","","","","■","■","","",""],
    ["14. APK Android + assetlinks","","","","","","","","","■","■","",""],
    ["15. Escáner EAN-13 (cámara nativa)","","","","","","","","","","■","",""],
    ["16. Panel admin + carga manual IPC","","","","","","","","","","■","■",""],
    ["17. Testing y corrección de bugs","","","","","","","","","","","■","■"],
    ["18. Documentación de tesis (completa)","","","","","","","","","■","■","■","■"],
    ["19. Preparación de presentación","","","","","","","","","","","","■"],
  ];

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      hdrCell("Tarea", 3200),
      ...["S1","S2","S3","S4","S5","S6","S7","S8","S9","S10","S11","S12"].map(s => hdrCell(s, 530))
    ]
  });
  const ganttRows = ganttData.map((row, ri) => new TableRow({
    children: row.map((v, ci) => {
      const isFilled = v === "■";
      const w = ci === 0 ? 3200 : 530;
      return new TableCell({
        borders,
        width: { size: w, type: WidthType.DXA },
        shading: { fill: isFilled ? GREEN : (ri%2===0 ? WHITE : CREAM), type: ShadingType.CLEAR },
        margins: { top: 50, bottom: 50, left: ci===0 ? 80 : 40, right: 40 },
        children: [new Paragraph({
          alignment: ci===0 ? AlignmentType.LEFT : AlignmentType.CENTER,
          children: [new TextRun({ text: v==="■" ? "▪" : (ci===0 ? v : ""), size: ci===0?17:14, bold: isFilled, color: isFilled ? WHITE : DARK, font: FONT })]
        })]
      });
    })
  }));

  return [
    h1("9. Diagrama de Gantt"),
    p("Planificación del proyecto para un desarrollador trabajando solo. Duración total: 12 semanas. Inicio: semana 1 del cuatrimestre 2026."),
    space(),
    ...figure(IMG.gantt, "Figura 9.1 — Diagrama de Gantt (12 semanas)", 520, 400),
    space(),
    new Table({ width: { size: 9560, type: WidthType.DXA }, columnWidths: WS, rows: [headerRow, ...ganttRows] }),
    space(),
    h3("Estado junio 2026"),
    bullet("Semanas 1–10: completadas. Producto en producción (PWA + APK Android verificada)."),
    bullet("Junio 2026: gestor de ventas v1, APK Android, fix assetlinks.json, documentación v3, preparación presentación Seminario Final."),
    bullet("Julio–agosto 2026: desglose gráfico IPC; corrección filtro ventas «Hoy» (día ART); defensa oral + demo ante el docente."),
    pb()
  ];
}

// ── SECCIÓN 10: TRAZABILIDAD ──────────────────────────────────────────────────
function seccion10() {
  const traz = [
    ["RF-W001","CU-01","CP-01, CP-02, CP-03, CP-04","Auth Google OAuth — Acceso"],
    ["RF-W002","CU-01","CP-03","JWT + sesión — refresco automático"],
    ["RF-W003","CU-02","—","Alta de local comercial"],
    ["RF-W004","CU-03","—","Activación de rubros COICOP"],
    ["RF-W005","CU-03","CP-18","Toggle 'Indexar USD' por rubro — excluye apply-ipc"],
    ["RF-W006","CU-04","CP-06, CP-07, CP-08","Alta de producto — cálculo sale_price"],
    ["RF-W007","CU-04","CP-14, CP-27","Escáner EAN-13 + autocompletado"],
    ["RF-W008","CU-05","CP-06, CP-12","Modificación de producto + historial"],
    ["RF-W009","CU-19","CP-13","Baja lógica de producto"],
    ["RF-W010","CU-04, CU-05","CP-06, CP-07, CP-08","Cálculo automático de sale_price"],
    ["RF-W011","CU-07","CP-10","Actualización masiva por porcentaje"],
    ["RF-W012","CU-08","CP-18, CP-20","IPC multi-serie por rubro COICOP"],
    ["RF-W013","CU-08","CP-18, CP-19","Apply-IPC por local — excluye indexByUsd"],
    ["RF-W014","CU-09","CP-19","Apply-USD BCRA — solo rubros indexByUsd"],
    ["RF-W015","CU-17","CP-20","Cron actualización índices (IPC 03:00 / BCRA 03:30 ART)"],
    ["RF-W016","CU-06","CP-09","Alertas de margen — is_margin_alert"],
    ["RF-W017","CU-10","CP-12, CP-18, CP-19","Historial append-only (price_history)"],
    ["RF-W018","CU-14","CP-15, CP-16","Exportación PNG (html2canvas + Storage)"],
    ["RF-W019","CU-14","CP-17","Compartir PNG por WhatsApp (Web Share API)"],
    ["RF-W020","CU-20","CP-24","Notificaciones in-app + desglose gráfico IPC (COICOP)"],
    ["RF-W021","CU-12","CP-22","Gestor de ventas lite (Free: 7 días)"],
    ["RF-W022","CU-15","CP-11, CP-23","Planes y suscripción (Free/Pro/Agency)"],
    ["RF-W023","CU-16","CP-21, CP-23","Panel de administración"],
    ["RF-W024","CU-21","CP-24","Modo offline limitado (Workbox caché lectura)"],
    ["RF-W025","CU-10","CP-28","Gráfico evolución de precios (Chart.js /history)"],
    ["RF-A001","CU-18","CP-25","Descarga directa APK desde landing"],
    ["RF-A002","CU-18","CP-26","Paridad funcional APK = PWA"],
    ["RF-A003","CU-18","CP-26","Digital Asset Links (assetlinks.json)"],
    ["RF-A004","CU-04","CP-27","Acceso a cámara nativa Android EAN-13"],
    ["RF-A005","CU-04","CP-14, CP-27","Autocompletado por escaneo (Open Food Facts)"],
    ["RF-A006","CU-18","CP-26","Pantalla completa sin barra URL (standalone)"],
    ["RF-A007","CU-14","CP-17","Compartir PNG por WhatsApp nativo Android"],
    ["RF-A008","NT-BUILD","—","Script regeneración APK (desarrollador; no CU-18)"],
  ];

  return [
    h1("10. Trazabilidad RF → CU → CP"),
    p("La siguiente tabla permite rastrear cada requisito funcional hacia los casos de uso que lo ejercitan y los casos de prueba que lo verifican."),
    space(),
    tableN(["Requisito","Caso de uso","Casos de prueba","Descripción breve"],
      traz, [1500, 1800, 2600, 3900]),
    pb()
  ];
}

// ── SECCIÓN 11: MANUAL DE USUARIO ────────────────────────────────────────────
function seccionManual() {
  const planes = [
    ["FREE","$0","30 productos","1 local","IPC/USD, alertas, PNG, escáner; ventas historial 7 días.","Sin límite de tiempo."],
    ["PRO","$4.500/mes","Ilimitado","3 locales","Todo Free + analytics de ventas + email IPC.","Mercado Pago (sandbox en tesis)."],
    ["AGENCY","A medida","Ilimitado","Ilimitado","Todo Pro + multi-cliente; contactar sales@preciosya.com.","Contactar ventas."],
  ];

  const rutas = [
    ["Dashboard","/dashboard","Resumen KPIs, alertas activas, último IPC aplicado."],
    ["Productos","/products","ABM de productos, escáner EAN-13, filtros, alertas de margen."],
    ["Categorías","/categories","Activar/desactivar rubros COICOP. Toggle indexByUsd."],
    ["Historial","/history","Evolución de sale_price por producto. Chart.js + tabla price_history."],
    ["Ventas","/sales","Registro de ventas, resumen KPIs, historial, análisis."],
    ["Lista de precios","/price-list","Generación de PNG y compartir por WhatsApp."],
    ["Ajustes","/settings","Configuración del local, cuenta, plan."],
    ["Admin","/admin","Solo is_admin: usuarios, IPC manual, estadísticas."],
  ];

  const problemas = [
    ["CORS / 'No autorizado'","Volver a iniciar sesión con Google. Si persiste, limpiar caché del navegador (Ctrl+Shift+R)."],
    ["Sesión expirada","El sistema refresca el JWT automáticamente. Si no funciona, cerrar sesión y volver a ingresar."],
    ["APK muestra barra de Chrome","El assetlinks.json puede estar desactualizado. Verificar que el alias preciosya.vercel.app apunte al deployment activo en Vercel. Desinstalar y reinstalar el APK."],
    ["Offline: no cargan datos","El modo offline solo muestra datos en caché. Si no se cargó la app previamente con conexión, no habrá datos."],
    ["Escáner no funciona","Verificar que el navegador/APK tenga permiso de cámara concedido. En iPhone, usar la PWA en Safari."],
    ["No llega el IPC","El cron de IPC corre todos los días a las 03:00 ART (idempotente). INDEC suele publicar el IPC del mes anterior hacia el 13–14; hasta entonces el job no encuentra dato nuevo. Si el dato no aparece tras la publicación, el admin puede cargarlo manualmente desde /admin."],
  ];

  const glosario = [
    ["IPC","Índice de Precios al Consumidor. Publicado mensualmente por el INDEC."],
    ["Margen (margin_pct)","Porcentaje de ganancia sobre el costo. Ejemplo: costo $100, margen 30% → precio $130."],
    ["Rubro COICOP","División del catálogo de categorías del INDEC (ej. Alimentos y bebidas, Indumentaria)."],
    ["apply-ipc","Acción que aplica el IPC del período a los costos y precios de los rubros elegibles del local."],
    ["apply-usd","Acción que aplica la variación diaria del USD BCRA a los rubros con flag indexByUsd."],
    ["sale_price","Precio de venta calculado: cost × (1 + margin_pct/100), redondeado a la decena."],
    ["price_history","Registro append-only de cada cambio de precio con motivo (change_reason) y fecha."],
    ["Freemium","Modelo de negocio con versión gratuita (Free) y versión paga (Pro) con más funciones."],
  ];

  return [
    h1("Anexo A — Manual de Usuario — PreciosYa v3.1"),
    noteBox("PreciosYa NO es un POS ni un sistema de facturación. Es un gestor de precios y márgenes. Contacto: sales@preciosya.com"),

    h2("A.1 Introducción"),
    p("PreciosYa te ayuda a calcular y actualizar los precios de tu kiosco o almacén de forma rápida, con los índices oficiales del INDEC y el BCRA, desde tu celular. Sin complicaciones, sin cuentas a mano."),

    h2("A.2 Requisitos e instalación"),
    h3("Versión Web (recomendada)"),
    bullet("Navegador: Google Chrome 90+ o Safari 15+ (iOS / macOS)."),
    bullet("Acceso: https://preciosya.vercel.app"),
    bullet("Sin instalación requerida. En Chrome Android, podés instalar la PWA desde el menú 'Agregar a pantalla de inicio'."),
    h3("APK Android"),
    bullet("Requisitos: Android 8.0 (Oreo) o superior."),
    bullet("Paso 1: en Ajustes del teléfono, habilitar 'Instalar apps desconocidas' para Chrome / gestor de archivos."),
    bullet("Paso 2: acceder a preciosya-landing.vercel.app y tocar el botón 'Descargar APK' (o ir directamente a /preciosya.apk)."),
    bullet("Paso 3: abrir el archivo descargado e instalar."),
    bullet("Paso 4: abrir la app desde el ícono en el launcher. Si assetlinks está correcto, la app se abre en pantalla completa sin barra de URL."),
    h3("iPhone / iPad"),
    bullet("Solo disponible la versión PWA desde Safari."),
    bullet("Para instalar: abrir https://preciosya.vercel.app en Safari → botón Compartir → 'Agregar a pantalla de inicio'."),
    bullet("La APK es exclusivamente para Android."),

    h2("A.3 Primeros pasos"),
    h3("Paso 1 — Login con Google"),
    bullet("Al abrir la app, tocá 'Ingresar con Google'."),
    bullet("Seleccioná tu cuenta de Gmail. No es necesario crear una cuenta adicional."),
    bullet("El sistema te crea un perfil automáticamente y te asigna el plan Free."),
    h3("Paso 2 — Crear tu local"),
    bullet("Desde el Dashboard, tocá 'Crear local' o andá a Ajustes > Locales."),
    bullet("Ingresá el nombre del local, la dirección (opcional) y el margen mínimo que querés proteger."),
    bullet("Con el plan Free podés tener 1 local; con el Pro, hasta 3."),
    h3("Paso 3 — Activar rubros COICOP"),
    bullet("Andá a la sección Categorías (/categories)."),
    bullet("Activá los rubros que tenés en tu local (por ejemplo: Alimentos y bebidas, Indumentaria, Electrónica)."),
    bullet("Si algún rubro sigue más el dólar que el IPC, activá el toggle 'Indexar USD' para ese rubro."),
    h3("Paso 4 — Cargar tu primer producto"),
    bullet("Andá a Productos > Nuevo producto."),
    bullet("Escaneá el código de barras o ingresalo manualmente."),
    bullet("Completá el costo y el margen que querés aplicar. El precio de venta se calcula solo."),

    h2("A.4 Navegación"),
    p("La app tiene dos modos de navegación según el dispositivo:"),
    bulletMix("Barra inferior móvil: ", "Dashboard | Productos | Ventas | Historial | Ajustes."),
    bulletMix("Sidebar en escritorio: ", "menú lateral expandible con todas las secciones."),

    h2("A.5 Módulos"),
    h3("Productos"),
    bullet("Alta de producto: nombre, código de barras (EAN-13 con escáner), costo, margen → precio calculado automáticamente."),
    bullet("Alerta de margen: si el margen cae por debajo del mínimo del local, el producto se marca en rojo."),
    bullet("Actualización masiva: subir el costo de un rubro completo por un porcentaje en un toque."),
    bullet("Apply-IPC: aplicar el IPC del INDEC por rubro. No afecta los rubros marcados como 'Indexar USD'."),
    bullet("Apply-USD: aplicar la variación diaria del dólar BCRA a los rubros con flag USD."),
    h3("Rubros"),
    bullet("Activar o desactivar categorías COICOP predefinidas."),
    bullet("Toggle 'Indexar USD': los rubros con este toggle activado no reciben el apply-ipc."),
    h3("IPC y USD"),
    bullet("Un banner aparece cuando hay un nuevo IPC o variación USD disponible."),
    bullet("Desde la campanita, en notificaciones NEW_IPC, Ver rubros abre un desglose gráfico (barras horizontales por división COICOP) con leyenda e íconos."),
    bullet("El comerciante decide cuándo aplicar cada actualización."),
    bullet("El historial de cambios queda registrado con el motivo de cada actualización."),
    h3("Historial"),
    bullet("Seleccioná un producto para ver la evolución de su precio de venta en el tiempo (Chart.js)."),
    bullet("La tabla muestra cada cambio con fecha y motivo (manual, IPC, USD, bulk)."),
    h3("Ventas"),
    bullet("Nueva venta: seleccioná los productos vendidos y las cantidades. El sistema calcula el resumen de rentabilidad."),
    bullet("Resumen: KPIs del período (ingresos, margen promedio, cantidad de ventas)."),
    bullet("Historial: lista de todas las ventas registradas con detalle."),
    h3("Ajustes"),
    bullet("Configuración del local: nombre, dirección, margen mínimo."),
    bullet("Plan: Free, Pro o Agency. Desde acá podés suscribirte a Pro."),
    bullet("Cuenta: información de tu perfil de Google."),
    h3("Admin (solo administradores)"),
    bullet("Gestión de usuarios y planes."),
    bullet("Carga manual de IPC si la fuente automática falló."),
    bullet("Estadísticas globales de uso."),

    h2("A.6 Matriz pantalla ↔ función"),
    tableN(["Pantalla","Ruta","Responsabilidad"], rutas, [2200, 1800, 5800]),

    h2("A.7 Planes y límites"),
    tableN(["Plan","Precio","Productos","Locales","Funciones incluidas","Pago"],
      planes, [1200, 1600, 1600, 1300, 3000, 2100]),

    h2("A.8 Solución de problemas"),
    table2(["Problema","Solución"], problemas, [3200, 6600]),

    h2("A.9 Glosario"),
    table2(["Término","Definición"], glosario, [2400, 7400]),
    pb()
  ];
}

// ── SECCIÓN 11: REFERENCIAS ───────────────────────────────────────────────────
function seccionRefs() {
  const refs = [
    "Confederación Argentina de la Mediana Empresa (CAME). (2026). Índice de Ventas Minoristas Pyme (IVM). https://www.came.org.ar/",
    "Unión de Kiosqueros de la República Argentina (UKRA). (2025). Comunicado por aumento de precios. https://ukraweb.org.ar/noticias/",
    "Instituto Nacional de Estadística y Censos (INDEC). (2026). Índice de precios al consumidor (IPC). https://www.indec.gob.ar/",
    "Banco Central de la República Argentina (BCRA). (2025). Informe de Inclusión Financiera: Primer Semestre 2025. https://www.bcra.gob.ar/",
    "Ley 25.326. (2000). Protección de los Datos Personales. Honorable Congreso de la Nación Argentina.",
    "Osterwalder, A. & Pigneur, Y. (2010). Business Model Generation. John Wiley & Sons.",
    "Porter, M. E. (2008). The Five Competitive Forces That Shape Strategy. Harvard Business Review.",
    "PrismaJS. (2024). Prisma ORM Documentation. https://www.prisma.io/docs",
    "Supabase. (2024). Supabase Documentation. https://supabase.com/docs",
  ];
  return [
    h1("11. Referencias"),
    ...refs.map(r => bullet(r)),
    space(),
    space(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 80 },
      children: [new TextRun({ text: "PreciosYa © 2026 | Documentación Técnica de Tesis v3.1 | Escuela Multimedial Da Vinci", size: 18, color: MID, font: FONT, italic: true })]
    }),
  ];
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENTO
// ═══════════════════════════════════════════════════════════════════════════════
const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{
        level: 0, format: LevelFormat.BULLET, text: "•",
        alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } }
      }]
    }]
  },
  styles: {
    default: { document: { run: { font: FONT, size: 22, color: DARK } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: FONT, color: GRKD },
        paragraph: { spacing: { before: 400, after: 160 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GREEN } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: FONT, color: GRKD },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: FONT, color: GREEN },
        paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 11906, height: 16838 }, // A4
        margin: { top: 1134, right: 1000, bottom: 1134, left: 1000 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: GREEN } },
          spacing: { after: 60 },
          children: [
            new TextRun({ text: "PreciosYa — Documentación Técnica de Tesis | Analista de Sistemas | Da Vinci 2026", size: 18, color: "78716C", font: FONT }),
          ]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: GREEN } },
          spacing: { before: 60 },
          tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
          children: [
            new TextRun({ text: "PreciosYa © 2026 | Documentación Técnica de Tesis | Da Vinci", size: 18, color: "78716C", font: FONT }),
            new TextRun({ text: "\tPágina ", size: 18, color: "78716C", font: FONT }),
            new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "78716C", font: FONT }),
          ]
        })]
      })
    },
    children: [
      ...portada(),
      ...seccion1(),
      ...seccion2(),
      ...seccion3(),
      ...seccion4(),
      ...seccionUML(),
      ...seccion5(),
      ...seccion6(),
      ...seccion7(),
      ...seccion8(),
      ...seccion9(),
      ...seccion10(),
      ...seccionManual(),
      ...seccionRefs(),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT, buf);
  console.log('Done! Bytes:', buf.length);
}).catch(e => { console.error(e); process.exit(1); });