
from fetch_clean_html import fetch_clean_html

def test_fetch_clean_html(requests_mock, snapshot):
    test_url = "http://example.com"
    test_html = """
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="UTF-8">
            <title>Что такое ATDD</title>
            <style>
                body { color: red; }
                .test { margin: 10px; }
            </style>
            <script src="https://example.com/script.js"></script>
            <script>alert("Remove me");</script>
            <script type="application/ld+json">
            {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": "Что такое ATDD? Полное руководство по Acceptance Test-Driven Development",
                "datePublished": "2023-10-15",
                "dateModified": "2023-10-20"
            }
            </script>
        </head>
        <body>
            <h1>Что такое ATDD?</h1>
            <p class="test">Content</p>
            <!-- Comment to remove -->
        </body>
    </html>
    """
    requests_mock.get(test_url, text=test_html, headers={"Content-Type": "text/html; charset=utf8"})
    
    html = fetch_clean_html(test_url)
    
    snapshot.assert_match(html, "cleaned_html_output")
