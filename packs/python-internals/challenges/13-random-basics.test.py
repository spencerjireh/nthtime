import random
from solution import roll_dice, shuffle_deck, weighted_choice, random_sample


def test_roll_dice_count():
    random.seed(42)
    result = roll_dice(5)
    assert len(result) == 5


def test_roll_dice_range():
    random.seed(42)
    result = roll_dice(100, sides=6)
    assert all(1 <= r <= 6 for r in result)


def test_roll_dice_custom_sides():
    random.seed(42)
    result = roll_dice(50, sides=20)
    assert all(1 <= r <= 20 for r in result)


def test_roll_dice_single():
    random.seed(42)
    result = roll_dice(1)
    assert len(result) == 1
    assert 1 <= result[0] <= 6


def test_shuffle_deck_count():
    random.seed(42)
    deck = shuffle_deck()
    assert len(deck) == 52


def test_shuffle_deck_unique():
    random.seed(42)
    deck = shuffle_deck()
    assert len(set(deck)) == 52


def test_shuffle_deck_has_tuples():
    random.seed(42)
    deck = shuffle_deck()
    for card in deck:
        assert isinstance(card, tuple)
        assert len(card) == 2


def test_shuffle_deck_all_suits():
    random.seed(42)
    deck = shuffle_deck()
    suits = {card[1] for card in deck}
    assert suits == {"Hearts", "Diamonds", "Clubs", "Spades"}


def test_shuffle_deck_shuffled():
    random.seed(42)
    deck1 = shuffle_deck()
    random.seed(99)
    deck2 = shuffle_deck()
    assert deck1 != deck2


def test_weighted_choice_returns_valid_item():
    random.seed(42)
    items = ["a", "b", "c"]
    weights = [1, 1, 1]
    result = weighted_choice(items, weights)
    assert result in items


def test_weighted_choice_heavy_weight():
    random.seed(42)
    items = ["a", "b"]
    weights = [1000, 1]
    results = [weighted_choice(items, weights) for _ in range(100)]
    assert results.count("a") > 80


def test_random_sample_count():
    random.seed(42)
    items = list(range(100))
    result = random_sample(items, 10)
    assert len(result) == 10


def test_random_sample_unique():
    random.seed(42)
    items = list(range(100))
    result = random_sample(items, 10)
    assert len(set(result)) == 10


def test_random_sample_subset():
    random.seed(42)
    items = [1, 2, 3, 4, 5]
    result = random_sample(items, 3)
    assert all(r in items for r in result)
