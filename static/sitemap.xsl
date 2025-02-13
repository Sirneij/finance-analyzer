<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
                xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
                xmlns:tag="http://www.sitemaps.org/schemas/sitemap-tags/0.9">
    <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
    <xsl:template match="/">
        <html>
            <head>
                <title>XML Sitemap | John Owolabi Idogun</title>
                <meta name="description" content="This is the sitemap for John Owolabi Idogun"/>
                <meta name="author" content="John Owolabi Idogun"/>
                <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                <meta name="robots" content="index, follow"/>
                <meta name="theme-color" content="#000"/>
                <meta name="twitter:card" content="summary"/>
                <meta name="twitter:site" content="@sirneij"/>
                <meta name="twitter:creator" content="@sirneij"/>
                <meta property="og:title" content="XML Sitemap | John Owolabi Idogun"/>
                <meta property="og:description" content="This is the sitemap for John Owolabi Idogun"/>
                <meta property="og:type" content="website"/>
                <meta property="og:url" content="https://johnowolabiidogun.dev/sitemap.xml"/>
                <meta property="og:image" content="https://johnowolabiidogun.dev/JI.png"/>
                <meta property="og:site_name" content="John Owolabi Idogun"/>
                <meta property="og:locale" content="en_US"/>
                <meta property="og:locale:alternate" content="en_GB"/>

                <link rel="canonical" href="https://johnowolabiidogun.dev/sitemap.xml"/>
                <style>
                    body { font-family: system-ui, -apple-system, sans-serif; max-width: 80ch; margin: 2rem auto; line-height: 1.5; }
                    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                    th, td { padding: 0.5rem; text-align: left; border: 1px solid #ddd; }
                    th { background: #f5f5f5; }
                    tr:nth-child(even) { background: #f9f9f9; }
                    .image-cell { max-width: 300px; word-wrap: break-word; }
                    .tag { margin: 0.2rem 0; padding: 0.2rem 0; border-bottom: 1px solid #eee; }
                    .tag:last-child { border-bottom: none; }
                </style>
            </head>
            <body>
                <h1>XML Sitemap</h1>
                <p>This is the sitemap for <xsl:value-of select="sitemap:urlset/sitemap:url[1]/sitemap:loc"/></p>
                <table>
                    <tr>
                        <th>URL</th>
                        <th>Last Modified</th>
                        <th>Change Frequency</th>
                        <th>Priority</th>
                        <th>Images</th>
                    </tr>
                    <xsl:for-each select="sitemap:urlset/sitemap:url">
                        <tr>
                            <td><a href="{sitemap:loc}"><xsl:value-of select="sitemap:loc"/></a></td>
                            <td><xsl:value-of select="sitemap:lastmod"/></td>
                            <td><xsl:value-of select="sitemap:changefreq"/></td>
                            <td><xsl:value-of select="sitemap:priority"/></td>
                            <td class="image-cell">
                                <xsl:for-each select="image:image">
                                    <div><xsl:value-of select="image:loc"/></div>
                                </xsl:for-each>
                            </td>
                        </tr>
                    </xsl:for-each>
                </table>
            </body>
        </html>
    </xsl:template>
</xsl:stylesheet>