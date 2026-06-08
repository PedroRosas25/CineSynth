from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import bcrypt  # IMPORTACIÓN NUEVA Y DIRECTA
import models
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CineSynth API")

# CONFIGURACIÓN DE CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UsuarioCreate(BaseModel):
    nombre: str
    email: str
    password: str

class UsuarioLogin(BaseModel):
    email: str
    password: str

class BovedaItem(BaseModel):
    id_usuario: int
    id_pelicula: int

@app.post("/api/signup", status_code=status.HTTP_201_CREATED)
def registrar_usuario(user: UsuarioCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.Usuario).filter(models.Usuario.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    # ENCRIPTACIÓN NATIVA CON BCRYPT (Soluciona el error de los 72 bytes)
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(user.password.encode('utf-8'), salt).decode('utf-8')
    
    nuevo_usuario = models.Usuario(
        nombre=user.nombre, 
        email=user.email, 
        password_hash=hashed_password
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    
    return {"mensaje": "Usuario creado exitosamente", "id": nuevo_usuario.id_usuario}

@app.post("/api/login")
def iniciar_sesion(user: UsuarioLogin, db: Session = Depends(get_db)):
    db_user = db.query(models.Usuario).filter(models.Usuario.email == user.email).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")
    
    # VERIFICACIÓN NATIVA CON BCRYPT
    password_correcta = bcrypt.checkpw(
        user.password.encode('utf-8'), 
        db_user.password_hash.encode('utf-8')
    )
    
    if not password_correcta:
        raise HTTPException(status_code=400, detail="Credenciales incorrectas")
    
    return {
        "mensaje": "Login exitoso", 
        "usuario": {
            "id": db_user.id_usuario,
            "nombre": db_user.nombre, 
            "email": db_user.email
        }
    }

@app.post("/api/boveda/add")
def agregar_a_boveda(item: BovedaItem, db: Session = Depends(get_db)):
    # 1. Verificar si la película ya está en la bóveda de ese usuario
    existe = db.query(models.Boveda).filter(
        models.Boveda.id_usuario == item.id_usuario,
        models.Boveda.id_pelicula == item.id_pelicula
    ).first()
    
    if existe:
        raise HTTPException(status_code=400, detail="La película ya está en tu bóveda")
    
    # 2. Guardar el nuevo registro
    nuevo_item = models.Boveda(
        id_usuario=item.id_usuario,
        id_pelicula=item.id_pelicula,
        visto=False
    )
    db.add(nuevo_item)
    db.commit()
    
    return {"mensaje": "Película guardada en la bóveda"}

@app.get("/api/boveda/{id_usuario}")
def obtener_boveda(id_usuario: int, db: Session = Depends(get_db)):
    # Buscamos todos los registros que pertenezcan a ese usuario
    items = db.query(models.Boveda).filter(models.Boveda.id_usuario == id_usuario).all()
    return items