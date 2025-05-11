#!/usr/bin/env python

# Скрипт для ручного тестирования:
#  1. Загружает HTML-код страницы по URL
#  2. Убирает из HTML лишние теги и комментарии
#  3. Выводит форматированный HTML в stdout

import requests
from bs4 import BeautifulSoup, Comment


def fetch_html_from_url(url: str) -> str:
    """Загружает HTML-код страницы по URL.
    """
    response = requests.get(url)
    response.raise_for_status()

    content_type = response.headers.get('Content-Type', '')
    is_html = content_type.startswith(
        'text/html') or content_type.startswith('application/xhtml+xml')
    if not is_html:
        raise ValueError(
            f'Resource at {url} has unexpected Content-Type: {content_type}')

    return response.text


def clean_parsed_html(soup: BeautifulSoup) -> None:
    """Очищает HTML от лишних тегов и комментариев.
    """

    # Удаляем теги <style>
    for style_tag in soup.find_all('style'):
        style_tag.decompose()

    # Удаляем теги <script>, кроме LD+JSON
    for script_tag in soup.find_all('script'):
        if script_tag.get('type') != 'application/ld+json':
            script_tag.decompose()

    # Удаляем HTML-комментарии
    for comment in soup.find_all(string=lambda text: isinstance(text, Comment)):
        comment.extract()


def fetch_clean_html(url: str) -> str:
    """Загружает HTML с указанного URL, очищает и возвращает его.
    """
    html = fetch_html_from_url(url)
    soup = BeautifulSoup(html, 'html.parser')
    clean_parsed_html(soup)
    return soup.prettify()


def main(url: str, output_path: str) -> None:
    """Основная функция: загружает, очищает и выводит HTML.
    """
    html = fetch_clean_html(url)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)
    print(f"HTML from {url} saved to {output_path}")


if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <URL> <output_path>", file=sys.stderr)
        sys.exit(1)
    main(sys.argv[1], sys.argv[2])
