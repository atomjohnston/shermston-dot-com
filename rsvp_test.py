import pytest
import rsvp


def test_get_basic():
    assert ('abbath', 'delight of the moon') == rsvp.get_basic(
        'Authorization: Basic YWJiYXRoOmRlbGlnaHQgb2YgdGhlIG1vb24=')


def test_get_basic_fails():
    with pytest.raises(UnicodeDecodeError):
        assert ('abbath', 'delight of the moon') == rsvp.get_basic(
            'Authorization: BasicYWJiYXRoOmRlbGlnaHQgb2YgdGhlIG1vb24=')