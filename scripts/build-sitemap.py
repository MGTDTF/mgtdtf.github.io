#!/bin/python3

import os
import sys
import xml.etree.ElementTree as ET


import datetime
date = datetime.datetime.now().date()


sitemap_header = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
'''

sitemap_page = '''
    <url>
        <loc>http://mgtdtf.github.io{}</loc>
        <lastmod>{}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>'''


sitemap_footer = '''
</urlset>'''

def initOutput(file, content):
    with open(file, "w") as dst:
        dst.write(content)
        dst.close()

def closeOutput(file, content):
    with open(file, "a") as dst:
        dst.write(content)
        dst.close()

def crawl_tree(elements):
    sitemap = ""
    for element in elements:
        if element.tag == 'menu': 
            crawl_tree(element)
        elif element.tag == 'item':
            url = element[1].text
            sitemap += sitemap_page.format(url, date)
    return(sitemap)
    
def write_file(file, content):
    with open(file, "a") as dst:
        dst.write(content)
        dst.close()

if __name__== "__main__":
    sourcefile = "./xml/pdf.xml"
    outfile = "./sitemap.xml"

    initOutput(outfile, sitemap_header)

    tree = ET.parse(sourcefile)
    root = tree.getroot()
    elements = list(root)
    bodyData = crawl_tree(elements)
    write_file(outfile, bodyData)

    closeOutput(outfile, sitemap_footer)