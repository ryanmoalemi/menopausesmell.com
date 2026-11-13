"""Reproducible editorial sentiment scores, never retail customer ratings."""
from pathlib import Path
from collections import Counter
from decimal import Decimal, ROUND_HALF_UP
import html
import json

DATA = json.loads((Path(__file__).parent / 'data/reddit-ratings.json').read_text())
E = html.escape


def score_family(key):
    family = DATA['families'][key]
    counts = Counter(row['sentiment'] for row in family['rows'])
    n = sum(counts.values())
    if n < DATA['minimum_threads']:
        return None, counts, n
    raw = Decimal(5 * counts['positive'] + 3 * counts['mixed'] + counts['negative'] + 6) / Decimal(n + 2)
    score = (raw * 2).quantize(Decimal('1'), rounding=ROUND_HALF_UP) / 2
    return float(score), counts, n


def stars(score):
    path = 'M12 2.3 15 8.4 21.8 9.4 16.9 14.2 18.1 21 12 17.8 5.9 21 7.1 14.2 2.2 9.4 9 8.4Z'
    icons = []
    for i in range(5):
        fill = max(0, min(1, score-i))
        icons.append(f'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="{path}" fill="#eee6d8" stroke="#ac7e1c" stroke-width=".7"/><path d="{path}" fill="#f4bd32" style="clip-path:inset(0 {100*(1-fill):g}% 0 0)"/></svg>')
    return '<span class="rating-stars" aria-hidden="true">'+''.join(icons)+'</span>'


def rating(pid):
    product = DATA['products'].get(pid, {})
    key = product.get('family')
    if not key:
        return '<div class="reddit-rating unrated"><span class="rating-kicker">Reddit sentiment</span><strong>Not rated yet</strong><span class="rating-context">Not enough product-specific feedback in our body-odor sample.</span><a class="rating-method" href="/reddit-recommendations/#ratings">How ratings work</a></div>'
    family = DATA['families'][key]
    score, counts, n = score_family(key)
    if score is None:
        return '<div class="reddit-rating unrated"><strong>Not rated yet</strong></div>'
    return f'''<div class="reddit-rating" data-rating-family="{key}" data-rating-score="{score:.1f}"><span class="rating-kicker">Reddit sentiment · {E(family['label'])}</span><a class="rating-line" href="/reddit-recommendations/#rating-{key}" aria-label="{score:.1f} out of 5, our editorial Reddit sentiment score for {E(family['label'])}. See sources and calculation.">{stars(score)}<strong>{score:.1f}<span> / 5</span></strong></a><span class="rating-context">{n} rated threads · Limited sample</span><span class="rating-scope">{E(family['scope'])}</span><a class="rating-method" href="/reddit-recommendations/#rating-{key}">See score breakdown</a></div>'''


def methodology():
    intro = '''<section class="rating-explainer" id="ratings"><span class="eyebrow">Behind the yellow stars</span><h2>How we score Reddit sentiment</h2><p>The stars summarize praise and criticism in the comments we reviewed. More stars mean a more favorable discussion in this small sample. They are our editorial calculation, not ratings submitted by Reddit users, Amazon reviews or proof a product works.</p><p><strong>What is being rated:</strong> a named product family, unless the exact formula is clear. The Mirai bar and liquid share one family score. Lume wash scores exclude deodorant-only comments. Read the scope beside every score.</p><div class="rating-rules"><div><strong>5 points</strong><span>Positive feedback, with no qualifying criticism found in the reviewed material.</span></div><div><strong>3 points</strong><span>Mixed feedback: praise plus complaints, or a partially helpful experience.</span></div><div><strong>1 point</strong><span>Negative feedback, with no praise found in the reviewed material.</span></div></div><p>Cost, delivery, irritation and disappointing results can affect sentiment. A general precaution is not treated as a personal bad experience. Each thread contributes once per family, regardless of comments or upvotes. A quiet thread counts as much as a busy one.</p><details class="label-details"><summary>See the calculation and limits</summary><p><strong>Score = (5 × positive threads + 3 × mixed threads + negative threads + 6) ÷ (rated threads + 2).</strong></p><p>The extra 6 points and 2 in the denominator are a neutral adjustment: two three-star observations that pull small samples toward the middle. They are not real reviews or included in the displayed thread count. We round to the nearest half star, with ties rounding up. At least three rated threads are required.</p><p>Our fixed sample contains eight selected body-odor threads. Searches partly included product names, so this is not a representative survey of Reddit. We read selected accessible comments, not every nested reply. Authors may appear in multiple threads, purchases are not verified, and combined routines cannot show which product caused a result. Missing comments could change a score.</p><p>Questions, plans to try, bare mentions, secondhand review summaries, known promotions and unclear product matches are excluded. Older context threads and the quotations on product cards are not automatically added to this sample. A product without enough evidence is “Not rated,” which does not mean it is poor quality. Commissions do not affect scores.</p></details><p class="note-small">Rating evidence reviewed November 12, 2026. These are consumer anecdotes, not clinical findings or a safety rating.</p></section>'''
    for key, family in DATA['families'].items():
        score, counts, n = score_family(key)
        breakdown = f"{counts['positive']} positive · {counts['mixed']} mixed · {counts['negative']} negative"
        rows = ''
        for row in family['rows']:
            t = DATA['threads'][row['thread']]
            rows += f'<li><div><a href="{E(t["url"],quote=True)}">{row["thread"]}: {E(t["title"])}</a><span class="sentiment-tag {row["sentiment"]}">{row["sentiment"].capitalize()}</span></div><p>{E(row["reason"])}</p></li>'
        intro += f'''<section class="rating-audit" id="rating-{key}"><h3>{E(family['label'])}</h3><div class="rating-line">{stars(score)}<strong>{score:.1f}<span> / 5</span></strong></div><p><strong>{breakdown}</strong> across {n} rated threads.</p><p>{family['positive_threads']} of the eight sampled threads include positive feedback. A thread can contain both praise and criticism, so this count is separate from the score.</p><p class="rating-scope">{E(family['scope'])}</p><details class="label-details"><summary>Read the {n} thread assessments</summary><ol class="sentiment-audit-list">{rows}</ol><p>{E(family['exclusions'])}</p></details></section>'''
    return intro
