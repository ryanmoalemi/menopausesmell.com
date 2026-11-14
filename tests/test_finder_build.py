import copy
import json
from pathlib import Path
import tempfile
import unittest
from finder import build_finder, ROOT

class FinderBuild(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory()
        self.out=Path(self.temp.name)
        self.settings=json.loads((ROOT/'data/finder-settings.json').read_text())
        self.products=json.loads((ROOT/'data/finder-products.json').read_text())
    def tearDown(self): self.temp.cleanup()
    def build(self,preview=False):return build_finder(self.out,preview,settings=self.settings,products=self.products)
    def test_disabled_is_default(self):
        (self.out/'index.html').write_text('<h1>Original home</h1>')
        self.assertFalse(self.build())
        self.assertFalse((self.out/'product-finder').exists())
        self.assertNotIn('product-finder',(self.out/'index.html').read_text())
    def test_preview_is_isolated_and_not_indexable(self):
        self.assertTrue(self.build(True))
        self.assertIn('noindex,nofollow',(self.out/'product-finder/index.html').read_text())
        self.assertTrue(json.loads((self.out/'product-finder/config.json').read_text())['preview'])
        self.assertFalse(self.settings['release_approved'])
        self.assertTrue((self.out/'__review/index.html').exists())
    def test_unapproved_release_fails(self):
        self.settings['enabled']=True
        with self.assertRaisesRegex(ValueError,'approved'):self.build()
    def test_image_permissions_gate(self):
        self.settings.update(enabled=True,release_approved=True)
        with self.assertRaisesRegex(ValueError,'image permissions'):self.build()
    def test_candidate_eligibility_gate(self):
        self.settings.update(enabled=True,release_approved=True)
        for p in self.products:p['imageRightsVerified']=True
        with self.assertRaisesRegex(ValueError,'eligibility'):self.build()

if __name__=='__main__':unittest.main()
