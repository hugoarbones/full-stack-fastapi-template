from sqlmodel import Session

from app import crud
from app.models import Restaurant, RestaurantCreate
from app.tests.utils.user import create_random_user
from app.tests.utils.utils import random_lower_string


def create_random_restaurant(db: Session) -> Restaurant:
    user = create_random_user(db)
    owner_id = user.id
    assert owner_id is not None
    name = random_lower_string()
    revo_tenant = random_lower_string()
    revo_client_key = random_lower_string()
    revo_api_key = random_lower_string()
    restaurant_in = RestaurantCreate(name=name, revo_tenant=revo_tenant, revo_client_key=revo_client_key, revo_api_key=revo_api_key)
    return crud.create_restaurant(session=db, restaurant_in=restaurant_in, owner_id=owner_id)
