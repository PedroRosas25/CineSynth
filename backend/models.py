from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)

class Boveda(Base):
    __tablename__ = "boveda"

    id_item = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_pelicula = Column(Integer) # ID de TMDb
    visto = Column(Boolean, default=False)
    puntuacion = Column(Integer, nullable=True) # 1 a 10