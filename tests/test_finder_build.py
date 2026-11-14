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
        self.settings.update(enabled=False, release_approved=False, reuse_existing_site_images=False)
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
        with self.assertRaisesRegex(ValueError,'image needs'):self.build()
    def test_candidate_eligibility_gate(self):
        self.settings.update(enabled=True,release_approved=True)
        for p in self.products:
            p['imageRightsVerified']=True
            p['publishEligible']=False
        with self.assertRaisesRegex(ValueError,'eligibility'):self.build()

    def test_approved_existing_asset_does_not_falsify_rights(self):
        self.settings.update(enabled=True,release_approved=True,reuse_existing_site_images=True)
        self.assertTrue(self.build())
        self.assertFalse(any(p['imageRightsVerified'] for p in self.products))
        self.assertFalse(json.loads((self.out/'product-finder/config.json').read_text())['preview'])
        self.assertIn('index,follow',(self.out/'product-finder/index.html').read_text())
        self.assertFalse((self.out/'__review').exists())
    def test_changed_unverified_asset_does_not_pass_existing_asset_check(self):
        self.settings.update(enabled=True,release_approved=True,reuse_existing_site_images=True)
        self.products[0]['existingAssetSha256']='not-the-approved-asset'
        with self.assertRaisesRegex(ValueError,'image needs'):self.build()

    def test_new_source_photo_requires_matching_recorded_source_and_bytes(self):
        self.settings.update(enabled=True,release_approved=True,reuse_existing_site_images=True)
        photo = next(p for p in self.products if p.get('sourcePhotoSha256'))
        photo['sourcePhotoSha256']='changed-photo'
        with self.assertRaisesRegex(ValueError,'image needs'):self.build()

if __name__=='__main__':unittest.main()
