from solution import Address, Person, Roster


def test_address_attributes():
    addr = Address("123 Main St", "Springfield", "62704")
    assert addr.street == "123 Main St"
    assert addr.city == "Springfield"
    assert addr.zip_code == "62704"


def test_person_attributes():
    addr = Address("123 Main St", "Springfield", "62704")
    person = Person("Alice", 30, addr)
    assert person.name == "Alice"
    assert person.age == 30
    assert person.address is addr


def test_person_summary():
    addr = Address("123 Main St", "Springfield", "62704")
    person = Person("Alice", 30, addr)
    assert person.summary() == "Alice, age 30, Springfield"


def test_roster_add_person():
    roster = Roster("Team A")
    addr = Address("1 St", "NYC", "10001")
    person = Person("Bob", 25, addr)
    roster.add_person(person)
    assert len(roster.people) == 1


def test_find_by_city_match():
    roster = Roster("Team A")
    addr1 = Address("1 St", "NYC", "10001")
    addr2 = Address("2 Ave", "LA", "90001")
    p1 = Person("Alice", 30, addr1)
    p2 = Person("Bob", 25, addr2)
    p3 = Person("Charlie", 35, addr1)
    roster.add_person(p1)
    roster.add_person(p2)
    roster.add_person(p3)
    result = roster.find_by_city("NYC")
    assert result == [p1, p3]


def test_find_by_city_no_match():
    roster = Roster("Team A")
    addr = Address("1 St", "NYC", "10001")
    roster.add_person(Person("Alice", 30, addr))
    assert roster.find_by_city("Chicago") == []


def test_summary_format():
    addr = Address("456 Oak Rd", "Denver", "80201")
    person = Person("Zara", 22, addr)
    assert person.summary() == "Zara, age 22, Denver"
