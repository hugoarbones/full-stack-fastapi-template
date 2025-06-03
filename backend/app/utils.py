import logging
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import emails  # type: ignore
import jwt
from jinja2 import Template
from jwt.exceptions import InvalidTokenError

from app.core import security
from app.core.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class EmailData:
    html_content: str
    subject: str


def render_email_template(*, template_name: str, context: dict[str, Any]) -> str:
    template_path = Path(__file__).parent / "email-templates" / "build" / template_name
    template_str = template_path.read_text(encoding="utf-8").strip()
    html_content = Template(template_str).render(context)
    return html_content


def send_email(
    *,
    email_to: str,
    subject: str = "",
    html_content: str = "",
) -> None:
    if settings.emails_enabled:
        print("Sending email to", email_to)
        print("Subject", subject)
        print("HTML content", html_content)
        message = emails.Message(
            subject=subject,
            html=html_content,
            mail_from=(settings.EMAILS_FROM_NAME, settings.EMAILS_FROM_EMAIL),
        )
        smtp_options: dict[str, Any] = {
            "host": settings.SMTP_HOST,
            "port": settings.SMTP_PORT,
        }
        if settings.SMTP_TLS:
            smtp_options["tls"] = True
        elif settings.SMTP_SSL:
            smtp_options["ssl"] = True
        else:
            smtp_options["ssl"] = False
            smtp_options["tls"] = False

        if settings.SMTP_USER and settings.SMTP_PASSWORD and settings.SMTP_TLS:
            smtp_options["user"] = settings.SMTP_USER
            smtp_options["password"] = settings.SMTP_PASSWORD

        print(smtp_options)
        try:
            response = message.send(to=email_to, smtp=smtp_options)
            logger.info(f"Email send response: {response}")

            status_code = getattr(response, "status_code", None)
            if status_code is None:
                logger.info(f"Email likely sent to {email_to} (no SMTP status code received, maybe mailcatcher)")
            elif status_code != 250:
                reason = getattr(response, "reason", "No reason provided")
                logger.error(f"Failed to send email to {email_to}: {status_code} {reason}")
            else:
                logger.info(f"Email sent successfully to {email_to}")
        except Exception as e:
            logger.exception(f"Exception occurred while sending email to {email_to}: {e}")

    if settings.emails_enabled_real:
        print("Sending real email to", email_to)
        print("Subject", subject)
        print("HTML content", html_content)
        message_real = emails.Message(
            subject=subject,
            html=html_content,
            mail_from=(settings.EMAILS_FROM_NAME_REAL, settings.EMAILS_FROM_EMAIL_REAL),
        )
        smtp_options_real: dict[str, Any] = {
            "host": settings.SMTP_HOST_REAL,
            "port": settings.SMTP_PORT_REAL,
        }
        if settings.SMTP_TLS_REAL:
            smtp_options_real["tls"] = True
        elif settings.SMTP_SSL_REAL:
            smtp_options_real["ssl"] = True
        else:
            smtp_options_real["ssl"] = False
            smtp_options_real["tls"] = False

        if settings.SMTP_USER_REAL and settings.SMTP_PASSWORD_REAL and settings.SMTP_TLS_REAL:
            smtp_options_real["user"] = settings.SMTP_USER_REAL
            smtp_options_real["password"] = settings.SMTP_PASSWORD_REAL

        print(smtp_options_real)
        try:
            response_real = message_real.send(to=email_to, smtp=smtp_options_real)
            logger.info(f"Real Email send response: {response_real}")

            status_code_real = getattr(response_real, "status_code", None)
            if status_code_real is None:
                logger.info(f"Real Email likely sent to {email_to}")
            elif status_code_real != 250:
                reason_real = getattr(response_real, "reason", "No reason provided")
                logger.error(f"Failed to send real email to {email_to}: {status_code_real} {reason_real}")
            else:
                logger.info(f"Real Email sent successfully to {email_to}")
        except Exception as e:
            logger.exception(f"Exception occurred while sending real email to {email_to}: {e}")


def generate_test_email(email_to: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Test email"
    html_content = render_email_template(
        template_name="test_email.html",
        context={"project_name": project_name, "email": email_to},
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_reset_password_email(email_to: str, email: str, token: str) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - Password recovery for user {email}"
    link = f"{settings.FRONTEND_HOST}/reset-password?token={token}"
    html_content = render_email_template(
        template_name="reset_password.html",
        context={
            "project_name": project_name,
            "username": email,
            "email": email_to,
            "valid_hours": settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS,
            "link": link,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_new_account_email(
    email_to: str, username: str, password: str
) -> EmailData:
    project_name = settings.PROJECT_NAME
    subject = f"{project_name} - New account for user {username}"
    html_content = render_email_template(
        template_name="new_account.html",
        context={
            "project_name": project_name,
            "username": username,
            "password": password,
            "email": email_to,
            "link": settings.FRONTEND_HOST,
        },
    )
    return EmailData(html_content=html_content, subject=subject)


def generate_password_reset_token(email: str) -> str:
    delta = timedelta(hours=settings.EMAIL_RESET_TOKEN_EXPIRE_HOURS)
    now = datetime.now(timezone.utc)
    expires = now + delta
    exp = int(expires.timestamp())
    nbf = int(now.timestamp())
    encoded_jwt = jwt.encode(
        {"exp": exp, "nbf": nbf, "sub": email},
        settings.SECRET_KEY,
        algorithm=security.ALGORITHM,
    )
    # jwt.encode returns str in PyJWT>=2.0, else bytes, so ensure str:
    if isinstance(encoded_jwt, bytes):
        encoded_jwt = encoded_jwt.decode("utf-8")
    return encoded_jwt


def verify_password_reset_token(token: str) -> str | None:
    try:
        decoded_token = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        return str(decoded_token["sub"])
    except InvalidTokenError:
        return None
