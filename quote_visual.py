"""Compact quote portraits with an adjacent, explicit illustration disclosure."""
import html


def visual_quote(text, attribution, photo, *, class_name='reader-portrait-quote', tag='blockquote', cite=''):
    e = html.escape
    source = f' cite="{e(cite, quote=True)}"' if cite else ''
    return (
        f'<figure class="portrait-quote {class_name}">'
        f'<img class="reader-portrait" src="/assets/{e(photo, quote=True)}" '
        'alt="AI-created illustrative portrait, not the quoted Reddit commenter" width="76" height="76">'
        f'<{tag} class="reader-quote"{source}>“{e(text)}”</{tag}>'
        f'<figcaption>{attribution}<span class="reader-portrait-note">'
        'AI illustration · not the commenter.</span></figcaption></figure>'
    )
