import unittest
from amazon_audit import direct_asin, audit_site
from commerce import amazon, refresh_amazon_links, LINKS
class DirectAmazonLinks(unittest.TestCase):
    def test_rejects_search_shortlinks_wrong_tags_and_extra_data(self):
        for url in ['https://www.amazon.com/s?k=soap&tag=menopausewash-20','https://amzn.to/test','https://www.amazon.com/dp/B07FKQGN7F?tag=other-20','https://www.amazon.com/dp/B07FKQGN7F?tag=menopausewash-20&concern=odor']:
            with self.subTest(url=url),self.assertRaises(ValueError):direct_asin(url)
    def test_every_comparison_product_has_a_tagged_direct_destination(self):
        for pid,p in LINKS['products'].items():
            with self.subTest(pid=pid):
                self.assertEqual(direct_asin(p['special_link']),p['asin'])
                self.assertNotIn('Amazon search',amazon(pid))
    def test_stale_snapshot_uses_current_ledger(self):
        html='<div class="amazon-choice"><a href="https://www.amazon.com/s?k=soap" data-product-id="vanicream-gentle-body-wash" data-placement="product_top">Find soap</a></div>'
        updated=refresh_amazon_links(html)
        self.assertIn('/dp/B07FKQGN7F?tag=menopausewash-20',updated)
        self.assertNotIn('/s?',updated)
    def test_unknown_product_fails_instead_of_searching(self):
        with self.assertRaises(ValueError):amazon('not-a-real-product')
