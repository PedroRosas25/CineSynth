from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import bcrypt  # IMPORTACIÓN NUEVA Y DIRECTA
import models
from database import engine, get_db
from typing import Optional

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="CineSynth API")

# CONFIGURACIÓN DE CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Permitimos todo para desarrollo
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

class BovedaUpdate(BaseModel):
    id_usuario: int
    id_pelicula: int
    visto: bool
    puntuacion: Optional[int] = None

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


# 2. Obtener el estado actual de una película para un usuario
@app.get("/api/boveda/status/{id_usuario}/{id_pelicula}")
def obtener_estado_boveda(id_usuario: int, id_pelicula: int, db: Session = Depends(get_db)):
    item = db.query(models.Boveda).filter(
        models.Boveda.id_usuario == id_usuario,
        models.Boveda.id_pelicula == id_pelicula
    ).first()
    
    if item:
        return {"en_boveda": True, "visto": item.visto, "puntuacion": item.puntuacion}
    return {"en_boveda": False, "visto": False, "puntuacion": None}

# 3. Actualizar o Insertar (Upsert) en la bóveda
@app.post("/api/boveda/update")
def actualizar_boveda(data: BovedaUpdate, db: Session = Depends(get_db)):
    item = db.query(models.Boveda).filter(
        models.Boveda.id_usuario == data.id_usuario,
        models.Boveda.id_pelicula == data.id_pelicula
    ).first()

    if not item:
        # Si no existe, la creamos
        item = models.Boveda(
            id_usuario=data.id_usuario, 
            id_pelicula=data.id_pelicula, 
            visto=data.visto, 
            puntuacion=data.puntuacion
        )
        db.add(item)
    else:
        # Si ya existe, actualizamos los datos
        item.visto = data.visto
        item.puntuacion = data.puntuacion
    
    db.commit()
    return {"mensaje": "Bóveda actualizada"}

# 4. Eliminar de la bóveda
@app.delete("/api/boveda/remove/{id_usuario}/{id_pelicula}")
def remover_de_boveda(id_usuario: int, id_pelicula: int, db: Session = Depends(get_db)):
    item = db.query(models.Boveda).filter(
        models.Boveda.id_usuario == id_usuario,
        models.Boveda.id_pelicula == id_pelicula
    ).first()
    if item:
        db.delete(item)
        db.commit()
    return {"mensaje": "Removido de la bóveda"}

@app.get("/api/usuarios/buscar/{nombre}")
def buscar_usuario(nombre: str, db: Session = Depends(get_db)):
    # Buscamos usuarios que contengan el texto ingresado
    usuarios = db.query(models.Usuario).filter(models.Usuario.nombre.contains(nombre)).all()
    return [{"id": u.id_usuario, "nombre": u.nombre} for u in usuarios]

@app.post("/api/amistades/solicitar")
def solicitar_amistad(id_origen: int, id_destino: int, db: Session = Depends(get_db)):
    # Verificamos que no exista ya la solicitud
    existente = db.query(models.Amistad).filter(
        models.Amistad.id_usuario_origen == id_origen,
        models.Amistad.id_usuario_destino == id_destino
    ).first()
    
    if existente:
        return {"mensaje": "Solicitud ya enviada"}
    
    nueva_amistad = models.Amistad(id_usuario_origen=id_origen, id_usuario_destino=id_destino)
    db.add(nueva_amistad)
    db.commit()
    return {"mensaje": "Solicitud enviada"}

@app.post("/api/amistades/solicitar")
def solicitar_amistad(id_origen: int = Query(...), id_destino: int = Query(...), db: Session = Depends(get_db)):
    # Verificamos que no intente agregarse a sí mismo
    if id_origen == id_destino:
        return {"mensaje": "No puedes agregarte a ti mismo"}
        
    existente = db.query(models.Amistad).filter(
        models.Amistad.id_usuario_origen == id_origen,
        models.Amistad.id_usuario_destino == id_destino
    ).first()
    
    if existente:
        return {"mensaje": "Solicitud ya enviada"}
    
    nueva_amistad = models.Amistad(id_usuario_origen=id_origen, id_usuario_destino=id_destino, aceptada=False)
    db.add(nueva_amistad)
    db.commit()
    return {"mensaje": "Solicitud enviada correctamente"}

# 1. Obtener solicitudes pendientes
@app.get("/api/amistades/pendientes/{id_usuario}")
def obtener_pendientes(id_usuario: int, db: Session = Depends(get_db)):
    pendientes = db.query(models.Amistad).filter(
        models.Amistad.id_usuario_destino == id_usuario,
        models.Amistad.aceptada == False
    ).all()
    
    resultado = []
    for p in pendientes:
        user_origen = db.query(models.Usuario).filter(models.Usuario.id_usuario == p.id_usuario_origen).first()
        if user_origen:
            resultado.append({"id_origen": p.id_usuario_origen, "nombre": user_origen.nombre})
    return resultado

# 2. Responder solicitud (Aceptar o Rechazar)
@app.post("/api/amistades/responder")
def responder_solicitud(id_origen: int = Query(...), id_destino: int = Query(...), aceptar: bool = Query(...), db: Session = Depends(get_db)):
    amistad = db.query(models.Amistad).filter(
        models.Amistad.id_usuario_origen == id_origen,
        models.Amistad.id_usuario_destino == id_destino
    ).first()
    
    if not amistad:
        return {"mensaje": "Solicitud no encontrada"}
    
    if aceptar:
        amistad.aceptada = True
    else:
        db.delete(amistad)
        
    db.commit()
    return {"mensaje": "Amistad aceptada" if aceptar else "Solicitud rechazada"}

# 3. Obtener lista de amigos confirmados
@app.get("/api/amistades/amigos/{id_usuario}")
def obtener_amigos(id_usuario: int, db: Session = Depends(get_db)):
    amistades = db.query(models.Amistad).filter(
        models.Amistad.aceptada == True,
        (models.Amistad.id_usuario_origen == id_usuario) | (models.Amistad.id_usuario_destino == id_usuario)
    ).all()
    
    amigos_ids = []
    for a in amistades:
        amigos_ids.append(a.id_usuario_destino if a.id_usuario_origen == id_usuario else a.id_usuario_origen)
    
    amigos = db.query(models.Usuario).filter(models.Usuario.id_usuario.in_(amigos_ids)).all()
    return [{"id": u.id_usuario, "nombre": u.nombre} for u in amigos]

# Obtener información básica de un usuario por su ID
@app.get("/api/usuarios/{id_usuario}")
def obtener_usuario(id_usuario: int, db: Session = Depends(get_db)):
    usuario = db.query(models.Usuario).filter(models.Usuario.id_usuario == id_usuario).first()
    if usuario:
        return {"nombre": usuario.nombre}
    return {"nombre": "Amigo"}