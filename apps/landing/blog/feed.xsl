<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="html" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html lang="es-AR">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="/rss/channel/title"/> — Feed RSS</title>
        <style>
          * { box-sizing: border-box; }
          body {
            font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
            margin: 0;
            padding: 2rem 1rem 3rem;
            background: #f8f7f4;
            color: #1c1917;
            line-height: 1.5;
          }
          .wrap { max-width: 40rem; margin: 0 auto; }
          h1 { font-size: 1.5rem; margin: 0 0 0.35rem; letter-spacing: -0.02em; }
          .lead { color: #57534e; margin: 0 0 1.25rem; font-size: 0.95rem; }
          .note {
            background: #fff;
            border: 1px solid #e7e5e4;
            border-radius: 12px;
            padding: 1rem 1.1rem;
            font-size: 0.85rem;
            color: #44403c;
            margin-bottom: 1.5rem;
          }
          .note strong { color: #16a34a; }
          ul { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.75rem; }
          li {
            background: #fff;
            border: 1px solid #e7e5e4;
            border-radius: 12px;
            padding: 1rem 1.15rem;
          }
          li a {
            color: #1c1917;
            font-weight: 700;
            text-decoration: none;
            font-size: 1rem;
          }
          li a:hover { color: #16a34a; }
          .desc { margin: 0.35rem 0 0; font-size: 0.875rem; color: #57534e; }
          .date { margin-top: 0.5rem; font-size: 0.75rem; color: #a8a29e; }
          .back {
            display: inline-block;
            margin-top: 1.5rem;
            font-size: 0.875rem;
            font-weight: 600;
            color: #16a34a;
            text-decoration: none;
          }
          .back:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <div class="wrap">
          <h1><xsl:value-of select="/rss/channel/title"/></h1>
          <p class="lead"><xsl:value-of select="/rss/channel/description"/></p>
          <div class="note">
            <strong>¿Qué es esto?</strong> Es el feed RSS del blog. Para leerlo en el celular o PC,
            agregá esta URL en Feedly, Inoreader o el lector de noticias de tu navegador.
            Si solo querés leer las guías, volvé al <a href="./">índice del blog</a>.
          </div>
          <ul>
            <xsl:for-each select="/rss/channel/item">
              <li>
                <a href="{link}"><xsl:value-of select="title"/></a>
                <p class="desc"><xsl:value-of select="description"/></p>
                <p class="date"><xsl:value-of select="pubDate"/></p>
              </li>
            </xsl:for-each>
          </ul>
          <a class="back" href="./">← Volver al blog</a>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
