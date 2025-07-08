from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from fastapi.staticfiles import StaticFiles
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
from enum import Enum
import aiofiles
import shutil

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create uploads directory
uploads_dir = ROOT_DIR / "uploads"
uploads_dir.mkdir(exist_ok=True)

# Create the main app
app = FastAPI(title="Plataforma de Rádios Online", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Mount static files for uploaded logos
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

# Security
security = HTTPBearer()
ADMIN_TOKEN = "admin-radio-token-2025"

# Enums
class GeneroEnum(str, Enum):
    JORNALISMO = "Jornalismo"
    POPULAR = "Popular"
    SERTANEJO = "Sertanejo"
    GOSPEL = "Gospel"
    ROCK = "Rock"
    POP = "Pop"
    ELETRONICA = "Eletrônica"
    CLASSICA = "Clássica"
    JAZZ = "Jazz"
    REGGAE = "Reggae"
    FUNK = "Funk"
    RAP = "Rap"
    FORRO = "Forró"
    MPB = "MPB"
    INTERNACIONAL = "Internacional"
    TALK_SHOW = "Talk Show"
    ESPORTIVA = "Esportiva"
    EDUCATIVA = "Educativa"

class RegiaoEnum(str, Enum):
    NORTE = "Norte"
    NORDESTE = "Nordeste"
    CENTRO_OESTE = "Centro-Oeste"
    SUDESTE = "Sudeste"
    SUL = "Sul"

# Models
class RedesSociais(BaseModel):
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    tiktok: Optional[str] = None
    twitter: Optional[str] = None
    youtube: Optional[str] = None
    website: Optional[str] = None

class RadioStation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    nome: str
    descricao: str
    stream_url: str
    genero: GeneroEnum
    regiao: RegiaoEnum
    cidade: str
    estado: str
    endereco: Optional[str] = None
    telefone: Optional[str] = None
    redes_sociais: Optional[RedesSociais] = None
    logo_url: Optional[str] = None
    data_cadastro: datetime = Field(default_factory=datetime.utcnow)
    ativo: bool = True

class RadioStationCreate(BaseModel):
    nome: str
    descricao: str
    stream_url: str
    genero: GeneroEnum
    regiao: RegiaoEnum
    cidade: str
    estado: str
    endereco: Optional[str] = None
    telefone: Optional[str] = None
    redes_sociais: Optional[RedesSociais] = None

class RadioStationUpdate(BaseModel):
    nome: Optional[str] = None
    descricao: Optional[str] = None
    stream_url: Optional[str] = None
    genero: Optional[GeneroEnum] = None
    regiao: Optional[RegiaoEnum] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    endereco: Optional[str] = None
    telefone: Optional[str] = None
    redes_sociais: Optional[RedesSociais] = None
    ativo: Optional[bool] = None

class RadioFilters(BaseModel):
    busca: Optional[str] = None
    genero: Optional[GeneroEnum] = None
    regiao: Optional[RegiaoEnum] = None
    cidade: Optional[str] = None
    estado: Optional[str] = None
    ativo: Optional[bool] = True

# Authentication helper
async def verify_admin_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Token inválido")
    return credentials.credentials

# Routes
@api_router.get("/")
async def root():
    return {"message": "API da Plataforma de Rádios Online", "version": "1.0.0"}

@api_router.get("/radios", response_model=List[RadioStation])
async def get_radios(
    busca: Optional[str] = Query(None, description="Buscar por nome, cidade ou estado"),
    genero: Optional[GeneroEnum] = Query(None, description="Filtrar por gênero"),
    regiao: Optional[RegiaoEnum] = Query(None, description="Filtrar por região"),
    cidade: Optional[str] = Query(None, description="Filtrar por cidade"),
    estado: Optional[str] = Query(None, description="Filtrar por estado"),
    ativo: Optional[bool] = Query(True, description="Filtrar por status ativo"),
    limite: int = Query(50, ge=1, le=100, description="Limite de resultados"),
    pagina: int = Query(1, ge=1, description="Página")
):
    """Buscar rádios com filtros"""
    
    # Construir filtros do MongoDB
    filtros = {}
    
    if ativo is not None:
        filtros["ativo"] = ativo
    
    if genero:
        filtros["genero"] = genero
    
    if regiao:
        filtros["regiao"] = regiao
    
    if cidade:
        filtros["cidade"] = {"$regex": cidade, "$options": "i"}
    
    if estado:
        filtros["estado"] = {"$regex": estado, "$options": "i"}
    
    # Busca textual
    if busca:
        filtros["$or"] = [
            {"nome": {"$regex": busca, "$options": "i"}},
            {"cidade": {"$regex": busca, "$options": "i"}},
            {"estado": {"$regex": busca, "$options": "i"}},
            {"descricao": {"$regex": busca, "$options": "i"}}
        ]
    
    # Paginação
    skip = (pagina - 1) * limite
    
    # Buscar no banco
    radios = await db.radios.find(filtros).skip(skip).limit(limite).to_list(length=limite)
    
    return [RadioStation(**radio) for radio in radios]

@api_router.get("/radios/{radio_id}", response_model=RadioStation)
async def get_radio(radio_id: str):
    """Buscar rádio por ID"""
    radio = await db.radios.find_one({"id": radio_id})
    if not radio:
        raise HTTPException(status_code=404, detail="Rádio não encontrada")
    return RadioStation(**radio)

@api_router.post("/radios", response_model=RadioStation)
async def create_radio(radio_data: RadioStationCreate, _: str = Depends(verify_admin_token)):
    """Criar nova rádio (requer autenticação admin)"""
    radio = RadioStation(**radio_data.dict())
    
    # Verificar se nome já existe
    existing = await db.radios.find_one({"nome": radio.nome})
    if existing:
        raise HTTPException(status_code=400, detail="Já existe uma rádio com este nome")
    
    await db.radios.insert_one(radio.dict())
    return radio

@api_router.put("/radios/{radio_id}", response_model=RadioStation)
async def update_radio(radio_id: str, radio_data: RadioStationUpdate, _: str = Depends(verify_admin_token)):
    """Atualizar rádio (requer autenticação admin)"""
    
    # Verificar se existe
    existing = await db.radios.find_one({"id": radio_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Rádio não encontrada")
    
    # Atualizar apenas campos fornecidos
    update_data = {k: v for k, v in radio_data.dict().items() if v is not None}
    
    if update_data:
        await db.radios.update_one({"id": radio_id}, {"$set": update_data})
    
    # Retornar atualizado
    updated_radio = await db.radios.find_one({"id": radio_id})
    return RadioStation(**updated_radio)

@api_router.delete("/radios/{radio_id}")
async def delete_radio(radio_id: str, _: str = Depends(verify_admin_token)):
    """Deletar rádio (requer autenticação admin)"""
    
    result = await db.radios.delete_one({"id": radio_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Rádio não encontrada")
    
    return {"message": "Rádio deletada com sucesso"}

@api_router.post("/upload/logo/{radio_id}")
async def upload_logo(radio_id: str, file: UploadFile = File(...), _: str = Depends(verify_admin_token)):
    """Upload de logo para rádio"""
    
    # Verificar se rádio existe
    radio = await db.radios.find_one({"id": radio_id})
    if not radio:
        raise HTTPException(status_code=404, detail="Rádio não encontrada")
    
    # Verificar tipo de arquivo
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Apenas imagens são permitidas")
    
    # Gerar nome único para o arquivo
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{radio_id}_{uuid.uuid4()}.{file_extension}"
    file_path = uploads_dir / unique_filename
    
    # Salvar arquivo
    async with aiofiles.open(file_path, 'wb') as out_file:
        content = await file.read()
        await out_file.write(content)
    
    # Atualizar URL do logo no banco
    logo_url = f"/uploads/{unique_filename}"
    await db.radios.update_one(
        {"id": radio_id}, 
        {"$set": {"logo_url": logo_url}}
    )
    
    return {"message": "Logo atualizado com sucesso", "logo_url": logo_url}

@api_router.get("/generos")
async def get_generos():
    """Listar todos os gêneros disponíveis"""
    return [{"value": genero.value, "label": genero.value} for genero in GeneroEnum]

@api_router.get("/regioes")
async def get_regioes():
    """Listar todas as regiões disponíveis"""
    return [{"value": regiao.value, "label": regiao.value} for regiao in RegiaoEnum]

@api_router.get("/cidades")
async def get_cidades():
    """Listar todas as cidades cadastradas"""
    cidades = await db.radios.distinct("cidade")
    return sorted(cidades)

@api_router.get("/estados")
async def get_estados():
    """Listar todos os estados cadastrados"""
    estados = await db.radios.distinct("estado")
    return sorted(estados)

@api_router.get("/stats")
async def get_stats():
    """Estatísticas da plataforma"""
    total_radios = await db.radios.count_documents({"ativo": True})
    
    # Contagem por gênero
    generos = await db.radios.aggregate([
        {"$match": {"ativo": True}},
        {"$group": {"_id": "$genero", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]).to_list(length=None)
    
    # Contagem por região
    regioes = await db.radios.aggregate([
        {"$match": {"ativo": True}},
        {"$group": {"_id": "$regiao", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]).to_list(length=None)
    
    return {
        "total_radios": total_radios,
        "por_genero": generos,
        "por_regiao": regioes
    }

# Include the router in the main app
app.include_router(api_router)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}