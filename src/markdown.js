class HtmlToMarkdownError {
    /**
     * @param {string} message 
     * @param {Node} node 
     */
    constructor(message, node) {
        this.message = message;
        this.node = node;
    }

    /**
     * @returns {string}
     */
    toString() {
        return this.message + ': ' + this.node.outerHTML;
    }

    /**
     * @returns {Error}
     */
    toError() {
        return new Error(this.toString());
    }
}

/**
 * Вспомогательные функции для преобразования различных фрагментов HTML документа в markdown.
 */
class HtmlToMarkdownConverter {
    /**
     * @param {{
     *   throwOnError: boolean
     * } | undefined} options 
     */
    constructor(options) {
        /**
         * @var {HtmlToMarkdownError[]}
         */
        options = options || {};
        this.errors = [];
        this.options = {
            throwOnError: options.throwOnError || false
        };
    }

    /**
     * @param {Node} block
     * @returns {string}
     */
    getInlineMarkdown(block) {
        const self = this;
        let chunks = [];

        /**
         * @param {Node|Element} node
         */
        function walk(node) {
            if (self._isTextNode(node)) {
                chunks.push(self._cleanInlineText(node.textContent));
            } else if (self._isElementNode(node)) {
                const tag = node.tagName.toLowerCase();
                switch (tag) {
                    case 'strong':
                    case 'b':
                        {
                            const text = self._getInlineText(node);
                            if (text) {
                                chunks.push('**' + text + '**');
                            }
                        }
                        break;

                    case 'em':
                    case 'i':
                        {
                            const text = self._getInlineText(node);
                            if (text) {
                                chunks.push('_' + text + '_');
                            }
                        }
                        break;

                    case 'u':
                    case 'ins':
                        {
                            const text = self._getInlineText(node);
                            if (text) {
                                chunks.push('<ins>' + text + '</ins>');
                            }
                        }
                        break;

                    case 's':
                    case 'del':
                        {
                            const text = self._getInlineText(node);
                            if (text) {
                                chunks.push('<del>' + text + '</del>');
                            }
                        }
                        break;

                    case 'sup':
                        {
                            const text = self._getInlineText(node);
                            if (text) {
                                chunks.push('<sup>' + text + '</sup>');
                            }
                        }
                        break;

                    case 'sub':
                        {
                            const text = self._getInlineText(node);
                            if (text) {
                                chunks.push('<sub>' + text + '</sub>');
                            }
                        }
                        break;

                    case 'sub':
                        {
                            const text = self._getInlineText(node);
                            if (text) {
                                chunks.push('<sub>' + text + '</sub>');
                            }
                        }
                        break;

                    case 'tt':
                    case 'code':
                        {
                            const text = self._getInlineText(node);
                            if (text) {
                                chunks.push('`' + text + '`');
                            }
                        }
                        break;

                    case 'img':
                        {
                            const alt = node.getAttribute('alt');
                            const src = node.getAttribute('src');
                            const title = node.getAttribute('title');
                            if (!src) {
                                self._addError(`Image "${tag}" has no "src" attribute: `, node)
                            } else {
                                chunks.push(title ? `![${alt}](${src} "${title}")` : `![${alt}](${src})`);
                            }
                        }
                        break;

                    case 'a':
                        {
                            const text = self._getInlineText(node);
                            const href = node.getAttribute('href');
                            const title = node.getAttribute('title');
                            if (!href) {
                                self._addError(`Hyperlink "${tag}" has no "href" attribute`, node);
                            } else {
                                chunks.push(title ? `[${text}](${href} "${title}")` : `[${text}](${href})`);
                            }
                        }
                        break;

                    case 'p':
                        for (let i = 0; i < node.childNodes.length; i++) {
                            walk(node.childNodes[i]);
                        }
                        break;

                    default:
                        self._addError(`Unexpected inline HTML tag "${tag}": `, node);
                        for (let i = 0; i < node.childNodes.length; i++) {
                            walk(node.childNodes[i]);
                        }
                        break;
                }
            }
        }

        walk(block);

        return this._joinInlineMarkdown(chunks);
    }

    /**
     * Соединяет фрагменты inline markdown по правилам HTML, то есть:
     *  ['hello', 'world'] => 'helloworld'
     *  ['hello', ' world'] => 'hello world'
     *  ['hello  ', ' world'] => 'hello world'
     *
     * @param {string[]} chunks
     * @returns {string}
     */
    _joinInlineMarkdown(chunks) {
        let result = '';
        let needsSpace = false;
        for (const text of chunks) {
            const textTrimmedStart = text.trimStart();
            const textTrimmedEnd = textTrimmedStart.trimEnd();

            if (textTrimmedEnd != '') {
                if (needsSpace || (textTrimmedStart !== text)) {
                    result += ' ';
                }
                if (textTrimmedEnd) {
                    result += textTrimmedEnd;
                }
                needsSpace = (textTrimmedEnd != textTrimmedStart);
            } else {
                needsSpace = needsSpace || (text != '');
            }
        }
        return result.trimStart();
    }

    /**
     * @param {Node} block
     * @returns {string}
     */
    _getInlineText(block) {
        const self = this;
        let chunks = [];

        /**
         * @param {Node|Element} node
         */
        function walk(node) {
            if (self._isTextNode(node)) {
                chunks.push(self._cleanInlineText(node.textContent));
            } else if (self._isElementNode(node)) {
                for (let i = 0; i < node.childNodes.length; i++) {
                    walk(node.childNodes[i]);
                }
            }
        }
        walk(block);

        return this._joinInlineText(chunks);
    }

    /**
     * Соединяет фрагменты текста по правилам HTML, то есть:
     *  ['hello', 'world'] => 'helloworld'
     *  ['hello', ' world'] => 'hello world'
     *  ['hello  ', ' world'] => 'hello world'
     *
     * @param {string[]} chunks
     * @returns {string}
     */
    _joinInlineText(chunks) {
        return chunks.join('').replace(/\s+/, ' ').trim();
    }

    _cleanInlineText(text) {
        return text.replaceAll(/\s+/g, ' ');
    }

    /**
     * @param {Node} node 
     * @returns {boolean}
     */
    _isTextNode(node) {
        return node.nodeType == 3;
    }

    /**
     * @param {Node} node 
     * @returns {boolean}
     */
    _isElementNode(node) {
        return node.nodeType == 1;
    }

    /**
     * @param {string} message 
     * @param {Node} node 
     */
    _addError(message, node) {
        const error = new HtmlToMarkdownError(message, node);
        if (this.options.throwOnError) {
            throw error.toError();
        }
        this.errors.push(error);
    }
}

class MarkdownDocument {
    constructor() {
        this.blocks = [];
        this.current = '';
    }

    addHeader() {
    }
}

/**
 * @param {HTMLElement} element 
 * @returns {string}
 */
function htmlToMarkdown(element) {
    let markdown = '';

    return ''
}

exports.HtmlToMarkdownConverter = HtmlToMarkdownConverter;
exports.MarkdownDocument = MarkdownDocument;
exports.htmlToMarkdown = htmlToMarkdown;
