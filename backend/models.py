from sqlalchemy import Column, Integer, String, ForeignKey, Boolean
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"
    id_usuario = Column(Integer, primary_key=True, index=True)
    # Cambio: Ahora el nombre es único para poder buscar usuarios por nombre
    nombre = Column(String, unique=True, index=True) 
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)

class Boveda(Base):
    __tablename__ = "boveda"
    id_item = Column(Integer, primary_key=True, index=True)
    id_usuario = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_pelicula = Column(Integer)
    visto = Column(Boolean, default=False)
    puntuacion = Column(Integer, nullable=True)

# NUEVA TABLA: Amistades
class Amistad(Base):
    __tablename__ = "amistades"
    id_amistad = Column(Integer, primary_key=True, index=True)
    id_usuario_origen = Column(Integer, ForeignKey("usuarios.id_usuario"))
    id_usuario_destino = Column(Integer, ForeignKey("usuarios.id_usuario"))
    # 'aceptada' será True cuando el amigo confirme la solicitud
    aceptada = Column(Boolean, default=False)