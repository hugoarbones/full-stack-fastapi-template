import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from app.tests.utils.restaurant import create_random_restaurant


def test_create_restaurant(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"name": "Foo", 'revo_tenant': 'pizzeria', 'revo_client_key': 'pizzeria', 'revo_api_key': 'pizzeria'}
    response = client.post(
        f"{settings.API_V1_STR}/restaurants/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == data["name"]
    assert content["revo_tenant"] == data["revo_tenant"]
    assert content["revo_client_key"] == data["revo_client_key"]
    assert content["revo_api_key"] == data["revo_api_key"]
    assert "id" in content
    assert "owner_id" in content


def test_read_restaurant(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    restaurant = create_random_restaurant(db)
    response = client.get(
        f"{settings.API_V1_STR}/restaurants/{restaurant.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == restaurant.name
    assert content["revo_tenant"] == restaurant.revo_tenant
    assert content["revo_client_key"] == restaurant.revo_client_key
    assert content["revo_api_key"] == restaurant.revo_api_key
    assert content["id"] == str(restaurant.id)
    assert content["owner_id"] == str(restaurant.owner_id)


def test_read_restaurant_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/restaurants/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "restaurant not found"


def test_read_restaurant_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    restaurant = create_random_restaurant(db)
    response = client.get(
        f"{settings.API_V1_STR}/restaurants/{restaurant.id}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"


def test_read_restaurants(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    create_random_restaurant(db)
    create_random_restaurant(db)
    response = client.get(
        f"{settings.API_V1_STR}/restaurants/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2


def test_update_restaurant(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    restaurant = create_random_restaurant(db)
    data = {"name": "Updated name", "revo_tenant": "Updated revo_tenant", "revo_client_key": "Updated revo_client_key", "revo_api_key": "Updated revo_api_key"}
    response = client.put(
        f"{settings.API_V1_STR}/restaurants/{restaurant.id}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["name"] == data["name"]
    assert content["revo_tenant"] == data["revo_tenant"]
    assert content["revo_client_key"] == data["revo_client_key"]
    assert content["revo_api_key"] == data["revo_api_key"]
    assert content["id"] == str(restaurant.id)
    assert content["owner_id"] == str(restaurant.owner_id)


def test_update_restaurant_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"name": "Updated name", "revo_tenant": "Updated revo_tenant", "revo_client_key": "Updated revo_client_key", "revo_api_key": "Updated revo_api_key"}
    response = client.put(
        f"{settings.API_V1_STR}/restaurants/{uuid.uuid4()}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "restaurant not found"


def test_update_restaurant_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    restaurant = create_random_restaurant(db)
    data = {"name": "Updated name", "revo_tenant": "Updated revo_tenant", "revo_client_key": "Updated revo_client_key", "revo_api_key": "Updated revo_api_key"}
    response = client.put(
        f"{settings.API_V1_STR}/restaurants/{restaurant.id}",
        headers=normal_user_token_headers,
        json=data,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"


def test_delete_restaurant(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    restaurant = create_random_restaurant(db)
    response = client.delete(
        f"{settings.API_V1_STR}/restaurants/{restaurant.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["message"] == "restaurant deleted successfully"


def test_delete_restaurant_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/restaurants/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "restaurant not found"


def test_delete_restaurant_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    restaurant = create_random_restaurant(db)
    response = client.delete(
        f"{settings.API_V1_STR}/restaurants/{restaurant.id}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 400
    content = response.json()
    assert content["detail"] == "Not enough permissions"
