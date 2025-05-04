const { describe, test, expect } = require("@jest/globals");
const { JSDOM } = require('jsdom');

const { HtmlToMarkdownConverter } = require('../src/markdown');
const { loadTestFilesAsync } = require('./test_helpers');

describe('markdown module', () => {
    test.each([
        [['hello', 'world'], 'helloworld'],
        [['hello', ' world'], 'hello world'],
        [['hello  ', '  world'], 'hello world'],
        [['hello  ', ' ', ' ', '  world'], 'hello world'],
        [['hello', '\n', 'world'], 'hello world'],
        [['hello\n\nworld'], 'hello world'],
        [['\n   '], ''],
    ])('can join "%s" into "%s"', (chunks, expected) => {
        const converter = new HtmlToMarkdownConverter({
            throwOnError: true
        });
        expect(converter._joinInlineText(chunks)).toBe(expected);
    });

    test.each([
        'inline/01/',
        'inline/02/',
        'inline/03/',
        'inline/04/',
    ])('can parse inline html at "%s"', async (dir) => {
        const { input, expected } = await loadTestFilesAsync(dir);
        const fragment = JSDOM.fragment(input);
        expect(fragment.children.length).toBe(1);

        const converter = new HtmlToMarkdownConverter({
            throwOnError: true
        });
        const markdown = converter.getInlineMarkdown(fragment.children[0]);
        expect(markdown).toBe(expected);
    })
});
