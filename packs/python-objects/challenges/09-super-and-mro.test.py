from solution import Animal, Dog, ServiceDog, describe


def test_animal_speak():
    a = Animal("Cat")
    assert a.speak() == "Cat makes a sound"


def test_animal_name():
    a = Animal("Cat")
    assert a.name == "Cat"


def test_dog_speak():
    d = Dog("Rex", "Lab")
    assert d.speak() == "Rex barks"


def test_dog_attributes():
    d = Dog("Rex", "Lab")
    assert d.name == "Rex"
    assert d.breed == "Lab"


def test_service_dog_speak():
    sd = ServiceDog("Buddy", "Golden", "guide")
    assert sd.speak() == "Buddy barks softly"


def test_service_dog_attributes():
    sd = ServiceDog("Buddy", "Golden", "guide")
    assert sd.name == "Buddy"
    assert sd.breed == "Golden"
    assert sd.task == "guide"


def test_describe_animal():
    a = Animal("Cat")
    assert describe(a) == "Animal: Cat makes a sound"


def test_describe_dog():
    d = Dog("Rex", "Lab")
    assert describe(d) == "Dog: Rex barks"


def test_describe_service_dog():
    sd = ServiceDog("Buddy", "Golden", "guide")
    assert describe(sd) == "ServiceDog: Buddy barks softly"


def test_isinstance_chain():
    sd = ServiceDog("Buddy", "Golden", "guide")
    assert isinstance(sd, ServiceDog)
    assert isinstance(sd, Dog)
    assert isinstance(sd, Animal)
