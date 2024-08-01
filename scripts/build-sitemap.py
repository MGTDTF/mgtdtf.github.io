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

def crawl_tree(outfile, elements):
    for element in elements:
        if element.tag != 'item': 
            crawl_tree(outfile, element)
        elif element.tag == 'item':
            url = element[1].text
            f = open(outfile, "a");
            f.write(sitemap_page.format(url, date))
            f.close()

    
def write_file(file, content):
    with open(file, "a") as dst:
        dst.write(content)
        dst.close()

if __name__== "__main__":
    bodyData = ""
    sourcefile = "./xml/pdf.xml"
    outfile = "./sitemap.xml"

    initOutput(outfile, sitemap_header)

    tree = ET.parse(sourcefile)
    root = tree.getroot()
    elements = list(root)
    crawl_tree(outfile, elements)

    closeOutput(outfile, sitemap_footer)