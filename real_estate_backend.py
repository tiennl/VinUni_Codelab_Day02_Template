"""Single-file real-estate chatbot backend.

Run from the repository root:
    uvicorn real_estate_backend:app --reload

The service stores property records in SQLite, retrieves matching properties
before a chat request, and optionally asks OpenAI to explain the results.
Configure the model with OPENAI_API_KEY. No key is exposed by the API.
"""

from __future__ import annotations

import json
import math
import os
import re
import sqlite3
import sys
import csv
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Literal
from uuid import uuid4

from fastapi import FastAPI, Header, Query
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field


ROOT = Path(__file__).resolve().parent
DATABASE_PATH = Path(os.getenv("REAL_ESTATE_DB_PATH", ROOT / "real_estate.db"))
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5")
PropertyType = Literal["apartment", "house", "villa", "townhouse", "land", "project"]


SEED_PROPERTIES = [
    {
        "property_id": "VH-OP1-CATALOG",
        "project": "Vinhomes Ocean Park 1",
        "zone": "Khu vực phía Đông",
        "building": None,
        "unit_code": None,
        "city": "Hanoi",
        "district": "Gia Lam",
        "ward": None,
        "address": "Vinhomes Ocean Park 1, Gia Lam, Hanoi",
        "latitude": None,
        "longitude": None,
        "property_type": "project",
        "bedrooms": None,
        "bathrooms": None,
        "area_m2": None,
        "floor": None,
        "price_vnd": None,
        "price_per_m2": None,
        "direction": None,
        "view": None,
        "furnishing": None,
        "status": "reference_only",
        "handover_status": None,
        "purpose_fit": ["residential", "investment"],
        "loan_support": None,
        "nearby_amenities": ["schools", "shopping", "parks", "lake"],
        "images": [],
        "source_name": "user-provided-image",
        "source_url": None,
        "source_type": "image",
        "data_type": "project_reference",
        "collected_at": None,
        "verified_at": None,
        "updated_at": None,
    },
    {
        "property_id": "VH-OP2-CATALOG",
        "project": "Vinhomes Ocean Park 2 - The Empire",
        "zone": "Khu vực phía Đông / giáp Hanoi",
        "building": None,
        "unit_code": None,
        "city": "Hung Yen",
        "district": "Van Giang",
        "ward": None,
        "address": "Vinhomes Ocean Park 2 - The Empire, Van Giang, Hung Yen",
        "latitude": None,
        "longitude": None,
        "property_type": "project",
        "bedrooms": None,
        "bathrooms": None,
        "area_m2": None,
        "floor": None,
        "price_vnd": None,
        "price_per_m2": None,
        "direction": None,
        "view": None,
        "furnishing": None,
        "status": "reference_only",
        "handover_status": None,
        "purpose_fit": ["residential", "investment"],
        "loan_support": None,
        "nearby_amenities": ["schools", "shopping", "parks", "entertainment"],
        "images": [],
        "source_name": "user-provided-image",
        "source_url": None,
        "source_type": "image",
        "data_type": "project_reference",
        "collected_at": None,
        "verified_at": None,
        "updated_at": None,
    },
    {
        "property_id": "VH-OP3-CATALOG",
        "project": "Vinhomes Ocean Park 3 - The Crown",
        "zone": "Khu vực phía Đông / giáp Hanoi",
        "building": None,
        "unit_code": None,
        "city": "Hung Yen",
        "district": "Van Giang",
        "ward": None,
        "address": "Vinhomes Ocean Park 3 - The Crown, Van Giang, Hung Yen",
        "latitude": None,
        "longitude": None,
        "property_type": "project",
        "bedrooms": None,
        "bathrooms": None,
        "area_m2": None,
        "floor": None,
        "price_vnd": None,
        "price_per_m2": None,
        "direction": None,
        "view": None,
        "furnishing": None,
        "status": "reference_only",
        "handover_status": None,
        "purpose_fit": ["residential", "investment"],
        "loan_support": None,
        "nearby_amenities": ["schools", "shopping", "parks", "entertainment"],
        "images": [],
        "source_name": "user-provided-image",
        "source_url": None,
        "source_type": "image",
        "data_type": "project_reference",
        "collected_at": None,
        "verified_at": None,
        "updated_at": None,
    },
    {
        "property_id": "VH-COLOA-CATALOG",
        "project": "Vinhomes Co Loa - Global Gate",
        "zone": "Khu vực phía Đông",
        "building": None,
        "unit_code": None,
        "city": "Hanoi",
        "district": "Dong Anh",
        "ward": "Co Loa",
        "address": "Vinhomes Co Loa - Global Gate, Dong Anh, Hanoi",
        "latitude": None,
        "longitude": None,
        "property_type": "project",
        "bedrooms": None,
        "bathrooms": None,
        "area_m2": None,
        "floor": None,
        "price_vnd": None,
        "price_per_m2": None,
        "direction": None,
        "view": None,
        "furnishing": None,
        "status": "reference_only",
        "handover_status": None,
        "purpose_fit": ["residential", "investment"],
        "loan_support": None,
        "nearby_amenities": ["schools", "shopping", "parks", "exhibition_center"],
        "images": [],
        "source_name": "user-provided-image",
        "source_url": None,
        "source_type": "image",
        "data_type": "project_reference",
        "collected_at": None,
        "verified_at": None,
        "updated_at": None,
    },
    {
        "property_id": "VH-LIENHA-CATALOG", "project": "Vinhomes Lien Ha",
        "zone": "Khu vực phía Đông", "building": None, "unit_code": None,
        "city": "Hanoi", "district": "Dong Anh", "ward": "Lien Ha",
        "address": "Vinhomes Lien Ha, Dong Anh, Hanoi", "latitude": None, "longitude": None,
        "property_type": "project", "bedrooms": None, "bathrooms": None, "area_m2": None,
        "floor": None, "price_vnd": None, "price_per_m2": None, "direction": None,
        "view": None, "furnishing": None, "status": "reference_only", "handover_status": None,
        "purpose_fit": ["residential", "investment"], "loan_support": None,
        "nearby_amenities": ["schools", "shopping", "parks"], "images": [],
        "source_name": "user-provided-image", "source_url": None, "source_type": "image",
        "data_type": "project_reference", "collected_at": None, "verified_at": None, "updated_at": None,
    },
    {
        "property_id": "VH-SMARTCITY-CATALOG", "project": "Vinhomes Smart City",
        "zone": "Khu vực phía Tây và Nam", "building": None, "unit_code": None,
        "city": "Hanoi", "district": "Nam Tu Liem", "ward": "Tay Mo - Dai Mo",
        "address": "Vinhomes Smart City, Tay Mo - Dai Mo, Nam Tu Liem, Hanoi",
        "latitude": None, "longitude": None, "property_type": "project", "bedrooms": None,
        "bathrooms": None, "area_m2": None, "floor": None, "price_vnd": None,
        "price_per_m2": None, "direction": None, "view": None, "furnishing": None,
        "status": "reference_only", "handover_status": None, "purpose_fit": ["residential", "investment"],
        "loan_support": None, "nearby_amenities": ["schools", "shopping", "parks", "sports"],
        "images": [], "source_name": "user-provided-image", "source_url": None,
        "source_type": "image", "data_type": "project_reference", "collected_at": None,
        "verified_at": None, "updated_at": None,
    },
    {
        "property_id": "VH-GREENVILLAS-CATALOG", "project": "Vinhomes Green Villas",
        "zone": "Khu vực phía Tây và Nam", "building": None, "unit_code": None,
        "city": "Hanoi", "district": "Nam Tu Liem", "ward": "Me Tri",
        "address": "Vinhomes Green Villas, Me Tri, Nam Tu Liem, Hanoi",
        "latitude": None, "longitude": None, "property_type": "villa", "bedrooms": None,
        "bathrooms": None, "area_m2": None, "floor": None, "price_vnd": None,
        "price_per_m2": None, "direction": None, "view": None, "furnishing": None,
        "status": "reference_only", "handover_status": None, "purpose_fit": ["residential", "investment"],
        "loan_support": None, "nearby_amenities": ["schools", "shopping", "parks"],
        "images": [], "source_name": "user-provided-image", "source_url": None,
        "source_type": "image", "data_type": "project_reference", "collected_at": None,
        "verified_at": None, "updated_at": None,
    },
    {
        "property_id": "VH-WONDERCITY-CATALOG", "project": "Vinhomes Wonder City",
        "zone": "Khu vực phía Tây và Nam", "building": None, "unit_code": None,
        "city": "Hanoi", "district": "Dan Phuong", "ward": None,
        "address": "Vinhomes Wonder City, Dan Phuong, Hanoi", "latitude": None, "longitude": None,
        "property_type": "project", "bedrooms": None, "bathrooms": None, "area_m2": None,
        "floor": None, "price_vnd": None, "price_per_m2": None, "direction": None,
        "view": None, "furnishing": None, "status": "reference_only", "handover_status": None,
        "purpose_fit": ["residential", "investment"], "loan_support": None,
        "nearby_amenities": ["schools", "shopping", "parks", "sports"], "images": [],
        "source_name": "user-provided-image", "source_url": None, "source_type": "image",
        "data_type": "project_reference", "collected_at": None, "verified_at": None, "updated_at": None,
    },
    {
        "property_id": "VH-THULAM-CATALOG", "project": "Vinhomes Thu Lam",
        "zone": "Khu vực phía Tây và Nam", "building": None, "unit_code": None,
        "city": "Hanoi", "district": "Dong Anh", "ward": "Thu Lam",
        "address": "Vinhomes Thu Lam, Dong Anh, Hanoi", "latitude": None, "longitude": None,
        "property_type": "project", "bedrooms": None, "bathrooms": None, "area_m2": None,
        "floor": None, "price_vnd": None, "price_per_m2": None, "direction": None,
        "view": None, "furnishing": None, "status": "reference_only", "handover_status": None,
        "purpose_fit": ["residential", "investment"], "loan_support": None,
        "nearby_amenities": ["schools", "shopping", "parks"], "images": [],
        "source_name": "user-provided-image", "source_url": None, "source_type": "image",
        "data_type": "project_reference", "collected_at": None, "verified_at": None, "updated_at": None,
    },
    {
        "property_id": "BINHMINH-LAMHUNG-CATALOG", "project": "Khu do thi moi tai Binh Minh va Lam Hung",
        "zone": "Khu vực phía Tây và Nam", "building": None, "unit_code": None,
        "city": "Hanoi", "district": None, "ward": "Binh Minh - Lam Hung",
        "address": "Khu do thi moi tai Binh Minh va Lam Hung, Hanoi", "latitude": None, "longitude": None,
        "property_type": "project", "bedrooms": None, "bathrooms": None, "area_m2": None,
        "floor": None, "price_vnd": None, "price_per_m2": None, "direction": None,
        "view": None, "furnishing": None, "status": "reference_only", "handover_status": None,
        "purpose_fit": ["residential", "investment"], "loan_support": None,
        "nearby_amenities": [], "images": [], "source_name": "user-provided-image",
        "source_url": None, "source_type": "image", "data_type": "project_reference",
        "collected_at": None, "verified_at": None, "updated_at": None,
    },
    {
        "property_id": "VH-SYMPHONY-CATALOG", "project": "Vinhomes Symphony",
        "zone": "Khu vực nội đô và các quận trung tâm", "building": None, "unit_code": None,
        "city": "Hanoi", "district": "Long Bien", "ward": None,
        "address": "Vinhomes Symphony, Long Bien, Hanoi", "latitude": None, "longitude": None,
        "property_type": "apartment", "bedrooms": None, "bathrooms": None, "area_m2": None,
        "floor": None, "price_vnd": None, "price_per_m2": None, "direction": None,
        "view": None, "furnishing": None, "status": "reference_only", "handover_status": None,
        "purpose_fit": ["residential", "investment"], "loan_support": None,
        "nearby_amenities": ["schools", "shopping", "parks", "lake"], "images": [],
        "source_name": "user-provided-image", "source_url": None, "source_type": "image",
        "data_type": "project_reference", "collected_at": None, "verified_at": None, "updated_at": None,
    },
    {
        "property_id": "VH-WESTPOINT-CATALOG", "project": "Vinhomes West Point",
        "zone": "Khu vực nội đô và các quận trung tâm", "building": None, "unit_code": None,
        "city": "Hanoi", "district": "Nam Tu Liem", "ward": None,
        "address": "Vinhomes West Point, Nam Tu Liem, Hanoi", "latitude": None, "longitude": None,
        "property_type": "apartment", "bedrooms": None, "bathrooms": None, "area_m2": None,
        "floor": None, "price_vnd": None, "price_per_m2": None, "direction": None,
        "view": None, "furnishing": None, "status": "reference_only", "handover_status": None,
        "purpose_fit": ["residential", "investment"], "loan_support": None,
        "nearby_amenities": ["schools", "shopping", "offices", "parks"], "images": [],
        "source_name": "user-provided-image", "source_url": None, "source_type": "image",
        "data_type": "project_reference", "collected_at": None, "verified_at": None, "updated_at": None,
    },
]


class Property(BaseModel):
    property_id: str
    project: str
    zone: str | None = None
    building: str | None = None
    unit_code: str | None = None
    city: str | None = None
    district: str | None = None
    ward: str | None = None
    address: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    property_type: PropertyType
    bedrooms: int | None = None
    bathrooms: int | None = None
    area_m2: float | None = None
    floor: str | None = None
    price_vnd: int | None = None
    price_per_m2: int | None = None
    direction: str | None = None
    view: str | None = None
    furnishing: str | None = None
    status: str
    handover_status: str | None = None
    purpose_fit: list[str] = Field(default_factory=list)
    loan_support: str | None = None
    nearby_amenities: list[str] = Field(default_factory=list)
    images: list[str] = Field(default_factory=list)
    source_name: str
    source_url: str | None = None
    source_type: str
    data_type: str
    collected_at: str | None = None
    verified_at: str | None = None
    updated_at: str | None = None


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    conversation_id: str | None = Field(default=None, max_length=128)


class ConversationMessage(BaseModel):
    message_id: int
    conversation_id: str
    role: Literal["user", "assistant"]
    content: str
    created_at: str


class ChatResponse(BaseModel):
    conversation_id: str
    answer: str
    listings: list[Property]
    model: str
    used_model: bool


def database_connection() -> sqlite3.Connection:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database() -> None:
    with database_connection() as connection:
        existing_columns = {
            row[1]
            for row in connection.execute("PRAGMA table_info(properties)").fetchall()
        }
        if existing_columns and "property_id" not in existing_columns:
            connection.execute("ALTER TABLE properties RENAME TO properties_legacy")
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS properties (
                property_id TEXT PRIMARY KEY,
                project TEXT NOT NULL,
                zone TEXT,
                building TEXT,
                unit_code TEXT,
                city TEXT,
                district TEXT,
                ward TEXT,
                address TEXT,
                latitude REAL,
                longitude REAL,
                property_type TEXT NOT NULL,
                bedrooms INTEGER,
                bathrooms INTEGER,
                area_m2 REAL,
                floor TEXT,
                price_vnd INTEGER,
                price_per_m2 INTEGER,
                direction TEXT,
                view TEXT,
                furnishing TEXT,
                images_json TEXT NOT NULL,
                status TEXT NOT NULL,
                handover_status TEXT,
                purpose_fit_json TEXT NOT NULL,
                loan_support TEXT,
                nearby_amenities_json TEXT NOT NULL,
                source_name TEXT NOT NULL,
                source_url TEXT,
                source_type TEXT NOT NULL,
                data_type TEXT NOT NULL,
                collected_at TEXT,
                verified_at TEXT,
                updated_at TEXT
            )
            """
        )
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS chat_messages (
                message_id INTEGER PRIMARY KEY AUTOINCREMENT,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('user', 'assistant')),
                content TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
            """
        )
        existing_count = connection.execute("SELECT COUNT(*) FROM properties").fetchone()[0]
        if existing_count == 0:
            connection.executemany(
                """
                INSERT INTO properties (
                    property_id, project, zone, building, unit_code, city, district,
                    ward, address, latitude, longitude, property_type, bedrooms,
                    bathrooms, area_m2, floor, price_vnd, price_per_m2, direction,
                    view, furnishing, images_json, status, handover_status,
                    purpose_fit_json, loan_support, nearby_amenities_json,
                    source_name, source_url, source_type, data_type, collected_at,
                    verified_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        item["property_id"], item["project"], item["zone"], item["building"],
                        item["unit_code"], item["city"], item["district"], item["ward"],
                        item["address"], item["latitude"], item["longitude"], item["property_type"],
                        item["bedrooms"], item["bathrooms"], item["area_m2"], item["floor"],
                        item["price_vnd"], item["price_per_m2"], item["direction"], item["view"],
                        item["furnishing"], json.dumps(item["images"]), item["status"],
                        item["handover_status"], json.dumps(item["purpose_fit"]), item["loan_support"],
                        json.dumps(item["nearby_amenities"]), item["source_name"], item["source_url"],
                        item["source_type"], item["data_type"], item["collected_at"],
                        item["verified_at"], item["updated_at"],
                    )
                    for item in SEED_PROPERTIES
                ],
            )


def row_to_property(row: sqlite3.Row) -> Property:
    data = dict(row)
    data["images"] = json.loads(data.pop("images_json"))
    data["purpose_fit"] = json.loads(data.pop("purpose_fit_json"))
    data["nearby_amenities"] = json.loads(data.pop("nearby_amenities_json"))
    return Property.model_validate(data)


def new_conversation_id(requested_id: str | None) -> str:
    """Keep a supplied session ID or create one that survives frontend refreshes."""
    cleaned_id = (requested_id or "").strip()
    return cleaned_id[:128] if cleaned_id else uuid4().hex


def current_timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()


def save_chat_message(conversation_id: str, role: Literal["user", "assistant"], content: str) -> None:
    with database_connection() as connection:
        connection.execute(
            """
            INSERT INTO chat_messages (conversation_id, role, content, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (conversation_id, role, content, current_timestamp()),
        )


def load_chat_history(conversation_id: str, limit: int = 20) -> list[ConversationMessage]:
    with database_connection() as connection:
        rows = connection.execute(
            """
            SELECT message_id, conversation_id, role, content, created_at
            FROM chat_messages
            WHERE conversation_id = ?
            ORDER BY message_id DESC
            LIMIT ?
            """,
            (conversation_id, limit),
        ).fetchall()
    return [ConversationMessage.model_validate(dict(row)) for row in reversed(rows)]


def history_context(history: list[ConversationMessage]) -> str:
    if not history:
        return "No earlier messages in this conversation."
    return "\n".join(f"{item.role.upper()}: {item.content}" for item in history)


def search_listings(
    location: str | None = None,
    property_type: PropertyType | None = None,
    min_price_vnd: int | None = None,
    max_price_vnd: int | None = None,
    bedrooms: int | None = None,
    limit: int = 20,
) -> list[Property]:
    clauses = ["status IN ('for_sale', 'reference_only')"]
    values: list[object] = []
    if location:
        clauses.append("(project LIKE ? OR city LIKE ? OR district LIKE ? OR ward LIKE ? OR address LIKE ?)")
        location_value = f"%{location}%"
        values.extend([location_value] * 5)
    if property_type:
        clauses.append("property_type = ?")
        values.append(property_type)
    if min_price_vnd is not None:
        clauses.append("price_vnd >= ?")
        values.append(min_price_vnd)
    if max_price_vnd is not None:
        clauses.append("price_vnd <= ?")
        values.append(max_price_vnd)
    if bedrooms is not None:
        clauses.append("bedrooms >= ?")
        values.append(bedrooms)

    query = "SELECT * FROM properties WHERE " + " AND ".join(clauses)
    query += " ORDER BY price_vnd ASC LIMIT ?"
    values.append(limit)
    with database_connection() as connection:
        rows = connection.execute(query, values).fetchall()
    return [row_to_property(row) for row in rows]


def nullable_value(value: object) -> object:
    """Convert empty Excel cells and NaN values to database NULL."""
    if value is None:
        return None
    if isinstance(value, float) and math.isnan(value):
        return None
    if isinstance(value, str) and not value.strip():
        return None
    return value


def json_list(value: object) -> list[str]:
    """Parse JSON-array Excel fields, returning an empty list when unavailable."""
    value = nullable_value(value)
    if value is None:
        return []
    try:
        parsed = json.loads(str(value))
    except (TypeError, json.JSONDecodeError):
        return [str(value)]
    if isinstance(parsed, list):
        return [str(item) for item in parsed if item is not None]
    return [str(parsed)]


def image_urls(value: object) -> list[str]:
    """Flatten the workbook's categorized image object into the API image list."""
    value = nullable_value(value)
    if value is None:
        return []
    try:
        parsed = json.loads(str(value))
    except (TypeError, json.JSONDecodeError):
        return [str(value)]
    if isinstance(parsed, dict):
        urls: list[str] = []
        for item in parsed.values():
            if isinstance(item, list):
                urls.extend(str(url) for url in item if url)
            elif item:
                urls.append(str(item))
        return urls
    return [str(item) for item in parsed] if isinstance(parsed, list) else [str(parsed)]


def normalize_property_type(value: object) -> str:
    text = str(nullable_value(value) or "").lower()
    if "căn hộ" in text or "apartment" in text:
        return "apartment"
    if "villa" in text:
        return "villa"
    if "nhà" in text or "house" in text:
        return "house"
    return "project"


def normalize_status(value: object) -> str:
    text = str(nullable_value(value) or "").strip().lower()
    if text in {"available", "for_sale", "for sale"}:
        return "for_sale"
    if text in {"sold", "closed"}:
        return "sold"
    return "reference_only"


def import_xlsx_to_database(xlsx_path: str | Path) -> int:
    """Import the workbook's Properties sheet into the current SQLite database."""
    from openpyxl import load_workbook

    source = Path(xlsx_path)
    if not source.exists():
        raise FileNotFoundError(f"Workbook not found: {source}")

    workbook = load_workbook(source, read_only=True, data_only=True)
    if "Properties" not in workbook.sheetnames:
        raise ValueError("Workbook must contain a 'Properties' sheet")
    worksheet = workbook["Properties"]
    rows = worksheet.iter_rows(values_only=True)
    headers = [str(value).strip() if value is not None else "" for value in next(rows)]
    required_headers = {
        "property_id", "project", "zone", "building", "unit_code", "city", "district",
        "ward", "address", "latitude", "longitude", "property_type", "bedrooms",
        "bathrooms", "area_m2", "floor", "price_vnd", "price_per_m2", "direction",
        "view", "furnishing", "status", "handover_status", "purpose_fit", "loan_support",
        "nearby_amenities", "images", "source_name", "source_url", "source_type",
        "data_type", "collected_at", "verified_at", "updated_at",
    }
    missing = required_headers.difference(headers)
    if missing:
        raise ValueError(f"Workbook is missing required columns: {sorted(missing)}")

    positions = {header: index for index, header in enumerate(headers)}
    imported_rows: list[tuple[object, ...]] = []
    for values in rows:
        if not any(value is not None for value in values):
            continue
        get = lambda name: nullable_value(values[positions[name]])
        imported_rows.append(
            (
                str(get("property_id")), get("project"), get("zone"), get("building"),
                get("unit_code"), get("city"), get("district"), get("ward"), get("address"),
                get("latitude"), get("longitude"), normalize_property_type(get("property_type")),
                get("bedrooms"), get("bathrooms"), get("area_m2"), get("floor"),
                get("price_vnd"), get("price_per_m2"), get("direction"), get("view"),
                get("furnishing"), json.dumps(image_urls(get("images")), ensure_ascii=False),
                normalize_status(get("status")), get("handover_status"),
                json.dumps(json_list(get("purpose_fit")), ensure_ascii=False), get("loan_support"),
                json.dumps(json_list(get("nearby_amenities")), ensure_ascii=False), get("source_name"),
                get("source_url"), get("source_type"), get("data_type"), get("collected_at"),
                get("verified_at"), get("updated_at"),
            )
        )
    workbook.close()

    initialize_database()
    with database_connection() as connection:
        connection.executemany(
            """
            INSERT OR REPLACE INTO properties (
                property_id, project, zone, building, unit_code, city, district,
                ward, address, latitude, longitude, property_type, bedrooms,
                bathrooms, area_m2, floor, price_vnd, price_per_m2, direction,
                view, furnishing, images_json, status, handover_status,
                purpose_fit_json, loan_support, nearby_amenities_json,
                source_name, source_url, source_type, data_type, collected_at,
                verified_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            imported_rows,
        )
    return len(imported_rows)


def import_image_csv_to_database(csv_path: str | Path) -> tuple[int, int]:
    """Merge image URLs from CSV into properties.images_json by property_id."""
    source = Path(csv_path)
    if not source.exists():
        raise FileNotFoundError(f"CSV file not found: {source}")

    grouped_images: dict[str, list[str]] = {}
    source_urls: dict[str, str] = {}
    with source.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)
        required_headers = {"property_id", "image_type", "image_url", "source_url"}
        if not reader.fieldnames or not required_headers.issubset(reader.fieldnames):
            raise ValueError(f"CSV must contain columns: {sorted(required_headers)}")
        for row in reader:
            property_id = (row.get("property_id") or "").strip()
            image_url = (row.get("image_url") or "").strip()
            if not property_id or not image_url:
                continue
            urls = grouped_images.setdefault(property_id, [])
            if image_url not in urls:
                urls.append(image_url)
            source_url = (row.get("source_url") or "").strip()
            if source_url:
                source_urls[property_id] = source_url

    initialize_database()
    with database_connection() as connection:
        database_ids = {
            row[0]
            for row in connection.execute(
                "SELECT property_id FROM properties WHERE property_id IN (%s)"
                % ",".join("?" for _ in grouped_images),
                list(grouped_images),
            ).fetchall()
        } if grouped_images else set()
        unmatched = sorted(set(grouped_images) - database_ids)
        if unmatched:
            raise ValueError(f"CSV contains property_id values not found in database: {unmatched[:10]}")

        connection.executemany(
            """
            UPDATE properties
            SET images_json = ?, source_url = COALESCE(NULLIF(source_url, ''), ?)
            WHERE property_id = ?
            """,
            [
                (json.dumps(urls, ensure_ascii=False), source_urls.get(property_id), property_id)
                for property_id, urls in grouped_images.items()
            ],
        )
    return len(grouped_images), sum(len(urls) for urls in grouped_images.values())


def extract_filters(message: str) -> dict[str, object]:
    """Extract simple MVP filters; the database remains the source of truth."""
    lower_message = message.lower()
    property_type: PropertyType | None = None
    if any(term in lower_message for term in ("apartment", "căn hộ", "chung cư")):
        property_type = "apartment"
    elif any(term in lower_message for term in ("house", "nhà phố", "nhà riêng")):
        property_type = "house"

    bedroom_match = re.search(r"(\d+)\s*(?:bed(?:room)?s?|phòng ngủ)", lower_message)
    max_price = None
    price_match = re.search(r"(?:under|below|dưới|tối đa)\s*(\d+(?:\.\d+)?)\s*(?:billion|tỷ)", lower_message)
    if price_match:
        max_price = int(float(price_match.group(1)) * 1_000_000_000)

    known_locations = (
        "Ocean Park 1", "Ocean Park 2", "Ocean Park 3", "Co Loa", "Lien Ha",
        "Smart City", "Green Villas", "Wonder City", "Thu Lam", "Binh Minh",
        "Lam Hung", "Symphony", "West Point", "Gia Lam", "Dong Anh",
        "Dan Phuong", "Long Bien", "Nam Tu Liem", "Hanoi", "Ha Noi",
    )
    location = next((item for item in known_locations if item.lower() in lower_message), None)
    return {
        "location": location,
        "property_type": property_type,
        "bedrooms": int(bedroom_match.group(1)) if bedroom_match else None,
        "max_price_vnd": max_price,
    }


def listing_context(listings: list[Property]) -> str:
    if not listings:
        return "No matching listings were found in the current storage."
    return "\n".join(
        f"property_id={item.property_id}; project={item.project}; type={item.property_type}; "
        f"location={item.ward}, {item.district}, {item.city}; price_vnd={item.price_vnd}; "
        f"bedrooms={item.bedrooms}; bathrooms={item.bathrooms}; area_m2={item.area_m2}; "
        f"address={item.address}; purpose_fit={item.purpose_fit}; "
        f"nearby_amenities={item.nearby_amenities}; status={item.status}"
        for item in listings
    )


def call_model_api(
    user_message: str,
    listings: list[Property],
    custom_api_key: str | None = None,
    history: list[ConversationMessage] | None = None,
) -> str:
    """Call OpenAI with a request key or the server's configured key.

    A request key is used in memory for this request only. It is never stored
    in SQLite, logs, response bodies, or conversation records.
    """
    api_key = (custom_api_key or os.getenv("OPENAI_API_KEY") or "").strip()
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    client = OpenAI(api_key=api_key)
    response = client.responses.create(
        model=OPENAI_MODEL,
        instructions=(
            "You are a real-estate search assistant. Use only the supplied property context. "
            "Never invent price, availability, location, dimensions, images, or legal facts. "
            "Mention property_id and project when recommending properties. Answer in the user's language. "
            "If a value is null or status is reference_only, say that it is not verified or not available. "
            "Prices are Vietnamese dong (VND); images are returned separately by the API."
        ),
        input=(
            "CONVERSATION HISTORY:\n"
            + history_context(history or [])
            + "\n\n"
            "LISTINGS CONTEXT:\n"
            + listing_context(listings)
            + "\n\nUSER REQUEST:\n"
            + user_message
        ),
    )
    return (response.output_text or "I could not generate an answer.").strip()


def fallback_answer(listings: list[Property]) -> str:
    if not listings:
        return "I could not find a matching property in the current listings."
    summary = "; ".join(
        f"{item.property_id} {item.project} at "
        f"{item.price_vnd:,} VND" if item.price_vnd is not None
        else f"{item.property_id} {item.project} (price not verified)"
        for item in listings[:5]
    )
    return f"I found {len(listings)} available listing(s): {summary}."


def process_chat(
    request: ChatRequest,
    custom_api_key: str | None = None,
) -> ChatResponse:
    conversation_id = new_conversation_id(request.conversation_id)
    history = load_chat_history(conversation_id)
    save_chat_message(conversation_id, "user", request.message)
    filters = extract_filters(request.message)
    listings = search_listings(**filters)
    try:
        answer = call_model_api(request.message, listings, custom_api_key, history)
        used_model = True
        model_name = OPENAI_MODEL
    except Exception:
        answer = fallback_answer(listings)
        used_model = False
        model_name = "fallback"
    save_chat_message(conversation_id, "assistant", answer)
    return ChatResponse(
        conversation_id=conversation_id,
        answer=answer,
        listings=listings,
        model=model_name,
        used_model=used_model,
    )


@asynccontextmanager
async def lifespan(_: FastAPI):
    initialize_database()
    yield


app = FastAPI(title="Real Estate Chatbot API", version="0.2.0", lifespan=lifespan)
allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "FRONTEND_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173"
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/api/listings", response_model=list[Property])
def get_listings(
    location: str | None = Query(default=None),
    property_type: PropertyType | None = Query(default=None),
    min_price_vnd: int | None = Query(default=None, ge=0),
    max_price_vnd: int | None = Query(default=None, ge=0),
    bedrooms: int | None = Query(default=None, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
) -> list[Property]:
    return search_listings(location, property_type, min_price_vnd, max_price_vnd, bedrooms, limit)


@app.post("/api/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    custom_api_key: str | None = Header(default=None, alias="X-OpenAI-API-Key"),
) -> ChatResponse:
    return process_chat(request, custom_api_key)


@app.get("/api/chat/{conversation_id}/history", response_model=list[ConversationMessage])
def chat_history(conversation_id: str) -> list[ConversationMessage]:
    return load_chat_history(conversation_id)


if __name__ == "__main__":
    import uvicorn

    if len(sys.argv) == 3 and sys.argv[1] == "--import-xlsx":
        imported = import_xlsx_to_database(sys.argv[2])
        print(f"Imported {imported} properties into {DATABASE_PATH}")
    elif len(sys.argv) == 3 and sys.argv[1] == "--import-images":
        property_count, image_count = import_image_csv_to_database(sys.argv[2])
        print(
            f"Updated images for {property_count} properties with {image_count} URLs "
            f"in {DATABASE_PATH}"
        )
    else:
        uvicorn.run("real_estate_backend:app", host="127.0.0.1", port=8000, reload=False)
