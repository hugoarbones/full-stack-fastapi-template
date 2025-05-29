from sqlmodel import Session

from app import crud
from app.models import Restaurant, RestaurantCreate
from app.tests.utils.user import create_random_user
from app.tests.utils.utils import random_lower_string


def create_random_restaurant(db: Session) -> Restaurant:
    user = create_random_user(db)
    owner_id = user.id
    assert owner_id is not None
    title = random_lower_string()
    description = random_lower_string()
    restaurant_in = RestaurantCreate(title=title, description=description)
    return crud.create_restaurant(session=db, restaurant_in=restaurant_in, owner_id=owner_id)
