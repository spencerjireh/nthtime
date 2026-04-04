import random
from solution import reservoir_sample, fisher_yates_shuffle, lcg


def test_reservoir_sample_count():
    random.seed(42)
    result = reservoir_sample(range(1000), 5)
    assert len(result) == 5


def test_reservoir_sample_subset():
    random.seed(42)
    items = list(range(100))
    result = reservoir_sample(items, 10)
    assert all(r in items for r in result)


def test_reservoir_sample_exact_size():
    random.seed(42)
    result = reservoir_sample(range(5), 5)
    assert sorted(result) == [0, 1, 2, 3, 4]


def test_reservoir_sample_single():
    random.seed(42)
    result = reservoir_sample(range(100), 1)
    assert len(result) == 1
    assert 0 <= result[0] < 100


def test_reservoir_sample_deterministic():
    random.seed(42)
    r1 = reservoir_sample(range(1000), 5)
    random.seed(42)
    r2 = reservoir_sample(range(1000), 5)
    assert r1 == r2


def test_fisher_yates_shuffle_contains_all():
    random.seed(42)
    original = [1, 2, 3, 4, 5]
    result = fisher_yates_shuffle(original)
    assert sorted(result) == sorted(original)


def test_fisher_yates_shuffle_same_length():
    random.seed(42)
    result = fisher_yates_shuffle([1, 2, 3, 4, 5])
    assert len(result) == 5


def test_fisher_yates_shuffle_does_not_modify_input():
    random.seed(42)
    original = [1, 2, 3, 4, 5]
    copy = original[:]
    fisher_yates_shuffle(original)
    assert original == copy


def test_fisher_yates_shuffle_deterministic():
    random.seed(42)
    r1 = fisher_yates_shuffle(list(range(20)))
    random.seed(42)
    r2 = fisher_yates_shuffle(list(range(20)))
    assert r1 == r2


def test_fisher_yates_shuffle_single_element():
    random.seed(42)
    result = fisher_yates_shuffle([1])
    assert result == [1]


def test_lcg_deterministic():
    gen1 = lcg(42)
    gen2 = lcg(42)
    assert [next(gen1) for _ in range(10)] == [next(gen2) for _ in range(10)]


def test_lcg_different_seeds():
    gen1 = lcg(42)
    gen2 = lcg(99)
    assert next(gen1) != next(gen2)


def test_lcg_yields_numbers():
    gen = lcg(0)
    for _ in range(100):
        val = next(gen)
        assert isinstance(val, int)
        assert 0 <= val < 2**32


def test_lcg_sequence_not_constant():
    gen = lcg(42)
    values = [next(gen) for _ in range(10)]
    assert len(set(values)) > 1


def test_lcg_custom_params():
    gen = lcg(0, a=5, c=3, m=16)
    values = [next(gen) for _ in range(5)]
    expected = []
    v = 0
    for _ in range(5):
        v = (5 * v + 3) % 16
        expected.append(v)
    assert values == expected
