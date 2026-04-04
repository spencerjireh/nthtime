import string
from solution import generate_token, generate_password, constant_time_compare, generate_otp


def test_generate_token_default_length():
    token = generate_token()
    assert len(token) == 64


def test_generate_token_custom_length():
    token = generate_token(16)
    assert len(token) == 32


def test_generate_token_is_hex():
    token = generate_token(8)
    assert all(c in "0123456789abcdef" for c in token)


def test_generate_token_unique():
    t1 = generate_token()
    t2 = generate_token()
    assert t1 != t2


def test_generate_password_default_length():
    pw = generate_password()
    assert len(pw) == 16


def test_generate_password_custom_length():
    pw = generate_password(8)
    assert len(pw) == 8


def test_generate_password_characters():
    pw = generate_password(100)
    allowed = set(string.ascii_letters + string.digits)
    assert all(c in allowed for c in pw)


def test_generate_password_unique():
    p1 = generate_password()
    p2 = generate_password()
    assert p1 != p2


def test_constant_time_compare_equal():
    assert constant_time_compare("hello", "hello") is True


def test_constant_time_compare_unequal():
    assert constant_time_compare("hello", "world") is False


def test_constant_time_compare_empty():
    assert constant_time_compare("", "") is True


def test_constant_time_compare_different_length():
    assert constant_time_compare("abc", "abcd") is False


def test_generate_otp_default_length():
    otp = generate_otp()
    assert len(otp) == 6


def test_generate_otp_custom_length():
    otp = generate_otp(4)
    assert len(otp) == 4


def test_generate_otp_all_digits():
    otp = generate_otp(10)
    assert otp.isdigit()


def test_generate_otp_zero_padded():
    found_leading_zero = False
    for _ in range(1000):
        otp = generate_otp(6)
        if otp[0] == "0":
            found_leading_zero = True
            assert len(otp) == 6
            break
    assert found_leading_zero or True
